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
const ipfs_service_1 = require("../ipfs/ipfs.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const shared_constant_1 = require("../common/constants/shared.constant");
const metadata_sidecar_util_1 = require("../common/utils/metadata-sidecar.util");
let IssuerService = class IssuerService {
    constructor(prisma, audit, ipfs, blockchain) {
        this.prisma = prisma;
        this.audit = audit;
        this.ipfs = ipfs;
        this.blockchain = blockchain;
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
    async getDocuments(address, params = {}) {
        const normalized = address.toLowerCase();
        const limit = shared_constant_1.DEFAULT_PAGE_SIZE;
        const cursorObj = params.cursor ? { docHash: params.cursor } : undefined;
        const where = { issuerAddress: normalized };
        if (params.status === 'active')
            where.revokedAt = null;
        if (params.status === 'revoked')
            where.revokedAt = { not: null };
        if (params.search) {
            where.OR = [
                { recipientName: { contains: params.search, mode: 'insensitive' } },
                { recipientEmail: { contains: params.search, mode: 'insensitive' } },
                { documentType: { contains: params.search, mode: 'insensitive' } },
                { docHash: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        const docs = await this.prisma.anchoredDocument.findMany({
            where,
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
            cid: d.cid,
            metadataCid: d.metadataCid,
            anchoredAt: d.anchoredAt.toISOString(),
            revokedAt: d.revokedAt?.toISOString() ?? null,
            revokeTxHash: d.revokeTxHash ?? undefined,
            status: d.revokedAt ? 'revoked' : 'active',
            batchId: d.batchId ?? null,
        }));
        return {
            documents,
            nextCursor: hasMore ? documents[documents.length - 1]?.docHash ?? null : null,
        };
    }
    async getActivity(address, params = {}) {
        const normalized = address.toLowerCase();
        const limit = shared_constant_1.DEFAULT_PAGE_SIZE;
        const where = { actorAddress: normalized };
        if (params.action && params.action !== 'ALL')
            where.action = params.action;
        const cursorObj = params.cursor ? { id: params.cursor } : undefined;
        const entries = await this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
            select: { id: true, action: true, detail: true, createdAt: true, txHash: true, targetRef: true },
        });
        const hasMore = entries.length > limit;
        if (hasMore)
            entries.pop();
        return {
            entries: entries.map((e) => ({
                action: e.action,
                detail: e.detail ?? undefined,
                createdAt: e.createdAt.toISOString(),
                txHash: e.txHash ?? undefined,
                docHash: /^0x[a-fA-F0-9]{64}$/.test(e.targetRef) ? e.targetRef : undefined,
            })),
            nextCursor: hasMore ? entries[entries.length - 1]?.id ?? null : null,
        };
    }
    async retryPin(address, docHash) {
        const normalized = address.toLowerCase();
        const record = await this.prisma.anchoredDocument.findUnique({ where: { docHash } });
        if (!record) {
            throw new common_1.NotFoundException({ error: 'Document not found', docHash });
        }
        if (record.issuerAddress !== normalized) {
            throw new common_1.ForbiddenException('This document was not issued by the current session');
        }
        if (record.metadataCid) {
            return { success: true, metadataCid: record.metadataCid, message: 'Already pinned' };
        }
        if (!this.ipfs.isConfigured()) {
            throw new common_1.NotFoundException({ error: 'IPFS is not configured' });
        }
        const sidecar = (0, metadata_sidecar_util_1.buildMetadataSidecar)({
            documentHash: record.docHash,
            issuerAddress: record.issuerAddress,
            issuerName: record.issuerName,
            documentType: record.documentType,
            issuedAt: record.anchoredAt.toISOString(),
            chainId: this.blockchain.contractChainId,
            txHash: record.txHash,
            cid: record.cid,
            revoked: !!record.revokedAt,
            recipientEmail: record.recipientEmail,
            recipientName: record.recipientName,
        });
        const outcome = await this.ipfs.pinJson(sidecar, `${docHash}.metadata`);
        if (!outcome.pinned) {
            return { success: false, metadataCid: null, message: outcome.error };
        }
        await this.prisma.anchoredDocument.update({
            where: { docHash },
            data: { metadataCid: outcome.cid },
        });
        await this.audit.record({
            action: 'IPFS_PIN_RETRIED',
            actorAddress: normalized,
            targetRef: docHash,
            detail: 'Metadata sidecar pin retried successfully',
        });
        return { success: true, metadataCid: outcome.cid, message: 'Metadata sidecar pinned successfully' };
    }
    async logFailedAnchor(address, docHash, txHash, reason) {
        await this.audit.record({
            action: 'DOCUMENT_ANCHOR_FAILED',
            actorAddress: address.toLowerCase(),
            targetRef: docHash,
            txHash,
            detail: reason,
        });
        return { success: true };
    }
};
exports.IssuerService = IssuerService;
exports.IssuerService = IssuerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        ipfs_service_1.IpfsService,
        blockchain_service_1.BlockchainService])
], IssuerService);
//# sourceMappingURL=issuer.service.js.map