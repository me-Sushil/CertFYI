# CertFYI

CertFYI anchors PDF fingerprints on Ethereum so a document's authenticity, issuer, and issuance date can be verified independently, without trusting a central authority or the issuer's own word.

## Use Case

Universities, training providers, and certifying bodies issue certificates and credentials that are easy to forge and hard to verify at scale. CertFYI lets an approved issuer anchor a document's hash on-chain at the moment of issuance. Anyone holding a copy of that document, or a link to it, can later confirm it is genuine, unaltered, and really came from that issuer, without contacting the issuer directly.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity, OpenZeppelin, Hardhat |
| Backend | NestJS, TypeScript, Prisma, PostgreSQL |
| Frontend | Next.js (App Router), React, Tailwind CSS, shadcn/ui |
| Web3 | wagmi, viem, RainbowKit |
| Auth | Sign-In with Ethereum (SIWE), JWT sessions |
| Storage | IPFS (Pinata), PostgreSQL |
| Build | Turborepo, pnpm workspaces |
| Network | Ethereum Sepolia (testnet) |

## Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL
- A Sepolia-funded wallet, for deploying the contract and for admin actions
- A Pinata account, for IPFS pinning

## Setup

### 1. Install

```bash
git clone https://github.com/your-org/certfyi.git
cd certfyi
pnpm install
```

### 2. Deploy the smart contract

The contract lives in `apps/api/contracts`. Deploying it is required before the backend or frontend can do anything on-chain, since both need its address.

```bash
cd apps/api/contracts
cp .env.example .env
```

Fill in `.env`:
- `SEPOLIA_RPC_URL` — a Sepolia RPC endpoint (the example value works without signup)
- `PRIVATE_KEY` — the private key of the wallet that should become the on-chain admin, without the `0x` prefix. Use a development-only wallet.

Then compile and deploy:

```bash
pnpm exec hardhat compile
pnpm exec hardhat run scripts/deploy.ts --network sepolia
```

This prints the deployed contract address. Save it, you'll need it in the next step. The wallet used to deploy automatically becomes the contract's admin.

### 3. Configure the backend and frontend

Copy `.env.example` to `.env` in both `apps/api` and `apps/web`, then fill in:
- Your PostgreSQL `DATABASE_URL`
- The contract address and RPC URL from step 2
- `ADMIN_WALLET_ADDRESS`, set to the same wallet address used to deploy
- Your Pinata JWT for IPFS pinning

### 4. Set up the database

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
```

### 5. Run

```bash
pnpm dev          # all apps
pnpm dev:api      # backend only
pnpm dev:web      # frontend only
```

The frontend runs on `localhost:3000`, the backend on `localhost:3001`.

### Build for production

```bash
pnpm build
```

## Adding More Admins

The contract supports multiple admin wallets. To grant one, run `apps/api/contracts/scripts/grant-admin.ts` with the original deployer's key, then add the new wallet's address to `ADMIN_WALLET_ADDRESS` (comma-separated) in `apps/api/.env`.

## API Documentation

With `SWAGGER_ENABLED=true`, the full API reference is available at `http://localhost:3001/docs`.

## Security

- Every on-chain transaction is independently re-verified server-side before being recorded
- Sessions use httpOnly cookies; no tokens are stored in localStorage
- All state-changing contract functions are protected by `ReentrancyGuard`
- Input is validated and unknown fields are stripped on every request

## License

Private
