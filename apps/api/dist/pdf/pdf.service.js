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
const ipfs_service_1 = require("../ipfs/ipfs.service");
const shared_constant_1 = require("../common/constants/shared.constant");
let PdfService = PdfService_1 = class PdfService {
    constructor(ipfs) {
        this.ipfs = ipfs;
        this.logger = new common_1.Logger(PdfService_1.name);
    }
    async upload(file, storeOnIpfs = false) {
        this.validate(file);
        const pdf = file;
        const documentHash = this.hashBuffer(pdf.buffer);
        const timestamp = new Date().toISOString();
        if (!storeOnIpfs) {
            return {
                success: true,
                filename: pdf.originalname,
                fileSize: pdf.size,
                documentHash,
                cid: null,
                gatewayUrl: null,
                pinned: false,
                timestamp,
                message: 'PDF hashed. IPFS storage was not requested.',
            };
        }
        const outcome = await this.ipfs.pinFile(pdf.buffer, pdf.originalname, 'application/pdf');
        if (!outcome.pinned) {
            this.logger.warn(`Pin failed for ${pdf.originalname}, continuing without a CID`);
        }
        return {
            success: true,
            filename: pdf.originalname,
            fileSize: pdf.size,
            documentHash,
            cid: outcome.cid,
            gatewayUrl: outcome.gatewayUrl,
            pinned: outcome.pinned,
            ...(outcome.pinned ? {} : { pinError: outcome.error }),
            timestamp,
            message: outcome.pinned
                ? 'PDF hashed and pinned to IPFS.'
                : 'PDF hashed. IPFS storage is unavailable - the document can still be anchored and verified.',
        };
    }
    hash(pdfContent, filename) {
        const buffer = Buffer.from(pdfContent, 'base64');
        return {
            success: true,
            filename,
            documentHash: this.hashBuffer(buffer),
            fileSize: buffer.length,
        };
    }
    async pinMetadata(metadata, name) {
        return this.ipfs.pinJson(metadata, name);
    }
    validate(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('File must be a PDF');
        }
        if (file.size > shared_constant_1.MAX_PDF_SIZE_BYTES) {
            throw new common_1.BadRequestException('File size exceeds 50MB limit');
        }
        if (!file.buffer.subarray(0, shared_constant_1.PDF_MAGIC_BYTES.length).equals(shared_constant_1.PDF_MAGIC_BYTES)) {
            throw new common_1.BadRequestException('File content is not a valid PDF');
        }
    }
    hashBuffer(data) {
        return '0x' + crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ipfs_service_1.IpfsService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map