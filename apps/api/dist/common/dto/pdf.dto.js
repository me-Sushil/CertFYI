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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfHashResponseDto = exports.PdfUploadResponseDto = exports.PdfUploadDto = exports.PdfHashDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const EXAMPLE_HASH = '0x' + 'e3b0c442'.repeat(8);
class PdfHashDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { pdfContent: { required: true, type: () => String }, filename: { required: true, type: () => String } };
    }
}
exports.PdfHashDto = PdfHashDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base64-encoded PDF bytes.',
        format: 'byte',
        example: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFI...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PdfHashDto.prototype, "pdfContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original file name, echoed back in the response.', example: 'degree.pdf' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PdfHashDto.prototype, "filename", void 0);
class PdfUploadDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { file: { required: true, type: () => Object } };
    }
}
exports.PdfUploadDto = PdfUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'PDF file to hash. Must be `application/pdf` and at most 50 MB.',
    }),
    __metadata("design:type", Object)
], PdfUploadDto.prototype, "file", void 0);
class PdfUploadResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, filename: { required: true, type: () => String }, fileSize: { required: true, type: () => Number }, documentHash: { required: true, type: () => String }, timestamp: { required: true, type: () => String }, message: { required: true, type: () => String } };
    }
}
exports.PdfUploadResponseDto = PdfUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PdfUploadResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'degree.pdf' }),
    __metadata("design:type", String)
], PdfUploadResponseDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Size in bytes.', example: 184320 }),
    __metadata("design:type", Number)
], PdfUploadResponseDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SHA-256 of the file bytes, 0x-prefixed.', example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], PdfUploadResponseDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], PdfUploadResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PDF uploaded and hashed successfully' }),
    __metadata("design:type", String)
], PdfUploadResponseDto.prototype, "message", void 0);
class PdfHashResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, filename: { required: true, type: () => String }, documentHash: { required: true, type: () => String }, fileSize: { required: true, type: () => Number } };
    }
}
exports.PdfHashResponseDto = PdfHashResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PdfHashResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'degree.pdf' }),
    __metadata("design:type", String)
], PdfHashResponseDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'SHA-256 of the decoded bytes, 0x-prefixed.', example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], PdfHashResponseDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Size in bytes of the decoded PDF.', example: 184320 }),
    __metadata("design:type", Number)
], PdfHashResponseDto.prototype, "fileSize", void 0);
//# sourceMappingURL=pdf.dto.js.map