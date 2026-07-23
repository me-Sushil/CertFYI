# CertFyi - Blockchain Document Verification Platform

A comprehensive platform for issuing, verifying, and managing tamper-proof digital documents on the blockchain using a **Turborepo monorepo** architecture.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourrepo%2Fcertfyi)

> **Note**: This project uses **Turborepo** for managing multiple applications and shared packages. See [MONOREPO.md](./MONOREPO.md) for detailed architecture and development guide.

## Features

### For Verifiers
- **Public Verification Portal**: Upload any PDF to verify its authenticity
- **Real-time Verification**: Instant blockchain verification
- **Batch Verification**: Check multiple documents at once
- **Detailed Reports**: Full audit trail and issuer information

### For Issuers
- **Single Issuance**: Issue documents one at a time
- **Bulk Issuance**: Anchor 100+ documents in a single transaction using Merkle trees
- **Gas Optimization**: Batch multiple documents for cost efficiency
- **Dashboard Analytics**: Track all issued and revoked documents
- **Document Revocation**: Revoke documents when needed with audit trail

### For Administrators
- **Issuer Management**: Approve and manage verified issuers
- **Audit Logging**: Complete audit trail of all platform activity
- **Platform Analytics**: System-wide statistics and monitoring
- **Compliance Tools**: Tools for regulatory compliance

## Architecture

### Monorepo Structure (Turborepo)
```
┌────────────────────────────────────────────────────────┐
│         Root Workspace (Turborepo orchestration)        │
│            turbo.json | package.json | pnpm            │
└────────────────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌────────┐    ┌────────┐    ┌────────────┐
    │ apps/  │    │packages│    │  Tools &   │
    │  web   │    │ ├─ ui  │    │   Config   │
    │ apps/  │    │ ├─shared│    │            │
    │  api   │    │ └─contract│  │            │
    └────────┘    └────────┘    └────────────┘
```

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│     Frontend (Next.js 16, @certfyi/web, apps/web)           │
│  - Verifier Portal   - Issuer Dashboard   - Admin Dashboard │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            ↓                     ↓
┌───────────────────────┐  ┌──────────────────────┐
│  Shared Layer         │  │  UI Components       │
│  @certfyi/shared      │  │  @certfyi/ui         │
│ ├─ types.ts          │  │ ├─ shadcn/ui        │
│ ├─ schemas.ts        │  │ ├─ custom           │
│ ├─ constants.ts      │  │ └─ theme system    │
└───────────┬───────────┘  └──────────────────────┘
            │
┌───────────┴──────────────────────────────────────┐
│  API Endpoints & Services (apps/web/app/api)     │
│  - Document Anchoring  - Verification - PDF Ops  │
└──────────────┬───────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    ↓          ↓          ↓
┌─────────┐ ┌──────────┐ ┌──────────────┐
│Database │ │Blockchain│ │  Blob        │
│Postgres │ │ Ethereum │ │  Storage     │
│         │ │ (L1/L2)  │ │  (Vercel)    │
└─────────┘ └──────────┘ └──────────────┘
```

## Technology Stack

### Build & Monorepo
- **Monorepo**: Turborepo with pnpm workspaces
- **Build System**: Turbo with smart caching & parallelization
- **Package Manager**: pnpm 9.0+
- **Node.js**: 18.0.0 or higher

### Frontend (`apps/web`)
- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui (built-in components)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **State Management**: React Hooks + SWR + Zustand
- **Wallet**: wagmi + RainbowKit (MetaMask integration)
- **Type Safety**: TypeScript 5.3+

### UI Package (`packages/ui`)
- **shadcn/ui Components**: Button, Card, Dialog, Input, etc.
- **Tailwind CSS**: Responsive design system
- **Custom Components**: Header, Logo, ThemeToggleInline
- **Barrel Exports**: Clean unified imports

### Shared Package (`packages/shared`)
- **Types**: TypeScript interfaces for Document, Issuer, VerificationResult
- **Validation**: Zod schemas for API/form validation
- **Constants**: Blockchain addresses, API endpoints, chains
- **Barrel Exports**: Centralized package interface

### Backend Services
- **API Routes**: Next.js API routes (`apps/web/app/api`)
- **Database**: PostgreSQL (configured for Prisma ORM)
- **Authentication**: Session-based with MetaMask wallet
- **File Storage**: Vercel Blob for PDF uploads
- **NestJS**: Backend scaffolded in `apps/api` (ready for expansion)

### Smart Contracts (`packages/contracts`)
- **Language**: Solidity 0.8.19
- **Network**: Ethereum (Sepolia testnet / Mainnet)
- **Framework**: Hardhat/Foundry
- **Security**: OpenZeppelin contracts
- **Features**: 
  - Merkle tree batching (100+ documents per transaction)
  - Document revocation with audit trail
  - Access control & role management

### Infrastructure & Deployment
- **Hosting**: Vercel (Edge Computing, auto-scaling)
- **SSL/TLS**: Auto HTTPS with custom domain support
- **Monitoring**: Error tracking & performance monitoring
- **Analytics**: Web vitals & user analytics
- **Wallet**: MetaMask via wagmi & RainbowKit

## Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **pnpm** 9.0.0 or higher (package manager)
- **Git** for version control
- **Web3 wallet** (MetaMask) for blockchain testing

### Installation

```bash
# Clone repository
git clone https://github.com/yourrepo/certfyi
cd certfyi

