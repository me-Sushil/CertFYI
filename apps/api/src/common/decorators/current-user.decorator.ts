import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { SessionPayload } from '../constants/roles.constant'

/** Injects the verified session attached by SessionGuard onto the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionPayload | null => {
    const request = ctx.switchToHttp().getRequest<Request & { session?: SessionPayload }>()
    return request.session ?? null
  },
)
