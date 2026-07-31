-- Removes document revocation status. The action to revoke a document has
-- been removed from the contract and API; these columns are no longer
-- populated or read. Drops 1 existing non-null row's historical value.
ALTER TABLE "anchored_documents" DROP COLUMN "revoked_at";
ALTER TABLE "anchored_documents" DROP COLUMN "revoke_tx_hash";
