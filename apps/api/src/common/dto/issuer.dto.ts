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

export class AccessRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  organization?: string

  @IsOptional()
  @ValidateIf((o) => o.website !== '')
  @IsUrl({}, { message: 'Invalid URL' })
  website?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  description?: string
}
