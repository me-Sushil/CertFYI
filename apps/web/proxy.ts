import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function proxy(request: NextRequest) {
  const session = await getSession(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/issuer')) {
    if (!session || session.role !== 'ISSUER') {
      return NextResponse.redirect(new URL('/request-access', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/issuer/:path*'],
}
