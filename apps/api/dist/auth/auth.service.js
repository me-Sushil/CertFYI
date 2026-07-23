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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const siwe_1 = require("siwe");
const prisma_service_1 = require("../prisma/prisma.service");
const roles_constant_1 = require("../common/constants/roles.constant");
const session_token_1 = require("../common/session/session-token");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifySiwe(message, signature, nonce) {
        let siweMessage;
        try {
            siweMessage = new siwe_1.SiweMessage(message);
        }
        catch {
            throw new common_1.UnauthorizedException('Malformed SIWE message');
        }
        let address;
        try {
            const { data } = await siweMessage.verify({ signature, nonce });
            address = data.address.toLowerCase();
        }
        catch {
            throw new common_1.UnauthorizedException('Signature verification failed');
        }
        let role;
        let requestStatus;
        if ((0, roles_constant_1.isAdminWallet)(address)) {
            role = 'ADMIN';
        }
        else {
            const accessRequest = await this.prisma.accessRequest.findUnique({
                where: { walletAddress: address },
            });
            if (accessRequest?.status === 'APPROVED') {
                role = 'ISSUER';
            }
            else {
                role = 'UNAPPROVED';
                requestStatus = accessRequest?.status ?? 'NONE';
            }
        }
        const token = await (0, session_token_1.createSessionToken)({ address, role });
        return { address, role, requestStatus, token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map