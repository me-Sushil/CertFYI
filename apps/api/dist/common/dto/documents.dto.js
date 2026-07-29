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
exports.QuickVerifyResponseDto = exports.VerifyDocumentResponseDto = exports.OnchainDataDto = exports.BatchLookupResponseDto = exports.BatchRecordDto = exports.BatchAnchorResponseDto = exports.AnchorLookupResponseDto = exports.AnchorRecordDto = exports.AnchorResponseDto = exports.VerifyDocumentDto = exports.BatchAnchorDto = exports.BatchDocumentDto = exports.RevokeDocumentResponseDto = exports.RevokeDocumentDto = exports.AnchorDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const shared_constant_1 = require("../constants/shared.constant");
const HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const HASH_PATTERN = '^0x[a-fA-F0-9]{64}$';
const TX_REGEX = /^0x[a-fA-F0-9]{64}$/;
const TX_PATTERN = '^0x[a-fA-F0-9]{64}$';
const CID_REGEX = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58,})$/;
const EXAMPLE_HASH = '0x' + 'e3b0c442'.repeat(8);
const EXAMPLE_TX = '0x' + 'ab'.repeat(32);
const EXAMPLE_WALLET = '0x1234567890abcdef1234567890abcdef12345678';
const EXAMPLE_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
class AnchorDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documentHash: { required: true, type: () => String, pattern: "HASH_REGEX" }, txHash: { required: true, type: () => String, pattern: "TX_REGEX" }, documentType: { required: true, type: () => String, enum: shared_constant_1.DOCUMENT_TYPES }, recipientEmail: { required: false, type: () => String }, recipientName: { required: false, type: () => String, maxLength: 200 }, cid: { required: false, type: () => String, pattern: "CID_REGEX" } };
    }
}
exports.AnchorDto = AnchorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SHA-256 hash of the document, 0x-prefixed.',
        pattern: HASH_PATTERN,
        example: EXAMPLE_HASH,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], AnchorDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the confirmed `anchorDocument` transaction, signed by the issuer’s own ' +
            'wallet. The backend verifies this on-chain before persisting anything - identity comes ' +
            'from the session, never from this field.',
        pattern: TX_PATTERN,
        example: EXAMPLE_TX,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(TX_REGEX, { message: 'Invalid transaction hash format' }),
    __metadata("design:type", String)
], AnchorDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_constant_1.DOCUMENT_TYPES, example: 'Certificate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(shared_constant_1.DOCUMENT_TYPES, { message: `documentType must be one of: ${shared_constant_1.DOCUMENT_TYPES.join(', ')}` }),
    __metadata("design:type", String)
], AnchorDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'email', example: 'recipient@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'recipientEmail must be a valid email address' }),
    __metadata("design:type", String)
], AnchorDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ada Lovelace' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AnchorDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'IPFS CID of the PDF itself, when the issuer chose to store a copy.',
        example: EXAMPLE_CID,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(CID_REGEX, { message: 'Invalid CID format' }),
    __metadata("design:type", String)
], AnchorDto.prototype, "cid", void 0);
class RevokeDocumentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documentHash: { required: true, type: () => String, pattern: "HASH_REGEX" }, txHash: { required: true, type: () => String, pattern: "TX_REGEX" } };
    }
}
exports.RevokeDocumentDto = RevokeDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the document to revoke.',
        pattern: HASH_PATTERN,
        example: EXAMPLE_HASH,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], RevokeDocumentDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the confirmed `revokeDocument` transaction, signed by the issuer’s own wallet.',
        pattern: TX_PATTERN,
        example: EXAMPLE_TX,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(TX_REGEX, { message: 'Invalid transaction hash format' }),
    __metadata("design:type", String)
], RevokeDocumentDto.prototype, "txHash", void 0);
class RevokeDocumentResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, documentHash: { required: true, type: () => String }, txHash: { required: true, type: () => String }, revokedAt: { required: true, type: () => String }, message: { required: true, type: () => String } };
    }
}
exports.RevokeDocumentResponseDto = RevokeDocumentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], RevokeDocumentResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], RevokeDocumentResponseDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Revocation transaction hash.', example: EXAMPLE_TX }),
    __metadata("design:type", String)
], RevokeDocumentResponseDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], RevokeDocumentResponseDto.prototype, "revokedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Document revoked' }),
    __metadata("design:type", String)
], RevokeDocumentResponseDto.prototype, "message", void 0);
class BatchDocumentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documentHash: { required: true, type: () => String, pattern: "HASH_REGEX" }, recipientEmail: { required: true, type: () => String }, recipientName: { required: true, type: () => String, maxLength: 200 }, cid: { required: false, type: () => String, pattern: "CID_REGEX" } };
    }
}
exports.BatchDocumentDto = BatchDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ pattern: HASH_PATTERN, example: EXAMPLE_HASH }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], BatchDocumentDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'email', example: 'recipient@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'recipientEmail must be a valid email address' }),
    __metadata("design:type", String)
], BatchDocumentDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ada Lovelace' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], BatchDocumentDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'IPFS CID of the PDF itself, when the issuer chose to store a copy.',
        example: EXAMPLE_CID,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(CID_REGEX, { message: 'Invalid CID format' }),
    __metadata("design:type", String)
], BatchDocumentDto.prototype, "cid", void 0);
class BatchAnchorDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documents: { required: true, type: () => [require("./documents.dto").BatchDocumentDto] }, documentType: { required: true, type: () => String, enum: shared_constant_1.DOCUMENT_TYPES }, txHash: { required: true, type: () => String, pattern: "TX_REGEX" }, batchId: { required: true, type: () => String } };
    }
}
exports.BatchAnchorDto = BatchAnchorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [BatchDocumentDto],
        description: 'Documents anchored together under one Merkle root. Must be non-empty.',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BatchDocumentDto),
    __metadata("design:type", Array)
], BatchAnchorDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_constant_1.DOCUMENT_TYPES, example: 'Certificate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(shared_constant_1.DOCUMENT_TYPES, { message: `documentType must be one of: ${shared_constant_1.DOCUMENT_TYPES.join(', ')}` }),
    __metadata("design:type", String)
], BatchAnchorDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the confirmed `anchorMerkleBatch` transaction, signed by the issuer’s own wallet.',
        pattern: TX_PATTERN,
        example: EXAMPLE_TX,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(TX_REGEX, { message: 'Invalid transaction hash format' }),
    __metadata("design:type", String)
], BatchAnchorDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Caller-supplied identifier used to look the batch up later.',
        example: 'spring-2026-graduates',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BatchAnchorDto.prototype, "batchId", void 0);
class VerifyDocumentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documentHash: { required: true, type: () => String, pattern: "HASH_REGEX" }, pdfContent: { required: false, type: () => String } };
    }
}
exports.VerifyDocumentDto = VerifyDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash to verify.',
        pattern: HASH_PATTERN,
        example: EXAMPLE_HASH,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(HASH_REGEX, { message: 'Invalid document hash format' }),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional base64 PDF. When supplied, its hash must match `documentHash` or verification fails.',
        format: 'byte',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "pdfContent", void 0);
class AnchorResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, txHash: { required: true, type: () => String }, documentHash: { required: true, type: () => String }, cid: { required: true, type: () => String, nullable: true }, metadataCid: { required: true, type: () => String, nullable: true }, timestamp: { required: true, type: () => String }, status: { required: true, type: () => String }, message: { required: true, type: () => String } };
    }
}
exports.AnchorResponseDto = AnchorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], AnchorResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Anchoring transaction hash.', example: EXAMPLE_TX }),
    __metadata("design:type", String)
], AnchorResponseDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], AnchorResponseDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: true,
        type: String,
        description: 'IPFS CID of the PDF, when a copy was stored.',
        example: null,
    }),
    __metadata("design:type", Object)
], AnchorResponseDto.prototype, "cid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: true,
        type: String,
        description: 'IPFS CID of the public, non-identifying metadata sidecar (SRS §8.2).',
        example: EXAMPLE_CID,
    }),
    __metadata("design:type", Object)
], AnchorResponseDto.prototype, "metadataCid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], AnchorResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'confirmed' }),
    __metadata("design:type", String)
], AnchorResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Document successfully anchored on the blockchain' }),
    __metadata("design:type", String)
], AnchorResponseDto.prototype, "message", void 0);
class AnchorRecordDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documentHash: { required: true, type: () => String }, documentType: { required: true, type: () => String }, recipientEmail: { required: false, type: () => String }, recipientName: { required: false, type: () => String }, issuerAddress: { required: true, type: () => String }, issuerName: { required: false, type: () => String }, txHash: { required: true, type: () => String }, cid: { required: true, type: () => String, nullable: true }, metadataCid: { required: true, type: () => String, nullable: true }, timestamp: { required: true, type: () => String }, status: { required: true, type: () => String }, merkleRoot: { required: true, type: () => String, nullable: true }, batchId: { required: true, type: () => String, nullable: true } };
    }
}
exports.AnchorRecordDto = AnchorRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Certificate' }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'recipient@example.com' }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ada Lovelace' }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_WALLET }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "issuerAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Example University' }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "issuerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_TX }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: null }),
    __metadata("design:type", Object)
], AnchorRecordDto.prototype, "cid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: EXAMPLE_CID }),
    __metadata("design:type", Object)
], AnchorRecordDto.prototype, "metadataCid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'confirmed' }),
    __metadata("design:type", String)
], AnchorRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: true,
        type: String,
        description: 'Set only when the document was anchored as part of a batch.',
        example: null,
    }),
    __metadata("design:type", Object)
], AnchorRecordDto.prototype, "merkleRoot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: null }),
    __metadata("design:type", Object)
], AnchorRecordDto.prototype, "batchId", void 0);
class AnchorLookupResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, document: { required: true, type: () => require("./documents.dto").AnchorRecordDto } };
    }
}
exports.AnchorLookupResponseDto = AnchorLookupResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], AnchorLookupResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AnchorRecordDto }),
    __metadata("design:type", AnchorRecordDto)
], AnchorLookupResponseDto.prototype, "document", void 0);
class BatchAnchorResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, batchId: { required: true, type: () => String }, merkleRoot: { required: true, type: () => String }, txHash: { required: true, type: () => String }, documentCount: { required: true, type: () => Number }, timestamp: { required: true, type: () => String }, status: { required: true, type: () => String }, message: { required: true, type: () => String } };
    }
}
exports.BatchAnchorResponseDto = BatchAnchorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BatchAnchorResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'spring-2026-graduates' }),
    __metadata("design:type", String)
], BatchAnchorResponseDto.prototype, "batchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Merkle root committed on-chain.', example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], BatchAnchorResponseDto.prototype, "merkleRoot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_TX }),
    __metadata("design:type", String)
], BatchAnchorResponseDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42 }),
    __metadata("design:type", Number)
], BatchAnchorResponseDto.prototype, "documentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], BatchAnchorResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'confirmed' }),
    __metadata("design:type", String)
], BatchAnchorResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Successfully anchored 42 documents in a single transaction' }),
    __metadata("design:type", String)
], BatchAnchorResponseDto.prototype, "message", void 0);
class BatchRecordDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { batchId: { required: true, type: () => String }, merkleRoot: { required: true, type: () => String }, issuerAddress: { required: true, type: () => String }, issuerName: { required: false, type: () => String }, documentCount: { required: true, type: () => Number }, documents: { required: true, type: () => [require("./documents.dto").BatchDocumentDto] }, txHash: { required: true, type: () => String }, timestamp: { required: true, type: () => String }, status: { required: true, type: () => String }, gasEstimate: { required: true, type: () => String } };
    }
}
exports.BatchRecordDto = BatchRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'spring-2026-graduates' }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "batchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "merkleRoot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_WALLET }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "issuerAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Example University' }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "issuerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42 }),
    __metadata("design:type", Number)
], BatchRecordDto.prototype, "documentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BatchDocumentDto] }),
    __metadata("design:type", Array)
], BatchRecordDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_TX }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'confirmed' }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated gas cost in native currency.', example: '0.15' }),
    __metadata("design:type", String)
], BatchRecordDto.prototype, "gasEstimate", void 0);
class BatchLookupResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, batch: { required: true, type: () => require("./documents.dto").BatchRecordDto } };
    }
}
exports.BatchLookupResponseDto = BatchLookupResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BatchLookupResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BatchRecordDto }),
    __metadata("design:type", BatchRecordDto)
], BatchLookupResponseDto.prototype, "batch", void 0);
class OnchainDataDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { transactionHash: { required: true, type: () => String }, blockNumber: { required: true, type: () => Number }, network: { required: true, type: () => String } };
    }
}
exports.OnchainDataDto = OnchainDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_TX }),
    __metadata("design:type", String)
], OnchainDataDto.prototype, "transactionHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 19845321 }),
    __metadata("design:type", Number)
], OnchainDataDto.prototype, "blockNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ethereum Mainnet' }),
    __metadata("design:type", String)
], OnchainDataDto.prototype, "network", void 0);
class VerifyDocumentResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, isValid: { required: true, type: () => Boolean }, documentHash: { required: false, type: () => String }, issuer: { required: false, type: () => String }, documentType: { required: false, type: () => String }, issuedDate: { required: false, type: () => String }, status: { required: false, type: () => String }, message: { required: true, type: () => String }, onchainData: { required: false, type: () => require("./documents.dto").OnchainDataDto }, cid: { required: false, type: () => String, nullable: true }, gatewayUrl: { required: false, type: () => String, nullable: true }, error: { required: false, type: () => String } };
    }
}
exports.VerifyDocumentResponseDto = VerifyDocumentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'False only when the supplied PDF does not hash to `documentHash`.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], VerifyDocumentResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the document is anchored and not revoked.', example: true }),
    __metadata("design:type", Boolean)
], VerifyDocumentResponseDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], VerifyDocumentResponseDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Issuing organization.', example: 'Stanford University' }),
    __metadata("design:type", String)
], VerifyDocumentResponseDto.prototype, "issuer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Certificate' }),
    __metadata("design:type", String)
], VerifyDocumentResponseDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], VerifyDocumentResponseDto.prototype, "issuedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['active', 'revoked', 'not_found'], example: 'active' }),
    __metadata("design:type", String)
], VerifyDocumentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Document verified successfully' }),
    __metadata("design:type", String)
], VerifyDocumentResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: OnchainDataDto, description: 'Present for valid documents.' }),
    __metadata("design:type", OnchainDataDto)
], VerifyDocumentResponseDto.prototype, "onchainData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        description: 'IPFS CID of the PDF, when the issuer chose to store a copy.',
    }),
    __metadata("design:type", Object)
], VerifyDocumentResponseDto.prototype, "cid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true, description: 'Public gateway URL for `cid`.' }),
    __metadata("design:type", Object)
], VerifyDocumentResponseDto.prototype, "gatewayUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason the document is not valid.' }),
    __metadata("design:type", String)
], VerifyDocumentResponseDto.prototype, "error", void 0);
class QuickVerifyResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, hash: { required: true, type: () => String }, isValid: { required: true, type: () => Boolean }, status: { required: true, type: () => String } };
    }
}
exports.QuickVerifyResponseDto = QuickVerifyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], QuickVerifyResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_HASH }),
    __metadata("design:type", String)
], QuickVerifyResponseDto.prototype, "hash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], QuickVerifyResponseDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['active', 'revoked'], example: 'active' }),
    __metadata("design:type", String)
], QuickVerifyResponseDto.prototype, "status", void 0);
//# sourceMappingURL=documents.dto.js.map