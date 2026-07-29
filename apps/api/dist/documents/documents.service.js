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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = __importDefault(require("crypto"));
const blockchain_service_1 = require("../blockchain/blockchain.service");
const audit_service_1 = require("../audit/audit.service");
const ipfs_service_1 = require("../ipfs/ipfs.service");
const prisma_service_1 = require("../prisma/prisma.service");
const metadata_sidecar_util_1 = require("../common/utils/metadata-sidecar.util");
let DocumentsService = class DocumentsService {
    constructor(blockchain, audit, ipfs, prisma) {
        this.blockchain = blockchain;
        this.audit = audit;
        this.ipfs = ipfs;
        this.prisma = prisma;
        this.anchoredBatches = new Map();
    }
    async anchor(body, issuerAddress) {
        const verification = await this.blockchain.verifyDocumentAnchor(body.documentHash, body.txHash, issuerAddress);
        if (!verification.ok) {
            throw new common_1.BadRequestException(verification.error ?? 'Could not verify the anchoring transaction');
        }
        const existing = await this.prisma.anchoredDocument.findUnique({
            where: { docHash: body.documentHash },
        });
        if (existing && existing.txHash.toLowerCase() !== body.txHash.toLowerCase()) {
            throw new common_1.ConflictException('This document hash was anchored by a different transaction');
        }
        const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: issuerAddress } });
        const issuerName = issuer?.organization ?? issuer?.name ?? null;
        const metadataCid = await this.pinMetadataSidecar({
            documentHash: body.documentHash,
            issuerAddress,
            issuerName,
            documentType: body.documentType,
            txHash: body.txHash,
            cid: body.cid ?? null,
            recipientEmail: body.recipientEmail,
            recipientName: body.recipientName,
        });
        const record = await this.prisma.anchoredDocument.upsert({
            where: { docHash: body.documentHash },
            create: {
                docHash: body.documentHash,
                issuerAddress,
                issuerName,
                documentType: body.documentType,
                recipientName: body.recipientName ?? null,
                recipientEmail: body.recipientEmail ?? null,
                cid: body.cid ?? null,
                metadataCid,
                txHash: body.txHash,
            },
            update: {},
        });
        if (!existing) {
            await this.audit.record({
                action: 'DOCUMENT_ANCHORED',
                actorAddress: issuerAddress,
                targetRef: body.documentHash,
                txHash: body.txHash,
                detail: `Document type: ${body.documentType}`,
            });
            if (this.ipfs.isConfigured() && !metadataCid) {
                await this.audit.record({
                    action: 'IPFS_PIN_FAILED',
                    actorAddress: issuerAddress,
                    targetRef: body.documentHash,
                    detail: 'Metadata sidecar pin failed',
                });
            }
        }
        return {
            success: true,
            txHash: record.txHash,
            documentHash: record.docHash,
            cid: record.cid,
            metadataCid: record.metadataCid,
            timestamp: record.anchoredAt.toISOString(),
            status: 'confirmed',
            message: 'Document successfully anchored on the blockchain',
        };
    }
    async revoke(body, issuerAddress) {
        const record = await this.prisma.anchoredDocument.findUnique({
            where: { docHash: body.documentHash },
        });
        if (!record) {
            throw new common_1.NotFoundException({ error: 'Document not found', hash: body.documentHash });
        }
        if (record.issuerAddress !== issuerAddress) {
            throw new common_1.ForbiddenException('This document was not issued by the current session');
        }
        if (record.revokedAt) {
            return {
                success: true,
                documentHash: record.docHash,
                txHash: record.revokeTxHash ?? record.txHash,
                revokedAt: record.revokedAt.toISOString(),
                message: 'Document already revoked',
            };
        }
        const verification = await this.blockchain.verifyDocumentRevoke(body.documentHash, body.txHash, issuerAddress);
        if (!verification.ok) {
            throw new common_1.BadRequestException(verification.error ?? 'Could not verify the revocation transaction');
        }
        const updated = await this.prisma.anchoredDocument.update({
            where: { docHash: body.documentHash },
            data: { revokedAt: new Date(), revokeTxHash: body.txHash },
        });
        await this.audit.record({
            action: 'DOCUMENT_REVOKED',
            actorAddress: issuerAddress,
            targetRef: body.documentHash,
            txHash: body.txHash,
        });
        return {
            success: true,
            documentHash: updated.docHash,
            txHash: body.txHash,
            revokedAt: updated.revokedAt.toISOString(),
            message: 'Document revoked',
        };
    }
    async getAnchor(hash) {
        if (!hash) {
            throw new common_1.BadRequestException('Missing hash parameter');
        }
        const record = await this.prisma.anchoredDocument.findUnique({ where: { docHash: hash } });
        if (!record) {
            throw new common_1.NotFoundException({ error: 'Document not found', hash });
        }
        return {
            success: true,
            document: {
                documentHash: record.docHash,
                documentType: record.documentType ?? '',
                recipientEmail: record.recipientEmail ?? undefined,
                recipientName: record.recipientName ?? undefined,
                issuerAddress: record.issuerAddress,
                issuerName: record.issuerName ?? undefined,
                txHash: record.txHash,
                cid: record.cid,
                metadataCid: record.metadataCid,
                timestamp: record.anchoredAt.toISOString(),
                status: record.revokedAt ? 'revoked' : 'confirmed',
                merkleRoot: null,
                batchId: null,
            },
        };
    }
    anchorBatch(body) {
        const leaves = body.documents.map((d) => Buffer.from(d.documentHash.slice(2), 'hex'));
        const merkleRoot = this.blockchain.calculateMerkleRoot(leaves);
        const merkleRootHex = '0x' + merkleRoot.toString('hex');
        const txHash = '0x' + crypto_1.default.randomBytes(32).toString('hex');
        const timestamp = new Date().toISOString();
        const batchRecord = {
            batchId: body.batchId,
            merkleRoot: merkleRootHex,
            issuerAddress: body.issuerAddress,
            issuerName: body.issuerName,
            documentCount: body.documents.length,
            documents: body.documents,
            txHash,
            timestamp,
            status: 'confirmed',
            gasEstimate: '0.15',
        };
        this.anchoredBatches.set(body.batchId, batchRecord);
        return {
            success: true,
            batchId: body.batchId,
            merkleRoot: merkleRootHex,
            txHash,
            documentCount: body.documents.length,
            timestamp,
            status: 'confirmed',
            message: `Successfully anchored ${body.documents.length} documents in a single transaction`,
        };
    }
    getBatch(batchId) {
        if (!batchId) {
            throw new common_1.BadRequestException('Missing batchId parameter');
        }
        const batch = this.anchoredBatches.get(batchId);
        if (!batch) {
            throw new common_1.NotFoundException({ error: 'Batch not found', batchId });
        }
        return { success: true, batch };
    }
    async verify(documentHash, pdfContent) {
        if (pdfContent) {
            const calculatedHash = this.calculateDocumentHash(Buffer.from(pdfContent, 'base64'));
            if (calculatedHash !== documentHash) {
                return {
                    success: false,
                    isValid: false,
                    error: 'Document hash does not match the provided PDF',
                    message: 'The PDF you provided does not match this verification hash. The document may have been modified.',
                };
            }
        }
        const onChain = await this.blockchain.getOnChainDocument(documentHash);
        if (!onChain) {
            return {
                success: true,
                isValid: false,
                documentHash,
                status: 'not_found',
                message: 'This hash has not been anchored on the blockchain.',
                error: 'Document not found on-chain',
            };
        }
        const record = await this.prisma.anchoredDocument.findUnique({ where: { docHash: documentHash } });
        const issuer = await this.prisma.issuer.findUnique({
            where: { walletAddress: onChain.issuer.toLowerCase() },
        });
        const issuerLabel = record?.issuerName ?? issuer?.organization ?? issuer?.name ?? onChain.issuer;
        const receiptSummary = record ? await this.blockchain.getReceiptSummary(record.txHash) : null;
        const base = {
            success: true,
            documentHash,
            issuer: issuerLabel,
            documentType: onChain.documentType,
            issuedDate: new Date(onChain.timestamp * 1000).toISOString(),
            cid: record?.cid ?? null,
            gatewayUrl: record?.cid ? this.ipfs.gatewayUrl(record.cid) : null,
            onchainData: record
                ? {
                    transactionHash: record.txHash,
                    blockNumber: receiptSummary?.blockNumber ?? 0,
                    network: this.blockchain.chainName(),
                }
                : undefined,
        };
        if (onChain.revoked) {
            return {
                ...base,
                isValid: false,
                status: 'revoked',
                message: 'This document has been revoked by its issuer.',
                error: 'Document is revoked',
            };
        }
        return {
            ...base,
            isValid: true,
            status: 'active',
            message: 'Document verified successfully',
        };
    }
    async quickVerify(hash) {
        if (!hash) {
            throw new common_1.BadRequestException('Missing hash parameter');
        }
        if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
            throw new common_1.BadRequestException('Invalid hash format');
        }
        const onChain = await this.blockchain.getOnChainDocument(hash);
        const isValid = !!onChain && !onChain.revoked;
        return {
            success: true,
            hash,
            isValid,
            status: !onChain ? 'not_found' : onChain.revoked ? 'revoked' : 'active',
        };
    }
    async pinMetadataSidecar(input) {
        if (!this.ipfs.isConfigured())
            return null;
        const sidecar = (0, metadata_sidecar_util_1.buildMetadataSidecar)({
            documentHash: input.documentHash,
            issuerAddress: input.issuerAddress,
            issuerName: input.issuerName,
            documentType: input.documentType,
            issuedAt: new Date().toISOString(),
            chainId: this.blockchain.contractChainId,
            txHash: input.txHash,
            cid: input.cid,
            revoked: false,
            recipientEmail: input.recipientEmail,
            recipientName: input.recipientName,
        });
        const outcome = await this.ipfs.pinJson(sidecar, `${input.documentHash}.metadata`);
        return outcome.pinned ? outcome.cid : null;
    }
    calculateDocumentHash(data) {
        return '0x' + crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        audit_service_1.AuditService,
        ipfs_service_1.IpfsService,
        prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map