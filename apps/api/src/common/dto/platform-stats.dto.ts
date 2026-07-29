import { ApiProperty } from '@nestjs/swagger'

export class PlatformStatsDto {
  @ApiProperty({ example: 142, description: 'Total documents anchored on the blockchain' })
  totalDocumentsAnchored!: number

  @ApiProperty({ example: 3851, description: 'Total verification requests processed' })
  totalVerifications!: number
}
