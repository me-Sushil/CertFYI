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
import { PdfService } from './pdf.service'
import { PdfHashDto } from '../common/dto/pdf.dto'

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file?: Express.Multer.File) {
    return this.pdfService.upload(file)
  }

  @Patch('upload')
  hash(@Body() body: PdfHashDto) {
    return this.pdfService.hash(body.pdfContent, body.filename)
  }
}
