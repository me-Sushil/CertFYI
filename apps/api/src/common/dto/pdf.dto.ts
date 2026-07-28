import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

const EXAMPLE_HASH = '0x' + 'e3b0c442'.repeat(8)
const EXAMPLE_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'

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

  @ApiPropertyOptional({
    type: 'string',
    enum: ['true', 'false'],
    default: 'false',
    description:
      'Set to `true` to also pin the file to IPFS. Defaults to `false`: a CID is a permanent, ' +
      'public handle, so anyone holding it can retrieve the document forever and it cannot be ' +
      'withdrawn. Anchoring and verification work without it - the SHA-256 hash is what proves ' +
      'authenticity.',
  })
  storeOnIpfs?: string
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

  @ApiProperty({
    nullable: true,
    description: 'IPFS content identifier. Null when storage was not requested or the pin failed.',
    example: EXAMPLE_CID,
  })
  cid!: string | null

  @ApiProperty({
    nullable: true,
    description: 'Public gateway URL for `cid`. Null when there is no CID.',
    example: `https://gateway.pinata.cloud/ipfs/${EXAMPLE_CID}`,
  })
  gatewayUrl!: string | null

  @ApiProperty({
    description: 'Whether the file was successfully pinned.',
    example: true,
  })
  pinned!: boolean

  @ApiPropertyOptional({
    description:
      'Why pinning failed, when it did. The document is still valid and anchorable - only the ' +
      'optional stored copy is missing.',
    example: 'PINATA_JWT is not configured',
  })
  pinError?: string

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string

  @ApiProperty({ example: 'PDF hashed and pinned to IPFS.' })
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
