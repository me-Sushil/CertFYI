"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const audit_service_1 = require("../audit/audit.service");
const ipfs_service_1 = require("../ipfs/ipfs.service");
let AdminService = class AdminService {
    constructor(prisma, blockchain, audit, ipfs) {
        this.prisma = prisma;
        this.blockchain = blockchain;
        this.audit = audit;
        this.ipfs = ipfs;
    }
    async getRequests(statusParam) {
        const where = statusParam === 'ALL' ? {} : { status: (statusParam ?? 'PENDING') };
        const requests = await this.prisma.accessRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return { requests };
    }
    async approveUser(walletAddress, txHash, adminAddress) {
        const normalized = walletAddress.toLowerCase();
        const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash, adminAddress);
        if (!verification.ok) {
            throw new common_1.HttpException({ error: verification.error }, verification.status ?? 400);
        }
        const [accessRequest] = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.issuer.findUnique({ where: { walletAddress: normalized } });
            if (existing?.registerTxHash === txHash) {
                throw new common_1.HttpException({ error: 'This transaction has already been recorded' }, 409);
            }
            const request = await tx.accessRequest.upsert({
                where: { walletAddress: normalized },
                create: { walletAddress: normalized, status: 'APPROVED', decidedAt: new Date() },
                update: { status: 'APPROVED', decidedAt: new Date(), rejectionReason: null },
            });
            const requestData = await tx.accessRequest.findUnique({ where: { walletAddress: normalized } });
            await tx.issuer.upsert({
                where: { walletAddress: normalized },
                create: {
                    walletAddress: normalized,
                    name: requestData?.name ?? null,
                    email: requestData?.email ?? null,
                    organization: requestData?.organization ?? null,
                    website: requestData?.website ?? null,
                    status: 'ACTIVE',
                    registerTxHash: txHash,
                },
                update: {
                    name: requestData?.name ?? null,
                    email: requestData?.email ?? null,
                    organization: requestData?.organization ?? null,
                    website: requestData?.website ?? null,
                    status: 'ACTIVE',
                    registerTxHash: txHash,
                    suspendedAt: null,
                    suspendTxHash: null,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'ISSUER_APPROVED',
                    actorAddress: adminAddress.toLowerCase(),
                    targetRef: normalized,
                    txHash,
                },
            });
            return [request];
        });
        return { accessRequest };
    }
    async rejectUser(walletAddress, reason, adminAddress) {
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
        await this.audit.record({
            action: 'ISSUER_REJECTED',
            actorAddress: adminAddress,
            targetRef: normalized,
            detail: reason ?? undefined,
        });
        return { accessRequest };
    }
    async getStats() {
        const [totalIssuers, pendingApprovals, documentsAnchored, suspendedIssuers] = await Promise.all([
            this.prisma.issuer.count({ where: { status: 'ACTIVE' } }),
            this.prisma.accessRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.anchoredDocument.count(),
            this.prisma.issuer.count({ where: { status: 'SUSPENDED' } }),
        ]);
        return { totalIssuers, pendingApprovals, documentsAnchored, suspendedIssuers };
    }
    async getIssuers(params) {
        const limit = Math.min(params.limit ?? 20, 100);
        const where = {};
        if (params.status && params.status !== 'ALL') {
            where.status = params.status;
        }
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { organization: { contains: params.search, mode: 'insensitive' } },
                { walletAddress: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        const cursorObj = params.cursor ? { walletAddress: params.cursor } : undefined;
        const issuers = await this.prisma.issuer.findMany({
            where,
            orderBy: { registeredAt: 'desc' },
            take: limit + 1,
            ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
        });
        const hasMore = issuers.length > limit;
        if (hasMore)
            issuers.pop();
        return {
            issuers,
            nextCursor: hasMore ? issuers[issuers.length - 1]?.walletAddress ?? null : null,
        };
    }
    async getIssuerDetail(address) {
        const normalized = address.toLowerCase();
        const issuer = await this.prisma.issuer.findUnique({
            where: { walletAddress: normalized },
        });
        if (!issuer) {
            throw new common_1.NotFoundException('Issuer not found');
        }
        const recentActivity = await this.prisma.auditLog.findMany({
            where: { targetRef: normalized },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { action: true, detail: true, createdAt: true, txHash: true },
        });
        return { issuer, recentActivity };
    }
    async suspendIssuer(walletAddress, txHash, adminAddress) {
        const normalized = walletAddress.toLowerCase();
        const verification = await this.blockchain.verifyIssuerRoleRevoke(normalized, txHash, adminAddress);
        if (!verification.ok) {
            throw new common_1.HttpException({ error: verification.error }, verification.status ?? 400);
        }
        const [issuer] = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.issuer.findUnique({ where: { walletAddress: normalized } });
            if (!existing) {
                throw new common_1.NotFoundException('Issuer not found');
            }
            if (existing.status !== 'ACTIVE') {
                throw new common_1.HttpException({ error: 'Issuer is not active' }, 400);
            }
            if (existing.suspendTxHash === txHash) {
                throw new common_1.HttpException({ error: 'This suspension has already been recorded' }, 409);
            }
            const updated = await tx.issuer.update({
                where: { walletAddress: normalized },
                data: { status: 'SUSPENDED', suspendedAt: new Date(), suspendTxHash: txHash },
            });
            await tx.auditLog.create({
                data: {
                    action: 'ISSUER_SUSPENDED',
                    actorAddress: adminAddress.toLowerCase(),
                    targetRef: normalized,
                    txHash,
                },
            });
            return [updated];
        });
        return { issuer };
    }
    async reactivateIssuer(walletAddress, txHash, adminAddress) {
        const normalized = walletAddress.toLowerCase();
        const verification = await this.blockchain.verifyIssuerRoleGrant(normalized, txHash, adminAddress);
        if (!verification.ok) {
            throw new common_1.HttpException({ error: verification.error }, verification.status ?? 400);
        }
        const [issuer] = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.issuer.findUnique({ where: { walletAddress: normalized } });
            if (!existing) {
                throw new common_1.NotFoundException('Issuer not found');
            }
            if (existing.status !== 'SUSPENDED') {
                throw new common_1.HttpException({ error: 'Issuer is not suspended' }, 400);
            }
            if (existing.registerTxHash === txHash) {
                throw new common_1.HttpException({ error: 'This transaction has already been recorded' }, 409);
            }
            const updated = await tx.issuer.update({
                where: { walletAddress: normalized },
                data: {
                    status: 'ACTIVE',
                    registerTxHash: txHash,
                    suspendedAt: null,
                    suspendTxHash: null,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'ISSUER_REACTIVATED',
                    actorAddress: adminAddress.toLowerCase(),
                    targetRef: normalized,
                    txHash,
                },
            });
            return [updated];
        });
        return { issuer };
    }
    async uploadIssuerMetadata(address) {
        const normalized = address.toLowerCase();
        const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } });
        if (!issuer) {
            throw new common_1.NotFoundException('Issuer not found');
        }
        const profile = {
            name: issuer.name,
            organization: issuer.organization,
            website: issuer.website,
            registeredAt: issuer.registeredAt.toISOString(),
        };
        const result = await this.ipfs.uploadJson(profile, `issuer-${normalized}`);
        const metadataUri = `ipfs://${result.cid}`;
        await this.prisma.issuer.update({
            where: { walletAddress: normalized },
            data: { metadataUri },
        });
        return { metadataUri, cid: result.cid };
    }
    async setIssuerMetadataOnChain(address, txHash, adminAddress) {
        const normalized = address.toLowerCase();
        const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: normalized } });
        if (!issuer) {
            throw new common_1.NotFoundException('Issuer not found');
        }
        if (!issuer.metadataUri) {
            throw new common_1.HttpException({ error: 'No metadata URI has been uploaded yet' }, 400);
        }
        const rpcUrl = process.env.RPC_URL;
        if (!rpcUrl) {
            throw new common_1.HttpException({ error: 'Server RPC_URL is not configured' }, 500);
        }
        const { createPublicClient, http, parseEventLogs } = await Promise.resolve().then(() => __importStar(require('viem')));
        const publicClient = createPublicClient({ transport: http(rpcUrl) });
        let receipt;
        try {
            receipt = await publicClient.getTransactionReceipt({ hash: txHash });
        }
        catch {
            throw new common_1.HttpException({ error: 'Transaction not found' }, 400);
        }
        if (receipt.status !== 'success') {
            throw new common_1.HttpException({ error: 'On-chain transaction did not succeed' }, 400);
        }
        const IssuerMetadataSetEvent = {
            type: 'event',
            name: 'IssuerMetadataSet',
            inputs: [
                { indexed: true, name: 'issuer', type: 'address' },
                { indexed: false, name: 'metadataURI', type: 'string' },
                { indexed: false, name: 'timestamp', type: 'uint256' },
            ],
        };
        const events = parseEventLogs({ abi: [IssuerMetadataSetEvent], logs: receipt.logs });
        const matched = events.some((event) => event.eventName === 'IssuerMetadataSet' &&
            event.args.issuer?.toLowerCase() === normalized);
        if (!matched) {
            throw new common_1.HttpException({ error: 'Transaction did not emit IssuerMetadataSet for this issuer' }, 400);
        }
        await this.audit.record({
            action: 'ISSUER_METADATA_SET',
            actorAddress: adminAddress,
            targetRef: normalized,
            txHash,
            detail: `metadataUri: ${issuer.metadataUri}`,
        });
        return { issuer: { ...issuer, metadataUri: issuer.metadataUri } };
    }
    async getAuditLog(params) {
        return this.audit.find(params);
    }
    async exportAuditLog(params, res) {
        const { find } = this.audit;
        const result = await find({ ...params, limit: 10000 });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`);
        const headers = ['Action', 'Actor Address', 'Actor Name', 'Target', 'Details', 'Timestamp', 'Tx Hash'];
        const rows = result.entries.map((e) => [
            e.action,
            e.actorAddress,
            e.actorName,
            e.targetRef,
            e.detail ?? '',
            new Date(e.createdAt).toISOString(),
            e.txHash ?? '',
        ]);
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        res.send(csv);
    }
    async getIpfsPinFailures() {
        const count = await this.prisma.auditLog.count({
            where: { action: 'IPFS_PIN_FAILED' },
        });
        return { count };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService,
        audit_service_1.AuditService,
        ipfs_service_1.IpfsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map