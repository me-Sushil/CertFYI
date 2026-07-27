import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { SESSION_ROLES, type SessionRole } from '../constants/roles.constant'

const EXAMPLE_SIWE_MESSAGE = `localhost:3000 wants you to sign in with your Ethereum account:
0x1234567890AbcdEF1234567890aBcdef12345678

Sign in to CertFyi

URI: http://localhost:3000
Version: 1
Chain ID: 11155111
Nonce: 8f4a2c1e9b7d6053
Issued At: 2026-01-01T00:00:00.000Z`

export class VerifyDto {
  @ApiProperty({
    description: 'The EIP-4361 (SIWE) message that was signed, verbatim.',
    example: EXAMPLE_SIWE_MESSAGE,
  })
  @IsString()
  @IsNotEmpty()
  message!: string

  @ApiProperty({
    description: '65-byte hex signature produced by the wallet for `message`.',
    example: '0x' + 'a'.repeat(130),
  })
  @IsString()
  @IsNotEmpty()
  signature!: string
}

export class NonceResponseDto {
  @ApiProperty({
    description: 'Single-use nonce to embed in the SIWE message. Also set as an httpOnly cookie.',
    example: '8f4a2c1e9b7d6053',
  })
  nonce!: string
}

export class VerifyResponseDto {
  @ApiProperty({
    description: 'Recovered wallet address, lowercased.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  address!: string

  @ApiProperty({ enum: SESSION_ROLES, example: 'ISSUER' })
  role!: SessionRole

  @ApiPropertyOptional({
    description: 'Access-request status. Present only for `UNAPPROVED` wallets.',
    enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  requestStatus?: string
}

export class SessionResponseDto {
  @ApiProperty({
    description: 'Wallet address of the current session, or `null` when signed out.',
    nullable: true,
    type: String,
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  address!: string | null

  @ApiProperty({
    description: 'Role of the current session, or `null` when signed out.',
    nullable: true,
    enum: SESSION_ROLES,
    example: 'ISSUER',
  })
  role!: SessionRole | null
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean
}
