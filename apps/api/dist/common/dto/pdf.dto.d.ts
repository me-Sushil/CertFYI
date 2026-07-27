export declare class PdfHashDto {
    pdfContent: string;
    filename: string;
}
export declare class PdfUploadDto {
    file: Express.Multer.File;
}
export declare class PdfUploadResponseDto {
    success: boolean;
    filename: string;
    fileSize: number;
    documentHash: string;
    timestamp: string;
    message: string;
}
export declare class PdfHashResponseDto {
    success: boolean;
    filename: string;
    documentHash: string;
    fileSize: number;
}
