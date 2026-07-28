"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = __importDefault(require("crypto"));
const shared_constant_1 = require("../common/constants/shared.constant");
const ipfs_service_1 = require("../ipfs/ipfs.service");
const PDF_MAGIC_BYTES = Buffer.from('%PDF-');
let PdfService = PdfService_1 = class PdfService {
    constructor(ipfs) {
        this.ipfs = ipfs;
        this.logger = new common_1.Logger(PdfService_1.name);
    }
    async upload(file, storeOnIpfs = false) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('File must be a PDF');
        }
        if (file.size > shared_constant_1.MAX_PDF_SIZE) {
            throw new common_1.BadRequestException('File size exceeds 50MB limit');
        }
        if (!file.buffer || file.buffer.length < 5 || !file.buffer.slice(0, 5).equals(PDF_MAGIC_BYTES)) {
            throw new common_1.BadRequestException('File does not appear to be a valid PDF');
        }
        const documentHash = '0x' + crypto_1.default.createHash('sha256').update(file.buffer).digest('hex');
        let cid = null;
        let metadataCid = null;
        if (storeOnIpfs) {
            try {
                const uploadResult = await this.ipfs.uploadFile(file.buffer, file.originalname, 'application/pdf');
                cid = uploadResult.cid;
            }
            catch (error) {
                this.logger.error(`IPFS upload failed for ${documentHash}, continuing with null CID`, error);
            }
        }
        this.logger.log('[API] PDF uploaded:', {
            filename: file.originalname,
            size: file.size,
            documentHash,
            cid,
        });
        const response = {
            success: true,
            filename: file.originalname,
            fileSize: file.size,
            documentHash,
            timestamp: new Date().toISOString(),
            message: 'PDF uploaded and hashed successfully',
        };
        if (cid) {
            response.cid = cid;
            response.gatewayUrl = `${process.env.IPFS_GATEWAY_URL || 'https://w3s.link/ipfs'}/${cid}`;
        }
        return response;
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
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ipfs_service_1.IpfsService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map