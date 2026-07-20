import { NextRequest, NextResponse } from 'next/server'

// Mock database
const approvedIssuers = new Map()

export async function POST(request: NextRequest) {
  try {
    const { registrationId, action, rejectionReason } = await request.json()

    if (!registrationId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Simulate approval
      approvedIssuers.set(registrationId, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      })

      return NextResponse.json({
        id: registrationId,
        status: 'approved',
        message: 'Issuer approved successfully',
      })
    } else {
      // Simulate rejection
      return NextResponse.json({
        id: registrationId,
        status: 'rejected',
        rejectionReason,
        message: 'Issuer registration rejected',
      })
    }
  } catch (error) {
    console.error('[v0] Approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
