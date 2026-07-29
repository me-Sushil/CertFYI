import { OnModuleInit } from '@nestjs/common';
import { type Hex } from 'viem';
export declare const ADMIN_ROLE: `0x${string}`;
export declare const ISSUER_ROLE: `0x${string}`;
export interface RoleGrantVerification {
    ok: boolean;
    error?: string;
    status?: number;
}
export interface OnChainDocument {
    anchored: boolean;
    issuer: string;
    timestamp: number;
    revoked: boolean;
    documentType: string;
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
    verifyDocumentAnchor(documentHash: Hex, txHash: Hex, issuerAddress: string): Promise<RoleGrantVerification>;
    verifyDocumentRevoke(documentHash: Hex, txHash: Hex, revokerAddress: string): Promise<RoleGrantVerification>;
    getOnChainDocument(documentHash: Hex): Promise<OnChainDocument | null>;
    verifyMerkleBatchAnchor(merkleRoot: Hex, txHash: Hex, issuerAddress: string): Promise<RoleGrantVerification>;
    getReceiptSummary(txHash: Hex): Promise<{
        blockNumber: number;
    } | null>;
    chainName(chainId?: number): string;
    calculateDocumentHash(data: Buffer | string): string;
    calculateMerkleRoot(leaves: Buffer[]): Buffer;
}
