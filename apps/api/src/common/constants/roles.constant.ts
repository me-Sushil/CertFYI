import type { CookieOptions } from 'express'

export type SessionRole = 'ADMIN' | 'ISSUER' | 'UNAPPROVED'

export interface SessionPayload {
  address: string
  role: SessionRole
}

// --- Session cookie (JWT) ---
export const SESSION_COOKIE = 'certfyi_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS * 1000,
}

// --- SIWE nonce cookie ---
// Stateless: generated, round-tripped in a short-lived httpOnly cookie, and
// consumed on verify. No server-side store needed.
export const NONCE_COOKIE = 'siwe_nonce'
export const NONCE_MAX_AGE_SECONDS = 60 * 5 // 5 minutes

export const NONCE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: NONCE_MAX_AGE_SECONDS * 1000,
}

/** Strict, lowercase-normalized comparison against the .env-bootstrapped admin wallet. */
export function isAdminWallet(address: string): boolean {
  const adminWallet = process.env.ADMIN_WALLET_ADDRESS
  if (!adminWallet) return false
  return address.toLowerCase() === adminWallet.toLowerCase()
}
