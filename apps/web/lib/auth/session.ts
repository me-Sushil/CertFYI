import { SignJWT, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import type { CookieOptions } from './cookies'

export type SessionRole = 'ADMIN' | 'ISSUER' | 'UNAPPROVED'

export interface SessionPayload {
  address: string
  role: SessionRole
}

export const SESSION_COOKIE = 'certfyi_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ address: payload.address, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (typeof payload.address !== 'string' || typeof payload.role !== 'string') {
      return null
    }
    if (!['ADMIN', 'ISSUER', 'UNAPPROVED'].includes(payload.role)) {
      return null
    }
    return { address: payload.address, role: payload.role as SessionRole }
  } catch {
    return null
  }
}

/** Reads and verifies the session from an incoming request's cookies. */
export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}
