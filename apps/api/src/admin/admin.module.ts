import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { BlockchainModule } from '../blockchain/blockchain.module'
import { AuditModule } from '../audit/audit.module'
import { IpfsModule } from '../ipfs/ipfs.module'

@Module({
  imports: [BlockchainModule, AuditModule, IpfsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
