export declare const REQUEST_STATUSES: readonly ["PENDING", "APPROVED", "REJECTED"];
export declare const REQUEST_STATUS_FILTERS: readonly ["ALL", "PENDING", "APPROVED", "REJECTED"];
export declare class ApproveUserDto {
    walletAddress: string;
    txHash: string;
}
export declare class RejectUserDto {
    walletAddress: string;
    reason?: string;
}
export declare class RequestsQueryDto {
    status?: string;
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
export declare class IssuerRowDto {
    walletAddress: string;
    name: string | null;
    email: string | null;
    organization: string | null;
    approvedAt: Date | null;
    documentCount: number;
}
export declare class IssuerListResponseDto {
    issuers: IssuerRowDto[];
}
export declare class SuspendIssuerDto {
    walletAddress: string;
}
export declare class AuditLogEntryDto {
    id: string;
    action: string;
    actor: string;
    target: string | null;
    details: string | null;
    timestamp: Date;
}
export declare class AuditLogListResponseDto {
    entries: AuditLogEntryDto[];
}
