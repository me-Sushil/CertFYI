import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

const EXAMPLE_HASH = '0x' + 'e3b0c442'.repeat(8)

export class PdfHashDto {
  @ApiProperty({
    description: 'Base64-encoded PDF bytes.',
    format: 'byte',
    example: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFI...',
  })
  @IsString()
  @IsNotEmpty()
  pdfContent!: string

  @ApiProperty({ description: 'Original file name, echoed back in the response.', example: 'degree.pdf' })
  @IsString()
  @IsNotEmpty()
  filename!: string
}

/** Documents the `multipart/form-data` body of `POST /api/pdf/upload`. */
export class PdfUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'PDF file to hash. Must be `application/pdf` and at most 50 MB.',
  })
  file!: Express.Multer.File
}

export class PdfUploadResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ example: 'degree.pdf' })
  filename!: string

  @ApiProperty({ description: 'Size in bytes.', example: 184320 })
  fileSize!: number

  @ApiProperty({ description: 'SHA-256 of the file bytes, 0x-prefixed.', example: EXAMPLE_HASH })
  documentHash!: string

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string

  @ApiProperty({ example: 'PDF uploaded and hashed successfully' })
  message!: string
}

export class PdfHashResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ example: 'degree.pdf' })
  filename!: string

  @ApiProperty({ description: 'SHA-256 of the decoded bytes, 0x-prefixed.', example: EXAMPLE_HASH })
  documentHash!: string

  @ApiProperty({ description: 'Size in bytes of the decoded PDF.', example: 184320 })
  fileSize!: number
}
