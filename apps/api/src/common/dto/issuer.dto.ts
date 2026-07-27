import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

// Mirrors the original zod AccessRequestSchema:
//   name (>= MIN_NAME_LENGTH), email, organization, website (url | ''), description (<= MAX)
const MIN_NAME_LENGTH = 2
const MAX_DESCRIPTION_LENGTH = 1000

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
  @IsOptional()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name?: string

  @ApiPropertyOptional({ format: 'email', example: 'ada@university.edu' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: 'Example University' })
  @IsOptional()
  @IsString()
  organization?: string

  @ApiPropertyOptional({
    description: 'Organization website. Send an empty string to omit.',
    format: 'url',
    example: 'https://university.edu',
  })
  @IsOptional()
  @ValidateIf((o) => o.website !== '')
  @IsUrl({}, { message: 'Invalid URL' })
  website?: string

  @ApiPropertyOptional({
    description: 'What the organization intends to issue.',
    maxLength: MAX_DESCRIPTION_LENGTH,
    example: 'We issue degree certificates to graduating students.',
  })
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
