import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'
import { API_TAGS } from './common/swagger/swagger.constants'
import { HealthResponseDto } from './common/dto/health.dto'

@ApiTags(API_TAGS.HEALTH)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Returns 200 as long as the process is serving traffic. Unauthenticated.',
  })
  @ApiOkResponse({ description: 'Service is up.', type: HealthResponseDto })
  getHealth() {
    return this.appService.getHealth()
  }
}
