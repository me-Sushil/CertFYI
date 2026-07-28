import { IssuerService } from './issuer.service';
import { AccessRequestDto } from '../common/dto/issuer.dto';
import type { SessionPayload } from '../common/constants/roles.constant';
export declare class IssuerController {
    private readonly issuerService;
    constructor(issuerService: IssuerService);
    submitRequest(user: SessionPayload, body: AccessRequestDto): Promise<{
        requestStatus: any;
    }>;
    getStatus(user: SessionPayload): Promise<{
        requestStatus: any;
    }>;
    getStats(user: SessionPayload): Promise<{
        totalIssued: number;
        activeDocuments: number;
        revokedCount: number;
        recentActivityCount: number;
    }>;
    getDocuments(user: SessionPayload, cursor?: string): Promise<{
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
    getActivity(user: SessionPayload): Promise<{
        entries: {
            action: import("@prisma/client").$Enums.AuditAction;
            detail: string | undefined;
            createdAt: string;
            txHash: string | undefined;
        }[];
    }>;
}
