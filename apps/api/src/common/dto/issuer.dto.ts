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
