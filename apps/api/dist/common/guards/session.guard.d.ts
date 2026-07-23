import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class SessionGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
