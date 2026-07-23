import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { AnchorDto, BatchAnchorDto, VerifyDocumentDto } from '../common/dto/documents.dto'

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('anchor')
  @HttpCode(201)
  anchor(@Body() body: AnchorDto) {
    return this.documentsService.anchor(body)
  }

  @Get('anchor')
  getAnchor(@Query('hash') hash?: string) {
    return this.documentsService.getAnchor(hash)
  }

  @Post('anchor-batch')
  @HttpCode(201)
  anchorBatch(@Body() body: BatchAnchorDto) {
    return this.documentsService.anchorBatch(body)
  }

  @Get('anchor-batch')
  getBatch(@Query('batchId') batchId?: string) {
    return this.documentsService.getBatch(batchId)
  }

  @Post('verify')
  @HttpCode(200)
  verify(@Body() body: VerifyDocumentDto) {
    return this.documentsService.verify(body.documentHash, body.pdfContent)
  }

  @Get('verify')
  quickVerify(@Query('hash') hash?: string) {
    return this.documentsService.quickVerify(hash)
  }
}
