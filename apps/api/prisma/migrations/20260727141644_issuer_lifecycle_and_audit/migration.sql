-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IssuerStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ISSUER_APPROVED', 'ISSUER_REJECTED', 'ISSUER_SUSPENDED', 'ISSUER_REACTIVATED', 'DOCUMENT_ANCHORED', 'BATCH_ANCHORED', 'DOCUMENT_REVOKED');

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "organization" TEXT,
    "website" TEXT,
    "description" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issuers" (
    "walletAddress" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "organization" TEXT,
    "website" TEXT,
    "metadata_uri" TEXT,
    "status" "IssuerStatus" NOT NULL DEFAULT 'ACTIVE',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "register_tx_hash" TEXT NOT NULL,
    "suspended_at" TIMESTAMP(3),
    "suspend_tx_hash" TEXT,
    "document_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "issuers_pkey" PRIMARY KEY ("walletAddress")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actor_address" TEXT NOT NULL,
    "target_ref" TEXT NOT NULL,
    "tx_hash" TEXT,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anchored_documents" (
    "doc_hash" TEXT NOT NULL,
    "issuer_address" TEXT NOT NULL,
    "cid" TEXT,
    "metadata_cid" TEXT,
    "tx_hash" TEXT NOT NULL,
    "anchored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "anchored_documents_pkey" PRIMARY KEY ("doc_hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessRequest_walletAddress_key" ON "AccessRequest"("walletAddress");

-- CreateIndex
CREATE INDEX "AccessRequest_status_idx" ON "AccessRequest"("status");

-- CreateIndex
CREATE INDEX "issuers_status_idx" ON "issuers"("status");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_address_idx" ON "audit_logs"("actor_address");

-- CreateIndex
CREATE INDEX "anchored_documents_issuer_address_idx" ON "anchored_documents"("issuer_address");
