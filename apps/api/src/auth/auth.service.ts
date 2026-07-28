import { Injectable, UnauthorizedException } from '@nestjs/common'
import { SiweMessage } from 'siwe'
import { PrismaService } from '../prisma/prisma.service'
import { isAdminWallet, type SessionRole } from '../common/constants/roles.constant'
import { createSessionToken } from '../common/session/session-token'

export interface VerifyResult {
  address: string
  role: SessionRole
  requestStatus?: string
  token: string
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async verifySiwe(message: string, signature: string, nonce: string): Promise<VerifyResult> {
    let siweMessage: SiweMessage
    try {
      siweMessage = new SiweMessage(message)
    } catch {
      throw new UnauthorizedException('Malformed SIWE message')
    }

    let address: string
    try {
      const { data } = await siweMessage.verify({ signature, nonce })
      address = data.address.toLowerCase()
    } catch {
      throw new UnauthorizedException('Signature verification failed')
    }

    let role: SessionRole
    let requestStatus: string | undefined

    if (isAdminWallet(address)) {
      role = 'ADMIN'
    } else {
      // Role is resolved from Issuer table (with active status), not AccessRequest
      // This ensures a suspended issuer cannot get ISSUER role (FR-A4).
      const issuer = await this.prisma.issuer.findUnique({
        where: { walletAddress: address },
      })

      if (issuer?.status === 'ACTIVE') {
        role = 'ISSUER'
      } else {
        role = 'UNAPPROVED'
        const accessRequest = await this.prisma.accessRequest.findUnique({
          where: { walletAddress: address },
        })
        requestStatus = accessRequest?.status ?? 'NONE'
        if (issuer?.status === 'SUSPENDED') {
          requestStatus = 'SUSPENDED'
        }
      }
    }

    const token = await createSessionToken({ address, role })
    return { address, role, requestStatus, token }
  }
}
