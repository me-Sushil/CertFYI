-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'ISSUER_METADATA_SET';
ALTER TYPE "AuditAction" ADD VALUE 'IPFS_PIN_FAILED';
ALTER TYPE "AuditAction" ADD VALUE 'IPFS_PIN_RETRIED';

-- CreateIndex
CREATE UNIQUE INDEX "issuers_register_tx_hash_key" ON "issuers"("register_tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "issuers_suspend_tx_hash_key" ON "issuers"("suspend_tx_hash");

