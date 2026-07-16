import { NextRequest, NextResponse } from 'next/server'

// Mock database
const issuerStatus = new Map()

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Check issuer status
    const status = issuerStatus.get(walletAddress.toLowerCase()) || 'not_registered'

    return NextResponse.json({
      walletAddress,
      status, // 'pending', 'approved', 'rejected', 'not_registered'
      isApproved: status === 'approved',
      isPending: status === 'pending',
    })
  } catch (error) {
    console.error('[v0] Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