# Install dependencies (pnpm workspace)
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your blockchain RPC URL, database URL, etc.

# Start all development servers (web + api)
pnpm dev

# Or start specific app:
pnpm dev:web      # Only frontend on port 3000
pnpm dev:api      # Only backend (when available)
```

Visit **http://localhost:3000** to access the application.

### Monorepo Commands

```bash
# Build all packages
pnpm build

# Build specific app
pnpm build:web    # Build only web
pnpm build:api    # Build only API (when ready)

# Type checking
pnpm type-check   # Check all packages

# Linting
pnpm lint         # Lint all packages

# Testing
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode

# Cleanup
pnpm clean        # Remove all build artifacts and node_modules
```

See [MONOREPO.md](./MONOREPO.md) for comprehensive monorepo documentation.

## Project Structure

This project uses **Turborepo** monorepo architecture for scalability and efficient builds:

```
certfyi/
├── apps/
│   ├── web/                           # Next.js 16 Frontend (@certfyi/web)
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── verify/               # Verifier portal
│   │   │   ├── issuer/               # Issuer dashboard
│   │   │   ├── admin/                # Admin dashboard
│   │   │   ├── api/                  # API routes
│   │   │   │   ├── documents/        # Document operations
│   │   │   │   └── pdf/              # PDF processing
│   │   │   └── providers.tsx         # Client providers
│   │   ├── components/               # React components
│   │   │   ├── header.tsx
│   │   │   ├── logo.tsx
│   │   │   └── theme-toggle-inline.tsx
│   │   ├── lib/                      # Utilities
│   │   ├── public/                   # Static assets
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                           # NestJS Backend (@certfyi/api) [Scaffolded]
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                        # Shared Types & Schemas (@certfyi/shared)
│   │   ├── src/
│   │   │   ├── types.ts              # TypeScript types
│   │   │   ├── schemas.ts            # Zod validation schemas
│   │   │   ├── constants.ts          # App constants
│   │   │   └── index.ts              # Barrel exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                            # UI Components (@certfyi/ui)
│   │   ├── src/
│   │   │   ├── components/           # All shadcn/ui components
│   │   │   └── index.ts              # Barrel exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── contracts/                     # Smart Contracts (@certfyi/contracts)
│       ├── src/
│       │   ├── DocumentAnchor.sol
│       │   └── IssuerRegistry.sol
│       ├── test/
│       ├── scripts/
│       ├── package.json
│       └── hardhat.config.ts
│
├── turbo.json                         # Turbo build configuration
├── pnpm-workspace.yaml               # pnpm workspace configuration
├── package.json                       # Root workspace package
├── MONOREPO.md                        # Detailed monorepo guide
├── TURBOREPO_SETUP.md                # Turborepo setup documentation
├── DATABASE.md                        # Database schema
├── SECURITY.md                        # Security guidelines
├── DEPLOYMENT.md                      # Deployment guide
└── README.md                          # This file
```

### Workspace Dependencies
The monorepo uses **pnpm workspaces** with the following dependency structure:
- `@certfyi/web` depends on `@certfyi/shared` and `@certfyi/ui`
- `@certfyi/api` depends on `@certfyi/shared`
- All packages are linked locally for fast development iteration

## API Endpoints

### Documents
- `POST /api/documents/anchor` - Anchor single document
- `POST /api/documents/anchor-batch` - Anchor batch with Merkle root
- `POST /api/documents/verify` - Verify document authenticity
- `GET /api/documents/verify?hash=...` - Quick verification

### PDF Processing
- `POST /api/pdf/upload` - Upload and hash PDF
- `PATCH /api/pdf/hash` - Calculate hash of existing PDF

## Environment Variables

```bash
# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111

