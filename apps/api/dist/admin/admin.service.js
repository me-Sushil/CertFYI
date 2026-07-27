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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
let AdminService = class AdminService {
    constructor(prisma, blockchain) {
        this.prisma = prisma;
        this.blockchain = blockchain;
    }
    async getRequests(statusParam) {
        const where = statusParam === 'ALL' ? {} : { status: (statusParam ?? 'PENDING') };
        const requests = await this.prisma.accessRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return { requests };
    }
    async approveUser(walletAddress, txHash) {
        const normalized = walletAddress.toLowerCase();
        const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash);
        if (!verification.ok) {
            throw new common_1.HttpException({ error: verification.error }, verification.status ?? 400);
        }
        const accessRequest = await this.prisma.accessRequest.upsert({
            where: { walletAddress: normalized },
            create: { walletAddress: normalized, status: 'APPROVED', decidedAt: new Date() },
            update: { status: 'APPROVED', decidedAt: new Date(), rejectionReason: null },
        });
        return { accessRequest };
    }
    async rejectUser(walletAddress, reason) {
        const normalized = walletAddress.toLowerCase();
        const accessRequest = await this.prisma.accessRequest
            .update({
            where: { walletAddress: normalized },
            data: { status: 'REJECTED', decidedAt: new Date(), rejectionReason: reason ?? null },
        })
            .catch(() => null);
        if (!accessRequest) {
            throw new common_1.NotFoundException('Request not found');
        }
        return { accessRequest };
    }
    async getIssuers() {
        const requests = await this.prisma.accessRequest.findMany({
            where: { status: 'APPROVED' },
            orderBy: { decidedAt: 'desc' },
        });
        const issuers = requests.map((r) => ({
            walletAddress: r.walletAddress,
            name: r.name,
            email: r.email,
            organization: r.organization,
            approvedAt: r.decidedAt,
            documentCount: 0,
        }));
        return { issuers };
    }
    async suspendIssuer(walletAddress) {
        const normalized = walletAddress.toLowerCase();
        const accessRequest = await this.prisma.accessRequest
            .update({
            where: { walletAddress: normalized },
            data: { status: 'REJECTED', decidedAt: new Date(), rejectionReason: 'Suspended by admin' },
        })
            .catch(() => null);
        if (!accessRequest) {
            throw new common_1.NotFoundException('Issuer not found');
        }
        return { accessRequest };
    }
    async getAuditLog() {
        const requests = await this.prisma.accessRequest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        const entries = requests.map((r) => {
            let action = 'Issuer Request Submitted';
            let details = `${r.name ?? 'Unknown'} requested issuer access`;
            if (r.status === 'APPROVED') {
                action = 'Issuer Approved';
                details = `${r.name ?? 'Unknown'} was approved as an issuer`;
            }
            else if (r.status === 'REJECTED') {
                action = r.rejectionReason === 'Suspended by admin' ? 'Issuer Suspended' : 'Issuer Rejected';
                details = `${r.name ?? 'Unknown'} was ${action.toLowerCase()}${r.rejectionReason ? `: ${r.rejectionReason}` : ''}`;
            }
            return {
                id: r.id,
                action,
                actor: r.walletAddress,
                target: r.walletAddress,
                details,
                timestamp: r.decidedAt ?? r.createdAt,
            };
        });
        return { entries };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], AdminService);
//# sourceMappingURL=admin.service.js.map