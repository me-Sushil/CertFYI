import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { NonceService } from './nonce.service';
import { VerifyDto } from '../common/dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    private readonly nonceService;
    constructor(authService: AuthService, nonceService: NonceService);
    getNonce(res: Response): {
        nonce: string;
    };
    verify(body: VerifyDto, req: Request, res: Response): Promise<{
        address: string;
        role: "ADMIN" | "ISSUER" | "UNAPPROVED";
        requestStatus: string | undefined;
    }>;
    session(req: Request): Promise<{
        address: null;
        role: null;
    } | {
        address: string;
        role: "ADMIN" | "ISSUER" | "UNAPPROVED";
    }>;
    logout(res: Response): {
        success: boolean;
    };
}
