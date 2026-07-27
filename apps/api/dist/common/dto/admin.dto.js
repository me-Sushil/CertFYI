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
exports.AuditLogListResponseDto = exports.AuditLogEntryDto = exports.SuspendIssuerDto = exports.IssuerListResponseDto = exports.IssuerRowDto = exports.AccessRequestDecisionResponseDto = exports.AccessRequestListResponseDto = exports.AccessRequestEntityDto = exports.RequestsQueryDto = exports.RejectUserDto = exports.ApproveUserDto = exports.REQUEST_STATUS_FILTERS = exports.REQUEST_STATUSES = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const EXAMPLE_WALLET = '0x1234567890abcdef1234567890abcdef12345678';
const EXAMPLE_TX = '0x' + 'ab'.repeat(32);
exports.REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
exports.REQUEST_STATUS_FILTERS = ['ALL', ...exports.REQUEST_STATUSES];
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
class IssuerRowDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String }, name: { required: true, type: () => String, nullable: true }, email: { required: true, type: () => String, nullable: true }, organization: { required: true, type: () => String, nullable: true }, approvedAt: { required: true, type: () => Date, nullable: true }, documentCount: { required: true, type: () => Number } };
    }
}
exports.IssuerRowDto = IssuerRowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x1234567890abcdef1234567890abcdef12345678' }),
    __metadata("design:type", String)
], IssuerRowDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Ada Lovelace' }),
    __metadata("design:type", Object)
], IssuerRowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'ada@university.edu' }),
    __metadata("design:type", Object)
], IssuerRowDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, type: String, example: 'Example University' }),
    __metadata("design:type", Object)
], IssuerRowDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", Object)
], IssuerRowDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of documents anchored by this issuer.', example: 142 }),
    __metadata("design:type", Number)
], IssuerRowDto.prototype, "documentCount", void 0);
class IssuerListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { issuers: { required: true, type: () => [require("./admin.dto").IssuerRowDto] } };
    }
}
exports.IssuerListResponseDto = IssuerListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IssuerRowDto] }),
    __metadata("design:type", Array)
], IssuerListResponseDto.prototype, "issuers", void 0);
class SuspendIssuerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String, pattern: "/^0x[a-fA-F0-9]{40}$/" } };
    }
}
exports.SuspendIssuerDto = SuspendIssuerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet address to suspend (revoke ISSUER_ROLE from).',
        example: '0x1234567890abcdef1234567890abcdef12345678',
        pattern: '^0x[a-fA-F0-9]{40}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' }),
    __metadata("design:type", String)
], SuspendIssuerDto.prototype, "walletAddress", void 0);
class AuditLogEntryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, action: { required: true, type: () => String }, actor: { required: true, type: () => String }, target: { required: true, type: () => String, nullable: true }, details: { required: true, type: () => String, nullable: true }, timestamp: { required: true, type: () => Date } };
    }
}
exports.AuditLogEntryDto = AuditLogEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx7f2k9a0000qw8h3n1e5r2t' }),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Issuer Approved' }),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0xabcd...' }),
    __metadata("design:type", String)
], AuditLogEntryDto.prototype, "actor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x1234...', nullable: true }),
    __metadata("design:type", Object)
], AuditLogEntryDto.prototype, "target", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Admin approved MIT as issuer' }),
    __metadata("design:type", Object)
], AuditLogEntryDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AuditLogEntryDto.prototype, "timestamp", void 0);
class AuditLogListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { entries: { required: true, type: () => [require("./admin.dto").AuditLogEntryDto] } };
    }
}
exports.AuditLogListResponseDto = AuditLogListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AuditLogEntryDto] }),
    __metadata("design:type", Array)
], AuditLogListResponseDto.prototype, "entries", void 0);
//# sourceMappingURL=admin.dto.js.map