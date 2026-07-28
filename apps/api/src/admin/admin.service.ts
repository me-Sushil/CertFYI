import { HttpException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import type { Hex } from 'viem'
import type { Response } from 'express'
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
    const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash as Hex, adminAddress)
    if (!verification.ok) {
      throw new HttpException(
        { error: verification.error },
        verification.status ?? 400,
      )
    }

    const [accessRequest] = await this.prisma.$transaction(async (tx) => {
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
    const [totalIssuers, pendingApprovals, totalDocuments, suspendedIssuers] = await Promise.all([
      this.prisma.issuer.count(),
      this.prisma.accessRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.anchoredDocument.count(),
      this.prisma.issuer.count({ where: { status: 'SUSPENDED' } }),
    ])

    return { totalIssuers, pendingApprovals, totalDocuments, suspendedIssuers }
  }

  async getIssuers(params?: { status?: string; search?: string; cursor?: string; limit?: number }) {
    const limit = Math.min(params?.limit ?? 20, 100)
    const where: Record<string, unknown> = {}

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status
    }

    if (params?.search) {
      where.OR = [
        { walletAddress: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { organization: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const cursorObj = params?.cursor ? { walletAddress: params.cursor } : undefined

    const issuers = await this.prisma.issuer.findMany({
      where,
      orderBy: { registeredAt: 'desc' },
      take: limit + 1,
      ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
    })

    const hasMore = issuers.length > limit
    if (hasMore) issuers.pop()

    return {
      issuers: issuers.map((i) => ({
        walletAddress: i.walletAddress,
        name: i.name,
        email: i.email,
        organization: i.organization,
        approvedAt: i.registeredAt,
        documentCount: i.documentCount,
      })),
      nextCursor: hasMore ? issuers[issuers.length - 1]?.walletAddress ?? null : null,
    }
  }

  async getIssuerDetail(address: string) {
    const normalized = address.toLowerCase()
    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }

    const recentActivity = await this.prisma.auditLog.findMany({
      where: { targetRef: normalized },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return {
      issuer: {
        walletAddress: issuer.walletAddress,
        name: issuer.name,
        email: issuer.email,
        organization: issuer.organization,
        approvedAt: issuer.registeredAt,
        documentCount: issuer.documentCount,
      },
      recentActivity: recentActivity.map((e) => ({
        id: e.id,
        action: e.action,
        actor: e.actorAddress,
        target: e.targetRef,
        details: e.detail,
        timestamp: e.createdAt,
      })),
    }
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

    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }
    if (issuer.status !== 'ACTIVE') {
      throw new HttpException({ error: 'Issuer is not active' }, 400)
    }

    await this.prisma.$transaction(async (tx) => {
      if (issuer.suspendTxHash === txHash) {
        throw new HttpException({ error: 'This transaction has already been recorded' }, 409)
      }

      await tx.issuer.update({
        where: { walletAddress: normalized },
        data: { status: 'SUSPENDED', suspendedAt: new Date(), suspendTxHash: txHash },
      })

      await tx.accessRequest.update({
        where: { walletAddress: normalized },
        data: { status: 'REJECTED', decidedAt: new Date(), rejectionReason: 'Suspended by admin' },
      })

      await tx.auditLog.create({
        data: {
          action: 'ISSUER_SUSPENDED',
          actorAddress: adminAddress.toLowerCase(),
          targetRef: normalized,
          txHash,
        },
      })
    })
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

    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }
    if (issuer.status !== 'SUSPENDED') {
      throw new HttpException({ error: 'Issuer is not suspended' }, 400)
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.issuer.update({
        where: { walletAddress: normalized },
        data: { status: 'ACTIVE', suspendedAt: null, suspendTxHash: null, registerTxHash: txHash },
      })

      await tx.accessRequest.update({
        where: { walletAddress: normalized },
        data: { status: 'APPROVED', decidedAt: new Date(), rejectionReason: null },
      })

      await tx.auditLog.create({
        data: {
          action: 'ISSUER_REACTIVATED',
          actorAddress: adminAddress.toLowerCase(),
          targetRef: normalized,
          txHash,
        },
      })
    })
  }

  async uploadIssuerMetadata(address: string) {
    const normalized = address.toLowerCase()
    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }

    const metadata = {
      name: issuer.name,
      organization: issuer.organization,
      website: issuer.website,
    }

    const result = await this.ipfs.pinJson(metadata, `issuer-${normalized}`)
    if (!result.pinned) {
      throw new ServiceUnavailableException(`Failed to upload metadata to IPFS: ${result.error}`)
    }

    await this.prisma.issuer.update({
      where: { walletAddress: normalized },
      data: { metadataUri: `ipfs://${result.cid}` },
    })

    return { cid: result.cid, gatewayUrl: result.gatewayUrl }
  }

  async setIssuerMetadataOnChain(address: string, txHash: string, adminAddress: string) {
    const normalized = address.toLowerCase()
    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } })
    if (!issuer) {
      throw new NotFoundException('Issuer not found')
    }
    if (!issuer.metadataUri) {
      throw new HttpException({ error: 'Metadata has not been uploaded yet. Call /metadata-upload first.' }, 400)
    }

    const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash as Hex, adminAddress)
    if (!verification.ok) {
      throw new HttpException(
        { error: verification.error },
        verification.status ?? 400,
      )
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'ISSUER_METADATA_SET',
        actorAddress: adminAddress.toLowerCase(),
        targetRef: normalized,
        txHash,
      },
    })

    return { message: 'Metadata confirmed on-chain' }
  }

  async getAuditLog(params?: { action?: string; actor?: string; from?: string; to?: string; cursor?: string; limit?: number }) {
    return this.audit.find(params ?? {})
  }

  async exportAuditLog(params: { action?: string; actor?: string; from?: string; to?: string }, res: Response) {
    const where: Record<string, unknown> = {}

    if (params.action && params.action !== 'ALL') {
      where.action = params.action
    }
    if (params.actor) {
      where.actorAddress = params.actor.toLowerCase()
    }
    if (params.from || params.to) {
      const createdAt: Record<string, Date> = {}
      if (params.from) createdAt.gte = new Date(params.from)
      if (params.to) createdAt.lte = new Date(params.to)
      where.createdAt = createdAt
    }

    const entries = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const csvHeader = 'id,action,actor,target,details,timestamp\n'
    const csvRows = entries
      .map(
        (e) =>
          `${e.id},${e.action},${e.actorAddress},${e.targetRef},"${(e.detail ?? '').replace(/"/g, '""')}",${e.createdAt.toISOString()}`,
      )
      .join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"')
    res.send(csvHeader + csvRows)
  }

  async getIpfsPinFailures() {
    const count = await this.audit.countByAction('IPFS_PIN_FAILED')
    return { count }
  }
}
