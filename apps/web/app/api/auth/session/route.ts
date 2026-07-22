import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ address: null, role: null })
  }
  return NextResponse.json({ address: session.address, role: session.role })
}
