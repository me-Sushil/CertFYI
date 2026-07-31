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
exports.AdminController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const admin_dto_1 = require("../common/dto/admin.dto");
const api_error_dto_1 = require("../common/dto/api-error.dto");
const swagger_constants_1 = require("../common/swagger/swagger.constants");
const session_guard_1 = require("../common/guards/session.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getRequests(query) {
        return this.adminService.getRequests(query.status);
    }
    approveUser(body, session) {
        return this.adminService.approveUser(body.walletAddress, body.txHash, session.address);
    }
    rejectUser(body, session) {
        return this.adminService.rejectUser(body.walletAddress, body.reason, session.address);
    }
    getStats() {
        return this.adminService.getStats();
    }
    getIssuers(query) {
        return this.adminService.getIssuers({
            status: query.status,
            search: query.search,
            cursor: query.cursor,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
        });
    }
    getDocuments(query) {
        return this.adminService.getDocuments({
            search: query.search,
            cursor: query.cursor,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
        });
    }
    getIssuer(address) {
        return this.adminService.getIssuerDetail(address);
    }
    suspendIssuer(body, session) {
        return this.adminService.suspendIssuer(body.walletAddress, body.txHash, session.address);
    }
    reactivateIssuer(body, session) {
        return this.adminService.reactivateIssuer(body.walletAddress, body.txHash, session.address);
    }
    uploadIssuerMetadata(address) {
        return this.adminService.uploadIssuerMetadata(address);
    }
    setIssuerMetadata(address, body, session) {
        return this.adminService.setIssuerMetadataOnChain(address, body.txHash, session.address);
    }
    getAuditLog(query) {
        return this.adminService.getAuditLog({
            action: query.action,
            actor: query.actor,
            from: query.from,
            to: query.to,
            cursor: query.cursor,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
        });
    }
    exportAuditLog(query, res) {
        return this.adminService.exportAuditLog({
            action: query.action,
            actor: query.actor,
            from: query.from,
            to: query.to,
        }, res);
    }
    getIpfsPinFailures() {
        return this.adminService.getIpfsPinFailures();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('requests'),
    (0, swagger_1.ApiOperation)({
        summary: 'List issuer access requests',
        description: 'Newest first. Defaults to `PENDING` when no `status` filter is supplied.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Matching access requests.', type: admin_dto_1.AccessRequestListResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.RequestsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Post)('approve-user'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Approve an issuer',
        description: 'Confirms on-chain that `txHash` really granted `ISSUER_ROLE` to `walletAddress`, then ' +
            'marks the request approved and creates an active Issuer row. The admin must have sent ' +
            'the `grantRole` transaction from their wallet first.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Request approved.', type: admin_dto_1.AccessRequestDecisionResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Transaction missing, reverted, or did not grant `ISSUER_ROLE` to this wallet.',
        type: api_error_dto_1.ApiErrorDto,
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.ApproveUserDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveUser", null);
__decorate([
    (0, common_1.Post)('reject-user'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Reject an issuer',
        description: 'Marks the request rejected. The applicant may re-submit afterwards.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Request rejected.', type: admin_dto_1.AccessRequestDecisionResponseDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'No request exists for that wallet.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.RejectUserDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectUser", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get admin dashboard statistics',
        description: 'Returns real counts for issuers, pending approvals, documents, and suspended issuers.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Dashboard stats.', type: admin_dto_1.AdminStatsResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('issuers'),
    (0, swagger_1.ApiOperation)({
        summary: 'List issuers',
        description: 'Paginated, filterable by status and search term. Results newest-first.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Issuer list.', type: admin_dto_1.IssuerListResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.IssuersQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getIssuers", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all anchored documents',
        description: 'Paginated, filterable by search term. Results newest-first.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Document list.', type: admin_dto_1.AdminDocumentsListResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AdminDocumentsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('issuers/:address'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get issuer detail with recent activity',
        description: 'Returns the issuer record plus the last 10 audit log entries referencing them.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Issuer detail.', type: admin_dto_1.IssuerDetailResponseDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Issuer not found.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getIssuer", null);
__decorate([
    (0, common_1.Post)('suspend-issuer'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Suspend an issuer',
        description: 'Confirms on-chain that `txHash` emitted `RoleRevoked` for `ISSUER_ROLE` on `walletAddress`, ' +
            'then marks the issuer SUSPENDED. Documents anchored before suspension remain valid (FR-A4).',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Issuer suspended.' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid transaction or issuer not active.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Issuer not found.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.SuspendIssuerDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "suspendIssuer", null);
__decorate([
    (0, common_1.Post)('reactivate-issuer'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Reactivate a suspended issuer',
        description: 'Confirms on-chain that `txHash` granted `ISSUER_ROLE`, then marks the issuer ACTIVE. ' +
            'Audit log distinguishes reinstatement from original approval.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Issuer reactivated.' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid transaction or issuer not suspended.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Issuer not found.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.ReactivateIssuerDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reactivateIssuer", null);
__decorate([
    (0, common_1.Post)('issuers/:address/metadata-upload'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload issuer profile metadata to IPFS',
        description: 'Pins the issuer profile JSON (name, organization, website) to IPFS and stores the ' +
            'resulting `ipfs://` URI on the issuer record. The admin then calls ' +
            '`POST /admin/issuers/:address/metadata` with the `setIssuerMetadata` tx hash.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Metadata uploaded to IPFS.' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Issuer not found.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "uploadIssuerMetadata", null);
__decorate([
    (0, common_1.Post)('issuers/:address/metadata'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm issuer metadata on-chain',
        description: 'Verifies that `txHash` emitted `IssuerMetadataSet` for this issuer, then records ' +
            'the transaction in the audit log. The metadata must first be uploaded via ' +
            '`POST /admin/issuers/:address/metadata-upload`.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Metadata confirmed on-chain.' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid transaction or no metadata uploaded.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Issuer not found.', type: api_error_dto_1.ApiErrorDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.SetIssuerMetadataDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "setIssuerMetadata", null);
__decorate([
    (0, common_1.Get)('audit-log'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get audit log entries',
        description: 'Filterable by action, actor, date range. Cursor-paginated, newest first.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Audit log entries.', type: admin_dto_1.AuditLogResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AuditLogQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)('audit-log/export'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export audit log as CSV',
        description: 'Downloads a CSV file matching the current filters.',
    }),
    (0, swagger_1.ApiProduces)('text/csv'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AuditLogQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "exportAuditLog", null);
__decorate([
    (0, common_1.Get)('ipfs-pin-failures'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get count of IPFS pin failures',
        description: 'Number of documents that were anchored but whose IPFS pin failed.',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getIpfsPinFailures", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)(swagger_constants_1.API_TAGS.ADMIN),
    (0, swagger_1.ApiCookieAuth)(swagger_constants_1.SESSION_COOKIE_AUTH),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'No valid session cookie.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Session is not an `ADMIN` wallet.', type: api_error_dto_1.ApiErrorDto }),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(session_guard_1.SessionGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map