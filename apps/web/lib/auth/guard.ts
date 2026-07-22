import { NextRequest, NextResponse } from 'next/server'
import { getSession, type SessionPayload, type SessionRole } from './session'

type GuardResult = { session: SessionPayload } | { response: NextResponse }

export async function requireRole(request: NextRequest, role: SessionRole): Promise<GuardResult> {
  const session = await getSession(request)
  if (!session) {
    return { response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }
  if (session.role !== role) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session }
}
