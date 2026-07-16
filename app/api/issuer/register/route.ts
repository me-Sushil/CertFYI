import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, use real database
const issuers = new Map()
const registrations = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      walletAddress,
      organization,
      description,
      website,
    } = body

    // Validation
    if (!name || !email || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if wallet already registered
    for (const issuer of registrations.values()) {
      if (issuer.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        return NextResponse.json(
          { error: 'Wallet address already registered' },
          { status: 409 }
        )
      }
    }

    // Create registration
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const registration = {
      id: registrationId,
      name,
      email,
      walletAddress,
      organization,
      description,
      website,
      status: 'pending',
      createdAt: new Date().toISOString(),
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    }

    registrations.set(registrationId, registration)

    return NextResponse.json(
      {
        id: registrationId,
        status: 'pending',
        message: 'Registration submitted for admin approval',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Issuer registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all registrations (admin only)
export async function GET(request: NextRequest) {
  try {
    const registrationsList = Array.from(registrations.values())
    return NextResponse.json(registrationsList)
  } catch (error) {
    console.error('[v0] Get registrations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
