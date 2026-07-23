import type { SessionRole } from '../constants/roles.constant';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: SessionRole[]) => import("@nestjs/common").CustomDecorator<string>;
