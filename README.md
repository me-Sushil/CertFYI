# CertFYI

A decentralized document verification platform that anchors PDF fingerprints (SHA-256 hashes) on the Ethereum blockchain, enabling anyone to verify document authenticity, issuer identity, and issuance timestamp without a central authority.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.20, OpenZeppelin 5.x, Hardhat |
| Backend | NestJS 10, TypeScript, Prisma, PostgreSQL |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui |
| Web3 | wagmi 2, viem 2, RainbowKit 2, ethers 6 |
| Auth | Sign-In with Ethereum (SIWE) + JWT |
| Storage | IPFS (Pinata), PostgreSQL |
| Build | Turborepo, pnpm workspaces |
| Chain | Ethereum Sepolia (testnet) |

## Monorepo Structure

```
certfyi/
├── apps/
│   ├── api/                    # NestJS backend (port 3001)
│   │   ├── contracts/          # Solidity smart contracts (Hardhat)
│   │   ├── prisma/             # Database schema & migrations
│   │   └── src/
│   │       ├── admin/          # Issuer management, on-chain role grants
│   │       ├── audit/          # Audit trail logging
│   │       ├── auth/           # SIWE verification, session JWT
│   │       ├── blockchain/     # On-chain anchoring, verification, Merkle batches
│   │       ├── common/         # DTOs, guards, decorators, constants
│   │       ├── documents/      # Anchor, revoke, verify documents
│   │       ├── ipfs/           # Pinata IPFS pinning with graceful degradation
│   │       ├── issuer/         # Issuer dashboard endpoints
│   │       ├── pdf/            # PDF validation, hashing, upload
│   │       └── prisma/         # Database service
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── admin/          # Admin dashboard, issuer management, audit log
│       │   ├── issuer/         # Issuer dashboard, issue, bulk-issue, history
│       │   ├── request-access/ # Issuer access request form
│       │   └── verify/         # Public document verification portal
│       ├── components/         # UI components (shadcn/ui + custom)
│       ├── hooks/              # Custom React hooks (on-chain actions, chain enforcement)
│       ├── lib/                # API client, contracts, auth context, utilities
│       └── queries/            # TanStack React Query hooks
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # Workspace declaration
└── package.json                # Root scripts
```

## Features

### Public Document Verification

Anyone can verify a document without logging in. Upload a PDF, the app computes its SHA-256 hash client-side and checks it directly against the on-chain contract. Displays issuer name, document type, issuance date, transaction hash, and IPFS link.

### Single Document Issuance

A 3-step wizard for issuers: fill metadata form, preview, then confirm. The PDF is pinned to IPFS via Pinata, anchored on-chain through the issuer's wallet, and recorded in the database after transaction verification.

### Bulk Document Issuance (Merkle Batching)

Upload a CSV mapping plus multiple PDFs. The platform computes a Merkle tree root from all document hashes and submits a single `anchorMerkleBatch` transaction for gas efficiency. The backend independently recomputes and verifies the Merkle root.

### Document Revocation

Issuers can revoke their own documents on-chain. The backend verifies the revocation receipt before updating records.

### Admin Dashboard

- Approve/reject issuer access requests with on-chain role grants
- Suspend/reactivate issuers
- Upload issuer metadata to IPFS and set on-chain
- Browse all anchored documents
- Full audit log with filtering and CSV export

### Issuer Access Request

Unapproved wallets can submit organization details. Admins review and approve, granting the ISSUER_ROLE on-chain.

### IPFS Integration

Documents and metadata are pinned to IPFS via Pinata. IPFS failures never block on-chain anchoring (graceful degradation). Failed pins can be retried later.

### Audit Trail

All admin and issuer actions are logged with timestamps, actor addresses, and transaction hashes. The log is filterable, paginated, and exportable to CSV.

## Smart Contract

**Contract:** `DocumentAnchor.sol` (Solidity 0.8.20)
**Deployed:** Sepolia at `0x742d35Cc6634C0532925a3b844Bc9e7595f42bE`

| Function | Access | Purpose |
|----------|--------|---------|
| `anchorDocument(bytes32, string)` | ISSUER_ROLE | Anchor a single document hash |
| `anchorMerkleBatch(bytes32, uint256, string)` | ISSUER_ROLE | Anchor a Merkle root for batch |
| `revokeDocument(bytes32)` | ISSUER_ROLE / ADMIN_ROLE | Revoke a document |
| `verifyDocument(bytes32)` | Public | Check if a hash is anchored |
| `getDocument(bytes32)` | Public | Get full document record |
| `verifyMerkleProof(...)` | Public | Verify membership in a batch |
| `grantRole(bytes32, address)` | ADMIN_ROLE | Grant issuer role |
| `revokeRole(bytes32, address)` | ADMIN_ROLE | Revoke issuer role |
| `setIssuerMetadata(address, string)` | ADMIN_ROLE | Set issuer metadata CID |

Built with OpenZeppelin's `AccessControl` and `ReentrancyGuard`.

