import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface AnchorRequest {
  documentHash: string
  documentType: string
  recipientEmail: string
  recipientName: string
  issuerAddress: string
  issuerName: string
}

// Mock database for demo purposes
const anchoredDocuments: Map<string, any> = new Map()

/**
 * POST /api/documents/anchor
 * Anchor a single document hash on the blockchain
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnchorRequest = await request.json()

    // Validate input
    if (!body.documentHash || !body.documentType || !body.issuerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate document hash format (should be hex string starting with 0x)
    if (!/^0x[a-fA-F0-9]{64}$/.test(body.documentHash)) {
      return NextResponse.json(
        { error: 'Invalid document hash format' },
        { status: 400 }
      )
    }

    // In a real implementation, this would:
    // 1. Call the smart contract to anchor the document
    // 2. Store metadata in a database
    // 3. Send confirmation email to recipient

    // Mock transaction hash
    const txHash = '0x' + crypto.randomBytes(32).toString('hex')
    const timestamp = new Date().toISOString()

    const anchorRecord = {
      documentHash: body.documentHash,
      documentType: body.documentType,
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
      issuerAddress: body.issuerAddress,
      issuerName: body.issuerName,
      txHash,
      timestamp,
      status: 'confirmed',
      merkleRoot: null,
      batchId: null,
    }

    // Store in mock database
    anchoredDocuments.set(body.documentHash, anchorRecord)

    // Log for audit
    console.log('[API] Document anchored:', {
      documentHash: body.documentHash,
      issuer: body.issuerAddress,
      txHash,
    })

    return NextResponse.json(
      {
        success: true,
        txHash,
        documentHash: body.documentHash,
        timestamp,
        status: 'confirmed',
        message: 'Document successfully anchored on the blockchain',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API] Anchor document error:', error)
    return NextResponse.json(
      { error: 'Failed to anchor document' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/anchor?hash=...
 * Retrieve anchor status for a document
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

    const record = anchoredDocuments.get(hash)

    if (!record) {
      return NextResponse.json(
        { error: 'Document not found', hash },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      document: record,
    })
  } catch (error) {
    console.error('[API] Get anchor status error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve anchor status' },
      { status: 500 }
    )
  }
}
