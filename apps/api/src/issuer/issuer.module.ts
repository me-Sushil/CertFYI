import { Module } from '@nestjs/common'
import { IssuerController } from './issuer.controller'
import { IssuerService } from './issuer.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuditModule } from '../audit/audit.module'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [IssuerController],
  providers: [IssuerService],
})
export class IssuerModule {}
