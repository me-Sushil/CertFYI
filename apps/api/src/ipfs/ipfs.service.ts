import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import type { IpfsFetchResult, IpfsPinStatus, IpfsProvider } from './ipfs-provider.interface'
import { IPFS_PROVIDER } from './ipfs.constants'
import { formatBytes, isValidCid } from './ipfs.utils'

/**
 * Result of a pin attempt.
 *
 * Modelled as a value rather than a thrown error because a failed pin is a
 * degraded outcome, not a failed request: the caller still has a valid document
 * hash and must be able to carry on.
 */
export type PinOutcome =
  | { pinned: true; cid: string; size: number; gatewayUrl: string; error?: undefined }
  | { pinned: false; cid: null; size: null; gatewayUrl: null; error: string }

@Injectable()
export class IpfsService implements OnModuleInit {
  private readonly logger = new Logger(IpfsService.name)

  constructor(@Inject(IPFS_PROVIDER) private readonly provider: IpfsProvider) {}

  onModuleInit() {
    if (this.provider.isConfigured()) {
      this.logger.log(`IPFS provider ready: ${this.provider.name}`)
    } else {
      // A warning, not a thrown error: the rest of the API must still boot and
      // serve verification, which never touches IPFS.
      this.logger.warn(
        `IPFS provider "${this.provider.name}" is not configured - pinning is disabled. ` +
          'Set PINATA_JWT to enable it.',
      )
    }
  }

  isConfigured(): boolean {
    return this.provider.isConfigured()
  }

  get providerName(): string {
    return this.provider.name
  }

  gatewayUrl(cid: string): string {
    return this.provider.gatewayUrl(cid)
  }

  /**
   * Pins a file, degrading rather than throwing.
   *
   * NFR Availability: a CertFyi outage "shall never make a genuine document
   * unverifiable in principle". The chain anchor is the trust root and IPFS is
   * convenience, so a pinning failure must never block the caller.
   */
  async pinFile(buffer: Buffer, filename: string, contentType: string): Promise<PinOutcome> {
    if (!this.provider.isConfigured()) {
      return this.degraded('IPFS is not configured')
    }

    try {
      const { cid, size } = await this.provider.uploadFile(buffer, filename, contentType)
      this.logger.log(`Pinned ${filename} (${formatBytes(size)}) -> ${cid}`)
      return { pinned: true, cid, size, gatewayUrl: this.provider.gatewayUrl(cid) }
    } catch (error) {
      return this.degraded(this.describe(error), `pin file ${filename}`)
    }
  }

  /** Pins a JSON document (e.g. a metadata sidecar). Degrades like pinFile. */
  async pinJson(data: unknown, name: string): Promise<PinOutcome> {
    if (!this.provider.isConfigured()) {
      return this.degraded('IPFS is not configured')
    }

    try {
      const { cid, size } = await this.provider.uploadJson(data, name)
      this.logger.log(`Pinned ${name} metadata -> ${cid}`)
      return { pinned: true, cid, size, gatewayUrl: this.provider.gatewayUrl(cid) }
    } catch (error) {
      return this.degraded(this.describe(error), `pin json ${name}`)
    }
  }

  /** Streams content back. Throws - the caller decides how to surface a miss. */
  async fetchFile(cid: string): Promise<IpfsFetchResult> {
    this.assertCid(cid)
    return this.provider.fetchFile(cid)
  }

  async status(cid: string): Promise<IpfsPinStatus> {
    if (!isValidCid(cid)) return { pinned: false }
    return this.provider.status(cid)
  }

  private assertCid(cid: string): void {
    if (!isValidCid(cid)) {
      throw new Error(`Malformed CID: ${cid}`)
    }
  }

  private degraded(reason: string, context?: string): PinOutcome {
    if (context) {
      this.logger.error(`IPFS degraded - could not ${context}: ${reason}`)
    }
    return { pinned: false, cid: null, size: null, gatewayUrl: null, error: reason }
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
  }
}
