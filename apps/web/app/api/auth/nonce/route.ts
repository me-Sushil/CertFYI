import { NextResponse } from 'next/server'
import { generateNonce } from 'siwe'
import { NONCE_COOKIE, NONCE_COOKIE_OPTIONS } from '@/lib/auth/nonce'

export async function GET() {
  const nonce = generateNonce()
  const response = NextResponse.json({ nonce })
  response.cookies.set(NONCE_COOKIE, nonce, NONCE_COOKIE_OPTIONS)
  return response
}
