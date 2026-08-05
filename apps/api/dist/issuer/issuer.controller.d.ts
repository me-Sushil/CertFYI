import { IssuerService } from './issuer.service';
import { AccessRequestDto, IssuerDocumentsQueryDto, IssuerActivityQueryDto, RetryPinDto, LogFailedAnchorDto } from '../common/dto/issuer.dto';
import type { SessionPayload } from '../common/constants/roles.constant';
export declare class IssuerController {
    private readonly issuerService;
    constructor(issuerService: IssuerService);
    submitRequest(user: SessionPayload, body: AccessRequestDto): Promise<{
        requestStatus: import("@prisma/client").$Enums.RequestStatus;
    }>;
    getStatus(user: SessionPayload): Promise<{
        requestStatus: string;
    }>;
    getStats(user: SessionPayload): Promise<{
        totalIssued: number;
        recentActivityCount: number;
    }>;
    getDocuments(user: SessionPayload, query: IssuerDocumentsQueryDto): Promise<{
        documents: {
            docHash: string;
            documentType: string | undefined;
            recipientName: string | undefined;
            recipientEmail: string | undefined;
            txHash: string;
            cid: string | null;
            metadataCid: string | null;
            anchoredAt: string;
            batchId: string | null;
        }[];
        nextCursor: string | null;
    }>;
    getActivity(user: SessionPayload, query: IssuerActivityQueryDto): Promise<{
        entries: {
            action: import("@prisma/client").$Enums.AuditAction;
            detail: string | undefined;
            createdAt: string;
            txHash: string | undefined;
            docHash: string | undefined;
        }[];
        nextCursor: string | null;
    }>;
    retryPin(user: SessionPayload, body: RetryPinDto): Promise<{
        success: boolean;
        metadataCid: string;
        message: string;
    } | {
        success: boolean;
        metadataCid: null;
        message: string;
    }>;
    logFailedAnchor(user: SessionPayload, body: LogFailedAnchorDto): Promise<{
        success: boolean;
    }>;
}
