import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AdminService } from './admin.service'
import {
  AccessRequestDecisionResponseDto,
  AccessRequestListResponseDto,
  ApproveUserDto,
  RejectUserDto,
  RequestsQueryDto,
} from '../common/dto/admin.dto'
import { ApiErrorDto } from '../common/dto/api-error.dto'
import { API_TAGS, SESSION_COOKIE_AUTH } from '../common/swagger/swagger.constants'
import { SessionGuard } from '../common/guards/session.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags(API_TAGS.ADMIN)
@ApiCookieAuth(SESSION_COOKIE_AUTH)
@ApiUnauthorizedResponse({ description: 'No valid session cookie.', type: ApiErrorDto })
@ApiForbiddenResponse({ description: 'Session is not an `ADMIN` wallet.', type: ApiErrorDto })
@Controller('admin')
@UseGuards(SessionGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('requests')
  @ApiOperation({
    summary: 'List issuer access requests',
    description: 'Newest first. Defaults to `PENDING` when no `status` filter is supplied.',
  })
  @ApiOkResponse({ description: 'Matching access requests.', type: AccessRequestListResponseDto })
  getRequests(@Query() query: RequestsQueryDto) {
    return this.adminService.getRequests(query.status)
  }

  @Post('approve-user')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Approve an issuer',
    description:
      'Confirms on-chain that `txHash` really granted `ISSUER_ROLE` to `walletAddress`, then ' +
      'marks the request approved. The admin must have sent the `grantRole` transaction from ' +
      'their wallet first - this endpoint records the result, it does not send the transaction.',
  })
  @ApiOkResponse({ description: 'Request approved.', type: AccessRequestDecisionResponseDto })
  @ApiBadRequestResponse({
    description: 'Transaction missing, reverted, or did not grant `ISSUER_ROLE` to this wallet.',
    type: ApiErrorDto,
  })
  approveUser(@Body() body: ApproveUserDto) {
    return this.adminService.approveUser(body.walletAddress, body.txHash)
  }

  @Post('reject-user')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reject an issuer',
    description: 'Marks the request rejected. The applicant may re-submit afterwards.',
  })
  @ApiOkResponse({ description: 'Request rejected.', type: AccessRequestDecisionResponseDto })
  @ApiNotFoundResponse({ description: 'No request exists for that wallet.', type: ApiErrorDto })
  rejectUser(@Body() body: RejectUserDto) {
    return this.adminService.rejectUser(body.walletAddress, body.reason)
  }
}
