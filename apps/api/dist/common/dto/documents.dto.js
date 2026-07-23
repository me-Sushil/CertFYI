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
exports.VerifyDocumentDto = exports.BatchAnchorDto = exports.BatchDocumentDto = exports.AnchorDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
class AnchorDto {
}
exports.AnchorDto = AnchorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], AnchorDto.prototype, "documentHash", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnchorDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnchorDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnchorDto.prototype, "recipientName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnchorDto.prototype, "issuerAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnchorDto.prototype, "issuerName", void 0);
class BatchDocumentDto {
}
exports.BatchDocumentDto = BatchDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], BatchDocumentDto.prototype, "documentHash", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchDocumentDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchDocumentDto.prototype, "recipientName", void 0);
class BatchAnchorDto {
}
exports.BatchAnchorDto = BatchAnchorDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BatchDocumentDto),
    __metadata("design:type", Array)
], BatchAnchorDto.prototype, "documents", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BatchAnchorDto.prototype, "issuerAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchAnchorDto.prototype, "issuerName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BatchAnchorDto.prototype, "batchId", void 0);
class VerifyDocumentDto {
}
exports.VerifyDocumentDto = VerifyDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "documentHash", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "pdfContent", void 0);
//# sourceMappingURL=documents.dto.js.map