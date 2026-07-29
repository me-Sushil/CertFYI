export declare class AnchorDto {
    documentHash: string;
    txHash: string;
    documentType: string;
    recipientEmail?: string;
    recipientName?: string;
    cid?: string;
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
export declare class AnchorResponseDto {
    success: boolean;
    txHash: string;
    documentHash: string;
    cid: string | null;
    metadataCid: string | null;
    timestamp: string;
    status: string;
    message: string;
}
export declare class AnchorRecordDto {
    documentHash: string;
    documentType: string;
    recipientEmail?: string;
    recipientName?: string;
    issuerAddress: string;
    issuerName?: string;
    txHash: string;
    cid: string | null;
    metadataCid: string | null;
    timestamp: string;
    status: string;
    merkleRoot: string | null;
    batchId: string | null;
}
export declare class AnchorLookupResponseDto {
    success: boolean;
    document: AnchorRecordDto;
}
export declare class BatchAnchorResponseDto {
    success: boolean;
    batchId: string;
    merkleRoot: string;
    txHash: string;
    documentCount: number;
    timestamp: string;
    status: string;
    message: string;
}
export declare class BatchRecordDto {
    batchId: string;
    merkleRoot: string;
    issuerAddress: string;
    issuerName?: string;
    documentCount: number;
    documents: BatchDocumentDto[];
    txHash: string;
    timestamp: string;
    status: string;
    gasEstimate: string;
}
export declare class BatchLookupResponseDto {
    success: boolean;
    batch: BatchRecordDto;
}
export declare class OnchainDataDto {
    transactionHash: string;
    blockNumber: number;
    network: string;
}
export declare class VerifyDocumentResponseDto {
    success: boolean;
    isValid: boolean;
    documentHash?: string;
    issuer?: string;
    documentType?: string;
    issuedDate?: string;
    status?: string;
    message: string;
    onchainData?: OnchainDataDto;
    cid?: string | null;
    gatewayUrl?: string | null;
    error?: string;
}
export declare class QuickVerifyResponseDto {
    success: boolean;
    hash: string;
    isValid: boolean;
    status: string;
}
