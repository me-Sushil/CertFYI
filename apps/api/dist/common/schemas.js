"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevocationSchema = exports.ApprovalSchema = exports.DocumentVerificationSchema = exports.IssuerRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.IssuerRegistrationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    organization: zod_1.z.string().min(2, 'Organization must be at least 2 characters'),
    website: zod_1.z.string().url('Invalid URL').optional(),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters').optional(),
    walletAddress: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
});
exports.DocumentVerificationSchema = zod_1.z.object({
    hash: zod_1.z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid document hash'),
    transactionHash: zod_1.z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
});
exports.ApprovalSchema = zod_1.z.object({
    issuerId: zod_1.z.string().uuid('Invalid issuer ID'),
    approved: zod_1.z.boolean(),
    rejectionReason: zod_1.z.string().optional(),
});
exports.RevocationSchema = zod_1.z.object({
    documentHash: zod_1.z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid document hash'),
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=schemas.js.map