import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, Matches } from 'class-validator'

const EXAMPLE_WALLET = '0x1234567890abcdef1234567890abcdef12345678'
const EXAMPLE_TX = '0x' + 'ab'.repeat(32)

export const REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const
export const REQUEST_STATUS_FILTERS = ['ALL', ...REQUEST_STATUSES] as const

export class ApproveUserDto {
  @ApiProperty({
    description: 'Wallet whose access request is being approved.',
    example: EXAMPLE_WALLET,
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  walletAddress!: string

  @ApiProperty({
    description:
      'Hash of the `grantRole(ISSUER_ROLE, walletAddress)` transaction the admin already sent. ' +
      'Verified on-chain before the request is marked approved.',
    example: EXAMPLE_TX,
    pattern: '^0x[a-fA-F0-9]{64}$',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' })
  txHash!: string
}

export class RejectUserDto {
  @ApiProperty({
    description: 'Wallet whose access request is being rejected.',
    example: EXAMPLE_WALLET,
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  walletAddress!: string

  @ApiPropertyOptional({
    description: 'Reason surfaced to the applicant. Stored on the request record.',
    example: 'Organization could not be verified.',
  })
  @IsOptional()
  @IsString()
  reason?: string
}

export class RequestsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status. Defaults to `PENDING`; `ALL` disables filtering.',
    enum: REQUEST_STATUS_FILTERS,
    default: 'PENDING',
  })
  @IsOptional()
  @IsIn(REQUEST_STATUS_FILTERS as unknown as string[])
  status?: string
}

/** Persisted issuer access request (Prisma `AccessRequest`). */
export class AccessRequestEntityDto {
  @ApiProperty({ example: 'clx7f2k9a0000qw8h3n1e5r2t' })
  id!: string

  @ApiProperty({ example: EXAMPLE_WALLET })
  walletAddress!: string

  @ApiProperty({ nullable: true, type: String, example: 'Ada Lovelace' })
  name!: string | null

  @ApiProperty({ nullable: true, type: String, example: 'ada@university.edu' })
  email!: string | null

  @ApiProperty({ nullable: true, type: String, example: 'Example University' })
  organization!: string | null

  @ApiProperty({ nullable: true, type: String, example: 'https://university.edu' })
  website!: string | null

  @ApiProperty({ nullable: true, type: String, example: 'We issue degree certificates.' })
  description!: string | null

  @ApiProperty({ enum: REQUEST_STATUSES, example: 'PENDING' })
  status!: string

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date

  @ApiProperty({
    format: 'date-time',
    nullable: true,
    type: String,
    description: 'When an admin approved or rejected the request.',
    example: null,
  })
  decidedAt!: Date | null

  @ApiProperty({ nullable: true, type: String, example: null })
  rejectionReason!: string | null
}

export class AccessRequestListResponseDto {
  @ApiProperty({ type: [AccessRequestEntityDto], description: 'Newest request first.' })
  requests!: AccessRequestEntityDto[]
}

export class AccessRequestDecisionResponseDto {
  @ApiProperty({ type: AccessRequestEntityDto, description: 'The request after the decision.' })
  accessRequest!: AccessRequestEntityDto
}

/** An approved issuer (wallet that has been granted ISSUER role). */
export class IssuerRowDto {
  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678' })
  walletAddress!: string

  @ApiProperty({ nullable: true, type: String, example: 'Ada Lovelace' })
  name!: string | null

  @ApiProperty({ nullable: true, type: String, example: 'ada@university.edu' })
  email!: string | null

  @ApiProperty({ nullable: true, type: String, example: 'Example University' })
  organization!: string | null

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  approvedAt!: Date | null

  @ApiProperty({ description: 'Number of documents anchored by this issuer.', example: 142 })
  documentCount!: number
}

export class IssuerListResponseDto {
  @ApiProperty({ type: [IssuerRowDto] })
  issuers!: IssuerRowDto[]
}

export class SuspendIssuerDto {
  @ApiProperty({
    description: 'Wallet address to suspend (revoke ISSUER_ROLE from).',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  walletAddress!: string
}

/** Single audit-log entry. */
export class AuditLogEntryDto {
  @ApiProperty({ example: 'clx7f2k9a0000qw8h3n1e5r2t' })
  id!: string

  @ApiProperty({ example: 'Issuer Approved' })
  action!: string

  @ApiProperty({ example: '0xabcd...' })
  actor!: string

  @ApiProperty({ example: '0x1234...', nullable: true })
  target!: string | null

  @ApiProperty({ example: 'Admin approved MIT as issuer' })
  details!: string | null

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: Date
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: [AuditLogEntryDto] })
  entries!: AuditLogEntryDto[]
}
