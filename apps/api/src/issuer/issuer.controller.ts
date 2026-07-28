import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { IssuerService } from './issuer.service'
import {
  AccessRequestDto,
  RequestStatusResponseDto,
  IssuerStatsResponseDto,
  IssuerDocumentsResponseDto,
  IssuerActivityResponseDto,
} from '../common/dto/issuer.dto'
import { ApiErrorDto } from '../common/dto/api-error.dto'
import { API_TAGS, SESSION_COOKIE_AUTH } from '../common/swagger/swagger.constants'
import { SessionGuard } from '../common/guards/session.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { SessionPayload } from '../common/constants/roles.constant'

@ApiTags(API_TAGS.ISSUER)
@ApiCookieAuth(SESSION_COOKIE_AUTH)
@ApiUnauthorizedResponse({ description: 'No valid session cookie.', type: ApiErrorDto })
@Controller('issuer')
@UseGuards(SessionGuard)
export class IssuerController {
  constructor(private readonly issuerService: IssuerService) {}

  @Post('request')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Submit an issuer access request',
    description:
      'Applies for `ISSUER` role for the wallet in the current session. Wallet identity comes ' +
      'from the session, never from the body. A previously rejected request may be re-submitted; ' +
      'a pending or approved one may not.',
  })
  @ApiCreatedResponse({ description: 'Request submitted and pending review.', type: RequestStatusResponseDto })
  @ApiConflictResponse({
    description: 'A request for this wallet is already pending or approved.',
    type: ApiErrorDto,
  })
  submitRequest(@CurrentUser() user: SessionPayload, @Body() body: AccessRequestDto) {
    return this.issuerService.submitRequest(user.address, body)
  }

  @Get('request')
  @ApiOperation({
    summary: 'Get own access-request status',
    description: 'Status for the session wallet. Returns `NONE` when no request has been made.',
  })
  @ApiOkResponse({ description: 'Current request status.', type: RequestStatusResponseDto })
  getStatus(@CurrentUser() user: SessionPayload) {
    return this.issuerService.getStatus(user.address)
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get issuer dashboard statistics',
    description: 'Returns total issued, active, revoked counts and recent activity count.',
  })
  @ApiOkResponse({ description: 'Issuer stats.', type: IssuerStatsResponseDto })
  getStats(@CurrentUser() user: SessionPayload) {
    return this.issuerService.getStats(user.address)
  }

  @Get('documents')
  @ApiOperation({
    summary: 'List documents issued by the current issuer',
    description: 'Paginated list of anchored documents with cursor-based pagination.',
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor (docHash).' })
  @ApiOkResponse({ description: 'Documents list.', type: IssuerDocumentsResponseDto })
  getDocuments(@CurrentUser() user: SessionPayload, @Query('cursor') cursor?: string) {
    return this.issuerService.getDocuments(user.address, cursor)
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get recent activity for the current issuer',
    description: 'Returns recent audit log entries for this issuer.',
  })
  @ApiOkResponse({ description: 'Activity entries.', type: IssuerActivityResponseDto })
  getActivity(@CurrentUser() user: SessionPayload) {
    return this.issuerService.getActivity(user.address)
  }
}
