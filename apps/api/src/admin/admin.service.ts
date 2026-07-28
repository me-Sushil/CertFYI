import { HttpException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import type { Hex } from 'viem'
import { Response } from 'express'
import { PrismaService } from '../prisma/prisma.service'
import { BlockchainService } from '../blockchain/blockchain.service'
import { AuditService } from '../audit/audit.service'
import { IpfsService } from '../ipfs/ipfs.service'

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
    private readonly audit: AuditService,
    private readonly ipfs: IpfsService,
  ) {}

  async getRequests(statusParam?: string) {
    const where =
      statusParam === 'ALL' ? {} : { status: (statusParam ?? 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' }

    const requests = await this.prisma.accessRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { requests }
  }

  async approveUser(walletAddress: string, txHash: string, adminAddress: string) {
    const normalized = walletAddress.toLowerCase()
    // BUG-8: sender verification and replay protection
    const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash as Hex, adminAddress)
    if (!verification.ok) {
      throw new HttpException(
        { error: verification.error },
        verification.status ?? 400,
      )
    }

    const [accessRequest] = await this.prisma.$transaction(async (tx) => {
      // BUG-8: Replay protection — registerTxHash is @unique
      const existing = await tx.issuer.findUnique({ where: { walletAddress: normalized } })
      if (existing?.registerTxHash === txHash) {
        throw new HttpException({ error: 'This transaction has already been recorded' }, 409)
      }

      const request = await tx.accessRequest.upsert({
        where: { walletAddress: normalized },
        create: { walletAddress: normalized, status: 'APPROVED', decidedAt: new Date() },
        update: { status: 'APPROVED', decidedAt: new Date(), rejectionReason: null },
      })

      const requestData = await tx.accessRequest.findUnique({ where: { walletAddress: normalized } })

      await tx.issuer.upsert({
        where: { walletAddress: normalized },
        create: {
          walletAddress: normalized,
          name: requestData?.name ?? null,
          email: requestData?.email ?? null,
          organization: requestData?.organization ?? null,
          website: requestData?.website ?? null,
          status: 'ACTIVE',
          registerTxHash: txHash,
        },
        update: {
          name: requestData?.name ?? null,
          email: requestData?.email ?? null,
          organization: requestData?.organization ?? null,
          website: requestData?.website ?? null,
          status: 'ACTIVE',
          registerTxHash: txHash,
          suspendedAt: null,
          suspendTxHash: null,
        },
      })

      await tx.auditLog.create({
        data: {
          action: 'ISSUER_APPROVED',
          actorAddress: adminAddress.toLowerCase(),
          targetRef: normalized,
          txHash,
        },
      })

      return [request]
    })

    return { accessRequest }
  }

  async rejectUser(walletAddress: string, reason: string | undefined, adminAddress: string) {
    const normalized = walletAddress.toLowerCase()
    const accessRequest = await this.prisma.accessRequest
      .update({
        where: { walletAddress: normalized },
        data: { status: 'REJECTED', decidedAt: new Date(), rejectionReason: reason ?? null },
      })
      .catch(() => null)

    if (!accessRequest) {
      throw new NotFoundException('Request not found')
    }

    await this.audit.record({
      action: 'ISSUER_REJECTED',
      actorAddress: adminAddress,
      targetRef: normalized,
      detail: reason ?? undefined,
    })

    return { accessRequest }
  }

  async getStats() {
    const [totalIssuers, pendingApprovals, documentsAnchored, suspendedIssuers] =
      await Promise.all([
        this.prisma.issuer.count({ where: { status: 'ACTIVE' } }),
        this.prisma.accessRequest.count({ where: { status: 'PENDING' } }),
        this.prisma.anchoredDocument.count(),
        this.prisma.issuer.count({ where: { status: 'SUSPENDED' } }),
      ])

    return { totalIssuers, pendingApprovals, documentsAnchored, suspendedIssuers }
  }

  async getIssuers(params: {
    status?: string
    search?: string
    cursor?: string
    limit?: number
  }) {
    const limit = Math.min(params.limit ?? 20, 100)
    const where: Record<string, unknown> = {}

    if (params.status && params.status !== 'ALL') {
      where.status = params.status
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { organization: { contains: params.search, mode: 'insensitive' } },
        { walletAddress: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const cursorObj = params.cursor ? { walletAddress: params.cursor } : undefined

    const issuers = await this.prisma.issuer.findMany({
      where,
      orderBy: { registeredAt: 'desc' },
      take: limit + 1,
      ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
    })

    const hasMore = issuers.length > limit
    if (hasMore) issuers.pop()

    return {
      issuers,
      nextCursor: hasMore ? issuers[issuers.length - 1]?.walletAddress ?? null : null,
    }
  }

  async getIssuerDetail(address: string) {
    const normalized = address.toLowerCase()
    const issuer = await this.prisma.issuer.findUnique({
      where: { walletAddress: normalized },
    })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }

    const recentActivity = await this.prisma.auditLog.findMany({
      where: { targetRef: normalized },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { action: true, detail: true, createdAt: true, txHash: true },
    })

    return { issuer, recentActivity }
  }

  async suspendIssuer(walletAddress: string, txHash: string, adminAddress: string) {
    const normalized = walletAddress.toLowerCase()
    const verification = await this.blockchain.verifyIssuerRoleRevoke(normalized, txHash as Hex, adminAddress)
    if (!verification.ok) {
      throw new HttpException(
        { error: verification.error },
        verification.status ?? 400,
      )
    }

    const [issuer] = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.issuer.findUnique({ where: { walletAddress: normalized } })
      if (!existing) {
        throw new NotFoundException('Issuer not found')
      }
      if (existing.status !== 'ACTIVE') {
        throw new HttpException({ error: 'Issuer is not active' }, 400)
      }

      // BUG-8: Replay protection — suspendTxHash is @unique
      if (existing.suspendTxHash === txHash) {
        throw new HttpException({ error: 'This suspension has already been recorded' }, 409)
      }

      const updated = await tx.issuer.update({
        where: { walletAddress: normalized },
        data: { status: 'SUSPENDED', suspendedAt: new Date(), suspendTxHash: txHash },
      })

      await tx.auditLog.create({
        data: {
          action: 'ISSUER_SUSPENDED',
          actorAddress: adminAddress.toLowerCase(),
          targetRef: normalized,
          txHash,
        },
      })

      return [updated]
    })

    return { issuer }
  }

  async reactivateIssuer(walletAddress: string, txHash: string, adminAddress: string) {
    const normalized = walletAddress.toLowerCase()
    const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash as Hex, adminAddress)
    if (!verification.ok) {
      throw new HttpException(
        { error: verification.error },
        verification.status ?? 400,
      )
    }

    const [issuer] = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.issuer.findUnique({ where: { walletAddress: normalized } })
      if (!existing) {
        throw new NotFoundException('Issuer not found')
      }
      if (existing.status !== 'SUSPENDED') {
        throw new HttpException({ error: 'Issuer is not suspended' }, 400)
      }

      // BUG-8: Replay protection — registerTxHash is @unique and changes on reactivation
      if (existing.registerTxHash === txHash) {
        throw new HttpException({ error: 'This transaction has already been recorded' }, 409)
      }

      const updated = await tx.issuer.update({
        where: { walletAddress: normalized },
        data: {
          status: 'ACTIVE',
          registerTxHash: txHash,
          suspendedAt: null,
          suspendTxHash: null,
        },
      })

      await tx.auditLog.create({
        data: {
          action: 'ISSUER_REACTIVATED',
          actorAddress: adminAddress.toLowerCase(),
          targetRef: normalized,
          txHash,
        },
      })

      return [updated]
    })

    return { issuer }
  }

  // --- Issuer metadata (IPFS profile — §7.7) ---

  async uploadIssuerMetadata(address: string) {
    const normalized = address.toLowerCase()
    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }

    const profile = {
      name: issuer.name,
      organization: issuer.organization,
      website: issuer.website,
      registeredAt: issuer.registeredAt.toISOString(),
    }

    const result = await this.ipfs.pinJson(profile, `issuer-${normalized}`)
    if (!result.pinned) {
      // Unlike document pinning, this one has no on-chain fallback: the caller
      // asked for a metadataUri and there is nothing meaningful to return.
      throw new ServiceUnavailableException(
        `Could not pin issuer metadata to IPFS: ${result.error}`,
      )
    }
    const metadataUri = `ipfs://${result.cid}`

    await this.prisma.issuer.update({
      where: { walletAddress: normalized },
      data: { metadataUri },
    })

    return { metadataUri, cid: result.cid }
  }

  async setIssuerMetadataOnChain(address: string, txHash: string, adminAddress: string) {
    const normalized = address.toLowerCase()
    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }
    if (!issuer.metadataUri) {
      throw new HttpException({ error: 'No metadata URI has been uploaded yet' }, 400)
    }

    // Verify the setIssuerMetadata tx
    const rpcUrl = process.env.RPC_URL
    if (!rpcUrl) {
      throw new HttpException({ error: 'Server RPC_URL is not configured' }, 500)
    }

    const { createPublicClient, http, parseEventLogs } = await import('viem')
    const publicClient = createPublicClient({ transport: http(rpcUrl) })

    let receipt
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash as Hex })
    } catch {
      throw new HttpException({ error: 'Transaction not found' }, 400)
    }

    if (receipt.status !== 'success') {
      throw new HttpException({ error: 'On-chain transaction did not succeed' }, 400)
    }

    // Verify the IssuerMetadataSet event
    const IssuerMetadataSetEvent = {
      type: 'event',
      name: 'IssuerMetadataSet',
      inputs: [
        { indexed: true, name: 'issuer', type: 'address' },
        { indexed: false, name: 'metadataURI', type: 'string' },
        { indexed: false, name: 'timestamp', type: 'uint256' },
      ],
    } as const

    const events = parseEventLogs({ abi: [IssuerMetadataSetEvent], logs: receipt.logs })
    const matched = events.some(
      (event) =>
        event.eventName === 'IssuerMetadataSet' &&
        event.args.issuer?.toLowerCase() === normalized,
    )

    if (!matched) {
      throw new HttpException(
        { error: 'Transaction did not emit IssuerMetadataSet for this issuer' },
        400,
      )
    }

    await this.audit.record({
      action: 'ISSUER_METADATA_SET',
      actorAddress: adminAddress,
      targetRef: normalized,
      txHash,
      detail: `metadataUri: ${issuer.metadataUri}`,
    })

    return { issuer: { ...issuer, metadataUri: issuer.metadataUri } }
  }

  // --- Audit log ---

  async getAuditLog(params: {
    action?: string
    actor?: string
    from?: string
    to?: string
    cursor?: string
    limit?: number
  }) {
    return this.audit.find(params)
  }

  async exportAuditLog(params: {
    action?: string
    actor?: string
    from?: string
    to?: string
  }, res: Response) {
    const { find } = this.audit
    const result = await find({ ...params, limit: 10000 })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    )

    const headers = ['Action', 'Actor Address', 'Actor Name', 'Target', 'Details', 'Timestamp', 'Tx Hash']
    const rows = result.entries.map((e: any) => [
      e.action,
      e.actorAddress,
      e.actorName,
      e.targetRef,
      e.detail ?? '',
      new Date(e.createdAt).toISOString(),
      e.txHash ?? '',
    ])

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    res.send(csv)
  }

  // --- IPFS pin failure tracking ---

  async getIpfsPinFailures() {
    const count = await this.prisma.auditLog.count({
      where: { action: 'IPFS_PIN_FAILED' },
    })
    return { count }
  }
}
