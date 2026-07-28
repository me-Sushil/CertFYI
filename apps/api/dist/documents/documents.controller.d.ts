import { DocumentsService } from './documents.service';
import { AnchorDto, BatchAnchorDto, VerifyDocumentDto } from '../common/dto/documents.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    anchor(body: AnchorDto): Promise<{
        success: boolean;
        txHash: string;
        documentHash: string;
        timestamp: string;
        status: string;
        message: string;
    }>;
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
    verify(body: VerifyDocumentDto): {
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
}
