import type { CookieOptions } from 'express'

/** Runtime list of session roles - also drives the `enum` in the OpenAPI spec. */
export const SESSION_ROLES = ['ADMIN', 'ISSUER', 'UNAPPROVED'] as const

export type SessionRole = (typeof SESSION_ROLES)[number]

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

/** Strict, lowercase-normalized comparison against the .env-bootstrapped admin wallet(s). */
export function isAdminWallet(address: string): boolean {
  const adminWallets = process.env.ADMIN_WALLET_ADDRESS
  if (!adminWallets) return false
  const normalized = address.toLowerCase()
  return adminWallets
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized)
}
