import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface VerifyRequest {
  documentHash: string
  pdfContent?: string // Base64 encoded for re-verification
}

/**
 * POST /api/documents/verify
 * Verify if a document hash is anchored and not revoked
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json()

    if (!body.documentHash) {
      return NextResponse.json(
        { error: 'Missing documentHash' },
        { status: 400 }
      )
    }

    // Validate document hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(body.documentHash)) {
      return NextResponse.json(
        { error: 'Invalid document hash format' },
        { status: 400 }
      )
    }

    // If PDF content is provided, verify the hash matches
    if (body.pdfContent) {
      const calculatedHash = calculateDocumentHash(Buffer.from(body.pdfContent, 'base64'))
      if (calculatedHash !== body.documentHash) {
        return NextResponse.json(
          {
            success: false,
            isValid: false,
            error: 'Document hash does not match the provided PDF',
            message: 'The PDF you provided does not match this verification hash. The document may have been modified.',
          },
          { status: 200 }
        )
      }
    }

    // In a real implementation, this would:
    // 1. Query the smart contract verifyDocument() function
    // 2. Check database for metadata
    // 3. Return full verification details

    // Mock verification response
    const mockIsValid = Math.random() > 0.2 // 80% valid for demo

    if (mockIsValid) {
      const mockIssuer = ['Stanford University', 'MIT', 'Harvard', 'Yale'][Math.floor(Math.random() * 4)]
      const daysAgo = Math.floor(Math.random() * 90)
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      return NextResponse.json({
        success: true,
        isValid: true,
        documentHash: body.documentHash,
        issuer: mockIssuer,
        documentType: 'Certificate',
        issuedDate: timestamp.toISOString(),
        status: 'active',
        message: 'Document verified successfully',
        onchainData: {
          transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
          blockNumber: Math.floor(Math.random() * 20000000),
          network: 'Ethereum Mainnet',
        },
      })
    } else {
      return NextResponse.json({
        success: true,
        isValid: false,
        documentHash: body.documentHash,
        status: 'revoked',
        message: 'Document is revoked or no longer valid',
        error: 'This document has been revoked by the issuer',
      })
    }
  } catch (error) {
    console.error('[API] Verify document error:', error)
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/verify?hash=...
 * Quick verification endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const hash = request.nextUrl.searchParams.get('hash')

    if (!hash) {
      return NextResponse.json(
        { error: 'Missing hash parameter' },
        { status: 400 }
      )
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      return NextResponse.json(
        { error: 'Invalid hash format' },
        { status: 400 }
      )
    }

    // Mock verification
    const isValid = Math.random() > 0.2

    return NextResponse.json({
      success: true,
      hash,
      isValid,
      status: isValid ? 'active' : 'revoked',
    })
  } catch (error) {
    console.error('[API] Quick verify error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

/**
 * Calculate SHA256 hash of document
 */
function calculateDocumentHash(data: Buffer): string {
  return '0x' + crypto.createHash('sha256').update(data).digest('hex')
}
