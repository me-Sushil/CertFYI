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
    activeDocuments: number;
    revokedCount: number;
    recentActivityCount: number;
}
export declare class IssuerDocumentDto {
    docHash: string;
    documentType?: string;
    recipientName?: string;
    recipientEmail?: string;
    txHash: string;
    anchoredAt: string;
    revokedAt: string | null;
    status: 'active' | 'revoked';
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
}
export declare class IssuerActivityResponseDto {
    entries: IssuerActivityEntryDto[];
}