## Authentication Flow

1. User connects wallet via RainbowKit
2. Backend generates a nonce (stored in a short-lived httpOnly cookie, 5 min TTL)
3. User signs a SIWE message
4. Backend verifies the signature and issues a session JWT (httpOnly cookie, 7 days)
5. Role is determined:
   - **ADMIN** — wallet matches `ADMIN_WALLET_ADDRESS` env var
   - **ISSUER** — wallet exists in `Issuer` table with `ACTIVE` status
   - **UNAPPROVED** — all other wallets

## Database Schema (PostgreSQL via Prisma)

| Model | Purpose |
|-------|---------|
| `AccessRequest` | Issuer access requests (PENDING / APPROVED / REJECTED) |
| `Issuer` | Off-chain index of on-chain ISSUER_ROLE holders (ACTIVE / SUSPENDED) |
| `AuditLog` | Full audit trail of all platform actions |
| `VerificationLog` | Tracks verification requests for analytics |
| `AnchoredDocument` | Documents anchored on-chain (hash, issuer, CID, tx, revocation status) |

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- PostgreSQL database
- Ethereum wallet with Sepolia ETH (for deployment/admin)
- Pinata account (for IPFS pinning)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/certfyi

# Blockchain
CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f42bE
CHAIN_ID=11155111
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Admin
ADMIN_WALLET_ADDRESS=0xYourAdminWallet

# IPFS
PINATA_JWT=your_pinata_jwt_token

# API
PORT=3001
WEB_APP_URL=http://localhost:3000
SWAGGER_ENABLED=true

# Frontend (prefix with NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f42bE
NEXT_PUBLIC_CHAIN_ID=11155111
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/certfyi.git
cd certfyi

# Install dependencies
pnpm install
```

### Database Setup

```bash
# Generate Prisma client
cd apps/api
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Smart Contract Deployment (optional)

```bash
cd apps/api/contracts

# Compile
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

### Development

```bash
# Run all apps
pnpm dev

# Run only the API
pnpm dev:api

# Run only the web frontend
pnpm dev:web
```

### Build

```bash
# Build all apps
pnpm build

# Build individually
pnpm build:api
pnpm build:web
```

## API Documentation

When `SWAGGER_ENABLED=true`, Swagger UI is available at `http://localhost:3001/docs`.

### Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| GET | `/api/platform/stats` | — | Public platform statistics |
| POST | `/api/auth/nonce` | — | Generate SIWE nonce |
| POST | `/api/auth/verify` | — | Verify SIWE signature |
| POST | `/api/auth/logout` | Session | Destroy session |
| GET | `/api/auth/session` | Session | Get current session |
| POST | `/api/documents/verify` | — | Verify a document hash |
| POST | `/api/documents/anchor` | Issuer | Record anchored document |
| POST | `/api/documents/batch-anchor` | Issuer | Record batch-anchored documents |
| POST | `/api/documents/revoke` | Issuer | Record revoked document |
| POST | `/api/pdf/validate` | Issuer | Validate and hash PDF |
| POST | `/api/pdf/upload` | Issuer | Upload PDF to IPFS |
| GET | `/api/issuer/profile` | Issuer | Get issuer profile |
| GET | `/api/issuer/stats` | Issuer | Get issuer statistics |
| GET | `/api/issuer/documents` | Issuer | List issued documents |
| POST | `/api/issuer/request-access` | Session | Submit access request |
| GET | `/api/admin/requests` | Admin | List access requests |
| POST | `/api/admin/requests/:id/approve` | Admin | Approve issuer |
| POST | `/api/admin/requests/:id/reject` | Admin | Reject issuer |
| POST | `/api/admin/issuers/:address/suspend` | Admin | Suspend issuer |
| POST | `/api/admin/issuers/:address/reactivate` | Admin | Reactivate issuer |
| GET | `/api/admin/audit-log` | Admin | Get audit log |

## Security

- **On-chain verification** — Every transaction receipt is verified server-side before database recording (prevents spoofing)
- **Replay protection** — Unique transaction hash constraints prevent replay attacks
- **Sender verification** — Transaction sender must match the authenticated session wallet
- **Rate limiting** — 60 requests per minute via @nestjs/throttler
- **Security headers** — Helmet with strict CSP
- **ReentrancyGuard** — All contract state-changing functions protected
- **httpOnly cookies** — Sessions stored in secure, httpOnly cookies (no localStorage)
- **PDF validation** — Magic byte verification, not just MIME type checking
- **Input validation** — class-validator with whitelist mode strips unknown properties
- **Stateless nonce** — 5-minute TTL prevents stale SIWE messages

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm dev:api` | Start only the API |
| `pnpm dev:web` | Start only the frontend |
| `pnpm build:api` | Build only the API |
| `pnpm build:web` | Build only the frontend |
| `pnpm lint` | Lint all apps |
| `pnpm type-check` | Type-check all apps |
| `pnpm test` | Run tests |
| `pnpm clean` | Clean all build outputs and node_modules |

## License

Private
