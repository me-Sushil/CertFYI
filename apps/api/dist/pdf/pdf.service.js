"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = __importDefault(require("crypto"));
const MAX_SIZE = 50 * 1024 * 1024;
let PdfService = class PdfService {
    upload(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('File must be a PDF');
        }
        if (file.size > MAX_SIZE) {
            throw new common_1.BadRequestException('File size exceeds 50MB limit');
        }
        const documentHash = '0x' + crypto_1.default.createHash('sha256').update(file.buffer).digest('hex');
        console.log('[API] PDF uploaded:', {
            filename: file.originalname,
            size: file.size,
            documentHash,
        });
        return {
            success: true,
            filename: file.originalname,
            fileSize: file.size,
            documentHash,
            timestamp: new Date().toISOString(),
            message: 'PDF uploaded and hashed successfully',
        };
    }
    hash(pdfContent, filename) {
        const buffer = Buffer.from(pdfContent, 'base64');
        const documentHash = '0x' + crypto_1.default.createHash('sha256').update(buffer).digest('hex');
        return {
            success: true,
            filename,
            documentHash,
            fileSize: buffer.length,
        };
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map