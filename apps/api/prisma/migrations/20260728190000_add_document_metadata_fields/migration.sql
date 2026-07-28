-- Add document metadata fields to AnchoredDocument
ALTER TABLE "anchored_documents" ADD COLUMN IF NOT EXISTS "issuer_name" TEXT;
ALTER TABLE "anchored_documents" ADD COLUMN IF NOT EXISTS "document_type" TEXT;
ALTER TABLE "anchored_documents" ADD COLUMN IF NOT EXISTS "recipient_name" TEXT;
ALTER TABLE "anchored_documents" ADD COLUMN IF NOT EXISTS "recipient_email" TEXT;
