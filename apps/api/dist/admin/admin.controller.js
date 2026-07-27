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
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getRequests(query) {
        return this.adminService.getRequests(query.status);
    }
    approveUser(body) {
        return this.adminService.approveUser(body.walletAddress, body.txHash);
    }
    rejectUser(body) {
        return this.adminService.rejectUser(body.walletAddress, body.reason);
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
            'marks the request approved. The admin must have sent the `grantRole` transaction from ' +
            'their wallet first - this endpoint records the result, it does not send the transaction.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Request approved.', type: admin_dto_1.AccessRequestDecisionResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Transaction missing, reverted, or did not grant `ISSUER_ROLE` to this wallet.',
        type: api_error_dto_1.ApiErrorDto,
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.ApproveUserDto]),
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.RejectUserDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectUser", null);
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