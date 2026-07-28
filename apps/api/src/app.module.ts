import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { BlockchainModule } from './blockchain/blockchain.module'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { IssuerModule } from './issuer/issuer.module'
import { DocumentsModule } from './documents/documents.module'
import { PdfModule } from './pdf/pdf.module'
import { AuditModule } from './audit/audit.module'
import { IpfsModule } from './ipfs/ipfs.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    BlockchainModule,
    AuthModule,
    AdminModule,
    IssuerModule,
    DocumentsModule,
    AuditModule,
    IpfsModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
