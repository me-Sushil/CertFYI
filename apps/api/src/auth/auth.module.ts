import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { NonceService } from './nonce.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, NonceService],
  exports: [AuthService],
})
export class AuthModule {}
