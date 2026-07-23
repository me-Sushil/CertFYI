import { BlockchainService } from '../blockchain/blockchain.service';
import type { AnchorDto, BatchAnchorDto } from '../common/dto/documents.dto';
export declare class DocumentsService {
    private readonly blockchain;
    private readonly anchoredDocuments;
    private readonly anchoredBatches;
    constructor(blockchain: BlockchainService);
    anchor(body: AnchorDto): {
        success: boolean;
        txHash: string;
        documentHash: string;
        timestamp: string;
        status: string;
        message: string;
    };
    getAnchor(hash?: string): {
        success: boolean;
        document: any;
    };
    anchorBatch(body: BatchAnchorDto): {
        success: boolean;
        batchId: string;
        merkleRoot: string;
        txHash: string;
        documentCount: number;
        timestamp: string;
        status: string;
        message: string;
    };
    getBatch(batchId?: string): {
        success: boolean;
        batch: any;
    };
    verify(documentHash: string, pdfContent?: string): {
        success: boolean;
        isValid: boolean;
        error: string;
        message: string;
        documentHash?: undefined;
        issuer?: undefined;
        documentType?: undefined;
        issuedDate?: undefined;
        status?: undefined;
        onchainData?: undefined;
    } | {
        success: boolean;
        isValid: boolean;
        documentHash: string;
        issuer: string;
        documentType: string;
        issuedDate: string;
        status: string;
        message: string;
        onchainData: {
            transactionHash: string;
            blockNumber: number;
            network: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        isValid: boolean;
        documentHash: string;
        status: string;
        message: string;
        error: string;
        issuer?: undefined;
        documentType?: undefined;
        issuedDate?: undefined;
        onchainData?: undefined;
    };
    quickVerify(hash?: string): {
        success: boolean;
        hash: string;
        isValid: boolean;
        status: string;
    };
    private calculateDocumentHash;
}
