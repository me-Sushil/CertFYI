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
}
