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

  /** List all approved issuers (wallets with APPROVED request status). */
  async getIssuers() {
    const requests = await this.prisma.accessRequest.findMany({
      where: { status: 'APPROVED' },
      orderBy: { decidedAt: 'desc' },
    })

    const issuers = requests.map((r) => ({
      walletAddress: r.walletAddress,
      name: r.name,
      email: r.email,
      organization: r.organization,
      approvedAt: r.decidedAt,
      documentCount: 0, // TODO: count from documents table when available
    }))

    return { issuers }
  }

  /** Suspend an issuer (revoke their APPROVED status). On-chain revocation is done client-side. */
  async suspendIssuer(walletAddress: string) {
    const normalized = walletAddress.toLowerCase()
    const accessRequest = await this.prisma.accessRequest
      .update({
        where: { walletAddress: normalized },
        data: { status: 'REJECTED', decidedAt: new Date(), rejectionReason: 'Suspended by admin' },
      })
      .catch(() => null)

    if (!accessRequest) {
      throw new NotFoundException('Issuer not found')
    }

    return { accessRequest }
  }

  /** Return aggregated audit log entries. */
  async getAuditLog() {
    const requests = await this.prisma.accessRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const entries = requests.map((r) => {
      let action = 'Issuer Request Submitted'
      let details = `${r.name ?? 'Unknown'} requested issuer access`
      if (r.status === 'APPROVED') {
        action = 'Issuer Approved'
        details = `${r.name ?? 'Unknown'} was approved as an issuer`
      } else if (r.status === 'REJECTED') {
        action = r.rejectionReason === 'Suspended by admin' ? 'Issuer Suspended' : 'Issuer Rejected'
        details = `${r.name ?? 'Unknown'} was ${action.toLowerCase()}${r.rejectionReason ? `: ${r.rejectionReason}` : ''}`
      }

      return {
        id: r.id,
        action,
        actor: r.walletAddress,
        target: r.walletAddress,
        details,
        timestamp: r.decidedAt ?? r.createdAt,
      }
    })

    return { entries }
  }
}
