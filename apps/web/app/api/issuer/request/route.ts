import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { VALIDATION } from '@certfyi/shared'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

const AccessRequestSchema = z.object({
  name: z.string().min(VALIDATION.MIN_NAME_LENGTH).optional(),
  email: z.string().email().optional(),
  organization: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(VALIDATION.MAX_DESCRIPTION_LENGTH).optional(),
})

// Submit (or re-submit after rejection) an issuer access request for the
// SIWE-authenticated caller's wallet. Wallet identity always comes from the
// verified session, never from client-supplied input.
export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = AccessRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const existing = await prisma.accessRequest.findUnique({
    where: { walletAddress: session.address },
  })

  if (existing && existing.status !== 'REJECTED') {
    return NextResponse.json(
      { error: `Request already ${existing.status.toLowerCase()}` },
      { status: 409 }
    )
  }

  const accessRequest = await prisma.accessRequest.upsert({
    where: { walletAddress: session.address },
    create: {
      walletAddress: session.address,
      ...parsed.data,
      status: 'PENDING',
    },
    update: {
      ...parsed.data,
      status: 'PENDING',
      decidedAt: null,
      rejectionReason: null,
    },
  })

  return NextResponse.json({ requestStatus: accessRequest.status }, { status: 201 })
}

// Status check for the caller's own wallet (derived from session, not a body param).
export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { walletAddress: session.address },
  })

  return NextResponse.json({ requestStatus: accessRequest?.status ?? 'NONE' })
}
