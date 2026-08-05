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
                status: 'confirmed',
                merkleRoot: null,
                batchId: null,
            },
        };
    }
    async anchorBatch(body, issuerAddress) {
        const leaves = body.documents.map((d) => Buffer.from(d.documentHash.slice(2), 'hex'));
        const merkleRoot = this.blockchain.calculateMerkleRoot(leaves);
        const merkleRootHex = ('0x' + merkleRoot.toString('hex'));
        const verification = await this.blockchain.verifyMerkleBatchAnchor(merkleRootHex, body.txHash, issuerAddress);
        if (!verification.ok) {
            throw new common_1.BadRequestException(verification.error ?? 'Could not verify the batch anchoring transaction');
        }
        const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: issuerAddress } });
        const issuerName = issuer?.organization ?? issuer?.name ?? null;
        const existing = await this.prisma.anchoredDocument.findMany({
            where: { docHash: { in: body.documents.map((d) => d.documentHash) } },
            select: { docHash: true, txHash: true },
        });
        const conflicting = existing.find((e) => e.txHash.toLowerCase() !== body.txHash.toLowerCase());
        if (conflicting) {
            throw new common_1.ConflictException(`Document ${conflicting.docHash} was already anchored by a different transaction`);
        }
        const alreadyRecorded = new Set(existing.map((e) => e.docHash));
        const records = [];
        for (const doc of body.documents) {
            if (alreadyRecorded.has(doc.documentHash)) {
                records.push(await this.prisma.anchoredDocument.findUniqueOrThrow({ where: { docHash: doc.documentHash } }));
                continue;
            }
            const metadataCid = await this.pinMetadataSidecar({
                documentHash: doc.documentHash,
                issuerAddress,
                issuerName,
                documentType: body.documentType,
                txHash: body.txHash,
                cid: doc.cid ?? null,
                recipientEmail: doc.recipientEmail,
                recipientName: doc.recipientName,
            });
            records.push(await this.prisma.anchoredDocument.create({
                data: {
                    docHash: doc.documentHash,
                    issuerAddress,
                    issuerName,
                    documentType: body.documentType,
                    recipientName: doc.recipientName,
                    recipientEmail: doc.recipientEmail,
                    cid: doc.cid ?? null,
                    metadataCid,
                    txHash: body.txHash,
                    batchId: body.batchId,
                },
            }));
        }
        if (existing.length === 0) {
            await this.audit.record({
                action: 'BATCH_ANCHORED',
                actorAddress: issuerAddress,
                targetRef: body.batchId,
                txHash: body.txHash,
                detail: `${body.documents.length} documents, merkleRoot: ${merkleRootHex}`,
            });
        }
        return {
            success: true,
            batchId: body.batchId,
            merkleRoot: merkleRootHex,
            txHash: body.txHash,
            documentCount: records.length,
            timestamp: new Date().toISOString(),
            status: 'confirmed',
            message: `Successfully anchored ${records.length} documents in a single transaction`,
        };
    }
    async getBatch(batchId) {
        if (!batchId) {
            throw new common_1.BadRequestException('Missing batchId parameter');
        }
        const documents = await this.prisma.anchoredDocument.findMany({ where: { batchId } });
        if (documents.length === 0) {
            throw new common_1.NotFoundException({ error: 'Batch not found', batchId });
        }
        return {
            success: true,
            batch: {
                batchId,
                issuerAddress: documents[0].issuerAddress,
                issuerName: documents[0].issuerName ?? undefined,
                documentCount: documents.length,
                documents: documents.map((d) => ({
                    documentHash: d.docHash,
                    recipientEmail: d.recipientEmail ?? undefined,
                    recipientName: d.recipientName ?? undefined,
                    cid: d.cid ?? undefined,
                })),
                txHash: documents[0].txHash,
                timestamp: documents[0].anchoredAt.toISOString(),
                status: 'confirmed',
            },
        };
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
        this.prisma.verificationLog.create({ data: {} }).catch(() => { });
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
        this.prisma.verificationLog.create({ data: {} }).catch(() => { });
        const onChain = await this.blockchain.getOnChainDocument(hash);
        return {
            success: true,
            hash,
            isValid: !!onChain,
            status: onChain ? 'active' : 'not_found',
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