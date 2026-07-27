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
exports.IssuerController = IssuerController = __decorate([
    (0, swagger_1.ApiTags)(swagger_constants_1.API_TAGS.ISSUER),
    (0, swagger_1.ApiCookieAuth)(swagger_constants_1.SESSION_COOKIE_AUTH),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'No valid session cookie.', type: api_error_dto_1.ApiErrorDto }),
    (0, common_1.Controller)('issuer'),
    (0, common_1.UseGuards)(session_guard_1.SessionGuard),
    __metadata("design:paramtypes", [issuer_service_1.IssuerService])
], IssuerController);
//# sourceMappingURL=issuer.controller.js.map