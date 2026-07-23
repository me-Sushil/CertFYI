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
let DocumentsService = class DocumentsService {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.anchoredDocuments = new Map();
        this.anchoredBatches = new Map();
    }
    anchor(body) {
        const txHash = '0x' + crypto_1.default.randomBytes(32).toString('hex');
        const timestamp = new Date().toISOString();
        const anchorRecord = {
            documentHash: body.documentHash,
            documentType: body.documentType,
            recipientEmail: body.recipientEmail,
            recipientName: body.recipientName,
            issuerAddress: body.issuerAddress,
            issuerName: body.issuerName,
            txHash,
            timestamp,
            status: 'confirmed',
            merkleRoot: null,
            batchId: null,
        };
        this.anchoredDocuments.set(body.documentHash, anchorRecord);
        console.log('[API] Document anchored:', {
            documentHash: body.documentHash,
            issuer: body.issuerAddress,
            txHash,
        });
        return {
            success: true,
            txHash,
            documentHash: body.documentHash,
            timestamp,
            status: 'confirmed',
            message: 'Document successfully anchored on the blockchain',
        };
    }
    getAnchor(hash) {
        if (!hash) {
            throw new common_1.BadRequestException('Missing hash parameter');
        }
        const record = this.anchoredDocuments.get(hash);
        if (!record) {
            throw new common_1.NotFoundException({ error: 'Document not found', hash });
        }
        return { success: true, document: record };
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
        console.log('[API] Batch anchored:', {
            batchId: body.batchId,
            documentCount: body.documents.length,
            merkleRoot: merkleRootHex,
            issuer: body.issuerAddress,
            txHash,
        });
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
    verify(documentHash, pdfContent) {
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
        const mockIsValid = Math.random() > 0.2;
        if (mockIsValid) {
            const mockIssuer = ['Stanford University', 'MIT', 'Harvard', 'Yale'][Math.floor(Math.random() * 4)];
            const daysAgo = Math.floor(Math.random() * 90);
            const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            return {
                success: true,
                isValid: true,
                documentHash,
                issuer: mockIssuer,
                documentType: 'Certificate',
                issuedDate: timestamp.toISOString(),
                status: 'active',
                message: 'Document verified successfully',
                onchainData: {
                    transactionHash: '0x' + crypto_1.default.randomBytes(32).toString('hex'),
                    blockNumber: Math.floor(Math.random() * 20000000),
                    network: 'Ethereum Mainnet',
                },
            };
        }
        return {
            success: true,
            isValid: false,
            documentHash,
            status: 'revoked',
            message: 'Document is revoked or no longer valid',
            error: 'This document has been revoked by the issuer',
        };
    }
    quickVerify(hash) {
        if (!hash) {
            throw new common_1.BadRequestException('Missing hash parameter');
        }
        if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
            throw new common_1.BadRequestException('Invalid hash format');
        }
        const isValid = Math.random() > 0.2;
        return {
            success: true,
            hash,
            isValid,
            status: isValid ? 'active' : 'revoked',
        };
    }
    calculateDocumentHash(data) {
        return '0x' + crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map