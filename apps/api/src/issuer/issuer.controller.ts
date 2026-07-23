import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { IssuerService } from './issuer.service'
import { AccessRequestDto } from '../common/dto/issuer.dto'
import { SessionGuard } from '../common/guards/session.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { SessionPayload } from '../common/constants/roles.constant'

@Controller('issuer')
@UseGuards(SessionGuard)
export class IssuerController {
  constructor(private readonly issuerService: IssuerService) {}

  @Post('request')
  @HttpCode(201)
  submitRequest(@CurrentUser() user: SessionPayload, @Body() body: AccessRequestDto) {
    return this.issuerService.submitRequest(user.address, body)
  }

  @Get('request')
  getStatus(@CurrentUser() user: SessionPayload) {
    return this.issuerService.getStatus(user.address)
  }
}
