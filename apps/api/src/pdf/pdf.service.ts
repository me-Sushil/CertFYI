import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import crypto from 'crypto'
import { MAX_PDF_SIZE } from '../common/constants/shared.constant'
import { IpfsService } from '../ipfs/ipfs.service'

const PDF_MAGIC_BYTES = Buffer.from('%PDF-')

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name)

  constructor(private readonly ipfs: IpfsService) {}

  async upload(file?: Express.Multer.File, storeOnIpfs = false) {
    if (!file) {
      throw new BadRequestException('No file provided')
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF')
    }
    if (file.size > MAX_PDF_SIZE) {
      throw new BadRequestException('File size exceeds 50MB limit')
    }

    // Magic-byte check - mimetype is client-supplied and trivially spoofed (SRS §10.4)
    if (!file.buffer || file.buffer.length < 5 || !file.buffer.slice(0, 5).equals(PDF_MAGIC_BYTES)) {
      throw new BadRequestException('File does not appear to be a valid PDF')
    }

    const documentHash = '0x' + crypto.createHash('sha256').update(file.buffer).digest('hex')

    let cid: string | null = null
    let metadataCid: string | null = null

    if (storeOnIpfs) {
      try {
        const uploadResult = await this.ipfs.uploadFile(file.buffer, file.originalname, 'application/pdf')
        cid = uploadResult.cid
      } catch (error) {
        // Pin failure must never block anchoring (SRS Availability NFR)
        this.logger.error(`IPFS upload failed for ${documentHash}, continuing with null CID`, error)
      }
    }

    this.logger.log('[API] PDF uploaded:', {
      filename: file.originalname,
      size: file.size,
      documentHash,
      cid,
    })

    const response: Record<string, unknown> = {
      success: true,
      filename: file.originalname,
      fileSize: file.size,
      documentHash,
      timestamp: new Date().toISOString(),
      message: 'PDF uploaded and hashed successfully',
    }

    if (cid) {
      response.cid = cid
      response.gatewayUrl = `${process.env.IPFS_GATEWAY_URL || 'https://w3s.link/ipfs'}/${cid}`
    }

    return response
  }

  hash(pdfContent: string, filename: string) {
    const buffer = Buffer.from(pdfContent, 'base64')
    const documentHash = '0x' + crypto.createHash('sha256').update(buffer).digest('hex')
    return {
      success: true,
      filename,
      documentHash,
      fileSize: buffer.length,
    }
  }
}
