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
exports.LogFailedAnchorDto = exports.RetryPinResponseDto = exports.RetryPinDto = exports.IssuerActivityQueryDto = exports.IssuerDocumentsQueryDto = exports.IssuerActivityResponseDto = exports.IssuerActivityEntryDto = exports.IssuerDocumentsResponseDto = exports.IssuerDocumentDto = exports.IssuerStatsResponseDto = exports.RequestStatusResponseDto = exports.AccessRequestDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const HASH_PATTERN = '^0x[a-fA-F0-9]{64}$';
const TX_REGEX = /^0x[a-fA-F0-9]{64}$/;
const TX_PATTERN = '^0x[a-fA-F0-9]{64}$';
const MIN_NAME_LENGTH = 2;
const MAX_DESCRIPTION_LENGTH = 1000;
const BlankToUndefined = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));
class AccessRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: false, type: () => String, minLength: MIN_NAME_LENGTH }, email: { required: false, type: () => String }, organization: { required: false, type: () => String }, website: { required: false, type: () => String }, description: { required: false, type: () => String, maxLength: MAX_DESCRIPTION_LENGTH } };
    }
}
exports.AccessRequestDto = AccessRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Contact name of the applicant.',
        minLength: MIN_NAME_LENGTH,
        example: 'Ada Lovelace',
    }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(MIN_NAME_LENGTH),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'email', example: 'ada@university.edu' }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Example University' }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Organization website. Send an empty string to omit.',
        format: 'url',
        example: 'https://university.edu',
    }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'website must be a valid URL, for example https://example.com' }),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'What the organization intends to issue.',
        maxLength: MAX_DESCRIPTION_LENGTH,
        example: 'We issue degree certificates to graduating students.',
    }),
    BlankToUndefined(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(MAX_DESCRIPTION_LENGTH),
    __metadata("design:type", String)
], AccessRequestDto.prototype, "description", void 0);
class RequestStatusResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { requestStatus: { required: true, type: () => String } };
    }
}
exports.RequestStatusResponseDto = RequestStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the caller’s own access request. `NONE` means never applied.',
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
    }),
    __metadata("design:type", String)
], RequestStatusResponseDto.prototype, "requestStatus", void 0);
class IssuerStatsResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalIssued: { required: true, type: () => Number }, recentActivityCount: { required: true, type: () => Number } };
    }
}
exports.IssuerStatsResponseDto = IssuerStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total documents issued by this issuer.', example: 142 }),
    __metadata("design:type", Number)
], IssuerStatsResponseDto.prototype, "totalIssued", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recent activity entries count.', example: 12 }),
    __metadata("design:type", Number)
], IssuerStatsResponseDto.prototype, "recentActivityCount", void 0);
class IssuerDocumentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { docHash: { required: true, type: () => String }, documentType: { required: false, type: () => String }, recipientName: { required: false, type: () => String }, recipientEmail: { required: false, type: () => String }, txHash: { required: true, type: () => String }, anchoredAt: { required: true, type: () => String }, batchId: { required: true, type: () => String, nullable: true } };
    }
}
exports.IssuerDocumentDto = IssuerDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }),
    __metadata("design:type", String)
], IssuerDocumentDto.prototype, "docHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Certificate of Completion' }),
    __metadata("design:type", String)
], IssuerDocumentDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ada Lovelace' }),
    __metadata("design:type", String)
], IssuerDocumentDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ada@example.com' }),
    __metadata("design:type", String)
], IssuerDocumentDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE' }),
    __metadata("design:type", String)
], IssuerDocumentDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-28T12:00:00.000Z' }),
    __metadata("design:type", String)
], IssuerDocumentDto.prototype, "anchoredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true, description: 'Set when issued as part of a bulk batch anchor.' }),
    __metadata("design:type", Object)
], IssuerDocumentDto.prototype, "batchId", void 0);
class IssuerDocumentsResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documents: { required: true, type: () => [require("./issuer.dto").IssuerDocumentDto] }, nextCursor: { required: true, type: () => String, nullable: true } };
    }
}
exports.IssuerDocumentsResponseDto = IssuerDocumentsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IssuerDocumentDto] }),
    __metadata("design:type", Array)
], IssuerDocumentsResponseDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], IssuerDocumentsResponseDto.prototype, "nextCursor", void 0);
class IssuerActivityEntryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { action: { required: true, type: () => String }, detail: { required: false, type: () => String }, createdAt: { required: true, type: () => String }, txHash: { required: false, type: () => String }, docHash: { required: false, type: () => String } };
    }
}
exports.IssuerActivityEntryDto = IssuerActivityEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DOCUMENT_ANCHORED' }),
    __metadata("design:type", String)
], IssuerActivityEntryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Document type: Certificate' }),
    __metadata("design:type", String)
], IssuerActivityEntryDto.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-28T12:00:00.000Z' }),
    __metadata("design:type", String)
], IssuerActivityEntryDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE' }),
    __metadata("design:type", String)
], IssuerActivityEntryDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document hash the entry relates to, when applicable (e.g. a failed IPFS pin).',
        example: '0x' + 'e3b0c442'.repeat(8),
    }),
    __metadata("design:type", String)
], IssuerActivityEntryDto.prototype, "docHash", void 0);
class IssuerActivityResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { entries: { required: true, type: () => [require("./issuer.dto").IssuerActivityEntryDto] }, nextCursor: { required: true, type: () => String, nullable: true } };
    }
}
exports.IssuerActivityResponseDto = IssuerActivityResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IssuerActivityEntryDto] }),
    __metadata("design:type", Array)
], IssuerActivityResponseDto.prototype, "entries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], IssuerActivityResponseDto.prototype, "nextCursor", void 0);
class IssuerDocumentsQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, cursor: { required: false, type: () => String } };
    }
}
exports.IssuerDocumentsQueryDto = IssuerDocumentsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Matches recipient name/email, document type, or hash.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssuerDocumentsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pagination cursor (docHash).' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssuerDocumentsQueryDto.prototype, "cursor", void 0);
class IssuerActivityQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { action: { required: false, type: () => String }, cursor: { required: false, type: () => String } };
    }
}
exports.IssuerActivityQueryDto = IssuerActivityQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ALL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssuerActivityQueryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pagination cursor (entry id).' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssuerActivityQueryDto.prototype, "cursor", void 0);
class RetryPinDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { docHash: { required: true, type: () => String, pattern: "HASH_REGEX" } };
    }
}
exports.RetryPinDto = RetryPinDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the previously anchored document whose metadata sidecar failed to pin.',
        pattern: HASH_PATTERN,
        example: '0x' + 'e3b0c442'.repeat(8),
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], RetryPinDto.prototype, "docHash", void 0);
class RetryPinResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, metadataCid: { required: true, type: () => String, nullable: true }, message: { required: true, type: () => String } };
    }
}
exports.RetryPinResponseDto = RetryPinResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], RetryPinResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' }),
    __metadata("design:type", Object)
], RetryPinResponseDto.prototype, "metadataCid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Metadata sidecar pinned successfully' }),
    __metadata("design:type", String)
], RetryPinResponseDto.prototype, "message", void 0);
class LogFailedAnchorDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { docHash: { required: true, type: () => String, pattern: "HASH_REGEX" }, txHash: { required: false, type: () => String, pattern: "TX_REGEX" }, reason: { required: true, type: () => String, maxLength: 500 } };
    }
}
exports.LogFailedAnchorDto = LogFailedAnchorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the document that failed to anchor.',
        pattern: HASH_PATTERN,
        example: '0x' + 'e3b0c442'.repeat(8),
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], LogFailedAnchorDto.prototype, "docHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction hash, when the failure happened after broadcast (e.g. a revert).',
        pattern: TX_PATTERN,
        example: '0x' + 'ab'.repeat(32),
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(TX_REGEX, { message: 'Invalid transaction hash format' }),
    __metadata("design:type", String)
], LogFailedAnchorDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Human-readable failure reason, shown in the activity feed.',
        maxLength: 500,
        example: 'Transaction reverted on-chain',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], LogFailedAnchorDto.prototype, "reason", void 0);
//# sourceMappingURL=issuer.dto.js.map