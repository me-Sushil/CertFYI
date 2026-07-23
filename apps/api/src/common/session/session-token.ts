import { SignJWT, jwtVerify } from 'jose'
import {
  SESSION_MAX_AGE_SECONDS,
  type SessionPayload,
  type SessionRole,
} from '../constants/roles.constant'

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
