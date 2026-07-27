import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { BlockchainModule } from './blockchain/blockchain.module'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { IssuerModule } from './issuer/issuer.module'
import { DocumentsModule } from './documents/documents.module'
import { PdfModule } from './pdf/pdf.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BlockchainModule,
    AuthModule,
    AdminModule,
    IssuerModule,
    DocumentsModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
