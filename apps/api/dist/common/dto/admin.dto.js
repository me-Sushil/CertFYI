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
exports.AuditLogResponseDto = exports.AuditLogEntryDto = exports.AdminDocumentsListResponseDto = exports.AdminDocumentEntityDto = exports.AdminDocumentsQueryDto = exports.DOCUMENT_STATUS_FILTERS = exports.AdminStatsResponseDto = exports.IssuerDetailResponseDto = exports.IssuerListResponseDto = exports.IssuerEntityDto = exports.AccessRequestDecisionResponseDto = exports.AccessRequestListResponseDto = exports.AccessRequestEntityDto = exports.AuditLogQueryDto = exports.IssuersQueryDto = exports.RequestsQueryDto = exports.SetIssuerMetadataDto = exports.ReactivateIssuerDto = exports.SuspendIssuerDto = exports.RejectUserDto = exports.ApproveUserDto = exports.ISSUER_STATUS_FILTERS = exports.REQUEST_STATUS_FILTERS = exports.REQUEST_STATUSES = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const EXAMPLE_WALLET = '0x1234567890abcdef1234567890abcdef12345678';
const EXAMPLE_TX = '0x' + 'ab'.repeat(32);
exports.REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
exports.REQUEST_STATUS_FILTERS = ['ALL', ...exports.REQUEST_STATUSES];
exports.ISSUER_STATUS_FILTERS = ['ALL', 'ACTIVE', 'SUSPENDED'];
class ApproveUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{40}$/" }, txHash: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{64}$/" } };
    }
}
exports.ApproveUserDto = ApproveUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet whose access request is being approved.',
        example: EXAMPLE_WALLET,
        pattern: '^0x[a-fA-F0-9]{40}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' }),
    __metadata("design:type", String)
], ApproveUserDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the `grantRole(ISSUER_ROLE, walletAddress)` transaction the admin already sent. ' +
            'Verified on-chain before the request is marked approved.',
        example: EXAMPLE_TX,
        pattern: '^0x[a-fA-F0-9]{64}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' }),
    __metadata("design:type", String)
], ApproveUserDto.prototype, "txHash", void 0);
class RejectUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{40}$/" }, reason: { required: false, type: () => String } };
    }
}
exports.RejectUserDto = RejectUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet whose access request is being rejected.',
        example: EXAMPLE_WALLET,
        pattern: '^0x[a-fA-F0-9]{40}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' }),
    __metadata("design:type", String)
], RejectUserDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason surfaced to the applicant. Stored on the request record.',
        example: 'Organization could not be verified.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectUserDto.prototype, "reason", void 0);
class SuspendIssuerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{40}$/" }, txHash: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{64}$/" } };
    }
}
exports.SuspendIssuerDto = SuspendIssuerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet of the issuer to suspend.',
        example: EXAMPLE_WALLET,
        pattern: '^0x[a-fA-F0-9]{40}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' }),
    __metadata("design:type", String)
], SuspendIssuerDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the `revokeRole(ISSUER_ROLE, walletAddress)` transaction the admin already sent.',
        example: EXAMPLE_TX,
        pattern: '^0x[a-fA-F0-9]{64}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' }),
    __metadata("design:type", String)
], SuspendIssuerDto.prototype, "txHash", void 0);
class ReactivateIssuerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{40}$/" }, txHash: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{64}$/" } };
    }
}
exports.ReactivateIssuerDto = ReactivateIssuerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet of the issuer to reactivate.',
        example: EXAMPLE_WALLET,
        pattern: '^0x[a-fA-F0-9]{40}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' }),
    __metadata("design:type", String)
], ReactivateIssuerDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the `grantRole(ISSUER_ROLE, walletAddress)` transaction the admin already sent.',
        example: EXAMPLE_TX,
        pattern: '^0x[a-fA-F0-9]{64}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' }),
    __metadata("design:type", String)
], ReactivateIssuerDto.prototype, "txHash", void 0);
class SetIssuerMetadataDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { txHash: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{64}$/" } };
    }
}
exports.SetIssuerMetadataDto = SetIssuerMetadataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the `setIssuerMetadata(wallet, metadataURI)` transaction the admin already sent.',
        example: EXAMPLE_TX,
        pattern: '^0x[a-fA-F0-9]{64}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' }),
    __metadata("design:type", String)
], SetIssuerMetadataDto.prototype, "txHash", void 0);
class RequestsQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => String, enum: exports.REQUEST_STATUS_FILTERS } };
    }
}
exports.RequestsQueryDto = RequestsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by status. Defaults to `PENDING`; `ALL` disables filtering.',
        enum: exports.REQUEST_STATUS_FILTERS,
        default: 'PENDING',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.REQUEST_STATUS_FILTERS),
    __metadata("design:type", String)
], RequestsQueryDto.prototype, "status", void 0);
class IssuersQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => String, enum: exports.ISSUER_STATUS_FILTERS }, search: { required: false, type: () => String }, cursor: { required: false, type: () => String }, limit: { required: false, type: () => String } };
    }
}
exports.IssuersQueryDto = IssuersQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by issuer status. Defaults to `ALL`.',
        enum: exports.ISSUER_STATUS_FILTERS,
        default: 'ALL',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.ISSUER_STATUS_FILTERS),
    __metadata("design:type", String)
], IssuersQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search term matching name, organization, or wallet.',
        example: 'Stanford',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssuersQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cursor for cursor-based pagination.',
        example: '0xabc...',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssuersQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page size (max 100).',
        example: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssuersQueryDto.prototype, "limit", void 0);
class AuditLogQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { action: { required: false, type: () => String }, actor: { required: false, type: () => String }, from: { required: false, type: () => String }, to: { required: false, type: () => String }, cursor: { required: false, type: () => String }, limit: { required: false, type: () => String } };
    }
}
exports.AuditLogQueryDto = AuditLogQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by action type.',
        example: 'ALL',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by actor wallet address.',
        example: EXAMPLE_WALLET,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "actor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Start date ISO string.',
        example: '2026-01-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'End date ISO string.',
        example: '2026-07-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cursor for cursor-based pagination.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page size (max 100).',
        example: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "limit", void 0);
class AccessRequestEntityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, walletAddress: { required: true, type: () => String }, name: { required: true, type: () => String, nullable: true }, email: { required: true, type: () => String, nullable: true }, organization: { required: true, type: () => String, nullable: true }, website: { required: true, type: () => String, nullable: true }, description: { required: true, type: () => String, nullable: true }, status: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, decidedAt: { required: true, type: () => Date, nullable: true }, rejectionReason: { required: true, type: () => String, nullable: true } };
    }
}
exports.AccessRequestEntityDto = AccessRequestEntityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx7f2k9a0000qw8h3n1e5r2t' }),
    __metadata("design:type", String)
], AccessRequestEntityDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_WALLET }),
    __metadata("design:type", String)
], AccessRequestEntityDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Ada Lovelace' }),
    __metadata("design:type", Object)
], AccessRequestEntityDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'ada@university.edu' }),
    __metadata("design:type", Object)
], AccessRequestEntityDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Example University' }),
    __metadata("design:type", Object)
], AccessRequestEntityDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'https://university.edu' }),
    __metadata("design:type", Object)
], AccessRequestEntityDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'We issue degree certificates.' }),
    __metadata("design:type", Object)
], AccessRequestEntityDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.REQUEST_STATUSES, example: 'PENDING' }),
    __metadata("design:type", String)
], AccessRequestEntityDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AccessRequestEntityDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        format: 'date-time',
        nullable: true,
        type: String,
        description: 'When an admin approved or rejected the request.',
        example: null,
    }),
    __metadata("design:type", Object)
], AccessRequestEntityDto.prototype, "decidedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: null }),
    __metadata("design:type", Object)
], AccessRequestEntityDto.prototype, "rejectionReason", void 0);
class AccessRequestListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { requests: { required: true, type: () => [require("./admin.dto").AccessRequestEntityDto] } };
    }
}
exports.AccessRequestListResponseDto = AccessRequestListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AccessRequestEntityDto], description: 'Newest request first.' }),
    __metadata("design:type", Array)
], AccessRequestListResponseDto.prototype, "requests", void 0);
class AccessRequestDecisionResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { accessRequest: { required: true, type: () => require("./admin.dto").AccessRequestEntityDto } };
    }
}
exports.AccessRequestDecisionResponseDto = AccessRequestDecisionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: AccessRequestEntityDto, description: 'The request after the decision.' }),
    __metadata("design:type", AccessRequestEntityDto)
], AccessRequestDecisionResponseDto.prototype, "accessRequest", void 0);
class IssuerEntityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String }, organization: { required: true, type: () => String, nullable: true }, name: { required: true, type: () => String, nullable: true }, email: { required: true, type: () => String, nullable: true }, website: { required: true, type: () => String, nullable: true }, metadataUri: { required: true, type: () => String, nullable: true }, status: { required: true, type: () => String }, documentCount: { required: true, type: () => Number }, registeredAt: { required: true, type: () => Date }, registerTxHash: { required: true, type: () => String }, suspendedAt: { required: true, type: () => Date, nullable: true }, suspendTxHash: { required: true, type: () => String, nullable: true } };
    }
}
exports.IssuerEntityDto = IssuerEntityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_WALLET }),
    __metadata("design:type", String)
], IssuerEntityDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Example University' }),
    __metadata("design:type", Object)
], IssuerEntityDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Ada Lovelace' }),
    __metadata("design:type", Object)
], IssuerEntityDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'admin@example.edu' }),
    __metadata("design:type", Object)
], IssuerEntityDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'https://example.edu' }),
    __metadata("design:type", Object)
], IssuerEntityDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'ipfs://...' }),
    __metadata("design:type", Object)
], IssuerEntityDto.prototype, "metadataUri", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ACTIVE', 'SUSPENDED'], example: 'ACTIVE' }),
    __metadata("design:type", String)
], IssuerEntityDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 142 }),
    __metadata("design:type", Number)
], IssuerEntityDto.prototype, "documentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], IssuerEntityDto.prototype, "registeredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_TX }),
    __metadata("design:type", String)
], IssuerEntityDto.prototype, "registerTxHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', nullable: true, type: String, example: null }),
    __metadata("design:type", Object)
], IssuerEntityDto.prototype, "suspendedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: null }),
    __metadata("design:type", Object)
], IssuerEntityDto.prototype, "suspendTxHash", void 0);
class IssuerListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { issuers: { required: true, type: () => [require("./admin.dto").IssuerEntityDto] }, nextCursor: { required: true, type: () => String, nullable: true } };
    }
}
exports.IssuerListResponseDto = IssuerListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IssuerEntityDto] }),
    __metadata("design:type", Array)
], IssuerListResponseDto.prototype, "issuers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: '0xnext...' }),
    __metadata("design:type", Object)
], IssuerListResponseDto.prototype, "nextCursor", void 0);
class IssuerDetailResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { issuer: { required: true, type: () => require("./admin.dto").IssuerEntityDto }, recentActivity: { required: true } };
    }
}
exports.IssuerDetailResponseDto = IssuerDetailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: IssuerEntityDto }),
    __metadata("design:type", IssuerEntityDto)
], IssuerDetailResponseDto.prototype, "issuer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object], description: 'Recent audit entries for this issuer.' }),
    __metadata("design:type", Array)
], IssuerDetailResponseDto.prototype, "recentActivity", void 0);
class AdminStatsResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalIssuers: { required: true, type: () => Number }, pendingApprovals: { required: true, type: () => Number }, documentsAnchored: { required: true, type: () => Number }, suspendedIssuers: { required: true, type: () => Number } };
    }
}
exports.AdminStatsResponseDto = AdminStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42 }),
    __metadata("design:type", Number)
], AdminStatsResponseDto.prototype, "totalIssuers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], AdminStatsResponseDto.prototype, "pendingApprovals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 52481 }),
    __metadata("design:type", Number)
], AdminStatsResponseDto.prototype, "documentsAnchored", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], AdminStatsResponseDto.prototype, "suspendedIssuers", void 0);
exports.DOCUMENT_STATUS_FILTERS = ['ALL', 'ACTIVE', 'REVOKED'];
class AdminDocumentsQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => String, enum: exports.DOCUMENT_STATUS_FILTERS }, search: { required: false, type: () => String }, cursor: { required: false, type: () => String }, limit: { required: false, type: () => String } };
    }
}
exports.AdminDocumentsQueryDto = AdminDocumentsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by document status. Defaults to `ALL`.',
        enum: exports.DOCUMENT_STATUS_FILTERS,
        default: 'ALL',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.DOCUMENT_STATUS_FILTERS),
    __metadata("design:type", String)
], AdminDocumentsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search term matching recipient name, email, type, or doc hash.',
        example: 'Stanford',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminDocumentsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cursor for cursor-based pagination.',
        example: '0xabc...',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminDocumentsQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page size (max 100).',
        example: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminDocumentsQueryDto.prototype, "limit", void 0);
class AdminDocumentEntityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { docHash: { required: true, type: () => String }, issuerAddress: { required: true, type: () => String }, issuerName: { required: true, type: () => String, nullable: true }, documentType: { required: true, type: () => String, nullable: true }, recipientName: { required: true, type: () => String, nullable: true }, recipientEmail: { required: true, type: () => String, nullable: true }, cid: { required: true, type: () => String, nullable: true }, txHash: { required: true, type: () => String }, anchoredAt: { required: true, type: () => Date }, revokedAt: { required: true, type: () => Date, nullable: true }, revokeTxHash: { required: true, type: () => String, nullable: true }, status: { required: true, type: () => String }, batchId: { required: true, type: () => String, nullable: true } };
    }
}
exports.AdminDocumentEntityDto = AdminDocumentEntityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x' + 'ab'.repeat(32) }),
    __metadata("design:type", String)
], AdminDocumentEntityDto.prototype, "docHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x1234567890abcdef1234567890abcdef12345678' }),
    __metadata("design:type", String)
], AdminDocumentEntityDto.prototype, "issuerAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Example University' }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "issuerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'DEGREE' }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Ada Lovelace' }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'ada@university.edu' }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'ipfs://...' }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "cid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x' + 'ab'.repeat(32) }),
    __metadata("design:type", String)
], AdminDocumentEntityDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AdminDocumentEntityDto.prototype, "anchoredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', nullable: true, type: String, example: null }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "revokedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: null }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "revokeTxHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'active' }),
    __metadata("design:type", String)
], AdminDocumentEntityDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: null, description: 'Set when issued as part of a bulk batch anchor.' }),
    __metadata("design:type", Object)
], AdminDocumentEntityDto.prototype, "batchId", void 0);
class AdminDocumentsListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { documents: { required: true, type: () => [require("./admin.dto").AdminDocumentEntityDto] }, nextCursor: { required: true, type: () => String, nullable: true } };
    }
}
exports.AdminDocumentsListResponseDto = AdminDocumentsListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AdminDocumentEntityDto] }),
    __metadata("design:type", Array)
], AdminDocumentsListResponseDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: '0xnext...' }),
    __metadata("design:type", Object)
], AdminDocumentsListResponseDto.prototype, "nextCursor", void 0);
class AuditLogEntryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, action: { required: true, type: () => String }, actorAddress: { required: true, type: () => String }, actorName: { required: true, type: () => String }, targetRef: { required: true, type: () => String }, txHash: { required: true, type: () => String, nullable: true }, detail: { required: true, type: () => String, nullable: true }, createdAt: { required: true, type: () => Date } };
    }
}
exports.AuditLogEntryDto = AuditLogEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: EXAMPLE_WALLET }),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "actorAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Example University' }),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "actorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "targetRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: EXAMPLE_TX }),
    __metadata("design:type", Object)
], AuditLogEntryDto.prototype, "txHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Approved by admin' }),
    __metadata("design:type", Object)
], AuditLogEntryDto.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AuditLogEntryDto.prototype, "createdAt", void 0);
class AuditLogResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { entries: { required: true, type: () => [require("./admin.dto").AuditLogEntryDto] }, nextCursor: { required: true, type: () => String, nullable: true } };
    }
}
exports.AuditLogResponseDto = AuditLogResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AuditLogEntryDto] }),
    __metadata("design:type", Array)
], AuditLogResponseDto.prototype, "entries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'clx7f2k...' }),
    __metadata("design:type", Object)
], AuditLogResponseDto.prototype, "nextCursor", void 0);
//# sourceMappingURL=admin.dto.js.map