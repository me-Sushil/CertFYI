import type { CookieOptions } from './cookies'

// SIWE nonces are stateless: generated, round-tripped in a short-lived
// httpOnly cookie, and consumed on verify. No server-side store needed.
export const NONCE_COOKIE = 'siwe_nonce'
const NONCE_MAX_AGE_SECONDS = 60 * 5 // 5 minutes

export const NONCE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: NONCE_MAX_AGE_SECONDS,
}
