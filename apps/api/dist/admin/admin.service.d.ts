import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AuditService } from '../audit/audit.service';
import { IpfsService } from '../ipfs/ipfs.service';
export declare class AdminService {
    private readonly prisma;
    private readonly blockchain;
    private readonly audit;
    private readonly ipfs;
    constructor(prisma: PrismaService, blockchain: BlockchainService, audit: AuditService, ipfs: IpfsService);
    getRequests(statusParam?: string): Promise<{
        requests: {
            id: string;
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            description: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        }[];
    }>;
    approveUser(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        accessRequest: {
            id: string;
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            description: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        };
    }>;
    rejectUser(walletAddress: string, reason: string | undefined, adminAddress: string): Promise<{
        accessRequest: {
            id: string;
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            description: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        };
    }>;
    getStats(): Promise<{
        totalIssuers: number;
        pendingApprovals: number;
        documentsAnchored: number;
        suspendedIssuers: number;
    }>;
    getIssuers(params: {
        status?: string;
        search?: string;
        cursor?: string;
        limit?: number;
    }): Promise<{
        issuers: {
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            metadataUri: string | null;
            registeredAt: Date;
            registerTxHash: string;
            suspendedAt: Date | null;
            suspendTxHash: string | null;
            documentCount: number;
        }[];
        nextCursor: string | null;
    }>;
    getIssuerDetail(address: string): Promise<{
        issuer: {
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            metadataUri: string | null;
            registeredAt: Date;
            registerTxHash: string;
            suspendedAt: Date | null;
            suspendTxHash: string | null;
            documentCount: number;
        };
        recentActivity: {
            createdAt: Date;
            action: import("@prisma/client").$Enums.AuditAction;
            txHash: string | null;
            detail: string | null;
        }[];
    }>;
    suspendIssuer(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        issuer: {
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            metadataUri: string | null;
            registeredAt: Date;
            registerTxHash: string;
            suspendedAt: Date | null;
            suspendTxHash: string | null;
            documentCount: number;
        };
    }>;
    reactivateIssuer(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        issuer: {
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            metadataUri: string | null;
            registeredAt: Date;
            registerTxHash: string;
            suspendedAt: Date | null;
            suspendTxHash: string | null;
            documentCount: number;
        };
    }>;
    uploadIssuerMetadata(address: string): Promise<{
        metadataUri: string;
        cid: string;
    }>;
    setIssuerMetadataOnChain(address: string, txHash: string, adminAddress: string): Promise<{
        issuer: {
            metadataUri: string;
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            registeredAt: Date;
            registerTxHash: string;
            suspendedAt: Date | null;
            suspendTxHash: string | null;
            documentCount: number;
        };
    }>;
    getAuditLog(params: {
        action?: string;
        actor?: string;
        from?: string;
        to?: string;
        cursor?: string;
        limit?: number;
    }): Promise<{
        entries: {
            actorName: string;
            id: string;
            action: string;
            actorAddress: string;
            targetRef: string;
            txHash: string | null;
            detail: string | null;
            createdAt: Date;
        }[];
        nextCursor: string | null;
    }>;
    exportAuditLog(params: {
        action?: string;
        actor?: string;
        from?: string;
        to?: string;
    }, res: Response): Promise<void>;
    getIpfsPinFailures(): Promise<{
        count: number;
    }>;
}
