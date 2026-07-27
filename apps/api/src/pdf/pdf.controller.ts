import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { PdfService } from './pdf.service'
import { PdfHashDto, PdfHashResponseDto, PdfUploadDto, PdfUploadResponseDto } from '../common/dto/pdf.dto'
import { ApiErrorDto, ValidationErrorDto } from '../common/dto/api-error.dto'
import { API_TAGS } from '../common/swagger/swagger.constants'

@ApiTags(API_TAGS.PDF)
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a PDF and get its hash',
    description:
      'Validates the file is a PDF under 50 MB and returns its SHA-256 hash. The resulting ' +
      '`documentHash` is what you pass to `POST /documents/anchor`.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PdfUploadDto, description: 'PDF file in the `file` field.' })
  @ApiCreatedResponse({ description: 'File accepted and hashed.', type: PdfUploadResponseDto })
  @ApiBadRequestResponse({
    description: 'No file supplied, wrong MIME type, or over the 50 MB limit.',
    type: ApiErrorDto,
  })
  upload(@UploadedFile() file?: Express.Multer.File) {
    return this.pdfService.upload(file)
  }

  @Patch('upload')
  @ApiOperation({
    summary: 'Hash a base64 PDF',
    description:
      'Same hash as `POST /pdf/upload`, for callers that already hold the bytes and prefer JSON ' +
      'over multipart.',
  })
  @ApiOkResponse({ description: 'Hash computed.', type: PdfHashResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.', type: ValidationErrorDto })
  hash(@Body() body: PdfHashDto) {
    return this.pdfService.hash(body.pdfContent, body.filename)
  }
}
