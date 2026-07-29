-- AlterTable
ALTER TABLE "anchored_documents" ADD COLUMN     "batch_id" TEXT;

-- CreateIndex
CREATE INDEX "anchored_documents_batch_id_idx" ON "anchored_documents"("batch_id");

