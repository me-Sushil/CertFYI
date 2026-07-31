import { Body, Controller, Get, HttpCode, Param, Post, Query, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AdminService } from './admin.service'
import {
  AccessRequestDecisionResponseDto,
  AccessRequestListResponseDto,
  AdminDocumentsListResponseDto,
  AdminDocumentsQueryDto,
  AdminStatsResponseDto,
  ApproveUserDto,
  AuditLogQueryDto,
  AuditLogResponseDto,
  IssuerDetailResponseDto,
  IssuerListResponseDto,
  IssuersQueryDto,
  ReactivateIssuerDto,
  RejectUserDto,
  RequestsQueryDto,
  SetIssuerMetadataDto,
  SuspendIssuerDto,
} from '../common/dto/admin.dto'
import { ApiErrorDto, ValidationErrorDto } from '../common/dto/api-error.dto'
import { API_TAGS, SESSION_COOKIE_AUTH } from '../common/swagger/swagger.constants'
import { SessionGuard } from '../common/guards/session.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { SessionPayload } from '../common/constants/roles.constant'

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
      'marks the request approved and creates an active Issuer row. The admin must have sent ' +
      'the `grantRole` transaction from their wallet first.',
  })
  @ApiOkResponse({ description: 'Request approved.', type: AccessRequestDecisionResponseDto })
  @ApiBadRequestResponse({
    description: 'Transaction missing, reverted, or did not grant `ISSUER_ROLE` to this wallet.',
    type: ApiErrorDto,
  })
  approveUser(@Body() body: ApproveUserDto, @CurrentUser() session: SessionPayload) {
    return this.adminService.approveUser(body.walletAddress, body.txHash, session.address)
  }

  @Post('reject-user')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reject an issuer',
    description: 'Marks the request rejected. The applicant may re-submit afterwards.',
  })
  @ApiOkResponse({ description: 'Request rejected.', type: AccessRequestDecisionResponseDto })
  @ApiNotFoundResponse({ description: 'No request exists for that wallet.', type: ApiErrorDto })
  rejectUser(@Body() body: RejectUserDto, @CurrentUser() session: SessionPayload) {
    return this.adminService.rejectUser(body.walletAddress, body.reason, session.address)
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description: 'Returns real counts for issuers, pending approvals, documents, and suspended issuers.',
  })
  @ApiOkResponse({ description: 'Dashboard stats.', type: AdminStatsResponseDto })
  getStats() {
    return this.adminService.getStats()
  }

  @Get('issuers')
  @ApiOperation({
    summary: 'List issuers',
    description: 'Paginated, filterable by status and search term. Results newest-first.',
  })
  @ApiOkResponse({ description: 'Issuer list.', type: IssuerListResponseDto })
  getIssuers(@Query() query: IssuersQueryDto) {
    return this.adminService.getIssuers({
      status: query.status,
      search: query.search,
      cursor: query.cursor,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    })
  }

  @Get('documents')
  @ApiOperation({
    summary: 'List all anchored documents',
    description: 'Paginated, filterable by search term. Results newest-first.',
  })
  @ApiOkResponse({ description: 'Document list.', type: AdminDocumentsListResponseDto })
  getDocuments(@Query() query: AdminDocumentsQueryDto) {
    return this.adminService.getDocuments({
      search: query.search,
      cursor: query.cursor,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    })
  }

  @Get('issuers/:address')
  @ApiOperation({
    summary: 'Get issuer detail with recent activity',
    description: 'Returns the issuer record plus the last 10 audit log entries referencing them.',
  })
  @ApiOkResponse({ description: 'Issuer detail.', type: IssuerDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Issuer not found.', type: ApiErrorDto })
  getIssuer(@Param('address') address: string) {
    return this.adminService.getIssuerDetail(address)
  }

  @Post('suspend-issuer')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Suspend an issuer',
    description:
      'Confirms on-chain that `txHash` emitted `RoleRevoked` for `ISSUER_ROLE` on `walletAddress`, ' +
      'then marks the issuer SUSPENDED. Documents anchored before suspension remain valid (FR-A4).',
  })
  @ApiOkResponse({ description: 'Issuer suspended.' })
  @ApiBadRequestResponse({ description: 'Invalid transaction or issuer not active.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'Issuer not found.', type: ApiErrorDto })
  suspendIssuer(@Body() body: SuspendIssuerDto, @CurrentUser() session: SessionPayload) {
    return this.adminService.suspendIssuer(body.walletAddress, body.txHash, session.address)
  }

  @Post('reactivate-issuer')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reactivate a suspended issuer',
    description:
      'Confirms on-chain that `txHash` granted `ISSUER_ROLE`, then marks the issuer ACTIVE. ' +
      'Audit log distinguishes reinstatement from original approval.',
  })
  @ApiOkResponse({ description: 'Issuer reactivated.' })
  @ApiBadRequestResponse({ description: 'Invalid transaction or issuer not suspended.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'Issuer not found.', type: ApiErrorDto })
  reactivateIssuer(@Body() body: ReactivateIssuerDto, @CurrentUser() session: SessionPayload) {
    return this.adminService.reactivateIssuer(body.walletAddress, body.txHash, session.address)
  }

  @Post('issuers/:address/metadata-upload')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Upload issuer profile metadata to IPFS',
    description:
      'Pins the issuer profile JSON (name, organization, website) to IPFS and stores the ' +
      'resulting `ipfs://` URI on the issuer record. The admin then calls ' +
      '`POST /admin/issuers/:address/metadata` with the `setIssuerMetadata` tx hash.',
  })
  @ApiOkResponse({ description: 'Metadata uploaded to IPFS.' })
  @ApiNotFoundResponse({ description: 'Issuer not found.', type: ApiErrorDto })
  uploadIssuerMetadata(@Param('address') address: string) {
    return this.adminService.uploadIssuerMetadata(address)
  }

  @Post('issuers/:address/metadata')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm issuer metadata on-chain',
    description:
      'Verifies that `txHash` emitted `IssuerMetadataSet` for this issuer, then records ' +
      'the transaction in the audit log. The metadata must first be uploaded via ' +
      '`POST /admin/issuers/:address/metadata-upload`.',
  })
  @ApiOkResponse({ description: 'Metadata confirmed on-chain.' })
  @ApiBadRequestResponse({ description: 'Invalid transaction or no metadata uploaded.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'Issuer not found.', type: ApiErrorDto })
  setIssuerMetadata(
    @Param('address') address: string,
    @Body() body: SetIssuerMetadataDto,
    @CurrentUser() session: SessionPayload,
  ) {
    return this.adminService.setIssuerMetadataOnChain(address, body.txHash, session.address)
  }

  @Get('audit-log')
  @ApiOperation({
    summary: 'Get audit log entries',
    description: 'Filterable by action, actor, date range. Cursor-paginated, newest first.',
  })
  @ApiOkResponse({ description: 'Audit log entries.', type: AuditLogResponseDto })
  getAuditLog(@Query() query: AuditLogQueryDto) {
    return this.adminService.getAuditLog({
      action: query.action,
      actor: query.actor,
      from: query.from,
      to: query.to,
      cursor: query.cursor,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    })
  }

  @Get('audit-log/export')
  @ApiOperation({
    summary: 'Export audit log as CSV',
    description: 'Downloads a CSV file matching the current filters.',
  })
  @ApiProduces('text/csv')
  exportAuditLog(@Query() query: AuditLogQueryDto, @Res() res: Response) {
    return this.adminService.exportAuditLog({
      action: query.action,
      actor: query.actor,
      from: query.from,
      to: query.to,
    }, res)
  }

  @Get('ipfs-pin-failures')
  @ApiOperation({
    summary: 'Get count of IPFS pin failures',
    description: 'Number of documents that were anchored but whose IPFS pin failed.',
  })
  getIpfsPinFailures() {
    return this.adminService.getIpfsPinFailures()
  }
}
