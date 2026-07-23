import { type Hex } from 'viem';
export declare const CONTRACT_ADDRESS: string;
export declare const CONTRACT_CHAIN_ID: number;
export declare const ADMIN_ROLE: `0x${string}`;
export declare const ISSUER_ROLE: `0x${string}`;
export interface RoleGrantVerification {
    ok: boolean;
    error?: string;
    status?: number;
}
export declare class BlockchainService {
    verifyIssuerRoleGrant(walletAddress: string, txHash: Hex): Promise<RoleGrantVerification>;
    calculateDocumentHash(data: Buffer | string): string;
    calculateMerkleRoot(leaves: Buffer[]): Buffer;
}
