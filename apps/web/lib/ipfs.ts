/**
 * Client-side IPFS helpers.
 *
 * The gateway is read from configuration rather than hardcoded, so switching
 * pinning provider does not silently leave every CID link pointing at the old
 * provider's gateway - and so a second gateway can be used for the redundancy
 * SRS §12 calls for.
 */

const DEFAULT_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

export const IPFS_GATEWAY_URL =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL?.replace(/\/+$/, '') || DEFAULT_GATEWAY

/** CIDv0 is base58btc starting `Qm`; CIDv1 is lowercase base32 starting `b`. */
const CID_V0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
const CID_V1 = /^b[a-z2-7]{58,}$/

export function isValidCid(cid: string | null | undefined): cid is string {
  if (!cid) return false
  return CID_V0.test(cid) || CID_V1.test(cid)
}

/**
 * Builds a public URL for a CID, tolerating either gateway form:
 *   path      - https://gateway.pinata.cloud/ipfs
 *   subdomain - https://example.mypinata.cloud
 */
export function ipfsGatewayUrl(cid: string): string {
  const base = IPFS_GATEWAY_URL.replace(/\/+$/, '')
  const withPath = base.endsWith('/ipfs') ? base : `${base}/ipfs`
  return `${withPath}/${cid}`
}

/** Middle-truncates a CID for display: `bafybeigd…y55fbzdi`. */
export function truncateCid(cid: string, lead = 10, tail = 6): string {
  if (cid.length <= lead + tail + 1) return cid
  return `${cid.slice(0, lead)}…${cid.slice(-tail)}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export type PinState = 'pinned' | 'not-stored' | 'failed'

/**
 * Maps an upload response onto a display state.
 *
 * `failed` is deliberately distinct from `not-stored`: one is a problem worth
 * surfacing, the other is the user's own choice.
 */
export function resolvePinState(input: {
  pinned: boolean
  cid: string | null
  pinError?: string
}): PinState {
  if (input.pinned && isValidCid(input.cid)) return 'pinned'
  return input.pinError ? 'failed' : 'not-stored'
}
