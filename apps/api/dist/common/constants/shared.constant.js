"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_TEST = exports.IS_DEVELOPMENT = exports.IS_PRODUCTION = exports.VALIDATION = exports.MAX_PDF_SIZE = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.API_ENDPOINTS = exports.DOCUMENT_STATUS = exports.REQUEST_STATUS = exports.ISSUER_STATUS = exports.CONTRACT_ADDRESSES = exports.RPC_URLS = exports.SUPPORTED_CHAINS = exports.API_URL = exports.APP_URL = exports.APP_DESCRIPTION = exports.APP_NAME = void 0;
exports.APP_NAME = 'CertFyi';
exports.APP_DESCRIPTION = 'Web3 Document Verification Platform';
exports.APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
exports.API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
exports.SUPPORTED_CHAINS = [
    { id: 1, name: 'Ethereum' },
    { id: 137, name: 'Polygon' },
    { id: 42161, name: 'Arbitrum' },
    { id: 8453, name: 'Base' },
    { id: 10, name: 'Optimism' },
];
exports.RPC_URLS = {
    1: process.env.NEXT_PUBLIC_ETH_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    137: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
    42161: process.env.NEXT_PUBLIC_ARB_RPC || 'https://arb1.arbitrum.io/rpc',
    8453: process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org',
    10: process.env.NEXT_PUBLIC_OP_RPC || 'https://mainnet.optimism.io',
};
exports.CONTRACT_ADDRESSES = {
    documentAnchor: process.env.NEXT_PUBLIC_DOCUMENT_ANCHOR_ADDRESS || '',
    issuerRegistry: process.env.NEXT_PUBLIC_ISSUER_REGISTRY_ADDRESS || '',
};
exports.ISSUER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
exports.REQUEST_STATUS = {
    NONE: 'NONE',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};
exports.DOCUMENT_STATUS = {
    ISSUED: 'issued',
    REVOKED: 'revoked',
    EXPIRED: 'expired',
};
exports.API_ENDPOINTS = {
    ISSUER_REGISTER: '/api/issuer/register',
    ISSUER_STATUS: '/api/issuer/status',
    ISSUER_APPROVE: '/api/issuer/approve',
    DOCUMENT_ANCHOR: '/api/documents/anchor',
    DOCUMENT_ANCHOR_BATCH: '/api/documents/anchor-batch',
    DOCUMENT_VERIFY: '/api/documents/verify',
    PDF_UPLOAD: '/api/pdf/upload',
};
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
exports.MAX_PDF_SIZE = 50 * 1024 * 1024;
exports.VALIDATION = {
    MIN_NAME_LENGTH: 2,
    MIN_EMAIL_LENGTH: 5,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 1000,
    ETH_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
    HASH_REGEX: /^0x[a-fA-F0-9]{64}$/,
};
exports.IS_PRODUCTION = process.env.NODE_ENV === 'production';
exports.IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
exports.IS_TEST = process.env.NODE_ENV === 'test';
//# sourceMappingURL=shared.constant.js.map