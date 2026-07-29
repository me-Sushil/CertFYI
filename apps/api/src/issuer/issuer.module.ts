import { Module } from '@nestjs/common'
import { IssuerController } from './issuer.controller'
import { IssuerService } from './issuer.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuditModule } from '../audit/audit.module'
import { IpfsModule } from '../ipfs/ipfs.module'
import { BlockchainModule } from '../blockchain/blockchain.module'

@Module({
  imports: [PrismaModule, AuditModule, IpfsModule, BlockchainModule],
  controllers: [IssuerController],
  providers: [IssuerService],
})
export class IssuerModule {}
