'use client'

import { useState } from 'react'
import type { Hex } from 'viem'
import { Link2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { OnChainButton } from '@/components/admin/on-chain-button'
import { useUploadIssuerMetadata, useConfirmIssuerMetadata } from '@/queries/admin'
import { ipfsGatewayUrl } from '@/lib/ipfs'
import type { IssuerRow } from '@/lib/api-types'

// Fixed gas limit for setIssuerMetadata - an event-only write (no storage),
// comfortably under 200k gas. See the same fix on anchor/revoke: wallet
// auto-estimation has been observed returning values that exceed the RPC
// provider's hard per-tx cap.
const METADATA_GAS_LIMIT = BigInt(300_000)

/**
 * Links an approved issuer's off-chain profile (SRS §7.2).
 *
 * Two steps, same choreography as anchoring: pin the profile JSON to IPFS
 * first (cheap, reversible), then have the admin sign `setIssuerMetadata`
 * in their own wallet to link it on-chain (the step that costs gas and
 * can't be silently retried without the admin's input).
 */
export function IssuerMetadataPanel({ issuer }: { issuer: IssuerRow }) {
  const [pendingUri, setPendingUri] = useState<string | null>(null)
  const uploadMetadata = useUploadIssuerMetadata()
  const confirmMetadata = useConfirmIssuerMetadata()

  const handleUpload = async () => {
    try {
      const result = await uploadMetadata.mutateAsync(issuer.walletAddress)
      setPendingUri(result.metadataUri)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pin profile metadata')
    }
  }

  if (pendingUri) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Profile pinned. Confirm on-chain:</span>
        <OnChainButton
          functionName="setIssuerMetadata"
          args={[issuer.walletAddress as Hex, pendingUri]}
          gas={METADATA_GAS_LIMIT}
          onConfirmed={async (txHash) => {
            await confirmMetadata.mutateAsync({ address: issuer.walletAddress, txHash })
            setPendingUri(null)
          }}
          successMessage="Issuer metadata set"
          errorMessage="Failed to confirm metadata"
          variant="outline"
        >
          Confirm Metadata On-Chain
        </OnChainButton>
        <Button size="sm" variant="ghost" onClick={() => setPendingUri(null)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {issuer.metadataUri && (
        <a
          href={ipfsGatewayUrl(issuer.metadataUri.replace(/^ipfs:\/\//, ''))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:opacity-80"
        >
          <Link2 className="h-3.5 w-3.5" aria-hidden />
          View Profile
        </a>
      )}
      <Button size="sm" variant="outline" onClick={handleUpload} disabled={uploadMetadata.isPending}>
        {uploadMetadata.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />}
        {issuer.metadataUri ? 'Update Metadata' : 'Set Metadata'}
      </Button>
    </div>
  )
}
