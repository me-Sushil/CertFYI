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
const audit_service_1 = require("../audit/audit.service");
let IssuerService = class IssuerService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
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
    async getStats(address) {
        const normalized = address.toLowerCase();
        const [totalIssued, activeDocuments, revokedCount, recentActivityCount] = await Promise.all([
            this.prisma.anchoredDocument.count({ where: { issuerAddress: normalized } }),
            this.prisma.anchoredDocument.count({ where: { issuerAddress: normalized, revokedAt: null } }),
            this.prisma.anchoredDocument.count({ where: { issuerAddress: normalized, revokedAt: { not: null } } }),
            this.prisma.auditLog.count({
                where: { actorAddress: normalized },
            }),
        ]);
        return { totalIssued, activeDocuments, revokedCount, recentActivityCount };
    }
    async getDocuments(address, cursor) {
        const normalized = address.toLowerCase();
        const limit = 20;
        const cursorObj = cursor ? { docHash: cursor } : undefined;
        const docs = await this.prisma.anchoredDocument.findMany({
            where: { issuerAddress: normalized },
            orderBy: { anchoredAt: 'desc' },
            take: limit + 1,
            ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
        });
        const hasMore = docs.length > limit;
        if (hasMore)
            docs.pop();
        const documents = docs.map((d) => ({
            docHash: d.docHash,
            documentType: d.documentType ?? undefined,
            recipientName: d.recipientName ?? undefined,
            recipientEmail: d.recipientEmail ?? undefined,
            txHash: d.txHash,
            anchoredAt: d.anchoredAt.toISOString(),
            revokedAt: d.revokedAt?.toISOString() ?? null,
            status: d.revokedAt ? 'revoked' : 'active',
        }));
        return {
            documents,
            nextCursor: hasMore ? documents[documents.length - 1]?.docHash ?? null : null,
        };
    }
    async getActivity(address) {
        const normalized = address.toLowerCase();
        const entries = await this.prisma.auditLog.findMany({
            where: { actorAddress: normalized },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { action: true, detail: true, createdAt: true, txHash: true },
        });
        return {
            entries: entries.map((e) => ({
                action: e.action,
                detail: e.detail ?? undefined,
                createdAt: e.createdAt.toISOString(),
                txHash: e.txHash ?? undefined,
            })),
        };
    }
};
exports.IssuerService = IssuerService;
exports.IssuerService = IssuerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], IssuerService);
//# sourceMappingURL=issuer.service.js.map