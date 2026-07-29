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
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            id: string;
            description: string | null;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        }[];
    }>;
    approveUser(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        accessRequest: {
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            id: string;
            description: string | null;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        };
    }>;
    rejectUser(walletAddress: string, reason: string | undefined, adminAddress: string): Promise<{
        accessRequest: {
            walletAddress: string;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            id: string;
            description: string | null;
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
            registerTxHash: string;
            suspendTxHash: string | null;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            metadataUri: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            registeredAt: Date;
            suspendedAt: Date | null;
            documentCount: number;
        }[];
        nextCursor: string | null;
    }>;
    getIssuerDetail(address: string): Promise<{
        issuer: {
            walletAddress: string;
            registerTxHash: string;
            suspendTxHash: string | null;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            metadataUri: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            registeredAt: Date;
            suspendedAt: Date | null;
            documentCount: number;
        };
        recentActivity: {
            txHash: string | null;
            createdAt: Date;
            action: import("@prisma/client").$Enums.AuditAction;
            detail: string | null;
        }[];
    }>;
    suspendIssuer(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        issuer: {
            walletAddress: string;
            registerTxHash: string;
            suspendTxHash: string | null;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            metadataUri: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            registeredAt: Date;
            suspendedAt: Date | null;
            documentCount: number;
        };
    }>;
    reactivateIssuer(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        issuer: {
            walletAddress: string;
            registerTxHash: string;
            suspendTxHash: string | null;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            metadataUri: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            registeredAt: Date;
            suspendedAt: Date | null;
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
            registerTxHash: string;
            suspendTxHash: string | null;
            name: string | null;
            email: string | null;
            organization: string | null;
            website: string | null;
            status: import("@prisma/client").$Enums.IssuerStatus;
            registeredAt: Date;
            suspendedAt: Date | null;
            documentCount: number;
        };
    }>;
    getDocuments(params: {
        status?: string;
        search?: string;
        cursor?: string;
        limit?: number;
    }): Promise<{
        documents: {
            status: string;
            docHash: string;
            issuerAddress: string;
            issuerName: string | null;
            documentType: string | null;
            recipientName: string | null;
            recipientEmail: string | null;
            cid: string | null;
            metadataCid: string | null;
            txHash: string;
            anchoredAt: Date;
            revokedAt: Date | null;
            revokeTxHash: string | null;
        }[];
        nextCursor: string | null;
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
