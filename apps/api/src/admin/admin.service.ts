import { HttpException, Injectable, NotFoundException } from '@nestjs/common'
import type { Hex } from 'viem'
import { PrismaService } from '../prisma/prisma.service'
import { BlockchainService } from '../blockchain/blockchain.service'

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
  ) {}

  async getRequests(statusParam?: string) {
    const where =
      statusParam === 'ALL' ? {} : { status: (statusParam ?? 'PENDING') as RequestStatus }

    const requests = await this.prisma.accessRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { requests }
  }

  /**
   * Admin has already sent `grantRole(ISSUER_ROLE, walletAddress)` client-side.
   * Confirm the tx actually succeeded and granted the right role before trusting
   * it and updating the DB.
   */
  async approveUser(walletAddress: string, txHash: string) {
    const normalized = walletAddress.toLowerCase()
    const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash as Hex)
    if (!verification.ok) {
      throw new HttpException(
        { error: verification.error },
        verification.status ?? 400,
      )
    }

    const accessRequest = await this.prisma.accessRequest.upsert({
      where: { walletAddress: normalized },
      create: { walletAddress: normalized, status: 'APPROVED', decidedAt: new Date() },
      update: { status: 'APPROVED', decidedAt: new Date(), rejectionReason: null },
    })

    return { accessRequest }
  }

  async rejectUser(walletAddress: string, reason?: string) {
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
