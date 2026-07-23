import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator'

const HASH_REGEX = /^0x[a-fA-F0-9]{64}$/

export class AnchorDto {
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  documentHash!: string

  @IsString()
  @IsNotEmpty()
  documentType!: string

  @IsOptional()
  @IsString()
  recipientEmail?: string

  @IsOptional()
  @IsString()
  recipientName?: string

  @IsString()
  @IsNotEmpty()
  issuerAddress!: string

  @IsOptional()
  @IsString()
  issuerName?: string
}

export class BatchDocumentDto {
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  documentHash!: string

  @IsOptional()
  @IsString()
  recipientEmail?: string

  @IsOptional()
  @IsString()
  recipientName?: string
}

export class BatchAnchorDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BatchDocumentDto)
  documents!: BatchDocumentDto[]

  @IsString()
  @IsNotEmpty()
  issuerAddress!: string

  @IsOptional()
  @IsString()
  issuerName?: string

  @IsString()
  @IsNotEmpty()
  batchId!: string
}

export class VerifyDocumentDto {
  @IsString()
  @Matches(HASH_REGEX, { message: 'Invalid document hash format' })
  documentHash!: string

  @IsOptional()
  @IsString()
  pdfContent?: string
}
