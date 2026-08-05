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
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = exports.ISSUER_ROLE = exports.ADMIN_ROLE = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = __importDefault(require("crypto"));
const viem_1 = require("viem");
exports.ADMIN_ROLE = (0, viem_1.keccak256)((0, viem_1.stringToBytes)('ADMIN_ROLE'));
exports.ISSUER_ROLE = (0, viem_1.keccak256)((0, viem_1.stringToBytes)('ISSUER_ROLE'));
const RoleGrantedEvent = {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
        { indexed: true, name: 'role', type: 'bytes32' },
        { indexed: true, name: 'account', type: 'address' },
        { indexed: true, name: 'sender', type: 'address' },
    ],
};
const RoleRevokedEvent = {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
        { indexed: true, name: 'role', type: 'bytes32' },
        { indexed: true, name: 'account', type: 'address' },
        { indexed: true, name: 'sender', type: 'address' },
    ],
};
const ROLE_EVENTS = [RoleGrantedEvent, RoleRevokedEvent];
const HasRoleFn = {
    type: 'function',
    name: 'hasRole',
    stateMutability: 'view',
    inputs: [
        { name: 'role', type: 'bytes32' },
        { name: 'account', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
};
const DocumentAnchoredEvent = {
    type: 'event',
    name: 'DocumentAnchored',
    inputs: [
        { indexed: true, name: 'documentHash', type: 'bytes32' },
        { indexed: true, name: 'issuer', type: 'address' },
        { indexed: false, name: 'documentType', type: 'string' },
        { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
};
const MerkleRootAnchoredEvent = {
    type: 'event',
    name: 'MerkleRootAnchored',
    inputs: [
        { indexed: true, name: 'merkleRoot', type: 'bytes32' },
        { indexed: true, name: 'issuer', type: 'address' },
        { indexed: false, name: 'documentCount', type: 'uint256' },
        { indexed: false, name: 'timestamp', type: 'uint256' },
        { indexed: false, name: 'batchId', type: 'string' },
    ],
};
const BATCH_EVENTS = [MerkleRootAnchoredEvent];
const GetMerkleBatchFn = {
    type: 'function',
    name: 'getMerkleBatch',
    stateMutability: 'view',
    inputs: [{ name: '_merkleRoot', type: 'bytes32' }],
    outputs: [
        { name: 'issuer', type: 'address' },
        { name: 'documentCount', type: 'uint256' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'batchId', type: 'string' },
    ],
};
const DOCUMENT_EVENTS = [DocumentAnchoredEvent];
const GetDocumentFn = {
    type: 'function',
    name: 'getDocument',
    stateMutability: 'view',
    inputs: [{ name: '_documentHash', type: 'bytes32' }],
    outputs: [
        { name: 'issuer', type: 'address' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'revoked', type: 'bool' },
        { name: 'documentType', type: 'string' },
    ],
};
const CHAIN_NAMES = {
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    42161: 'Arbitrum',
    8453: 'Base',
    10: 'Optimism',
    11155111: 'Sepolia',
};
let BlockchainService = BlockchainService_1 = class BlockchainService {
    constructor() {
        this.logger = new common_1.Logger(BlockchainService_1.name);
        const rawAddress = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
        if (!rawAddress) {
            throw new Error('CONTRACT_ADDRESS is not set. Set CONTRACT_ADDRESS (or NEXT_PUBLIC_CONTRACT_ADDRESS) ' +
                'in the environment before starting the server.');
        }
        try {
            this.contractAddress = (0, viem_1.getAddress)(rawAddress);
        }
        catch {
            throw new Error(`CONTRACT_ADDRESS "${rawAddress}" is not a valid EVM address. ` +
                'Provide a 40-character hex address with 0x prefix.');
        }
        const rawChainId = process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID;
        if (!rawChainId) {
            throw new Error('CHAIN_ID is not set. Set CHAIN_ID (or NEXT_PUBLIC_CHAIN_ID) in the environment.');
        }
        this.contractChainId = parseInt(rawChainId, 10);
        if (isNaN(this.contractChainId) || this.contractChainId <= 0) {
            throw new Error(`CHAIN_ID "${rawChainId}" is not a valid chain ID.`);
        }
    }
    async onModuleInit() {
        const rpcUrl = process.env.RPC_URL;
        if (!rpcUrl) {
            throw new Error('RPC_URL is not set. Provide an RPC endpoint for the configured chain.');
        }
        this.publicClient = (0, viem_1.createPublicClient)({ transport: (0, viem_1.http)(rpcUrl) });
        try {
            const actualChainId = await this.publicClient.getChainId();
            if (actualChainId !== this.contractChainId) {
                throw new Error(`RPC_URL chain ID (${actualChainId}) does not match CHAIN_ID (${this.contractChainId}). ` +
                    'The RPC endpoint must point at the same chain the contract is deployed on.');
            }
            this.logger.log(`BlockchainService initialised: chain=${this.contractChainId} contract=${this.contractAddress}`);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('RPC_URL chain ID')) {
                throw error;
            }
            throw new Error(`Failed to connect to RPC_URL: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
                'Check that RPC_URL is reachable and points to the configured chain.');
        }
    }
    async verifyIssuerRoleGrant(walletAddress, txHash, adminAddress) {
        return this.verifyRoleEvent(walletAddress, txHash, 'RoleGranted', adminAddress);
    }
    async verifyIssuerRoleRevoke(walletAddress, txHash, adminAddress) {
        return this.verifyRoleEvent(walletAddress, txHash, 'RoleRevoked', adminAddress);
    }
    async verifyRoleEvent(walletAddress, txHash, eventName, adminAddress) {
        let receipt;
        try {
            receipt = await this.publicClient.getTransactionReceipt({ hash: txHash });
        }
        catch {
            return { ok: false, error: 'Transaction not found', status: 400 };
        }
        if (receipt.status !== 'success') {
            return { ok: false, error: 'On-chain transaction did not succeed', status: 400 };
        }
        if (receipt.to?.toLowerCase() !== this.contractAddress.toLowerCase()) {
            return { ok: false, error: 'Transaction does not target the document contract', status: 400 };
        }
        if (receipt.from.toLowerCase() !== adminAddress.toLowerCase()) {
            return {
                ok: false,
                error: `Transaction was sent by a different wallet than the current session. ` +
                    `Only the wallet that signed the transaction can record it.`,
                status: 403,
            };
        }
        const events = (0, viem_1.parseEventLogs)({ abi: ROLE_EVENTS, logs: receipt.logs });
        const matched = events.some((event) => event.eventName === eventName &&
            event.args.role === exports.ISSUER_ROLE &&
            event.args.account.toLowerCase() === walletAddress.toLowerCase());
        if (matched) {
            return { ok: true };
        }
        const hasRole = await this.publicClient.readContract({
            address: this.contractAddress,
            abi: [HasRoleFn],
            functionName: 'hasRole',
            args: [exports.ISSUER_ROLE, walletAddress],
        });
        const expectedState = eventName === 'RoleGranted';
        if (hasRole === expectedState) {
            return { ok: true };
        }
        return {
            ok: false,
            error: `Transaction did not emit ${eventName} for ISSUER_ROLE on this wallet, and the ` +
                `wallet's current on-chain role state does not match either.`,
            status: 400,
        };
    }
    async verifyDocumentAnchor(documentHash, txHash, issuerAddress) {
        let receipt;
        try {
            receipt = await this.publicClient.getTransactionReceipt({ hash: txHash });
        }
        catch {
            return { ok: false, error: 'Transaction not found', status: 400 };
        }
        if (receipt.status !== 'success') {
            return { ok: false, error: 'On-chain transaction did not succeed', status: 400 };
        }
        if (receipt.to?.toLowerCase() !== this.contractAddress.toLowerCase()) {
            return { ok: false, error: 'Transaction does not target the document contract', status: 400 };
        }
        if (receipt.from.toLowerCase() !== issuerAddress.toLowerCase()) {
            return {
                ok: false,
                error: 'Transaction was sent by a different wallet than the current session.',
                status: 403,
            };
        }
        const events = (0, viem_1.parseEventLogs)({ abi: DOCUMENT_EVENTS, logs: receipt.logs });
        const matched = events.some((event) => event.eventName === 'DocumentAnchored' &&
            event.args.documentHash.toLowerCase() === documentHash.toLowerCase() &&
            event.args.issuer.toLowerCase() === issuerAddress.toLowerCase());
        if (matched) {
            return { ok: true };
        }
        const onChain = await this.getOnChainDocument(documentHash);
        if (onChain?.anchored && onChain.issuer.toLowerCase() === issuerAddress.toLowerCase()) {
            return { ok: true };
        }
        return {
            ok: false,
            error: 'Transaction did not emit DocumentAnchored for this hash, and the hash is not ' +
                'anchored on-chain for this issuer.',
            status: 400,
        };
    }
    async getOnChainDocument(documentHash) {
        const [issuer, timestamp, , documentType] = await this.publicClient.readContract({
            address: this.contractAddress,
            abi: [GetDocumentFn],
            functionName: 'getDocument',
            args: [documentHash],
        });
        if (timestamp === 0n) {
            return null;
        }
        return {
            anchored: true,
            issuer,
            timestamp: Number(timestamp),
            documentType,
        };
    }
    async verifyMerkleBatchAnchor(merkleRoot, txHash, issuerAddress) {
        let receipt;
        try {
            receipt = await this.publicClient.getTransactionReceipt({ hash: txHash });
        }
        catch {
            return { ok: false, error: 'Transaction not found', status: 400 };
        }
        if (receipt.status !== 'success') {
            return { ok: false, error: 'On-chain transaction did not succeed', status: 400 };
        }
        if (receipt.to?.toLowerCase() !== this.contractAddress.toLowerCase()) {
            return { ok: false, error: 'Transaction does not target the document contract', status: 400 };
        }
        if (receipt.from.toLowerCase() !== issuerAddress.toLowerCase()) {
            return {
                ok: false,
                error: 'Transaction was sent by a different wallet than the current session.',
                status: 403,
            };
        }
        const events = (0, viem_1.parseEventLogs)({ abi: BATCH_EVENTS, logs: receipt.logs });
        const matched = events.some((event) => event.eventName === 'MerkleRootAnchored' &&
            event.args.merkleRoot.toLowerCase() === merkleRoot.toLowerCase());
        if (matched) {
            return { ok: true };
        }
        const [batchIssuer, documentCount] = await this.publicClient.readContract({
            address: this.contractAddress,
            abi: [GetMerkleBatchFn],
            functionName: 'getMerkleBatch',
            args: [merkleRoot],
        });
        if (documentCount > 0n && batchIssuer.toLowerCase() === issuerAddress.toLowerCase()) {
            return { ok: true };
        }
        return {
            ok: false,
            error: 'Transaction did not emit MerkleRootAnchored for this root, and the root is not ' +
                'anchored on-chain for this issuer.',
            status: 400,
        };
    }
    async getReceiptSummary(txHash) {
        try {
            const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash });
            return { blockNumber: Number(receipt.blockNumber) };
        }
        catch {
            return null;
        }
    }
    chainName(chainId = this.contractChainId) {
        return CHAIN_NAMES[chainId] ?? `Chain ID ${chainId}`;
    }
    calculateDocumentHash(data) {
        const buffer = typeof data === 'string' ? Buffer.from(data) : data;
        return '0x' + crypto_1.default.createHash('sha256').update(buffer).digest('hex');
    }
    calculateMerkleRoot(leaves) {
        if (leaves.length === 0) {
            throw new Error('Cannot calculate Merkle root from empty array');
        }
        let tree = leaves.slice();
        while (tree.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < tree.length; i += 2) {
                if (i + 1 < tree.length) {
                    const combined = Buffer.concat([tree[i], tree[i + 1]]);
                    nextLevel.push(crypto_1.default.createHash('sha256').update(combined).digest());
                }
                else {
                    nextLevel.push(tree[i]);
                }
            }
            tree = nextLevel;
        }
        return tree[0];
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map