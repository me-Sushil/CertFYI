import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AccessRequestDto } from '../common/dto/issuer.dto';
export declare class IssuerService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    submitRequest(address: string, data: AccessRequestDto): Promise<{
        requestStatus: any;
    }>;
    getStatus(address: string): Promise<{
        requestStatus: any;
    }>;
    getStats(address: string): Promise<{
        totalIssued: number;
        activeDocuments: number;
        revokedCount: number;
        recentActivityCount: number;
    }>;
    getDocuments(address: string, cursor?: string): Promise<{
        documents: {
            docHash: string;
            documentType: string | undefined;
            recipientName: string | undefined;
            recipientEmail: string | undefined;
            txHash: string;
            anchoredAt: string;
            revokedAt: string | null;
            status: "active" | "revoked";
        }[];
        nextCursor: string | null;
    }>;
    getActivity(address: string): Promise<{
        entries: {
            action: import("@prisma/client").$Enums.AuditAction;
            detail: string | undefined;
            createdAt: string;
            txHash: string | undefined;
        }[];
    }>;
}
