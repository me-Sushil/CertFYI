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
exports.LogoutResponseDto = exports.SessionResponseDto = exports.VerifyResponseDto = exports.NonceResponseDto = exports.VerifyDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const roles_constant_1 = require("../constants/roles.constant");
const EXAMPLE_SIWE_MESSAGE = `localhost:3000 wants you to sign in with your Ethereum account:
0x1234567890AbcdEF1234567890aBcdef12345678

Sign in to CertFyi

URI: http://localhost:3000
Version: 1
Chain ID: 11155111
Nonce: 8f4a2c1e9b7d6053
Issued At: 2026-01-01T00:00:00.000Z`;
class VerifyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { message: { required: true, type: () => String }, signature: { required: true, type: () => String } };
    }
}
exports.VerifyDto = VerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The EIP-4361 (SIWE) message that was signed, verbatim.',
        example: EXAMPLE_SIWE_MESSAGE,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '65-byte hex signature produced by the wallet for `message`.',
        example: '0x' + 'a'.repeat(130),
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyDto.prototype, "signature", void 0);
class NonceResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { nonce: { required: true, type: () => String } };
    }
}
exports.NonceResponseDto = NonceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Single-use nonce to embed in the SIWE message. Also set as an httpOnly cookie.',
        example: '8f4a2c1e9b7d6053',
    }),
    __metadata("design:type", String)
], NonceResponseDto.prototype, "nonce", void 0);
class VerifyResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { address: { required: true, type: () => String }, role: { required: true, type: () => Object }, requestStatus: { required: false, type: () => String } };
    }
}
exports.VerifyResponseDto = VerifyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recovered wallet address, lowercased.',
        example: '0x1234567890abcdef1234567890abcdef12345678',
    }),
    __metadata("design:type", String)
], VerifyResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: roles_constant_1.SESSION_ROLES, example: 'ISSUER' }),
    __metadata("design:type", String)
], VerifyResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Access-request status. Present only for `UNAPPROVED` wallets.',
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
    }),
    __metadata("design:type", String)
], VerifyResponseDto.prototype, "requestStatus", void 0);
class SessionResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { address: { required: true, type: () => String, nullable: true }, role: { required: true, type: () => Object, nullable: true } };
    }
}
exports.SessionResponseDto = SessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet address of the current session, or `null` when signed out.',
        nullable: true,
        type: String,
        example: '0x1234567890abcdef1234567890abcdef12345678',
    }),
    __metadata("design:type", Object)
], SessionResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role of the current session, or `null` when signed out.',
        nullable: true,
        enum: roles_constant_1.SESSION_ROLES,
        example: 'ISSUER',
    }),
    __metadata("design:type", Object)
], SessionResponseDto.prototype, "role", void 0);
class LogoutResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean } };
    }
}
exports.LogoutResponseDto = LogoutResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], LogoutResponseDto.prototype, "success", void 0);
//# sourceMappingURL=auth.dto.js.map