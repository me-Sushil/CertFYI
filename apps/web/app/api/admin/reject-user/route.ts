import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const guard = await requireRole(request, 'ADMIN')
  if ('response' in guard) return guard.response

  const body = await request.json().catch(() => null)
  const walletAddress: string | undefined = body?.walletAddress?.toLowerCase?.()
  const reason: string | undefined = body?.reason

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 })
  }

  const accessRequest = await prisma.accessRequest
    .update({
      where: { walletAddress },
      data: { status: 'REJECTED', decidedAt: new Date(), rejectionReason: reason ?? null },
    })
    .catch(() => null)

  if (!accessRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  return NextResponse.json({ accessRequest })
}
