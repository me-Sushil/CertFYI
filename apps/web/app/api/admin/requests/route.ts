import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const guard = await requireRole(request, 'ADMIN')
  if ('response' in guard) return guard.response

  const statusParam = new URL(request.url).searchParams.get('status')
  const where =
    statusParam === 'ALL'
      ? {}
      : { status: (statusParam ?? 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' }

  const requests = await prisma.accessRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ requests })
}
