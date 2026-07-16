# CertFyi Database Schema

This document describes the database schema for the CertFyi platform.

## Overview

The database stores:
- User and issuer accounts
- Document metadata and anchor records
- Batch anchor history
- Audit logs
- Revocation records

## Tables

### Users
Stores user accounts for issuers and admins.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('issuer', 'admin', 'user') DEFAULT 'user',
  organization_id UUID,
  wallet_address VARCHAR(255),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Organizations
Stores issuer organizations.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  wallet_address VARCHAR(255) UNIQUE,
  description TEXT,
  logo_url VARCHAR(255),
  website_url VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Documents
Stores document metadata and anchor records.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_hash VARCHAR(66) UNIQUE NOT NULL, -- 0x + 64 hex chars
  issuer_id UUID NOT NULL REFERENCES organizations(id),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  document_type VARCHAR(100),
  file_size INTEGER,
  file_hash VARCHAR(66), -- Hash of the PDF file
  tx_hash VARCHAR(66), -- Blockchain transaction hash
  block_number INTEGER,
  merkle_root VARCHAR(66), -- For batch anchoring
  batch_id UUID REFERENCES batches(id),
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP,
  revoke_reason TEXT,
  anchor_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_hash ON documents(document_hash);
CREATE INDEX idx_issuer_id ON documents(issuer_id);
CREATE INDEX idx_recipient_email ON documents(recipient_email);
CREATE INDEX idx_merkle_root ON documents(merkle_root);
```

### Batches
Stores Merkle batch anchor records.

```sql
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(255) UNIQUE NOT NULL,
  issuer_id UUID NOT NULL REFERENCES organizations(id),
  merkle_root VARCHAR(66) NOT NULL,
  document_count INTEGER NOT NULL,
  tx_hash VARCHAR(66), -- Blockchain transaction
  block_number INTEGER,
  status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
  gas_used DECIMAL(20, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

CREATE INDEX idx_batch_id ON batches(batch_id);
CREATE INDEX idx_issuer_id ON batches(issuer_id);
CREATE INDEX idx_merkle_root ON batches(merkle_root);
```

### Audit Log
Stores platform activity and changes.

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES users(id),
  actor_type ENUM('user', 'system', 'contract'),
  target_type VARCHAR(50), -- 'document', 'batch', 'issuer', 'user'
  target_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status ENUM('success', 'failed') DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_action ON audit_log(action);
CREATE INDEX idx_actor_id ON audit_log(actor_id);
CREATE INDEX idx_created_at ON audit_log(created_at);
```

### Revocations
Tracks document revocations.

```sql
CREATE TABLE revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  document_hash VARCHAR(66) NOT NULL,
  revoked_by_id UUID REFERENCES users(id),
  reason VARCHAR(255),
  tx_hash VARCHAR(66), -- Revocation transaction
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_hash ON revocations(document_hash);
CREATE INDEX idx_document_id ON revocations(document_id);
```

## Relationships

```
Organizations (issuers)
├── Users (admin contacts)
├── Documents (issued by)
└── Batches (anchor records)

Documents
├── Organization (issuer)
├── Batch (if part of batch)
└── Revocation (if revoked)

Audit Log
├── User (actor)
└── Various targets (documents, batches, users, organizations)
```

## Setup

### PostgreSQL

```bash
psql -U postgres -d certfyi -f setup.sql
```

### Prisma (recommended)

The schema can also be defined using Prisma:

```bash
npm install @prisma/client prisma
npx prisma init

# Edit .env to add DATABASE_URL
# Edit prisma/schema.prisma with the schema above

npx prisma migrate dev --name init
```

### Supabase

If using Supabase:

1. Create a new project at supabase.com
2. Go to the SQL Editor
3. Run the SQL scripts above
4. Update environment variables:
   ```
   DATABASE_URL=postgresql://user:password@db.supabase.co/postgres
   ```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/certfyi
DATABASE_POOL_SIZE=10

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=certfyi-documents
AWS_REGION=us-east-1

# Email (for notifications)
SENDGRID_API_KEY=your_key
SENDGRID_FROM_EMAIL=noreply@certfyi.com
```

## Migrations

### Adding a new column to documents table

```sql
ALTER TABLE documents 
ADD COLUMN metadata JSONB DEFAULT '{}';
```

### Creating a backup

```bash
pg_dump -U postgres -d certfyi > backup.sql
```

### Restoring from backup

```bash
psql -U postgres -d certfyi < backup.sql
```

## Performance Optimization

1. **Indexing**: All frequently queried columns are indexed
2. **Partitioning**: Consider partitioning the `audit_log` by date for very large deployments
3. **Connection Pooling**: Use PgBouncer or similar for connection management
4. **Caching**: Cache organization and user data with Redis

## Security

- All sensitive data (passwords, private keys) are hashed and encrypted
- Row-level security (RLS) policies should be implemented in production
- Database credentials are stored in environment variables
- Regular backups are automated
- SQL injection is prevented using parameterized queries
