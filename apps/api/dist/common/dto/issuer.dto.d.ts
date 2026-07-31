export declare class AccessRequestDto {
    name?: string;
    email?: string;
    organization?: string;
    website?: string;
    description?: string;
}
export declare class RequestStatusResponseDto {
    requestStatus: string;
}
export declare class IssuerStatsResponseDto {
    totalIssued: number;
    recentActivityCount: number;
}
export declare class IssuerDocumentDto {
    docHash: string;
    documentType?: string;
    recipientName?: string;
    recipientEmail?: string;
    txHash: string;
    anchoredAt: string;
    batchId: string | null;
}
export declare class IssuerDocumentsResponseDto {
    documents: IssuerDocumentDto[];
    nextCursor: string | null;
}
export declare class IssuerActivityEntryDto {
    action: string;
    detail?: string;
    createdAt: string;
    txHash?: string;
    docHash?: string;
}
export declare class IssuerActivityResponseDto {
    entries: IssuerActivityEntryDto[];
    nextCursor: string | null;
}
export declare class IssuerDocumentsQueryDto {
    search?: string;
    cursor?: string;
}
export declare class IssuerActivityQueryDto {
    action?: string;
    cursor?: string;
}
export declare class RetryPinDto {
    docHash: string;
}
export declare class RetryPinResponseDto {
    success: boolean;
    metadataCid: string | null;
    message: string;
}
export declare class LogFailedAnchorDto {
    docHash: string;
    txHash?: string;
    reason: string;
}
