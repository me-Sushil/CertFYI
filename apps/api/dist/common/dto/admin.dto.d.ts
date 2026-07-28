export declare const REQUEST_STATUSES: readonly ["PENDING", "APPROVED", "REJECTED"];
export declare const REQUEST_STATUS_FILTERS: readonly ["ALL", "PENDING", "APPROVED", "REJECTED"];
export declare const ISSUER_STATUS_FILTERS: readonly ["ALL", "ACTIVE", "SUSPENDED"];
export declare class ApproveUserDto {
    walletAddress: string;
    txHash: string;
}
export declare class RejectUserDto {
    walletAddress: string;
    reason?: string;
}
export declare class SuspendIssuerDto {
    walletAddress: string;
    txHash: string;
}
export declare class ReactivateIssuerDto {
    walletAddress: string;
    txHash: string;
}
export declare class SetIssuerMetadataDto {
    txHash: string;
}
export declare class RequestsQueryDto {
    status?: string;
}
export declare class IssuersQueryDto {
    status?: string;
    search?: string;
    cursor?: string;
    limit?: string;
}
export declare class AuditLogQueryDto {
    action?: string;
    actor?: string;
    from?: string;
    to?: string;
    cursor?: string;
    limit?: string;
}
export declare class AccessRequestEntityDto {
    id: string;
    walletAddress: string;
    name: string | null;
    email: string | null;
    organization: string | null;
    website: string | null;
    description: string | null;
    status: string;
    createdAt: Date;
    decidedAt: Date | null;
    rejectionReason: string | null;
}
export declare class AccessRequestListResponseDto {
    requests: AccessRequestEntityDto[];
}
export declare class AccessRequestDecisionResponseDto {
    accessRequest: AccessRequestEntityDto;
}
export declare class IssuerEntityDto {
    walletAddress: string;
    organization: string | null;
    name: string | null;
    email: string | null;
    website: string | null;
    metadataUri: string | null;
    status: string;
    documentCount: number;
    registeredAt: Date;
    registerTxHash: string;
    suspendedAt: Date | null;
    suspendTxHash: string | null;
}
export declare class IssuerListResponseDto {
    issuers: IssuerEntityDto[];
    nextCursor: string | null;
}
export declare class IssuerDetailResponseDto {
    issuer: IssuerEntityDto;
    recentActivity: Array<{
        action: string;
        detail: string | null;
        createdAt: Date;
        txHash: string | null;
    }>;
}
export declare class AdminStatsResponseDto {
    totalIssuers: number;
    pendingApprovals: number;
    documentsAnchored: number;
    suspendedIssuers: number;
}
export declare class AuditLogEntryDto {
    id: string;
    action: string;
    actorAddress: string;
    actorName: string;
    targetRef: string;
    txHash: string | null;
    detail: string | null;
    createdAt: Date;
}
export declare class AuditLogResponseDto {
    entries: AuditLogEntryDto[];
    nextCursor: string | null;
}
