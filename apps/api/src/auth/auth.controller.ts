import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { NonceService } from './nonce.service'
import { VerifyDto } from '../common/dto/auth.dto'
import { verifySessionToken } from '../common/session/session-token'
import {
  NONCE_COOKIE,
  NONCE_COOKIE_OPTIONS,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from '../common/constants/roles.constant'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly nonceService: NonceService,
  ) {}

  @Get('nonce')
  getNonce(@Res({ passthrough: true }) res: Response) {
    const nonce = this.nonceService.generate()
    res.cookie(NONCE_COOKIE, nonce, NONCE_COOKIE_OPTIONS)
    return { nonce }
  }

  @Post('verify')
  @HttpCode(200)
  async verify(
    @Body() body: VerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body?.message || !body?.signature) {
      throw new BadRequestException('Missing message or signature')
    }

    const nonce = req.cookies?.[NONCE_COOKIE]
    if (!nonce) {
      throw new UnauthorizedException('Missing or expired nonce - request a new one')
    }

    try {
      const { address, role, requestStatus, token } = await this.authService.verifySiwe(
        body.message,
        body.signature,
        nonce,
      )
      res.cookie(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS)
      res.clearCookie(NONCE_COOKIE, { path: '/' })
      return { address, role, requestStatus }
    } catch (error) {
      // Clear the consumed nonce on failure, mirroring the original handler.
      res.clearCookie(NONCE_COOKIE, { path: '/' })
      throw error
    }
  }

  @Get('session')
  async session(@Req() req: Request) {
    const token = req.cookies?.[SESSION_COOKIE]
    if (!token) {
      return { address: null, role: null }
    }
    const session = await verifySessionToken(token)
    if (!session) {
      return { address: null, role: null }
    }
    return { address: session.address, role: session.role }
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: '/' })
    return { success: true }
  }
}
