import { NextRequest, NextResponse } from 'next/server'
import type { SessionResponse } from '@/lib/api-types'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * Session verification (JWT signing/checking) now lives entirely in apps/api.
 * The middleware forwards the caller's cookies to the backend's /auth/session
 * endpoint rather than verifying the token itself.
 */
async function getSession(request: NextRequest): Promise<SessionResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/session`, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
    })
    if (!res.ok) return { address: null, role: null }
    return await res.json()
  } catch {
    return { address: null, role: null }
  }
}

export async function proxy(request: NextRequest) {
  const session = await getSession(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!session.address || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/issuer')) {
    if (!session.address || session.role !== 'ISSUER') {
      return NextResponse.redirect(new URL('/request-access', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/issuer/:path*'],
}
