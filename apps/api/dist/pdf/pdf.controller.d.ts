import { PdfService } from './pdf.service';
import { PdfHashDto } from '../common/dto/pdf.dto';
export declare class PdfController {
    private readonly pdfService;
    constructor(pdfService: PdfService);
    upload(file?: Express.Multer.File): {
        success: boolean;
        filename: string;
        fileSize: number;
        documentHash: string;
        timestamp: string;
        message: string;
    };
    hash(body: PdfHashDto): {
        success: boolean;
        filename: string;
        documentHash: string;
        fileSize: number;
    };
}
