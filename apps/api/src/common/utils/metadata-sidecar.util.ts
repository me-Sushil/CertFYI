import crypto from 'crypto'

export interface MetadataSidecarInput {
  documentHash: string
  issuerAddress: string
  issuerName: string | null
  documentType: string | null
  issuedAt: string
  chainId: number
  txHash: string
  cid: string | null
  recipientEmail?: string | null
  recipientName?: string | null
}

/**
 * The public, non-identifying metadata sidecar (SRS §8.2, adjusted per §5/§12).
 *
 * Shared by the anchor path and the pin-retry path so both ever produce the
 * exact same bytes for a given document - a drift here would mean a retried
 * pin has a different `recipientRef` than the original attempt.
 */
export function buildMetadataSidecar(input: MetadataSidecarInput) {
  return {
    docHash: input.documentHash,
    issuerAddress: input.issuerAddress,
    issuerName: input.issuerName,
    documentType: input.documentType,
    issuedAt: input.issuedAt,
    chain: input.chainId,
    txHash: input.txHash,
    cid: input.cid,
    recipientRef: computeRecipientRef(input.recipientEmail, input.recipientName),
  }
}

export function computeRecipientRef(
  recipientEmail?: string | null,
  recipientName?: string | null,
): string | null {
  if (!recipientEmail && !recipientName) return null
  return (
    '0x' +
    crypto
      .createHash('sha256')
      .update(`${recipientEmail ?? ''}:${recipientName ?? ''}`)
      .digest('hex')
  )
}
