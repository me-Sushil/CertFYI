import { IPFS_MAX_ATTEMPTS, IPFS_RETRY_BASE_DELAY_MS } from './ipfs.constants'

/**
 * CIDv0 is base58btc and always starts `Qm` (46 chars). CIDv1 is lowercase
 * base32 starting `b`. Deliberately a shape check, not a full multihash decode -
 * enough to reject obvious junk before spending a network round trip.
 */
const CID_V0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
const CID_V1 = /^b[a-z2-7]{58,}$/

export function isValidCid(cid: string): boolean {
  if (!cid) return false
  return CID_V0.test(cid) || CID_V1.test(cid)
}

/**
 * Joins a gateway base and a CID without doubling or dropping slashes.
 *
 * Accepts either gateway form:
 *   path      - https://gateway.pinata.cloud/ipfs  -> https://gateway.pinata.cloud/ipfs/<cid>
 *   subdomain - https://example.mypinata.cloud     -> https://example.mypinata.cloud/ipfs/<cid>
 */
export function buildGatewayUrl(gatewayBase: string, cid: string): string {
  const base = gatewayBase.replace(/\/+$/, '')
  const withPath = base.endsWith('/ipfs') ? base : `${base}/ipfs`
  return `${withPath}/${cid}`
}

/** Trims a filename to something safe to send as multipart metadata. */
export function sanitizeFilename(filename: string, fallback = 'file'): string {
  const cleaned = filename
    .replace(/[/\\]/g, '_')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim()
  return cleaned.length > 0 ? cleaned.slice(0, 255) : fallback
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Thrown for a provider response we should not retry - bad credentials, a
 * rejected payload. Retrying these just burns the request budget.
 */
export class PermanentIpfsError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'PermanentIpfsError'
  }
}

/** 4xx other than 408/429 is our fault, not a blip - do not retry those. */
export function isRetryableStatus(status: number): boolean {
  if (status === 408 || status === 429) return true
  return status >= 500
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface RetryOptions {
  attempts?: number
  baseDelayMs?: number
  /** Called before each retry, for logging. */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void
}

/**
 * Runs `fn` with bounded exponential backoff and jitter.
 *
 * Jitter matters because a pinning outage makes every in-flight request fail at
 * once; without it they would all retry in lockstep and hammer the provider as
 * it recovers.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = options.attempts ?? IPFS_MAX_ATTEMPTS
  const baseDelayMs = options.baseDelayMs ?? IPFS_RETRY_BASE_DELAY_MS

  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (error instanceof PermanentIpfsError || attempt === attempts) {
        throw error
      }

      const backoff = baseDelayMs * 2 ** (attempt - 1)
      const delayMs = backoff + Math.floor(Math.random() * baseDelayMs)
      options.onRetry?.(attempt, error, delayMs)
      await sleep(delayMs)
    }
  }

  throw lastError
}
