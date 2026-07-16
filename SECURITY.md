# CertFyi Security & Deployment Guide

## Security Best Practices

### 1. Environment Variables

Never commit sensitive data to version control. Always use environment variables:

```bash
# .env.local (never commit)
PRIVATE_KEY=your_private_key_here
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
ETHERSCAN_API_KEY=...
```

### 2. Authentication & Authorization

- Use strong password requirements (minimum 12 characters, mixed case, numbers, symbols)
- Implement rate limiting on login attempts
- Use session tokens with appropriate expiration times
- Verify issuer wallets before approving document anchoring
- Implement role-based access control (RBAC)

```typescript
// Example: Check authorization
if (!approvedIssuers.includes(wallet)) {
  throw new Error('Unauthorized issuer')
}
```

### 3. Smart Contract Security

- Use OpenZeppelin security libraries
- Implement ReentrancyGuard to prevent reentrancy attacks
- Use Checks-Effects-Interactions pattern
- Validate all inputs thoroughly
- Consider professional smart contract audit before mainnet deployment

```solidity
// Good practice: Check before state change
require(msg.sender == owner, "Only owner");
// Update state
// Interact with external contracts
```

### 4. API Security

- Use HTTPS only (enforced by Next.js in production)
- Validate all input data
- Implement request rate limiting
- Use CORS appropriately
- Sanitize user inputs to prevent injection attacks

```typescript
// Validate incoming data
if (!/^0x[a-fA-F0-9]{64}$/.test(documentHash)) {
  return error('Invalid hash format')
}
```

### 5. Database Security

- Use parameterized queries (Prisma ORM handles this)
- Implement Row-Level Security (RLS) policies
- Encrypt sensitive data at rest
- Use strong database credentials
- Regular backups with encryption

```sql
-- Example: RLS policy
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issuers_see_own_docs" ON documents
  USING (issuer_id = current_user_id);
```

### 6. File Upload Security

- Validate file types (only accept PDF)
- Enforce file size limits
- Store files in secure cloud storage (Vercel Blob)
- Never execute uploaded files
- Scan files for malware

```typescript
// Validate file upload
if (file.type !== 'application/pdf') {
  throw new Error('Only PDFs allowed')
}
if (file.size > 50 * 1024 * 1024) {
  throw new Error('File too large')
}
```

### 7. Cryptography

- Use SHA-256 for document hashing
- Use Keccak-256 (EVM compatible) for Merkle trees
- Never store raw private keys
- Use secure random number generation

### 8. Audit Logging

- Log all critical operations
- Include timestamp, actor, action, and result
- Store logs in immutable storage
- Review logs regularly

```typescript
// Log security event
console.log('[AUDIT]', {
  action: 'document_anchored',
  actor: issuer,
  documentHash,
  timestamp: new Date().toISOString(),
  status: 'success'
})
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Smart contracts audited
- [ ] HTTPS certificates installed
- [ ] Firewall rules configured
- [ ] Backup system tested
- [ ] Monitoring set up
- [ ] Error tracking enabled (Sentry)

### Deployment Steps

1. **Staging Deployment**
   ```bash
   # Deploy to staging environment first
   vercel deploy --prod --scope staging
   ```

2. **Smart Contract Deployment**
   ```bash
   # Deploy contract to testnet first
   npx hardhat run scripts/deploy.js --network sepolia
   
   # Verify on Etherscan
   npx hardhat verify --network sepolia CONTRACT_ADDRESS
   ```

3. **Database Migration**
   ```bash
   # Run migrations
   npx prisma migrate deploy
   
   # Backup existing data
   pg_dump $DATABASE_URL > backup.sql
   ```

4. **Production Deployment**
   ```bash
   # Final production deployment
   vercel deploy --prod
   ```

### Post-Deployment

- [ ] Verify all services are running
- [ ] Check health endpoints
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Monitor gas usage (for contract)
- [ ] Verify database backups

## Monitoring & Alerts

### Application Monitoring

Use Vercel Analytics and Sentry for monitoring:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Blockchain Monitoring

Monitor smart contract events:

```typescript
contract.on('DocumentAnchored', (hash, issuer, type, tx) => {
  console.log('[BLOCKCHAIN] Document anchored:', {
    hash,
    issuer,
    type,
    transactionHash: tx.hash
  })
})
```

### Performance Metrics

Track key metrics:

```
- Document anchoring latency (target: < 5s)
- API response time (target: < 200ms)
- Gas used per batch (target: < 0.2 ETH)
- Uptime (target: 99.9%)
```

## Incident Response

### Security Incident Response Plan

1. **Identify**: Detect unusual activity
2. **Contain**: Limit damage (suspend accounts, pause contract)
3. **Investigate**: Root cause analysis
4. **Remedy**: Fix vulnerability
5. **Recover**: Restore normal operations
6. **Review**: Update security practices

### Common Incidents

**Suspected private key compromise:**
1. Immediately rotate the key
2. Deploy a new contract with new key
3. Revoke the compromised issuer
4. Audit all transactions from compromised key

**Database breach:**
1. Take database offline
2. Restore from clean backup
3. Force password resets
4. Audit all access logs
5. Enable enhanced monitoring

## Compliance

- **GDPR**: Implement data retention policies and right-to-be-forgotten
- **SOC 2**: Maintain security logs and audit trails
- **Industry Standards**: Follow blockchain best practices
- **Legal Review**: Have lawyers review terms of service

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### Security Tests

```bash
# Check for known vulnerabilities
npm audit

# Scan code for security issues
npm run security:scan
```

### Load Testing

```bash
# Test API under load
npm run test:load
```

## Versioning Strategy

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag all releases: `git tag v1.0.0`
- Maintain changelog
- Keep breaking changes to major versions

## Rollback Plan

If issues occur after deployment:

```bash
# Revert to previous version
vercel rollback

# Or deploy specific commit
vercel --prod --target commitSha
```

## Regular Security Audits

- Monthly: Review access logs and permissions
- Quarterly: Run security scan tools
- Annually: Third-party security audit
- Continuously: Monitor for vulnerabilities

## Contact & Reporting

For security vulnerabilities:
- Email: security@certfyi.com
- Do not open public issues for security vulnerabilities
- Allow 90 days for remediation before disclosure
- We appreciate responsible disclosure

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Smart Contract Best Practices](https://consensys.net/diligence/blog/2019/12/consensys-diligence-evm-opcode-gas-costs/)
- [Next.js Security](https://nextjs.org/docs/guides/security)
- [Ethereum Security](https://ethereum.org/en/developers/docs/security/)
