import { IsIn, IsOptional, IsString, Matches } from 'class-validator'

export class ApproveUserDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  walletAddress!: string

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' })
  txHash!: string
}

export class RejectUserDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  walletAddress!: string

  @IsOptional()
  @IsString()
  reason?: string
}

export class RequestsQueryDto {
  @IsOptional()
  @IsIn(['ALL', 'PENDING', 'APPROVED', 'REJECTED'])
  status?: string
}
