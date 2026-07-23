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
exports.IssuerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IssuerService = class IssuerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitRequest(address, data) {
        const existing = await this.prisma.accessRequest.findUnique({
            where: { walletAddress: address },
        });
        if (existing && existing.status !== 'REJECTED') {
            throw new common_1.ConflictException(`Request already ${existing.status.toLowerCase()}`);
        }
        const accessRequest = await this.prisma.accessRequest.upsert({
            where: { walletAddress: address },
            create: {
                walletAddress: address,
                ...data,
                status: 'PENDING',
            },
            update: {
                ...data,
                status: 'PENDING',
                decidedAt: null,
                rejectionReason: null,
            },
        });
        return { requestStatus: accessRequest.status };
    }
    async getStatus(address) {
        const accessRequest = await this.prisma.accessRequest.findUnique({
            where: { walletAddress: address },
        });
        return { requestStatus: accessRequest?.status ?? 'NONE' };
    }
};
exports.IssuerService = IssuerService;
exports.IssuerService = IssuerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IssuerService);
//# sourceMappingURL=issuer.service.js.map