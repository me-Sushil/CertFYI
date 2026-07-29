import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import type { AccessRequestDto } from '../common/dto/issuer.dto';
export declare class IssuerService {
    private readonly prisma;
    private readonly audit;
    private readonly ipfs;
    private readonly blockchain;
    constructor(prisma: PrismaService, audit: AuditService, ipfs: IpfsService, blockchain: BlockchainService);
    submitRequest(address: string, data: AccessRequestDto): Promise<{
        requestStatus: import("@prisma/client").$Enums.RequestStatus;
    }>;
    getStatus(address: string): Promise<{
        requestStatus: string;
    }>;
    getStats(address: string): Promise<{
        totalIssued: number;
        activeDocuments: number;
        revokedCount: number;
        recentActivityCount: number;
    }>;
    getDocuments(address: string, params?: {
        status?: 'all' | 'active' | 'revoked';
        search?: string;
        cursor?: string;
    }): Promise<{
        documents: {
            docHash: string;
            documentType: string | undefined;
            recipientName: string | undefined;
            recipientEmail: string | undefined;
            txHash: string;
            cid: string | null;
            metadataCid: string | null;
            anchoredAt: string;
            revokedAt: string | null;
            revokeTxHash: string | undefined;
            status: "revoked" | "active";
        }[];
        nextCursor: string | null;
    }>;
    getActivity(address: string, params?: {
        action?: string;
        cursor?: string;
    }): Promise<{
        entries: {
            action: import("@prisma/client").$Enums.AuditAction;
            detail: string | undefined;
            createdAt: string;
            txHash: string | undefined;
            docHash: string | undefined;
        }[];
        nextCursor: string | null;
    }>;
    retryPin(address: string, docHash: string): Promise<{
        success: boolean;
        metadataCid: string;
        message: string;
    } | {
        success: boolean;
        metadataCid: null;
        message: string;
    }>;
    logFailedAnchor(address: string, docHash: string, txHash: string | undefined, reason: string): Promise<{
        success: boolean;
    }>;
}
