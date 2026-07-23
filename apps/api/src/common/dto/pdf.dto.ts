import { IsNotEmpty, IsString } from 'class-validator'

export class PdfHashDto {
  @IsString()
  @IsNotEmpty()
  pdfContent!: string

  @IsString()
  @IsNotEmpty()
  filename!: string
}
