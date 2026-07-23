import { PrismaService } from '../prisma/prisma.service';
import { type SessionRole } from '../common/constants/roles.constant';
export interface VerifyResult {
    address: string;
    role: SessionRole;
    requestStatus?: string;
    token: string;
}
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    verifySiwe(message: string, signature: string, nonce: string): Promise<VerifyResult>;
}
