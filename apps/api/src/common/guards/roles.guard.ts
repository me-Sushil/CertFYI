import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { SessionPayload, SessionRole } from '../constants/roles.constant'

/**
 * Enforces role metadata set via @Roles(). Must run after SessionGuard, which
 * attaches the verified session to the request.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SessionRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request & { session?: SessionPayload }>()
    const session = request.session
    if (!session || !requiredRoles.includes(session.role)) {
      throw new ForbiddenException('Forbidden')
    }

    return true
  }
}
