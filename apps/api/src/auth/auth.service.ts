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

  /**
   * Verifies a SIWE message + signature against the round-tripped nonce, resolves
   * the caller's role from admin config / access-request DB state, and mints a
   * session JWT. Throws UnauthorizedException on signature failure.
   */
  async verifySiwe(message: string, signature: string, nonce: string): Promise<VerifyResult> {
    let siweMessage: SiweMessage
    try {
      siweMessage = new SiweMessage(message)
    } catch {
      throw new UnauthorizedException('Malformed SIWE message')
    }

    // siwe's verify() *rejects* (rather than resolving with success:false) when
    // verification fails, so failure must be caught separately from real errors.
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
      const accessRequest = await this.prisma.accessRequest.findUnique({
        where: { walletAddress: address },
      })
      if (accessRequest?.status === 'APPROVED') {
        role = 'ISSUER'
      } else {
        role = 'UNAPPROVED'
        requestStatus = accessRequest?.status ?? 'NONE'
      }
    }

    const token = await createSessionToken({ address, role })
    return { address, role, requestStatus, token }
  }
}
