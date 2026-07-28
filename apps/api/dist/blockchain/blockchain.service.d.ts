import { OnModuleInit } from '@nestjs/common';
import { type Hex } from 'viem';
export declare const ADMIN_ROLE: `0x${string}`;
export declare const ISSUER_ROLE: `0x${string}`;
export interface RoleGrantVerification {
    ok: boolean;
    error?: string;
    status?: number;
}
export declare class BlockchainService implements OnModuleInit {
    private readonly logger;
    private publicClient;
    readonly contractAddress: string;
    readonly contractChainId: number;
    constructor();
    onModuleInit(): Promise<void>;
    verifyIssuerRoleGrant(walletAddress: string, txHash: Hex, adminAddress: string): Promise<RoleGrantVerification>;
    verifyIssuerRoleRevoke(walletAddress: string, txHash: Hex, adminAddress: string): Promise<RoleGrantVerification>;
    private verifyRoleEvent;
    calculateDocumentHash(data: Buffer | string): string;
    calculateMerkleRoot(leaves: Buffer[]): Buffer;
}
