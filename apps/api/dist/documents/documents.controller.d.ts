import { DocumentsService } from './documents.service';
import { AnchorDto, BatchAnchorDto, RevokeDocumentDto, VerifyDocumentDto } from '../common/dto/documents.dto';
import type { SessionPayload } from '../common/constants/roles.constant';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    anchor(user: SessionPayload, body: AnchorDto): Promise<{
        success: boolean;
        txHash: string;
        documentHash: string;
        cid: string | null;
        metadataCid: string | null;
        timestamp: string;
        status: string;
        message: string;
    }>;
    revoke(user: SessionPayload, body: RevokeDocumentDto): Promise<{
        success: boolean;
        documentHash: string;
        txHash: string;
        revokedAt: string;
        message: string;
    }>;
    getAnchor(hash?: string): Promise<{
        success: boolean;
        document: {
            documentHash: string;
            documentType: string;
            recipientEmail: string | undefined;
            recipientName: string | undefined;
            issuerAddress: string;
            issuerName: string | undefined;
            txHash: string;
            cid: string | null;
            metadataCid: string | null;
            timestamp: string;
            status: string;
            merkleRoot: null;
            batchId: null;
        };
    }>;
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
    verify(body: VerifyDocumentDto): Promise<{
        success: boolean;
        isValid: boolean;
        error: string;
        message: string;
        documentHash?: undefined;
        status?: undefined;
    } | {
        success: boolean;
        isValid: boolean;
        documentHash: string;
        status: string;
        message: string;
        error: string;
    } | {
        isValid: boolean;
        status: string;
        message: string;
        error: string;
        success: boolean;
        documentHash: string;
        issuer: string;
        documentType: string;
        issuedDate: string;
        cid: string | null;
        gatewayUrl: string | null;
        onchainData: {
            transactionHash: string;
            blockNumber: number;
            network: string;
        } | undefined;
    } | {
        isValid: boolean;
        status: string;
        message: string;
        success: boolean;
        documentHash: string;
        issuer: string;
        documentType: string;
        issuedDate: string;
        cid: string | null;
        gatewayUrl: string | null;
        onchainData: {
            transactionHash: string;
            blockNumber: number;
            network: string;
        } | undefined;
        error?: undefined;
    }>;
    quickVerify(hash?: string): Promise<{
        success: boolean;
        hash: string;
        isValid: boolean;
        status: string;
    }>;
}
