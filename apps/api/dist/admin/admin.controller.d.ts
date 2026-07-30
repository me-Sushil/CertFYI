import type { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminDocumentsQueryDto, ApproveUserDto, AuditLogQueryDto, IssuersQueryDto, ReactivateIssuerDto, RejectUserDto, RequestsQueryDto, SetIssuerMetadataDto, SuspendIssuerDto } from '../common/dto/admin.dto';
import type { SessionPayload } from '../common/constants/roles.constant';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getRequests(query: RequestsQueryDto): Promise<{
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
    approveUser(body: ApproveUserDto, session: SessionPayload): Promise<{
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
    rejectUser(body: RejectUserDto, session: SessionPayload): Promise<{
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
    getIssuers(query: IssuersQueryDto): Promise<{
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
    getDocuments(query: AdminDocumentsQueryDto): Promise<{
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
            batchId: string | null;
        }[];
        nextCursor: string | null;
    }>;
    getIssuer(address: string): Promise<{
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
    suspendIssuer(body: SuspendIssuerDto, session: SessionPayload): Promise<{
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
    reactivateIssuer(body: ReactivateIssuerDto, session: SessionPayload): Promise<{
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
    setIssuerMetadata(address: string, body: SetIssuerMetadataDto, session: SessionPayload): Promise<{
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
    getAuditLog(query: AuditLogQueryDto): Promise<{
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
    exportAuditLog(query: AuditLogQueryDto, res: Response): Promise<void>;
    getIpfsPinFailures(): Promise<{
        count: number;
    }>;
}
