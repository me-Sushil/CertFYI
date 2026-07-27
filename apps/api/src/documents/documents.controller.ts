import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { DocumentsService } from './documents.service'
import {
  AnchorDto,
  AnchorLookupResponseDto,
  AnchorResponseDto,
  BatchAnchorDto,
  BatchAnchorResponseDto,
  BatchLookupResponseDto,
  QuickVerifyResponseDto,
  VerifyDocumentDto,
  VerifyDocumentResponseDto,
} from '../common/dto/documents.dto'
import { ApiErrorDto, ValidationErrorDto } from '../common/dto/api-error.dto'
import { API_TAGS } from '../common/swagger/swagger.constants'

@ApiTags(API_TAGS.DOCUMENTS)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('anchor')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Anchor a single document hash',
    description:
      'Commits one document hash on-chain and records its issuer metadata. Only the hash leaves ' +
      'the issuer - CertFyi never stores the document itself.',
  })
  @ApiCreatedResponse({ description: 'Document anchored.', type: AnchorResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.', type: ValidationErrorDto })
  anchor(@Body() body: AnchorDto) {
    return this.documentsService.anchor(body)
  }

  @Get('anchor')
  @ApiOperation({
    summary: 'Look up an anchored document',
    description: 'Returns the full anchor record, including issuer metadata, for a known hash.',
  })
  @ApiQuery({
    name: 'hash',
    required: true,
    description: 'Document hash to look up.',
    example: '0x' + 'e3b0c442'.repeat(8),
  })
  @ApiOkResponse({ description: 'Anchor record found.', type: AnchorLookupResponseDto })
  @ApiBadRequestResponse({ description: '`hash` query parameter missing.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'No document anchored for that hash.', type: ApiErrorDto })
  getAnchor(@Query('hash') hash?: string) {
    return this.documentsService.getAnchor(hash)
  }

  @Post('anchor-batch')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Anchor many documents in one transaction',
    description:
      'Builds a Merkle tree over the supplied hashes and commits only the root, so gas cost is ' +
      'flat regardless of batch size. Each document remains independently verifiable.',
  })
  @ApiCreatedResponse({ description: 'Batch anchored.', type: BatchAnchorResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or empty batch.',
    type: ValidationErrorDto,
  })
  anchorBatch(@Body() body: BatchAnchorDto) {
    return this.documentsService.anchorBatch(body)
  }

  @Get('anchor-batch')
  @ApiOperation({
    summary: 'Look up an anchored batch',
    description: 'Returns the batch record, its Merkle root, and the documents it covers.',
  })
  @ApiQuery({
    name: 'batchId',
    required: true,
    description: 'Identifier supplied when the batch was anchored.',
    example: 'spring-2026-graduates',
  })
  @ApiOkResponse({ description: 'Batch record found.', type: BatchLookupResponseDto })
  @ApiBadRequestResponse({ description: '`batchId` query parameter missing.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'No batch anchored under that id.', type: ApiErrorDto })
  getBatch(@Query('batchId') batchId?: string) {
    return this.documentsService.getBatch(batchId)
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify a document',
    description:
      'Checks whether a hash is anchored and still active. Supply `pdfContent` to also prove the ' +
      'PDF in hand hashes to `documentHash` - a mismatch means the file was modified. Public: no ' +
      'authentication required.',
  })
  @ApiOkResponse({
    description:
      'Verification completed. Inspect `isValid` - a document that is revoked or unknown still ' +
      'returns 200.',
    type: VerifyDocumentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed.', type: ValidationErrorDto })
  verify(@Body() body: VerifyDocumentDto) {
    return this.documentsService.verify(body.documentHash, body.pdfContent)
  }

  @Get('verify')
  @ApiOperation({
    summary: 'Quick hash-only verification',
    description:
      'Lightweight status check for a hash, without issuer metadata. Suited to QR-code scans and ' +
      'link previews.',
  })
  @ApiQuery({
    name: 'hash',
    required: true,
    description: 'Document hash to check.',
    example: '0x' + 'e3b0c442'.repeat(8),
  })
  @ApiOkResponse({ description: 'Status resolved.', type: QuickVerifyResponseDto })
  @ApiBadRequestResponse({ description: '`hash` is missing or malformed.', type: ApiErrorDto })
  quickVerify(@Query('hash') hash?: string) {
    return this.documentsService.quickVerify(hash)
  }
}
