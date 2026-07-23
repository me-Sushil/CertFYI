import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { NONCE_COOKIE } from '@/lib/auth/nonce'
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, createSessionToken, type SessionRole } from '@/lib/auth/session'
import { isAdminWallet } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json()
    if (!message || !signature) {
      return NextResponse.json({ error: 'Missing message or signature' }, { status: 400 })
    }

    const nonce = request.cookies.get(NONCE_COOKIE)?.value
    if (!nonce) {
      return NextResponse.json(
        { error: 'Missing or expired nonce - request a new one' },
        { status: 401 }
      )
    }

    let siweMessage: SiweMessage
    try {
      siweMessage = new SiweMessage(message)
    } catch {
      return NextResponse.json({ error: 'Malformed SIWE message' }, { status: 400 })
    }

    // siwe's verify() *rejects* (rather than resolving with success:false) when
    // verification fails, so failure must be caught separately from real errors.
    let address: string
    try {
      const { data } = await siweMessage.verify({ signature, nonce })
      address = data.address.toLowerCase()
    } catch {
      const response = NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
      response.cookies.delete(NONCE_COOKIE)
      return response
    }

    let role: SessionRole
    let requestStatus: string | undefined

    if (isAdminWallet(address)) {
      role = 'ADMIN'
    } else {
      const accessRequest = await prisma.accessRequest.findUnique({
        where: { walletAddress: address },
      })
      if (accessRequest?.status === 'APPROVED') {
        role = 'ISSUER'
      } else {
        role = 'UNAPPROVED'
        requestStatus = accessRequest?.status ?? 'NONE'
      }
    }

    const token = await createSessionToken({ address, role })

    const response = NextResponse.json({ address, role, requestStatus })
    response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS)
    response.cookies.delete(NONCE_COOKIE)
    return response
  } catch (error) {
    console.error('SIWE verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
