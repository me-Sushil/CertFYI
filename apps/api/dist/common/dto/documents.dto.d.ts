export declare class AnchorDto {
    documentHash: string;
    documentType: string;
    recipientEmail?: string;
    recipientName?: string;
    issuerAddress: string;
    issuerName?: string;
}
export declare class BatchDocumentDto {
    documentHash: string;
    recipientEmail?: string;
    recipientName?: string;
}
export declare class BatchAnchorDto {
    documents: BatchDocumentDto[];
    issuerAddress: string;
    issuerName?: string;
    batchId: string;
}
export declare class VerifyDocumentDto {
    documentHash: string;
    pdfContent?: string;
}
