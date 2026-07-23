import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { SESSION_COOKIE, type SessionPayload } from '../constants/roles.constant'
import { verifySessionToken } from '../session/session-token'

/**
 * Verifies the SIWE session JWT carried in the httpOnly cookie and attaches the
 * decoded session to the request. Rejects unauthenticated callers with 401.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { session?: SessionPayload }>()
    const token = request.cookies?.[SESSION_COOKIE]
    if (!token) {
      throw new UnauthorizedException('Authentication required')
    }

    const session = await verifySessionToken(token)
    if (!session) {
      throw new UnauthorizedException('Authentication required')
    }

    request.session = session
    return true
  }
}
