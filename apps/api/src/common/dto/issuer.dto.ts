import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator'

const HASH_REGEX = /^0x[a-fA-F0-9]{64}$/
const HASH_PATTERN = '^0x[a-fA-F0-9]{64}$'
const TX_REGEX = /^0x[a-fA-F0-9]{64}$/
const TX_PATTERN = '^0x[a-fA-F0-9]{64}$'

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

  @ApiProperty({ example: null, nullable: true, description: 'Set when issued as part of a bulk batch anchor.' })
  batchId!: string | null
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

  @ApiPropertyOptional({
    description: 'Document hash the entry relates to, when applicable (e.g. a failed IPFS pin).',
    example: '0x' + 'e3b0c442'.repeat(8),
  })
  docHash?: string
}

export class IssuerActivityResponseDto {
  @ApiProperty({ type: [IssuerActivityEntryDto] })
  entries!: IssuerActivityEntryDto[]

  @ApiProperty({ example: null, nullable: true })
  nextCursor!: string | null
}

export class IssuerDocumentsQueryDto {
  @ApiPropertyOptional({ description: 'Matches recipient name/email, document type, or hash.' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: 'Pagination cursor (docHash).' })
  @IsOptional()
  @IsString()
  cursor?: string
}

export class IssuerActivityQueryDto {
  @ApiPropertyOptional({ example: 'ALL' })
  @IsOptional()
  @IsString()
  action?: string

  @ApiPropertyOptional({ description: 'Pagination cursor (entry id).' })
  @IsOptional()
  @IsString()
  cursor?: string
}

export class RetryPinDto {
  @ApiProperty({
    description: 'Hash of the previously anchored document whose metadata sidecar failed to pin.',
    pattern: HASH_PATTERN,
    example: '0x' + 'e3b0c442'.repeat(8),
  })
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  docHash!: string
}

export class RetryPinResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ nullable: true, type: String, example: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' })
  metadataCid!: string | null

  @ApiProperty({ example: 'Metadata sidecar pinned successfully' })
  message!: string
}

/**
 * Records an anchoring attempt that never made it into `AnchoredDocument` -
 * the wallet rejected it, or the chain reverted it. Nothing was anchored, so
 * there is no document row to write; this is audit trail only, so a failed
 * attempt is still visible on the issuer's Activity page instead of vanishing
 * silently in the browser.
 */
export class LogFailedAnchorDto {
  @ApiProperty({
    description: 'Hash of the document that failed to anchor.',
    pattern: HASH_PATTERN,
    example: '0x' + 'e3b0c442'.repeat(8),
  })
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  docHash!: string

  @ApiPropertyOptional({
    description: 'Transaction hash, when the failure happened after broadcast (e.g. a revert).',
    pattern: TX_PATTERN,
    example: '0x' + 'ab'.repeat(32),
  })
  @IsOptional()
  @IsString()
  @Matches(TX_REGEX, { message: 'Invalid transaction hash format' })
  txHash?: string

  @ApiProperty({
    description: 'Human-readable failure reason, shown in the activity feed.',
    maxLength: 500,
    example: 'Transaction reverted on-chain',
  })
  @IsString()
  @MaxLength(500)
  reason!: string
}
