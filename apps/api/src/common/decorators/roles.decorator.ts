import { SetMetadata } from '@nestjs/common'
import type { SessionRole } from '../constants/roles.constant'

export const ROLES_KEY = 'roles'

/** Restricts a route/controller to the given session role(s). Requires RolesGuard. */
export const Roles = (...roles: SessionRole[]) => SetMetadata(ROLES_KEY, roles)
