import { Module } from '@nestjs/common'
import { PdfController } from './pdf.controller'
import { PdfService } from './pdf.service'
import { IpfsModule } from '../ipfs/ipfs.module'

@Module({
  imports: [IpfsModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