# Database
DATABASE_URL=postgresql://user:pass@host/certfyi

# Blockchain
ETHERSCAN_API_KEY=...

# Email (optional)
SENDGRID_API_KEY=...

# Monitoring
SENTRY_DSN=...
```

See `.env.example` for complete list.

## Usage Examples

### Verify a Document

```typescript
import { POST as verifyDocument } from '@/app/api/documents/verify/route'

const response = await fetch('/api/documents/verify', {
  method: 'POST',
  body: JSON.stringify({
    documentHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE...',
  })
})

const { isValid, issuer, timestamp } = await response.json()
```

### Issue a Document

```typescript
const response = await fetch('/api/documents/anchor', {
  method: 'POST',
  body: JSON.stringify({
    documentHash: '0x...',
    documentType: 'Certificate',
    recipientEmail: 'recipient@example.com',
    issuerAddress: '0x...'
  })
})

const { txHash, status } = await response.json()
```

### Bulk Issue Documents

```typescript
const response = await fetch('/api/documents/anchor-batch', {
  method: 'POST',
  body: JSON.stringify({
    documents: [
      { documentHash: '0x...', recipientEmail: '...' },
      { documentHash: '0x...', recipientEmail: '...' },
    ],
    issuerAddress: '0x...',
    batchId: 'batch-001'
  })
})

const { merkleRoot, txHash } = await response.json()
```

## Smart Contract Functions

```solidity
// Anchor a single document
anchorDocument(bytes32 documentHash, string memory documentType)

// Anchor multiple documents with Merkle root
anchorMerkleBatch(bytes32 merkleRoot, uint256 documentCount, string memory batchId)

// Verify document authenticity
verifyDocument(bytes32 documentHash) returns (bool)

// Revoke a document
revokeDocument(bytes32 documentHash)

// Verify Merkle proof
verifyMerkleProof(bytes32[] calldata proof, bytes32 merkleRoot, bytes32 leaf) returns (bool)
```

## Deployment

### Development
```bash
pnpm dev
```

### Production
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide.

```bash
vercel deploy --prod
```

## Security

⚠️ This is a production-ready system. See [SECURITY.md](SECURITY.md) for:
- Authentication & authorization
- Smart contract security
- API security
- Database security
- Deployment security

### Key Security Features
- ✅ Input validation on all APIs
- ✅ ReentrancyGuard on smart contracts
- ✅ Row-level security for database
- ✅ HTTPS/SSL encryption
- ✅ Audit logging of all operations
- ✅ Rate limiting (recommended)

## Testing

```bash
# Run tests
pnpm test

# Run integration tests
pnpm test:integration

# Run security scan
pnpm security:scan

# Check test coverage
pnpm test:coverage
```

## Performance Metrics

- **Page Load Time**: < 2 seconds (target)
- **API Response Time**: < 200ms (average)
- **Verification Time**: < 5 seconds
- **Batch Anchoring**: 100 documents in ~1 transaction
- **Gas Efficiency**: ~0.0015 ETH per document (batched)

## Roadmap

- [ ] Layer 2 optimization (Arbitrum, Optimism)
- [ ] Multi-chain support (Polygon, BSC)
- [ ] NFT certificates
- [ ] Mobile app
- [ ] DAO governance
- [ ] IPFS integration
- [ ] Zero-knowledge proofs

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file

## Support

- 📖 [Documentation](https://docs.certfyi.com)
- 💬 [Discord Community](https://discord.gg/certfyi)
- 🐛 [Issue Tracker](https://github.com/yourrepo/certfyi/issues)
- 📧 [Email Support](mailto:support@certfyi.com)

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI Components from [shadcn/ui](https://ui.shadcn.com)
- Smart Contract Libraries from [OpenZeppelin](https://openzeppelin.com)
- Hosted on [Vercel](https://vercel.com)

## Disclaimer

This platform is for legitimate credential verification only. Users are responsible for:
- Obtaining proper authorization to issue documents
- Ensuring documents are not fraudulently created
- Complying with all applicable laws and regulations

## Contact

- **Website**: https://certfyi.com
- **Email**: hello@certfyi.com
- **Twitter**: [@CertFyi](https://twitter.com/certfyi)
- **GitHub**: [CertFyi](https://github.com/certfyi)

---

Made with ❤️ by the CertFyi Team
