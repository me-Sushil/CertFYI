# CertFyi Deployment Guide

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm or npm
- Git
- Vercel account (for hosting)
- Web3 wallet (for contract deployment)

### Local Development

```bash
# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local

# Start development server
pnpm dev

# Open http://localhost:3000
```

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Create new project
3. Connect your GitHub repository
4. Import project

### Step 2: Configure Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f42bE
NEXT_PUBLIC_CHAIN_ID=11155111
DATABASE_URL=postgresql://...
ETHERSCAN_API_KEY=your_api_key
```

### Step 3: Deploy

```bash
# Auto-deploys on push to main
# Or manually trigger:
vercel --prod
```

## Smart Contract Deployment

### Step 1: Setup Hardhat

```bash
cd contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

npx hardhat
# Select "Create an empty hardhat.config.js"
```

### Step 2: Configure hardhat.config.js

```javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}
```

### Step 3: Deploy Contract

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Step 4: Update Contract Address

After successful deployment, update:
- `.env.local`: `NEXT_PUBLIC_CONTRACT_ADDRESS`
- Vercel environment variables
- Frontend configuration

## Database Setup

### Using Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Run migrations from `DATABASE.md`
5. Get connection string: Settings → Database → Connection Pooling
6. Update `DATABASE_URL` in environment variables

### Using PostgreSQL Locally

```bash
# Install PostgreSQL
brew install postgresql

# Create database
createdb certfyi

# Run migrations
psql -U postgres -d certfyi -f migrations/001_init.sql

# Connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/certfyi
```

## DNS & SSL Configuration

### Custom Domain Setup

1. In Vercel project settings, add custom domain
2. Update DNS records at your registrar:
   ```
   CNAME    www    cname.vercel-dns.com
   A        @      76.76.19.43
   ```
3. SSL certificate auto-generated

### SSL Certificate

- Automatically provisioned by Vercel
- Auto-renewal enabled
- Available at: https://your-domain.com

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image'

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      width={1200}
      height={600}
      alt="Hero"
    />
  )
}
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/Heavy'))
```

### Caching Strategies

```typescript
// Cache for 1 hour
export const revalidate = 3600

// Cache forever
export const revalidate = false

// Revalidate on demand
import { revalidateTag } from 'next/cache'
revalidateTag('documents')
```

## Monitoring & Logging

### Sentry Integration

```bash
npm install @sentry/nextjs
```

Update `next.config.js`:

```javascript
const withSentry = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentry(
  {
    // ... rest of config
  },
  {
    org: "your-org",
    project: "certfyi",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

### Vercel Analytics

Analytics automatically enabled. View in Vercel dashboard.

## Continuous Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      - run: npm test
      
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Scaling & Load Balancing

### Vercel Automatic Scaling

- Automatically scales based on traffic
- Pay-as-you-go pricing
- Regions: Multiple edge locations

### Database Connection Pooling

Use PgBouncer for connection management:

```
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

## Rollback Procedure

```bash
# View deployment history
vercel list

# Rollback to previous deployment
vercel rollback

# Or deploy specific commit
vercel deploy --prod --target <commit-hash>
```

## Troubleshooting

### Common Issues

**Build fails: Module not found**
```bash
# Clear cache and reinstall
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Contract deployment fails**
```bash
# Check account balance
ethers.getBalance(account)

# Check gas prices
npm run estimate-gas
```

**Database connection issues**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check pool connections
SELECT count(*) FROM pg_stat_activity;
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=certfyi:* pnpm dev

# View detailed logs
vercel logs --tail
```

## Maintenance

### Regular Updates

```bash
# Check for outdated packages
pnpm outdated

# Update packages safely
pnpm update

# Audit security vulnerabilities
pnpm audit
```

### Database Maintenance

```bash
# Vacuum and analyze
VACUUM ANALYZE;

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Clean Up Old Deployments

```bash
# Remove old deployments
vercel remove

# Keeps only recent deployments
```

## Cost Optimization

### Frontend Hosting
- Vercel Pro: $20/month
- Edge functions: $0.50 per 1M requests

### Database
- Supabase Free: $0 (development)
- Supabase Pro: $25/month (production)

### Smart Contract Gas Costs
- Single document: ~0.01 ETH
- Batch 100 documents: ~0.15 ETH

## Staging Environment

Create separate staging deployment:

```bash
# Deploy to staging
vercel deploy --scope staging

# Update staging env vars
vercel env pull --environment preview

# Deploy to staging
vercel deploy
```

## Going Live Checklist

- [ ] Domain configured
- [ ] SSL certificate verified
- [ ] Environment variables set
- [ ] Database backup created
- [ ] Smart contract audited
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Backup system tested
- [ ] Security review completed
- [ ] Legal review completed
- [ ] Team trained

## Support

For deployment issues:
- Check [Vercel docs](https://vercel.com/docs)
- Review [Next.js docs](https://nextjs.org/docs)
- Visit [Ethereum docs](https://ethereum.org/developers)
- Create GitHub issue

## Next Steps

1. Deploy frontend to Vercel
2. Deploy smart contract to Sepolia
3. Setup database with Supabase
4. Configure monitoring and alerts
5. Create admin user
6. Test full issuance flow
7. Launch to production

---

**Need help?** Check SECURITY.md and DATABASE.md for more details.
