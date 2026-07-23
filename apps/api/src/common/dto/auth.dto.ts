import { IsNotEmpty, IsString } from 'class-validator'

export class VerifyDto {
  @IsString()
  @IsNotEmpty()
  message!: string

  @IsString()
  @IsNotEmpty()
  signature!: string
}
