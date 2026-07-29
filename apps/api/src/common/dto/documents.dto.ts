import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { DOCUMENT_TYPES } from '../constants/shared.constant'

const HASH_REGEX = /^0x[a-fA-F0-9]{64}$/
const HASH_PATTERN = '^0x[a-fA-F0-9]{64}$'
const TX_REGEX = /^0x[a-fA-F0-9]{64}$/
const TX_PATTERN = '^0x[a-fA-F0-9]{64}$'
const CID_REGEX = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58,})$/

const EXAMPLE_HASH = '0x' + 'e3b0c442'.repeat(8)
const EXAMPLE_TX = '0x' + 'ab'.repeat(32)
const EXAMPLE_WALLET = '0x1234567890abcdef1234567890abcdef12345678'
const EXAMPLE_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'

export class AnchorDto {
  @ApiProperty({
    description: 'SHA-256 hash of the document, 0x-prefixed.',
    pattern: HASH_PATTERN,
    example: EXAMPLE_HASH,
  })
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  documentHash!: string

  @ApiProperty({
    description:
      'Hash of the confirmed `anchorDocument` transaction, signed by the issuer’s own ' +
      'wallet. The backend verifies this on-chain before persisting anything - identity comes ' +
      'from the session, never from this field.',
    pattern: TX_PATTERN,
    example: EXAMPLE_TX,
  })
  @IsString()
  @Matches(TX_REGEX, { message: 'Invalid transaction hash format' })
  txHash!: string

  @ApiProperty({ enum: DOCUMENT_TYPES, example: 'Certificate' })
  @IsString()
  @IsIn(DOCUMENT_TYPES, { message: `documentType must be one of: ${DOCUMENT_TYPES.join(', ')}` })
  documentType!: string

  @ApiPropertyOptional({ format: 'email', example: 'recipient@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'recipientEmail must be a valid email address' })
  recipientEmail?: string

  @ApiPropertyOptional({ example: 'Ada Lovelace' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientName?: string

  @ApiPropertyOptional({
    description: 'IPFS CID of the PDF itself, when the issuer chose to store a copy.',
    example: EXAMPLE_CID,
  })
  @IsOptional()
  @IsString()
  @Matches(CID_REGEX, { message: 'Invalid CID format' })
  cid?: string
}

export class BatchDocumentDto {
  @ApiProperty({ pattern: HASH_PATTERN, example: EXAMPLE_HASH })
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  documentHash!: string

  @ApiPropertyOptional({ format: 'email', example: 'recipient@example.com' })
  @IsOptional()
  @IsString()
  recipientEmail?: string

  @ApiPropertyOptional({ example: 'Ada Lovelace' })
  @IsOptional()
  @IsString()
  recipientName?: string
}

export class BatchAnchorDto {
  @ApiProperty({
    type: [BatchDocumentDto],
    description: 'Documents to anchor together under one Merkle root. Must be non-empty.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BatchDocumentDto)
  documents!: BatchDocumentDto[]

  @ApiProperty({ example: EXAMPLE_WALLET })
  @IsString()
  @IsNotEmpty()
  issuerAddress!: string

  @ApiPropertyOptional({ example: 'Example University' })
  @IsOptional()
  @IsString()
  issuerName?: string

  @ApiProperty({
    description: 'Caller-supplied identifier used to look the batch up later.',
    example: 'spring-2026-graduates',
  })
  @IsString()
  @IsNotEmpty()
  batchId!: string
}

export class VerifyDocumentDto {
  @ApiProperty({
    description: 'Hash to verify.',
    pattern: HASH_PATTERN,
    example: EXAMPLE_HASH,
  })
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  documentHash!: string

  @ApiPropertyOptional({
    description:
      'Optional base64 PDF. When supplied, its hash must match `documentHash` or verification fails.',
    format: 'byte',
  })
  @IsOptional()
  @IsString()
  pdfContent?: string
}

// --- Responses ---

export class AnchorResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ description: 'Anchoring transaction hash.', example: EXAMPLE_TX })
  txHash!: string

  @ApiProperty({ example: EXAMPLE_HASH })
  documentHash!: string

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'IPFS CID of the PDF, when a copy was stored.',
    example: null,
  })
  cid!: string | null

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'IPFS CID of the public, non-identifying metadata sidecar (SRS §8.2).',
    example: EXAMPLE_CID,
  })
  metadataCid!: string | null

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string

  @ApiProperty({ example: 'confirmed' })
  status!: string

  @ApiProperty({ example: 'Document successfully anchored on the blockchain' })
  message!: string
}

