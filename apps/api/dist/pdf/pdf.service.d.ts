import { IpfsService } from '../ipfs/ipfs.service';
export interface PdfUploadResult {
    success: boolean;
    filename: string;
    fileSize: number;
    documentHash: string;
    cid: string | null;
    gatewayUrl: string | null;
    pinned: boolean;
    pinError?: string;
    timestamp: string;
    message: string;
}
export declare class PdfService {
    private readonly ipfs;
    private readonly logger;
    constructor(ipfs: IpfsService);
    upload(file?: Express.Multer.File, storeOnIpfs?: boolean): Promise<PdfUploadResult>;
    hash(pdfContent: string, filename: string): {
        success: boolean;
        filename: string;
        documentHash: string;
        fileSize: number;
    };
    pinMetadata(metadata: Record<string, unknown>, name: string): Promise<import("../ipfs/ipfs.service").PinOutcome>;
    private validate;
    private hashBuffer;
}
