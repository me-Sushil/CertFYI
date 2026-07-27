import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Shape produced by Nest's built-in `HttpException` filter. Documented once and
 * reused via `@ApiResponse({ type: ApiErrorDto })` so every failure mode in the
 * spec carries a real schema instead of an empty body.
 */
export class ApiErrorDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number

  @ApiProperty({
    example: 'Missing hash parameter',
    description: 'Human-readable error message',
  })
  message!: string

  @ApiPropertyOptional({ example: 'Bad Request', description: 'HTTP status text' })
  error?: string
}

/**
 * Emitted by the global `ValidationPipe` when a request body or query fails
 * class-validator constraints - `message` is an array of violations.
 */
export class ValidationErrorDto {
  @ApiProperty({ example: 400 })
  statusCode!: number

  @ApiProperty({
    type: [String],
    example: ['documentHash must match /^0x[a-fA-F0-9]{64}$/ regular expression'],
    description: 'One entry per failed constraint',
  })
  message!: string[]

  @ApiProperty({ example: 'Bad Request' })
  error!: string
}
