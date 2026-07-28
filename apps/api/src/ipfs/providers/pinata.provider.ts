import { Injectable, Logger } from '@nestjs/common'
import { Readable } from 'stream'
import type { ReadableStream as WebReadableStream } from 'stream/web'
import type {
  IpfsFetchResult,
  IpfsPinStatus,
  IpfsProvider,
  IpfsUploadResult,
} from '../ipfs-provider.interface'
import {
  DEFAULT_IPFS_GATEWAY,
  DEFAULT_PINATA_NETWORK,
  IPFS_REQUEST_TIMEOUT_MS,
  PINATA_UPLOAD_URL,
} from '../ipfs.constants'
import {
  PermanentIpfsError,
  buildGatewayUrl,
  isRetryableStatus,
  sanitizeFilename,
  withRetry,
} from '../ipfs.utils'

interface PinataUploadResponse {
  data?: {
    cid?: string
    size?: number
    id?: string
    is_duplicate?: boolean
  }
}

/**
 * Pinata implementation of the IpfsProvider port.
 *
 * Talks to the documented REST API over `fetch` rather than through an SDK.
 * The surface we need is two endpoints, and a direct client means no dependency
 * that can be renamed or deprecated underneath us - which is exactly what
 * happened to the previous provider.
 */
@Injectable()
export class PinataProvider implements IpfsProvider {
  readonly name = 'pinata'

  private readonly logger = new Logger(PinataProvider.name)
  private readonly jwt = process.env.PINATA_JWT ?? ''
  private readonly network = process.env.PINATA_NETWORK ?? DEFAULT_PINATA_NETWORK
  private readonly gateway = process.env.IPFS_GATEWAY_URL ?? DEFAULT_IPFS_GATEWAY

  isConfigured(): boolean {
    return this.jwt.length > 0
  }

  gatewayUrl(cid: string): string {
    return buildGatewayUrl(this.gateway, cid)
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
  ): Promise<IpfsUploadResult> {
    const name = sanitizeFilename(filename)
    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(buffer)], { type: contentType }), name)
    form.append('network', this.network)
    form.append('name', name)

    const result = await this.post(form, `file ${name}`)
    return { cid: result.cid, size: result.size ?? buffer.length }
  }

  async uploadJson(data: unknown, name: string): Promise<IpfsUploadResult> {
    const json = JSON.stringify(data, null, 2)
    const bytes = Buffer.from(json, 'utf8')
    const filename = sanitizeFilename(name.endsWith('.json') ? name : `${name}.json`)

    const form = new FormData()
    form.append(
      'file',
      new Blob([new Uint8Array(bytes)], { type: 'application/json' }),
      filename,
    )
    form.append('network', this.network)
    form.append('name', filename)

    const result = await this.post(form, `json ${filename}`)
    return { cid: result.cid, size: result.size ?? bytes.length }
  }

  async fetchFile(cid: string): Promise<IpfsFetchResult> {
    const url = this.gatewayUrl(cid)
    const res = await fetch(url, { signal: AbortSignal.timeout(IPFS_REQUEST_TIMEOUT_MS) })

    if (!res.ok) {
      throw new PermanentIpfsError(
        `Gateway returned ${res.status} for ${cid}`,
        res.status,
      )
    }
    if (!res.body) {
      throw new PermanentIpfsError(`Gateway returned an empty body for ${cid}`)
    }

    const contentLength = res.headers.get('content-length')
    return {
      stream: Readable.fromWeb(res.body as unknown as WebReadableStream),
      contentType: res.headers.get('content-type') ?? 'application/octet-stream',
      contentLength: contentLength ? Number(contentLength) : undefined,
    }
  }

  /**
   * A HEAD against the gateway, rather than Pinata's file-management API.
   *
   * "Can a verifier actually retrieve this?" is the question that matters, and
   * the gateway answers it directly - a file can be pinned yet unreachable.
   */
  async status(cid: string): Promise<IpfsPinStatus> {
    try {
      const res = await fetch(this.gatewayUrl(cid), {
        method: 'HEAD',
        signal: AbortSignal.timeout(IPFS_REQUEST_TIMEOUT_MS),
      })
      return { pinned: res.ok }
    } catch {
      return { pinned: false }
    }
  }

  private async post(form: FormData, label: string): Promise<{ cid: string; size?: number }> {
    if (!this.isConfigured()) {
      throw new PermanentIpfsError('PINATA_JWT is not configured')
    }

    return withRetry(
      async () => {
        const res = await fetch(PINATA_UPLOAD_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.jwt}` },
          body: form,
          signal: AbortSignal.timeout(IPFS_REQUEST_TIMEOUT_MS),
        })

        if (!res.ok) {
          const detail = await res.text().catch(() => '')
          const message = `Pinata upload failed (${res.status}) for ${label}${detail ? `: ${detail.slice(0, 300)}` : ''}`

          if (!isRetryableStatus(res.status)) {
            // 401/403 means the JWT is wrong; retrying cannot fix it.
            throw new PermanentIpfsError(message, res.status)
          }
          throw new Error(message)
        }

        const body = (await res.json()) as PinataUploadResponse
        const cid = body.data?.cid

        if (!cid) {
          throw new PermanentIpfsError(
            `Pinata accepted ${label} but returned no CID: ${JSON.stringify(body).slice(0, 300)}`,
          )
        }

        return { cid, size: body.data?.size }
      },
      {
        onRetry: (attempt, error, delayMs) =>
          this.logger.warn(
            `Pinata upload attempt ${attempt} failed for ${label}, retrying in ${delayMs}ms: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
      },
    )
  }
}
