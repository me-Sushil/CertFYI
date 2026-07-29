import { Module } from '@nestjs/common'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'
import { BlockchainModule } from '../blockchain/blockchain.module'
import { AuditModule } from '../audit/audit.module'
import { IpfsModule } from '../ipfs/ipfs.module'

@Module({
  imports: [BlockchainModule, AuditModule, IpfsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
