import { BlockchainService } from '../blockchain/blockchain.service';
import { AuditService } from '../audit/audit.service';
import { IpfsService } from '../ipfs/ipfs.service';
import type { AnchorDto, BatchAnchorDto, RevokeDocumentDto } from '../common/dto/documents.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private readonly blockchain;
    private readonly audit;
    private readonly ipfs;
    private readonly prisma;
    constructor(blockchain: BlockchainService, audit: AuditService, ipfs: IpfsService, prisma: PrismaService);
    anchor(body: AnchorDto, issuerAddress: string): Promise<{
        success: boolean;
        txHash: string;
        documentHash: string;
        cid: string | null;
        metadataCid: string | null;
        timestamp: string;
        status: string;
        message: string;
    }>;
    revoke(body: RevokeDocumentDto, issuerAddress: string): Promise<{
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
    anchorBatch(body: BatchAnchorDto, issuerAddress: string): Promise<{
        success: boolean;
        batchId: string;
        merkleRoot: `0x${string}`;
        txHash: string;
        documentCount: number;
        timestamp: string;
        status: string;
        message: string;
    }>;
    getBatch(batchId?: string): Promise<{
        success: boolean;
        batch: {
            batchId: string;
            issuerAddress: string;
            issuerName: string | undefined;
            documentCount: number;
            documents: {
                documentHash: string;
                recipientEmail: string | undefined;
                recipientName: string | undefined;
                cid: string | undefined;
            }[];
            txHash: string;
            timestamp: string;
            status: string;
        };
    }>;
    verify(documentHash: string, pdfContent?: string): Promise<{
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
    private pinMetadataSidecar;
    private calculateDocumentHash;
}
