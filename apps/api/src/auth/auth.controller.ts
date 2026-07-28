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
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { NonceService } from './nonce.service'
import {
  LogoutResponseDto,
  NonceResponseDto,
  SessionResponseDto,
  VerifyDto,
  VerifyResponseDto,
} from '../common/dto/auth.dto'
import { ApiErrorDto } from '../common/dto/api-error.dto'
import { API_TAGS } from '../common/swagger/swagger.constants'
import { verifySessionToken } from '../common/session/session-token'
import {
  NONCE_COOKIE,
  NONCE_COOKIE_OPTIONS,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from '../common/constants/roles.constant'

@ApiTags(API_TAGS.AUTH)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly nonceService: NonceService,
  ) {}

  @Get('nonce')
  @ApiOperation({
    summary: 'Issue a SIWE nonce',
    description:
      'Step 1 of sign-in. Returns a single-use nonce and stores it in the short-lived httpOnly ' +
      `\`${NONCE_COOKIE}\` cookie (5 minutes). Embed the nonce in the SIWE message you ask the ` +
      'wallet to sign.',
  })
  @ApiOkResponse({ description: 'Nonce issued and cookie set.', type: NonceResponseDto })
  getNonce(@Res({ passthrough: true }) res: Response) {
    const nonce = this.nonceService.generate()
    res.cookie(NONCE_COOKIE, nonce, NONCE_COOKIE_OPTIONS)
    return { nonce }
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify a SIWE signature and open a session',
    description:
      'Step 2 of sign-in. Validates the signature against the nonce cookie, resolves the ' +
      `caller's role, and sets the httpOnly \`${SESSION_COOKIE}\` cookie (7 days). The nonce ` +
      'is consumed either way, so a failed attempt requires a fresh `GET /auth/nonce`.',
  })
  @ApiOkResponse({ description: 'Signature verified; session cookie set.', type: VerifyResponseDto })
  @ApiBadRequestResponse({ description: 'Missing `message` or `signature`.', type: ApiErrorDto })
  @ApiUnauthorizedResponse({
    description: 'Nonce missing/expired, SIWE message malformed, or signature invalid.',
    type: ApiErrorDto,
  })
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
      return { address, role, requestStatus, token }
    } catch (error) {
      // Clear the consumed nonce on failure, mirroring the original handler.
      res.clearCookie(NONCE_COOKIE, { path: '/' })
      throw error
    }
  }

  @Get('session')
  @ApiOperation({
    summary: 'Read the current session',
    description:
      'Returns the signed-in wallet and role. Always 200 - a missing or invalid session cookie ' +
      'yields `{ address: null, role: null }` rather than a 401, so clients can poll it safely.',
  })
  @ApiOkResponse({ description: 'Current session, or nulls when signed out.', type: SessionResponseDto })
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
  @ApiOperation({
    summary: 'End the session',
    description: `Clears the \`${SESSION_COOKIE}\` cookie. Idempotent.`,
  })
  @ApiOkResponse({ description: 'Session cookie cleared.', type: LogoutResponseDto })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: '/' })
    return { success: true }
  }
}
