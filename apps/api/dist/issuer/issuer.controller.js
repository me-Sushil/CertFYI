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
exports.IssuerController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const issuer_service_1 = require("./issuer.service");
const issuer_dto_1 = require("../common/dto/issuer.dto");
const api_error_dto_1 = require("../common/dto/api-error.dto");
const swagger_constants_1 = require("../common/swagger/swagger.constants");
const session_guard_1 = require("../common/guards/session.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let IssuerController = class IssuerController {
    constructor(issuerService) {
        this.issuerService = issuerService;
    }
    submitRequest(user, body) {
        return this.issuerService.submitRequest(user.address, body);
    }
    getStatus(user) {
        return this.issuerService.getStatus(user.address);
    }
    getStats(user) {
        return this.issuerService.getStats(user.address);
    }
    getDocuments(user, query) {
        return this.issuerService.getDocuments(user.address, query);
    }
    getActivity(user, query) {
        return this.issuerService.getActivity(user.address, query);
    }
    retryPin(user, body) {
        return this.issuerService.retryPin(user.address, body.docHash);
    }
    logFailedAnchor(user, body) {
        return this.issuerService.logFailedAnchor(user.address, body.docHash, body.txHash, body.reason);
    }
};
exports.IssuerController = IssuerController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit an issuer access request',
        description: 'Applies for `ISSUER` role for the wallet in the current session. Wallet identity comes ' +
            'from the session, never from the body. A previously rejected request may be re-submitted; ' +
            'a pending or approved one may not.',
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Request submitted and pending review.', type: issuer_dto_1.RequestStatusResponseDto }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'A request for this wallet is already pending or approved.',
        type: api_error_dto_1.ApiErrorDto,
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, issuer_dto_1.AccessRequestDto]),
    __metadata("design:returntype", void 0)
], IssuerController.prototype, "submitRequest", null);
__decorate([
    (0, common_1.Get)('request'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get own access-request status',
        description: 'Status for the session wallet. Returns `NONE` when no request has been made.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Current request status.', type: issuer_dto_1.RequestStatusResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IssuerController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get issuer dashboard statistics',
        description: 'Returns total issued, active, revoked counts and recent activity count.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Issuer stats.', type: issuer_dto_1.IssuerStatsResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IssuerController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, swagger_1.ApiOperation)({
        summary: 'List documents issued by the current issuer',
        description: 'Server-side filtered and paginated list of anchored documents. `search` matches ' +
            'recipient name/email, document type, or hash.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Documents list.', type: issuer_dto_1.IssuerDocumentsResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, issuer_dto_1.IssuerDocumentsQueryDto]),
    __metadata("design:returntype", void 0)
], IssuerController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('activity'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent activity for the current issuer',
        description: 'Server-side filtered and paginated audit log entries for this issuer.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Activity entries.', type: issuer_dto_1.IssuerActivityResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, issuer_dto_1.IssuerActivityQueryDto]),
    __metadata("design:returntype", void 0)
], IssuerController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Post)('retry-pin'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Retry pinning a document’s metadata sidecar',
        description: 'Re-attempts pinning the public, non-identifying metadata sidecar for a document this ' +
            'issuer owns, when the original pin failed. The PDF itself cannot be retried this way - ' +
            'its bytes are never stored server-side - only the sidecar, which is rebuilt from data ' +
            'already in the database.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Retry attempted.', type: issuer_dto_1.RetryPinResponseDto }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, issuer_dto_1.RetryPinDto]),
    __metadata("design:returntype", void 0)
], IssuerController.prototype, "retryPin", null);
__decorate([
    (0, common_1.Post)('log-failed-anchor'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Record a failed anchoring attempt',
        description: 'Writes an audit entry for an anchoring attempt that never produced a document - the ' +
            'wallet rejected it, or the chain reverted it. Nothing is verified on-chain here (there is ' +
            'nothing to verify); this exists so the attempt is visible in Activity rather than lost the ' +
            'moment the browser moves on.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Logged.' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, issuer_dto_1.LogFailedAnchorDto]),
    __metadata("design:returntype", void 0)
], IssuerController.prototype, "logFailedAnchor", null);
exports.IssuerController = IssuerController = __decorate([
    (0, swagger_1.ApiTags)(swagger_constants_1.API_TAGS.ISSUER),
    (0, swagger_1.ApiCookieAuth)(swagger_constants_1.SESSION_COOKIE_AUTH),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'No valid session cookie.', type: api_error_dto_1.ApiErrorDto }),
    (0, common_1.Controller)('issuer'),
    (0, common_1.UseGuards)(session_guard_1.SessionGuard),
    __metadata("design:paramtypes", [issuer_service_1.IssuerService])
], IssuerController);
//# sourceMappingURL=issuer.controller.js.map