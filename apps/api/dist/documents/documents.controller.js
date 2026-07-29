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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const documents_dto_1 = require("../common/dto/documents.dto");
const api_error_dto_1 = require("../common/dto/api-error.dto");
const swagger_constants_1 = require("../common/swagger/swagger.constants");
const session_guard_1 = require("../common/guards/session.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const issuer_active_guard_1 = require("../common/guards/issuer-active.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const shared_constant_1 = require("../common/constants/shared.constant");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    anchor(user, body) {
        return this.documentsService.anchor(body, user.address);
    }
    revoke(user, body) {
        return this.documentsService.revoke(body, user.address);
    }
    getAnchor(hash) {
        return this.documentsService.getAnchor(hash);
    }
    anchorBatch(user, body) {
        return this.documentsService.anchorBatch(body, user.address);
    }
    getBatch(batchId) {
        return this.documentsService.getBatch(batchId);
    }
    verify(body) {
        return this.documentsService.verify(body.documentHash, body.pdfContent);
    }
    quickVerify(hash) {
        return this.documentsService.quickVerify(hash);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('anchor'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseGuards)(session_guard_1.SessionGuard, roles_guard_1.RolesGuard, issuer_active_guard_1.IssuerActiveGuard),
    (0, roles_decorator_1.Roles)('ISSUER'),
    (0, throttler_1.Throttle)({ default: shared_constant_1.AUTHENTICATED_THROTTLE }),
    (0, swagger_1.ApiCookieAuth)(swagger_constants_1.SESSION_COOKIE_AUTH),
    (0, swagger_1.ApiOperation)({
        summary: 'Anchor a single document hash',
        description: 'Records a document hash the issuer has already anchored on-chain in their own wallet. ' +
            'The backend verifies the transaction receipt before persisting anything. Only the hash ' +
            'leaves the issuer - CertFyi never stores the document itself.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Document anchored.', type: documents_dto_1.AnchorResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation failed, or the transaction could not be verified.', type: api_error_dto_1.ValidationErrorDto }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'No valid session cookie.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Session is not an active issuer.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, documents_dto_1.AnchorDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "anchor", null);
__decorate([
    (0, common_1.Post)('revoke'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(session_guard_1.SessionGuard, roles_guard_1.RolesGuard, issuer_active_guard_1.IssuerActiveGuard),
    (0, roles_decorator_1.Roles)('ISSUER'),
    (0, throttler_1.Throttle)({ default: shared_constant_1.AUTHENTICATED_THROTTLE }),
    (0, swagger_1.ApiCookieAuth)(swagger_constants_1.SESSION_COOKIE_AUTH),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke a previously anchored document',
        description: 'Records a revocation the issuer has already confirmed on-chain in their own wallet, for ' +
            'a document they issued. The backend verifies the transaction receipt before persisting ' +
            'anything. Revocation does not invalidate documents that were valid while the issuer was ' +
            'in good standing - the chain anchor itself is untouched, only its status changes.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Document revoked.', type: documents_dto_1.RevokeDocumentResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation failed, or the transaction could not be verified.', type: api_error_dto_1.ValidationErrorDto }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'No valid session cookie.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Session is not an active issuer, or does not own this document.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'No document anchored for that hash.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, documents_dto_1.RevokeDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "revoke", null);
__decorate([
    (0, common_1.Get)('anchor'),
    (0, swagger_1.ApiOperation)({
        summary: 'Look up an anchored document',
        description: 'Returns the full anchor record, including issuer metadata, for a known hash.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hash',
        required: true,
        description: 'Document hash to look up.',
        example: '0x' + 'e3b0c442'.repeat(8),
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Anchor record found.', type: documents_dto_1.AnchorLookupResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: '`hash` query parameter missing.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'No document anchored for that hash.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getAnchor", null);
__decorate([
    (0, common_1.Post)('anchor-batch'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseGuards)(session_guard_1.SessionGuard, roles_guard_1.RolesGuard, issuer_active_guard_1.IssuerActiveGuard),
    (0, roles_decorator_1.Roles)('ISSUER'),
    (0, throttler_1.Throttle)({ default: shared_constant_1.AUTHENTICATED_THROTTLE }),
    (0, swagger_1.ApiCookieAuth)(swagger_constants_1.SESSION_COOKIE_AUTH),
    (0, swagger_1.ApiOperation)({
        summary: 'Anchor many documents in one transaction',
        description: 'Builds a Merkle tree over the supplied hashes and commits only the root, so gas cost is ' +
            'flat regardless of batch size. Each document remains independently verifiable.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Batch anchored.', type: documents_dto_1.BatchAnchorResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Validation failed or empty batch.',
        type: api_error_dto_1.ValidationErrorDto,
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, documents_dto_1.BatchAnchorDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "anchorBatch", null);
__decorate([
    (0, common_1.Get)('anchor-batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Look up an anchored batch',
        description: 'Returns the batch record, its Merkle root, and the documents it covers.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'batchId',
        required: true,
        description: 'Identifier supplied when the batch was anchored.',
        example: 'spring-2026-graduates',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Batch record found.', type: documents_dto_1.BatchLookupResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: '`batchId` query parameter missing.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'No batch anchored under that id.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getBatch", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify a document',
        description: 'Checks whether a hash is anchored and still active. Supply `pdfContent` to also prove the ' +
            'PDF in hand hashes to `documentHash` - a mismatch means the file was modified. Public: no ' +
            'authentication required.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Verification completed. Inspect `isValid` - a document that is revoked or unknown still ' +
            'returns 200.',
        type: documents_dto_1.VerifyDocumentResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation failed.', type: api_error_dto_1.ValidationErrorDto }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [documents_dto_1.VerifyDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "verify", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, swagger_1.ApiOperation)({
        summary: 'Quick hash-only verification',
        description: 'Lightweight status check for a hash, without issuer metadata. Suited to QR-code scans and ' +
            'link previews.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hash',
        required: true,
        description: 'Document hash to check.',
        example: '0x' + 'e3b0c442'.repeat(8),
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Status resolved.', type: documents_dto_1.QuickVerifyResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: '`hash` is missing or malformed.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "quickVerify", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)(swagger_constants_1.API_TAGS.DOCUMENTS),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map