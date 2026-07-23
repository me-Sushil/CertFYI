import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { AccessRequestDto } from '../common/dto/issuer.dto'

@Injectable()
export class IssuerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit (or re-submit after rejection) an issuer access request for the
   * SIWE-authenticated caller's wallet. Wallet identity always comes from the
   * verified session, never from client-supplied input.
   */
  async submitRequest(address: string, data: AccessRequestDto) {
    const existing = await this.prisma.accessRequest.findUnique({
      where: { walletAddress: address },
    })

    if (existing && existing.status !== 'REJECTED') {
      throw new ConflictException(`Request already ${existing.status.toLowerCase()}`)
    }

    const accessRequest = await this.prisma.accessRequest.upsert({
      where: { walletAddress: address },
      create: {
        walletAddress: address,
        ...data,
        status: 'PENDING',
      },
      update: {
        ...data,
        status: 'PENDING',
        decidedAt: null,
        rejectionReason: null,
      },
    })

    return { requestStatus: accessRequest.status }
  }

  /** Status check for the caller's own wallet (derived from session). */
  async getStatus(address: string) {
    const accessRequest = await this.prisma.accessRequest.findUnique({
      where: { walletAddress: address },
    })

    return { requestStatus: accessRequest?.status ?? 'NONE' }
  }
}
