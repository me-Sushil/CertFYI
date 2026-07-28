import type { Readable } from 'stream'

export interface IpfsUploadResult {
  /** Content identifier. Immutable - the same bytes always yield the same CID. */
  cid: string
  /** Size in bytes of what was stored. */
  size: number
}

export interface IpfsPinStatus {
  pinned: boolean
}

export interface IpfsFetchResult {
  stream: Readable
  contentType: string
  contentLength?: number
}

/**
 * The storage port. Everything outside this folder depends on IpfsService,
 * which depends on this interface - never on a concrete provider.
 *
 * SRS §12 names IPFS unavailability as a top risk and pinning to more than one
 * provider as the mitigation, so adding a second implementation must stay a
 * module-level change rather than a rewrite.
 */
export interface IpfsProvider {
  /** Human-readable provider name, used in logs and health output. */
  readonly name: string

  /**
   * Whether credentials are present. Checked at startup so a misconfigured
   * deployment warns loudly instead of failing on the first upload.
   */
  isConfigured(): boolean

  uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<IpfsUploadResult>

  uploadJson(data: unknown, name: string): Promise<IpfsUploadResult>

  /** Streams content back from the gateway. */
  fetchFile(cid: string): Promise<IpfsFetchResult>

  status(cid: string): Promise<IpfsPinStatus>

  /** Public URL for a CID on the configured gateway. */
  gatewayUrl(cid: string): string
}
