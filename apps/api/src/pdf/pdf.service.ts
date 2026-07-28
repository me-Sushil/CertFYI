import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import crypto from 'crypto'
import { IpfsService } from '../ipfs/ipfs.service'
import { MAX_PDF_SIZE_BYTES, PDF_MAGIC_BYTES } from '../common/constants/shared.constant'

export interface PdfUploadResult {
  success: boolean
  filename: string
  fileSize: number
  documentHash: string
  cid: string | null
  gatewayUrl: string | null
  pinned: boolean
  pinError?: string
  timestamp: string
  message: string
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name)

  constructor(private readonly ipfs: IpfsService) {}

  /**
   * Validates a PDF, hashes it, and optionally pins it to IPFS.
   *
   * Order matters: the SHA-256 is what gets anchored on-chain and is computed
   * first, so a pinning outage can never prevent a document being issued.
   */
  async upload(file?: Express.Multer.File, storeOnIpfs = false): Promise<PdfUploadResult> {
    this.validate(file)
    const pdf = file as Express.Multer.File

    const documentHash = this.hashBuffer(pdf.buffer)
    const timestamp = new Date().toISOString()

    if (!storeOnIpfs) {
      return {
        success: true,
        filename: pdf.originalname,
        fileSize: pdf.size,
        documentHash,
        cid: null,
        gatewayUrl: null,
        pinned: false,
        timestamp,
        message: 'PDF hashed. IPFS storage was not requested.',
      }
    }

    const outcome = await this.ipfs.pinFile(pdf.buffer, pdf.originalname, 'application/pdf')

    if (!outcome.pinned) {
      // Degraded, not failed - the hash is what proves authenticity, so the
      // caller can still anchor and verify (NFR Availability).
      this.logger.warn(`Pin failed for ${pdf.originalname}, continuing without a CID`)
    }

    return {
      success: true,
      filename: pdf.originalname,
      fileSize: pdf.size,
      documentHash,
      cid: outcome.cid,
      gatewayUrl: outcome.gatewayUrl,
      pinned: outcome.pinned,
      ...(outcome.pinned ? {} : { pinError: outcome.error }),
      timestamp,
      message: outcome.pinned
        ? 'PDF hashed and pinned to IPFS.'
        : 'PDF hashed. IPFS storage is unavailable - the document can still be anchored and verified.',
    }
  }

  /** Hashes a base64-encoded PDF the caller already holds. */
  hash(pdfContent: string, filename: string) {
    const buffer = Buffer.from(pdfContent, 'base64')
    return {
      success: true,
      filename,
      documentHash: this.hashBuffer(buffer),
      fileSize: buffer.length,
    }
  }

  /**
   * Pins a metadata sidecar.
   *
   * Callers must pass a payload that carries no plaintext recipient identity -
   * a CID is a permanent public handle, and SRS §5 requires personal data stay
   * encrypted off-chain. Use an opaque `recipientRef` instead (SRS §8.1).
   */
  async pinMetadata(metadata: Record<string, unknown>, name: string) {
    return this.ipfs.pinJson(metadata, name)
  }

  private validate(file?: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided')
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF')
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new BadRequestException('File size exceeds 50MB limit')
    }
    // The declared MIME type is attacker-controlled; the bytes are not.
    if (!file.buffer.subarray(0, PDF_MAGIC_BYTES.length).equals(PDF_MAGIC_BYTES)) {
      throw new BadRequestException('File content is not a valid PDF')
    }
  }

  private hashBuffer(data: Buffer): string {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex')
  }
}
