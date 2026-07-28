import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator'

// Mirrors the original zod AccessRequestSchema:
//   name (>= MIN_NAME_LENGTH), email, organization, website (url | ''), description (<= MAX)
const MIN_NAME_LENGTH = 2
const MAX_DESCRIPTION_LENGTH = 1000

/**
 * Treats a blank string as "not provided".
 *
 * `@IsOptional()` only skips `null`/`undefined`, so a form that initialises its
 * optional inputs to '' and posts them all would fail validation on every field
 * the user left empty. Normalising to `undefined` here also means Prisma stores
 * NULL rather than '' for those columns.
 */
const BlankToUndefined = () =>
  Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))

/**
 * Body for submitting an issuer access request. The wallet address is never
 * accepted from the client - it is taken from the verified SIWE session.
 */
export class AccessRequestDto {
  @ApiPropertyOptional({
    description: 'Contact name of the applicant.',
    minLength: MIN_NAME_LENGTH,
    example: 'Ada Lovelace',
  })
  @BlankToUndefined()
  @IsOptional()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name?: string

  @ApiPropertyOptional({ format: 'email', example: 'ada@university.edu' })
  @BlankToUndefined()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: 'Example University' })
  @BlankToUndefined()
  @IsOptional()
  @IsString()
  organization?: string

  @ApiPropertyOptional({
    description: 'Organization website. Send an empty string to omit.',
    format: 'url',
    example: 'https://university.edu',
  })
  @BlankToUndefined()
  @IsOptional()
  // Names the field, matching the style class-validator generates for the other
  // properties ("email must be an email"). A bare "Invalid URL" gives the user
  // no clue which input to correct.
  @IsUrl({}, { message: 'website must be a valid URL, for example https://example.com' })
  website?: string

  @ApiPropertyOptional({
    description: 'What the organization intends to issue.',
    maxLength: MAX_DESCRIPTION_LENGTH,
    example: 'We issue degree certificates to graduating students.',
  })
  @BlankToUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  description?: string
}

export class RequestStatusResponseDto {
  @ApiProperty({
    description: 'Status of the caller’s own access request. `NONE` means never applied.',
    enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  requestStatus!: string
}

// --- Issuer dashboard types ---

export class IssuerStatsResponseDto {
  @ApiProperty({ description: 'Total documents issued by this issuer.', example: 142 })
  totalIssued!: number

  @ApiProperty({ description: 'Currently active (non-revoked) documents.', example: 138 })
  activeDocuments!: number

  @ApiProperty({ description: 'Number of revoked documents.', example: 4 })
  revokedCount!: number

  @ApiProperty({ description: 'Recent activity entries count.', example: 12 })
  recentActivityCount!: number
}

export class IssuerDocumentDto {
  @ApiProperty({ example: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' })
  docHash!: string

  @ApiPropertyOptional({ example: 'Certificate of Completion' })
  documentType?: string

  @ApiPropertyOptional({ example: 'Ada Lovelace' })
  recipientName?: string

  @ApiPropertyOptional({ example: 'ada@example.com' })
  recipientEmail?: string

  @ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE' })
  txHash!: string

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  anchoredAt!: string

  @ApiProperty({ example: null, nullable: true })
  revokedAt!: string | null

  @ApiProperty({ enum: ['active', 'revoked'], example: 'active' })
  status!: 'active' | 'revoked'
}

export class IssuerDocumentsResponseDto {
  @ApiProperty({ type: [IssuerDocumentDto] })
  documents!: IssuerDocumentDto[]

  @ApiProperty({ example: null, nullable: true })
  nextCursor!: string | null
}

export class IssuerActivityEntryDto {
  @ApiProperty({ example: 'DOCUMENT_ANCHORED' })
  action!: string

  @ApiPropertyOptional({ example: 'Document type: Certificate' })
  detail?: string

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  createdAt!: string

  @ApiPropertyOptional({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE' })
  txHash?: string
}

export class IssuerActivityResponseDto {
  @ApiProperty({ type: [IssuerActivityEntryDto] })
  entries!: IssuerActivityEntryDto[]
}
