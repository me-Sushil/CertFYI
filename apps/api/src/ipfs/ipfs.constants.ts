/**
 * DI token for the bound IpfsProvider implementation.
 *
 * Lives in its own file so IpfsService can inject it without importing the
 * module that declares IpfsService - that cycle leaves the provider undefined
 * at scan time and Nest reports it as a circular dependency.
 */
export const IPFS_PROVIDER = 'IPFS_PROVIDER'

/** Pinata v3 upload host. Uploads go here, not to the main API host. */
export const PINATA_UPLOAD_URL = 'https://uploads.pinata.cloud/v3/files'

/** Pinata management API, used for pin-status lookups. */
export const PINATA_API_URL = 'https://api.pinata.cloud/v3'

/**
 * Shared public gateway. Fine for development; Pinata rate-limits it, so
 * production should point IPFS_GATEWAY_URL at a dedicated gateway
 * (https://<your-subdomain>.mypinata.cloud/ipfs).
 */
export const DEFAULT_IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

/**
 * Pinata stores uploads as `private` unless told otherwise, and private files
 * are not retrievable from a public gateway. Verification is a public read
 * (SRS FR-V1), so anything we pin for verification must be public.
 */
export const DEFAULT_PINATA_NETWORK = 'public'

/** Hard ceiling on a single pin attempt, so a slow provider cannot hang a request. */
export const IPFS_REQUEST_TIMEOUT_MS = 30_000

/** Total attempts (1 initial + 2 retries) before giving up on a transient failure. */
export const IPFS_MAX_ATTEMPTS = 3

/** Base delay for exponential backoff between retries. */
export const IPFS_RETRY_BASE_DELAY_MS = 500
