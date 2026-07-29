import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
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
  IssuerDocumentsQueryDto,
  IssuerActivityQueryDto,
  RetryPinDto,
  RetryPinResponseDto,
  LogFailedAnchorDto,
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
    description:
      'Server-side filtered and paginated list of anchored documents. `search` matches ' +
      'recipient name/email, document type, or hash.',
  })
  @ApiOkResponse({ description: 'Documents list.', type: IssuerDocumentsResponseDto })
  getDocuments(@CurrentUser() user: SessionPayload, @Query() query: IssuerDocumentsQueryDto) {
    return this.issuerService.getDocuments(user.address, query)
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get recent activity for the current issuer',
    description: 'Server-side filtered and paginated audit log entries for this issuer.',
  })
  @ApiOkResponse({ description: 'Activity entries.', type: IssuerActivityResponseDto })
  getActivity(@CurrentUser() user: SessionPayload, @Query() query: IssuerActivityQueryDto) {
    return this.issuerService.getActivity(user.address, query)
  }

  @Post('retry-pin')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Retry pinning a document’s metadata sidecar',
    description:
      'Re-attempts pinning the public, non-identifying metadata sidecar for a document this ' +
      'issuer owns, when the original pin failed. The PDF itself cannot be retried this way - ' +
      'its bytes are never stored server-side - only the sidecar, which is rebuilt from data ' +
      'already in the database.',
  })
  @ApiOkResponse({ description: 'Retry attempted.', type: RetryPinResponseDto })
  retryPin(@CurrentUser() user: SessionPayload, @Body() body: RetryPinDto) {
    return this.issuerService.retryPin(user.address, body.docHash)
  }

  @Post('log-failed-anchor')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Record a failed anchoring attempt',
    description:
      'Writes an audit entry for an anchoring attempt that never produced a document - the ' +
      'wallet rejected it, or the chain reverted it. Nothing is verified on-chain here (there is ' +
      'nothing to verify); this exists so the attempt is visible in Activity rather than lost the ' +
      'moment the browser moves on.',
  })
  @ApiOkResponse({ description: 'Logged.' })
  logFailedAnchor(@CurrentUser() user: SessionPayload, @Body() body: LogFailedAnchorDto) {
    return this.issuerService.logFailedAnchor(user.address, body.docHash, body.txHash, body.reason)
  }
}
