import { IpfsService } from '../ipfs/ipfs.service';
export declare class PdfService {
    private readonly ipfs;
    private readonly logger;
    constructor(ipfs: IpfsService);
    upload(file?: Express.Multer.File, storeOnIpfs?: boolean): Promise<Record<string, unknown>>;
    hash(pdfContent: string, filename: string): {
        success: boolean;
        filename: string;
        documentHash: string;
        fileSize: number;
    };
}