export class AnchorRecordDto {
  @ApiProperty({ example: EXAMPLE_HASH })
  documentHash!: string

  @ApiProperty({ example: 'Certificate' })
  documentType!: string

  @ApiPropertyOptional({ example: 'recipient@example.com' })
  recipientEmail?: string

  @ApiPropertyOptional({ example: 'Ada Lovelace' })
  recipientName?: string

  @ApiProperty({ example: EXAMPLE_WALLET })
  issuerAddress!: string

  @ApiPropertyOptional({ example: 'Example University' })
  issuerName?: string

  @ApiProperty({ example: EXAMPLE_TX })
  txHash!: string

  @ApiProperty({ nullable: true, type: String, example: null })
  cid!: string | null

  @ApiProperty({ nullable: true, type: String, example: EXAMPLE_CID })
  metadataCid!: string | null

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string

  @ApiProperty({ example: 'confirmed' })
  status!: string

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Set only when the document was anchored as part of a batch.',
    example: null,
  })
  merkleRoot!: string | null

  @ApiProperty({ nullable: true, type: String, example: null })
  batchId!: string | null
}

export class AnchorLookupResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ type: AnchorRecordDto })
  document!: AnchorRecordDto
}

export class BatchAnchorResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ example: 'spring-2026-graduates' })
  batchId!: string

  @ApiProperty({ description: 'Merkle root committed on-chain.', example: EXAMPLE_HASH })
  merkleRoot!: string

  @ApiProperty({ example: EXAMPLE_TX })
  txHash!: string

  @ApiProperty({ example: 42 })
  documentCount!: number

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string

  @ApiProperty({ example: 'confirmed' })
  status!: string

  @ApiProperty({ example: 'Successfully anchored 42 documents in a single transaction' })
  message!: string
}

export class BatchRecordDto {
  @ApiProperty({ example: 'spring-2026-graduates' })
  batchId!: string

  @ApiProperty({ example: EXAMPLE_HASH })
  merkleRoot!: string

  @ApiProperty({ example: EXAMPLE_WALLET })
  issuerAddress!: string

  @ApiPropertyOptional({ example: 'Example University' })
  issuerName?: string

  @ApiProperty({ example: 42 })
  documentCount!: number

  @ApiProperty({ type: [BatchDocumentDto] })
  documents!: BatchDocumentDto[]

  @ApiProperty({ example: EXAMPLE_TX })
  txHash!: string

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string

  @ApiProperty({ example: 'confirmed' })
  status!: string

  @ApiProperty({ description: 'Estimated gas cost in native currency.', example: '0.15' })
  gasEstimate!: string
}

export class BatchLookupResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ type: BatchRecordDto })
  batch!: BatchRecordDto
}

export class OnchainDataDto {
  @ApiProperty({ example: EXAMPLE_TX })
  transactionHash!: string

  @ApiProperty({ example: 19845321 })
  blockNumber!: number

  @ApiProperty({ example: 'Ethereum Mainnet' })
  network!: string
}

export class VerifyDocumentResponseDto {
  @ApiProperty({
    description: 'False only when the supplied PDF does not hash to `documentHash`.',
    example: true,
  })
  success!: boolean

  @ApiProperty({ description: 'Whether the document is anchored and not revoked.', example: true })
  isValid!: boolean

  @ApiPropertyOptional({ example: EXAMPLE_HASH })
  documentHash?: string

  @ApiPropertyOptional({ description: 'Issuing organization.', example: 'Stanford University' })
  issuer?: string

  @ApiPropertyOptional({ example: 'Certificate' })
  documentType?: string

  @ApiPropertyOptional({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  issuedDate?: string

  @ApiPropertyOptional({ enum: ['active', 'revoked', 'not_found'], example: 'active' })
  status?: string

  @ApiProperty({ example: 'Document verified successfully' })
  message!: string

  @ApiPropertyOptional({ type: OnchainDataDto, description: 'Present for valid documents.' })
  onchainData?: OnchainDataDto

  @ApiPropertyOptional({
    nullable: true,
    description: 'IPFS CID of the PDF, when the issuer chose to store a copy.',
  })
  cid?: string | null

  @ApiPropertyOptional({ nullable: true, description: 'Public gateway URL for `cid`.' })
  gatewayUrl?: string | null

  @ApiPropertyOptional({ description: 'Reason the document is not valid.' })
  error?: string
}

export class QuickVerifyResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ example: EXAMPLE_HASH })
  hash!: string

  @ApiProperty({ example: true })
  isValid!: boolean

  @ApiProperty({ enum: ['active', 'revoked'], example: 'active' })
  status!: string
}
