# CertFyi Monorepo Architecture

This is a Turborepo-based monorepo for the CertFyi Web3 document verification platform. It contains the frontend, backend, shared packages, and smart contracts.

## Project Structure

```
certfyi/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities and hooks
│   │   ├── public/         # Static assets
│   │   └── package.json    # Web app dependencies
│   │
│   └── api/                # NestJS backend application
│       ├── src/
│       │   ├── modules/    # Feature modules
│       │   ├── common/     # Shared utilities
│       │   └── main.ts     # Entry point
│       └── package.json    # API dependencies
│
├── packages/
│   ├── shared/             # Shared types, schemas, constants
│   │   ├── src/
│   │   │   ├── types.ts    # TypeScript types
│   │   │   ├── schemas.ts  # Zod validation schemas
│   │   │   ├── constants.ts # App constants
│   │   │   └── index.ts    # Barrel exports
│   │   └── package.json
│   │
│   ├── ui/                 # Reusable UI components
│   │   ├── src/
│   │   │   ├── components/ # Custom components + shadcn/ui
│   │   │   └── index.ts    # Barrel exports
│   │   └── package.json
│   │
│   └── contracts/          # Hardhat smart contracts
│       ├── src/           # Contract source files
│       ├── test/          # Contract tests
│       ├── scripts/       # Deployment scripts
│       └── package.json
│
├── turbo.json              # Turbo configuration
├── package.json            # Root workspace configuration
├── tsconfig.json           # Root TypeScript config
├── MONOREPO.md             # This file
└── README.md               # Project overview
```

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Git

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# This will run:
# - web: Next.js on http://localhost:3000
# - api: NestJS on http://localhost:3001
```

## Workspace Commands

### Development
```bash
# Start all apps in parallel
pnpm dev

# Start specific app
pnpm dev --filter=@certfyi/web
pnpm dev --filter=@certfyi/api
```

### Building
```bash
# Build all packages
pnpm build

# Build specific app
pnpm build:web
pnpm build:api

# View build dependencies
turbo build --graph
```

### Testing & Validation
```bash
# Type check all packages
pnpm type-check

# Lint all packages
pnpm lint

# Run tests
pnpm test
pnpm test:watch
```

### Cleanup
```bash
# Clean build artifacts and reinstall
pnpm clean
pnpm install
```

## Package Descriptions

### @certfyi/web
Next.js 16 frontend with:
- Responsive UI with shadcn/ui components
- MetaMask wallet integration (wagmi + RainbowKit)
- Light/Dark theme switching
- Issuer registration workflow
- PDF document verification interface

**Commands:**
```bash
pnpm dev --filter=@certfyi/web
pnpm build:web
```

### @certfyi/api
NestJS backend API with:
- Issuer management and approval flow
- Document verification endpoints
- Blockchain interaction services
- JWT authentication
- Database models and migrations

**Commands:**
```bash
pnpm dev --filter=@certfyi/api
pnpm build:api
```

### @certfyi/shared
Shared TypeScript package containing:
- **Types** - Document, Issuer, VerificationResult, AuditLog interfaces
- **Schemas** - Zod validation schemas for forms and API requests
- **Constants** - API endpoints, blockchain addresses, status codes

**Usage in other packages:**
```typescript
import { 
  Document, 
  IssuerRegistrationSchema,
  API_ENDPOINTS 
} from '@certfyi/shared'
```

### @certfyi/ui
Reusable React component library:
- All shadcn/ui components (Button, Card, Dialog, etc.)
- Custom CertFyi components (Header, Logo, ThemeToggle)
- Tailwind CSS configuration
- TypeScript support

**Usage:**
```typescript
import { Button, Header, ThemeToggleInline } from '@certfyi/ui'
```

### @certfyi/contracts
Smart contracts for blockchain interaction:
- DocumentAnchor.sol - Main anchoring contract with Merkle batching
- IssuerRegistry.sol - Issuer management contract
- Tests and deployment scripts
- Generated ABIs for frontend/backend

## Turborepo Benefits

### Automatic Caching
Turbo caches task results based on file changes:
```bash
# First run: Full build
pnpm build  # ~30s

# Second run: Cached
pnpm build  # ~2s (with no changes)
```

### Parallelization
Tasks run in parallel where possible:
```bash
# These run simultaneously
pnpm build
# @certfyi/shared builds
# @certfyi/ui builds (after shared)
# @certfyi/web and @certfyi/api build (after their dependencies)
```

### Filtered Builds
Build only affected packages:
```bash
# Only build web and dependencies
turbo build --filter=@certfyi/web

# Only build packages that changed
turbo build --filter=[HEAD^]
```

## Environment Variables

Each app has its own `.env` files:

### apps/web/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

### apps/api/.env.local
```
DATABASE_URL=postgresql://user:password@localhost:5432/certfyi
JWT_SECRET=your_secret_key
BLOCKCHAIN_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/demo
```

## Adding New Packages

### Create a new package
```bash
mkdir -p packages/my-package/src
cd packages/my-package

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@certfyi/my-package",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts"
}
EOF
```

### Add to a workspace dependency
```bash
# In apps/web/package.json
"dependencies": {
  "@certfyi/my-package": "workspace:*"
}
```

## Dependency Management

### Workspace Dependencies
Use `workspace:*` protocol for internal dependencies:
```json
{
  "dependencies": {
    "@certfyi/shared": "workspace:*",
    "@certfyi/ui": "workspace:*"
  }
}
```

### Shared Dependencies
Root `package.json` manages versions:
```bash
# Add to root
pnpm add -w typescript prettier turbo

# Updates propagate to all packages
```

## Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test --coverage
```

### Integration Tests
Each app has its own test suite:
```bash
# Test web app
pnpm test --filter=@certfyi/web

# Test API
pnpm test --filter=@certfyi/api
```

## Deployment

### Frontend (Vercel)
```bash
# The web app auto-deploys to Vercel
# Environment variables configured in Vercel dashboard
pnpm build:web
```

### Backend (Docker/Cloud Run)
```bash
# Build Docker image
pnpm build:api
docker build -f apps/api/Dockerfile -t certfyi-api .

# Deploy to cloud
docker push certfyi-api:latest
```

### Smart Contracts (Blockchain)
```bash
# Compile contracts
pnpm run --filter=@certfyi/contracts compile

# Deploy to testnet
pnpm run --filter=@certfyi/contracts deploy:testnet

# Verify on mainnet
pnpm run --filter=@certfyi/contracts verify
```

## Performance Optimization

### Turbo Cache Hits
View cache stats:
```bash
pnpm build --no-cache  # Clear cache
pnpm build             # First run
pnpm build             # Cache hit
```

### Remote Caching (Team Collaboration)
```bash
# Connect to Vercel
turbo login

# Push cache
turbo build --remote-only
```

## Troubleshooting

### Build fails
```bash
# Clean and reinstall
pnpm clean
pnpm install

# Check for circular dependencies
turbo build --graph
```

### Workspace dependency errors
```bash
# Reinstall workspaces
pnpm install --force

# Check workspace structure
pnpm list -r
```

### Port conflicts
```bash
# Web: PORT=3002 pnpm dev --filter=@certfyi/web
# API: API_PORT=3002 pnpm dev --filter=@certfyi/api
```

## Contributing

When adding features:
1. Shared types go to `packages/shared`
2. Reusable UI components go to `packages/ui`
3. Constants and schemas go to `packages/shared`
4. Feature code goes to respective `apps/`

## Resources

- [Turbo Documentation](https://turbo.build)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org)
- [NestJS Documentation](https://docs.nestjs.com)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com)
