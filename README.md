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

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  - Verifier Portal   - Issuer Dashboard   - Admin Dashboard  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────────────┐
│              Backend API & Services (Next.js)                │
│  - Document Anchoring  - Batch Processing  - Verification   │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────┴────────┐ ┌──┴──────────┐ ┌─┴─────────────────────┐
│  PostgreSQL    │ │  Blockchain │ │   Blob Storage        │
│  Database      │ │  (Ethereum) │ │   (File Upload)       │
└────────────────┘ └─────────────┘ └───────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Hooks + SWR
- **Type Safety**: TypeScript

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based with secure tokens
- **File Storage**: Vercel Blob

### Smart Contracts
- **Language**: Solidity 0.8.19
- **Network**: Ethereum (Sepolia testnet / Mainnet)
- **Security**: OpenZeppelin contracts
- **Features**: Merkle tree batching, revocation, access control

### Infrastructure
- **Hosting**: Vercel (Edge Computing)
- **DNS**: Custom domain with auto SSL
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Git
- Web3 wallet (for testing)

### Installation

```bash
# Clone repository
git clone https://github.com/yourrepo/certfyi
cd certfyi

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Visit http://localhost:3000

## Project Structure

```
certfyi/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Home page
│   ├── verify/                # Verifier portal
│   ├── issuer/                # Issuer dashboard
│   ├── admin/                 # Admin dashboard
│   └── api/                   # API routes
│       ├── documents/         # Document operations
│       └── pdf/              # PDF processing
├── components/               # React components
├── lib/                       # Utilities
│   ├── contracts.ts          # Smart contract configs
│   └── utils.ts              # Helper functions
├── contracts/                # Smart contracts
│   ├── src/
│   │   └── DocumentAnchor.sol
│   └── README.md
├── public/                    # Static assets
├── DATABASE.md               # Database schema
├── SECURITY.md               # Security guidelines
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

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
