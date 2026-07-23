export declare class PdfService {
    upload(file?: Express.Multer.File): {
        success: boolean;
        filename: string;
        fileSize: number;
        documentHash: string;
        timestamp: string;
        message: string;
    };
    hash(pdfContent: string, filename: string): {
        success: boolean;
        filename: string;
        documentHash: string;
        fileSize: number;
    };
}
