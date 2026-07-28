import type { Response } from 'express';
import { AdminService } from './admin.service';
import { ApproveUserDto, AuditLogQueryDto, IssuersQueryDto, ReactivateIssuerDto, RejectUserDto, RequestsQueryDto, SetIssuerMetadataDto, SuspendIssuerDto } from '../common/dto/admin.dto';
import type { SessionPayload } from '../common/constants/roles.constant';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getRequests(query: RequestsQueryDto): Promise<{
        requests: $Public.PrismaPromise<T>;
    }>;
    approveUser(body: ApproveUserDto, session: SessionPayload): Promise<{
        accessRequest: $Utils.JsPromise<R>;
    }>;
    rejectUser(body: RejectUserDto, session: SessionPayload): Promise<{
        accessRequest: any;
    }>;
    getStats(): Promise<{
        totalIssuers: any;
        pendingApprovals: any;
        documentsAnchored: any;
        suspendedIssuers: any;
    }>;
    getIssuers(query: IssuersQueryDto): Promise<{
        issuers: $Public.PrismaPromise<T>;
        nextCursor: any;
    }>;
    getIssuer(address: string): Promise<{
        issuer: any;
        recentActivity: $Public.PrismaPromise<T>;
    }>;
    suspendIssuer(body: SuspendIssuerDto, session: SessionPayload): Promise<{
        issuer: $Utils.JsPromise<R>;
    }>;
    reactivateIssuer(body: ReactivateIssuerDto, session: SessionPayload): Promise<{
        issuer: $Utils.JsPromise<R>;
    }>;
    uploadIssuerMetadata(address: string): Promise<{
        metadataUri: string;
        cid: string;
    }>;
    setIssuerMetadata(address: string, body: SetIssuerMetadataDto, session: SessionPayload): Promise<{
        issuer: any;
    }>;
    getAuditLog(query: AuditLogQueryDto): Promise<{
        entries: {
            actorName: {};
            id: string;
            action: string;
            actorAddress: string;
            targetRef: string;
            txHash: string | null;
            detail: string | null;
            createdAt: Date;
        }[];
        nextCursor: any;
    }>;
    exportAuditLog(query: AuditLogQueryDto, res: Response): Promise<void>;
    getIpfsPinFailures(): Promise<{
        count: $Public.PrismaPromise<T>;
    }>;
}
