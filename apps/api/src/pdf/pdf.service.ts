import { BadRequestException, Injectable } from '@nestjs/common'
import crypto from 'crypto'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

@Injectable()
export class PdfService {
  /**
   * Validate and hash an uploaded PDF.
   * In a real implementation the file would be stored (e.g. Vercel Blob) and a
   * DB record created; here we only compute and return the SHA256 hash.
   */
  upload(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided')
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF')
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds 50MB limit')
    }

    const documentHash = '0x' + crypto.createHash('sha256').update(file.buffer).digest('hex')

    console.log('[API] PDF uploaded:', {
      filename: file.originalname,
      size: file.size,
      documentHash,
    })

    return {
      success: true,
      filename: file.originalname,
      fileSize: file.size,
      documentHash,
      timestamp: new Date().toISOString(),
      message: 'PDF uploaded and hashed successfully',
    }
  }

  /** Calculate the hash of a base64-encoded PDF already in the system. */
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
