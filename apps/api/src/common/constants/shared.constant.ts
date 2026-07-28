// Application Constants
export const APP_NAME = 'CertFyi'
export const APP_DESCRIPTION = 'Web3 Document Verification Platform'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Blockchain Constants
export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 8453, name: 'Base' },
  { id: 10, name: 'Optimism' },
]

export const RPC_URLS = {
  1: process.env.NEXT_PUBLIC_ETH_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  137: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
  42161: process.env.NEXT_PUBLIC_ARB_RPC || 'https://arb1.arbitrum.io/rpc',
  8453: process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org',
  10: process.env.NEXT_PUBLIC_OP_RPC || 'https://mainnet.optimism.io',
}

// Smart Contract Addresses
export const CONTRACT_ADDRESSES = {
  documentAnchor: process.env.NEXT_PUBLIC_DOCUMENT_ANCHOR_ADDRESS || '',
  issuerRegistry: process.env.NEXT_PUBLIC_ISSUER_REGISTRY_ADDRESS || '',
}

// Status Constants
export const ISSUER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

// Wallet access-request status values (SIWE auth flow)
export const REQUEST_STATUS = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const DOCUMENT_STATUS = {
  ISSUED: 'issued',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Issuer
  ISSUER_REGISTER: '/api/issuer/register',
  ISSUER_STATUS: '/api/issuer/status',
  ISSUER_APPROVE: '/api/issuer/approve',

  // Documents
  DOCUMENT_ANCHOR: '/api/documents/anchor',
  DOCUMENT_ANCHOR_BATCH: '/api/documents/anchor-batch',
  DOCUMENT_VERIFY: '/api/documents/verify',

  // PDF
  PDF_UPLOAD: '/api/pdf/upload',
} as const

// Uploads
/** Largest PDF accepted by `POST /pdf/upload`. */
export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024

/**
 * Leading bytes of every PDF ("%PDF-"). Checked server-side because a client
 * can set any `Content-Type` it likes (SRS §10.4).
 */
export const PDF_MAGIC_BYTES = Buffer.from('%PDF-', 'ascii')

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File upload
export const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50MB

// Validation Rules
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MIN_EMAIL_LENGTH: 5,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  ETH_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  HASH_REGEX: /^0x[a-fA-F0-9]{64}$/,
} as const

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const IS_TEST = process.env.NODE_ENV === 'test'
