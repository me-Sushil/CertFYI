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
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const nonce_service_1 = require("./nonce.service");
const auth_dto_1 = require("../common/dto/auth.dto");
const api_error_dto_1 = require("../common/dto/api-error.dto");
const swagger_constants_1 = require("../common/swagger/swagger.constants");
const session_token_1 = require("../common/session/session-token");
const roles_constant_1 = require("../common/constants/roles.constant");
let AuthController = class AuthController {
    constructor(authService, nonceService) {
        this.authService = authService;
        this.nonceService = nonceService;
    }
    getNonce(res) {
        const nonce = this.nonceService.generate();
        res.cookie(roles_constant_1.NONCE_COOKIE, nonce, roles_constant_1.NONCE_COOKIE_OPTIONS);
        return { nonce };
    }
    async verify(body, req, res) {
        if (!body?.message || !body?.signature) {
            throw new common_1.BadRequestException('Missing message or signature');
        }
        const nonce = req.cookies?.[roles_constant_1.NONCE_COOKIE];
        if (!nonce) {
            throw new common_1.UnauthorizedException('Missing or expired nonce - request a new one');
        }
        try {
            const { address, role, requestStatus, token } = await this.authService.verifySiwe(body.message, body.signature, nonce);
            res.cookie(roles_constant_1.SESSION_COOKIE, token, roles_constant_1.SESSION_COOKIE_OPTIONS);
            res.clearCookie(roles_constant_1.NONCE_COOKIE, { path: '/' });
            return { address, role, requestStatus, token };
        }
        catch (error) {
            res.clearCookie(roles_constant_1.NONCE_COOKIE, { path: '/' });
            throw error;
        }
    }
    async session(req) {
        const token = req.cookies?.[roles_constant_1.SESSION_COOKIE];
        if (!token) {
            return { address: null, role: null };
        }
        const session = await (0, session_token_1.verifySessionToken)(token);
        if (!session) {
            return { address: null, role: null };
        }
        return { address: session.address, role: session.role };
    }
    logout(res) {
        res.clearCookie(roles_constant_1.SESSION_COOKIE, { path: '/' });
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('nonce'),
    (0, swagger_1.ApiOperation)({
        summary: 'Issue a SIWE nonce',
        description: 'Step 1 of sign-in. Returns a single-use nonce and stores it in the short-lived httpOnly ' +
            `\`${roles_constant_1.NONCE_COOKIE}\` cookie (5 minutes). Embed the nonce in the SIWE message you ask the ` +
            'wallet to sign.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Nonce issued and cookie set.', type: auth_dto_1.NonceResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getNonce", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify a SIWE signature and open a session',
        description: 'Step 2 of sign-in. Validates the signature against the nonce cookie, resolves the ' +
            `caller's role, and sets the httpOnly \`${roles_constant_1.SESSION_COOKIE}\` cookie (7 days). The nonce ` +
            'is consumed either way, so a failed attempt requires a fresh `GET /auth/nonce`.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Signature verified; session cookie set.', type: auth_dto_1.VerifyResponseDto }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Missing `message` or `signature`.', type: api_error_dto_1.ApiErrorDto }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Nonce missing/expired, SIWE message malformed, or signature invalid.',
        type: api_error_dto_1.ApiErrorDto,
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, common_1.Get)('session'),
    (0, swagger_1.ApiOperation)({
        summary: 'Read the current session',
        description: 'Returns the signed-in wallet and role. Always 200 - a missing or invalid session cookie ' +
            'yields `{ address: null, role: null }` rather than a 401, so clients can poll it safely.',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Current session, or nulls when signed out.', type: auth_dto_1.SessionResponseDto }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "session", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'End the session',
        description: `Clears the \`${roles_constant_1.SESSION_COOKIE}\` cookie. Idempotent.`,
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Session cookie cleared.', type: auth_dto_1.LogoutResponseDto }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)(swagger_constants_1.API_TAGS.AUTH),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        nonce_service_1.NonceService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map