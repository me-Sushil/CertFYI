import { ApiProperty } from '@nestjs/swagger'

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok'] })
  status!: string

  @ApiProperty({ example: '@certfyi/api', description: 'Identifier of the responding service' })
  service!: string
}
