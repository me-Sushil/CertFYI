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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async record(params) {
        await this.prisma.auditLog.create({
            data: {
                action: params.action,
                actorAddress: params.actorAddress.toLowerCase(),
                targetRef: params.targetRef,
                txHash: params.txHash ?? null,
                detail: params.detail ?? null,
            },
        });
    }
    async find(params) {
        const limit = Math.min(params.limit ?? 20, 100);
        const where = this.buildWhere(params);
        const cursorObj = params.cursor ? { id: params.cursor } : undefined;
        const entries = await this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
        });
        const hasMore = entries.length > limit;
        if (hasMore)
            entries.pop();
        return {
            entries: await this.resolveNames(entries),
            nextCursor: hasMore ? entries[entries.length - 1]?.id ?? null : null,
        };
    }
    async findForExport(params) {
        const where = this.buildWhere(params);
        const entries = await this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 10_000,
        });
        return { entries: await this.resolveNames(entries) };
    }
    buildWhere(params) {
        const where = {};
        if (params.action && params.action !== 'ALL') {
            where.action = params.action;
        }
        if (params.actor) {
            where.actorAddress = params.actor.toLowerCase();
        }
        if (params.from || params.to) {
            const createdAt = {};
            if (params.from)
                createdAt.gte = new Date(params.from);
            if (params.to)
                createdAt.lte = new Date(params.to);
            where.createdAt = createdAt;
        }
        return where;
    }
    async resolveNames(entries) {
        const walletAddresses = entries.map((e) => e.actorAddress);
        const issuers = await this.prisma.issuer.findMany({
            where: { walletAddress: { in: walletAddresses } },
            select: { walletAddress: true, organization: true, name: true },
        });
        const nameMap = new Map(issuers.map((i) => [i.walletAddress, i.organization ?? i.name ?? i.walletAddress.slice(0, 10)]));
        return entries.map((e) => ({
            ...e,
            actorName: nameMap.get(e.actorAddress) ?? e.actorAddress.slice(0, 10),
        }));
    }
    async countByAction(action) {
        return this.prisma.auditLog.count({ where: { action } });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map