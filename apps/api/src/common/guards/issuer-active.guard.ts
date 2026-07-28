import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import type { Request } from 'express'
import type { SessionPayload } from '../constants/roles.constant'
import { PrismaService } from '../../prisma/prisma.service'

/**
 * Re-checks issuer standing at request time rather than trusting the session
 * JWT role claim alone. A suspended issuer still holds a valid `ISSUER` JWT
 * until it expires (7 days); this guard closes the window.
 *
 * Apply to issuer-only routes. The extra DB read is acceptable for authenticated
 * issuer paths; it is not used on the public verification flow.
 */
@Injectable()
export class IssuerActiveGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { session?: SessionPayload }>()
    const session = request.session

    if (!session || session.role !== 'ISSUER') {
      throw new ForbiddenException('Forbidden')
    }

    const issuer = await this.prisma.issuer.findUnique({
      where: { walletAddress: session.address },
      select: { status: true },
    })

    if (!issuer || issuer.status !== 'ACTIVE') {
      throw new ForbiddenException('Issuer account is not active')
    }

    return true
  }
}
