"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = exports.ISSUER_ROLE = exports.ADMIN_ROLE = exports.CONTRACT_CHAIN_ID = exports.CONTRACT_ADDRESS = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = __importDefault(require("crypto"));
const viem_1 = require("viem");
exports.CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE';
exports.CONTRACT_CHAIN_ID = parseInt(process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');
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
let BlockchainService = class BlockchainService {
    async verifyIssuerRoleGrant(walletAddress, txHash) {
        const rpcUrl = process.env.RPC_URL;
        if (!rpcUrl) {
            return { ok: false, error: 'Server RPC_URL is not configured', status: 500 };
        }
        const publicClient = (0, viem_1.createPublicClient)({ transport: (0, viem_1.http)(rpcUrl) });
        let receipt;
        try {
            receipt = await publicClient.getTransactionReceipt({ hash: txHash });
        }
        catch {
            return { ok: false, error: 'Transaction not found', status: 400 };
        }
        if (receipt.status !== 'success') {
            return { ok: false, error: 'On-chain transaction did not succeed', status: 400 };
        }
        if (receipt.to?.toLowerCase() !== exports.CONTRACT_ADDRESS.toLowerCase()) {
            return { ok: false, error: 'Transaction does not target the document contract', status: 400 };
        }
        const grantedEvents = (0, viem_1.parseEventLogs)({ abi: [RoleGrantedEvent], logs: receipt.logs });
        const grantedIssuerRole = grantedEvents.some((event) => event.eventName === 'RoleGranted' &&
            event.args.role === exports.ISSUER_ROLE &&
            event.args.account.toLowerCase() === walletAddress.toLowerCase());
        if (!grantedIssuerRole) {
            return { ok: false, error: 'Transaction did not grant ISSUER_ROLE to this wallet', status: 400 };
        }
        return { ok: true };
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
exports.BlockchainService = BlockchainService = __decorate([
    (0, common_1.Injectable)()
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map