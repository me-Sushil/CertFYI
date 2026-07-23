import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { ApproveUserDto, RejectUserDto, RequestsQueryDto } from '../common/dto/admin.dto'
import { SessionGuard } from '../common/guards/session.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('admin')
@UseGuards(SessionGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('requests')
  getRequests(@Query() query: RequestsQueryDto) {
    return this.adminService.getRequests(query.status)
  }

  @Post('approve-user')
  @HttpCode(200)
  approveUser(@Body() body: ApproveUserDto) {
    return this.adminService.approveUser(body.walletAddress, body.txHash)
  }

  @Post('reject-user')
  @HttpCode(200)
  rejectUser(@Body() body: RejectUserDto) {
    return this.adminService.rejectUser(body.walletAddress, body.reason)
  }
}
