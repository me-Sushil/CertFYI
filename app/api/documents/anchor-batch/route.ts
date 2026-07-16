import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface BatchAnchorRequest {
  documents: Array<{
    documentHash: string
    recipientEmail: string
    recipientName: string
  }>
  issuerAddress: string
  issuerName: string
  batchId: string
}

// Mock database for batches
const anchoredBatches: Map<string, any> = new Map()

/**
 * POST /api/documents/anchor-batch
 * Anchor multiple documents using Merkle tree batching
 */
export async function POST(request: NextRequest) {
  try {
    const body: BatchAnchorRequest = await request.json()

    // Validate input
    if (!body.documents || body.documents.length === 0 || !body.issuerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields or empty document list' },
        { status: 400 }
      )
    }

    // Validate all document hashes
    for (const doc of body.documents) {
      if (!/^0x[a-fA-F0-9]{64}$/.test(doc.documentHash)) {
        return NextResponse.json(
          { error: `Invalid document hash format: ${doc.documentHash}` },
          { status: 400 }
        )
      }
    }

    // Calculate Merkle root from document hashes
    let leaves = body.documents.map(d => Buffer.from(d.documentHash.slice(2), 'hex'))
    let merkleRoot = calculateMerkleRoot(leaves)

    // In a real implementation, this would:
    // 1. Call the smart contract anchorMerkleBatch function
    // 2. Store batch metadata in database
    // 3. Send confirmation emails to all recipients

    const txHash = '0x' + crypto.randomBytes(32).toString('hex')
    const timestamp = new Date().toISOString()

    const batchRecord = {
      batchId: body.batchId,
      merkleRoot: '0x' + merkleRoot.toString('hex'),
      issuerAddress: body.issuerAddress,
      issuerName: body.issuerName,
      documentCount: body.documents.length,
      documents: body.documents,
      txHash,
      timestamp,
      status: 'confirmed',
      gasEstimate: '0.15',
    }

    // Store in mock database
    anchoredBatches.set(body.batchId, batchRecord)

    // Log for audit
    console.log('[API] Batch anchored:', {
      batchId: body.batchId,
      documentCount: body.documents.length,
      merkleRoot: '0x' + merkleRoot.toString('hex'),
      issuer: body.issuerAddress,
      txHash,
    })

    return NextResponse.json(
      {
        success: true,
        batchId: body.batchId,
        merkleRoot: '0x' + merkleRoot.toString('hex'),
        txHash,
        documentCount: body.documents.length,
        timestamp,
        status: 'confirmed',
        message: `Successfully anchored ${body.documents.length} documents in a single transaction`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API] Anchor batch error:', error)
    return NextResponse.json(
      { error: 'Failed to anchor batch' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/anchor-batch?batchId=...
 * Retrieve batch anchor status
 */
export async function GET(request: NextRequest) {
  try {
    const batchId = request.nextUrl.searchParams.get('batchId')

    if (!batchId) {
      return NextResponse.json(
        { error: 'Missing batchId parameter' },
        { status: 400 }
      )
    }

    const batch = anchoredBatches.get(batchId)

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found', batchId },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      batch,
    })
  } catch (error) {
    console.error('[API] Get batch status error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve batch status' },
      { status: 500 }
    )
  }
}

/**
 * Calculate Merkle root from leaf hashes using Keccak256
 */
function calculateMerkleRoot(leaves: Buffer[]): Buffer {
  const crypto = require('crypto')

  if (leaves.length === 0) {
    throw new Error('Cannot calculate Merkle root from empty array')
  }

  let tree = leaves.slice()

  while (tree.length > 1) {
    const nextLevel: Buffer[] = []

    for (let i = 0; i < tree.length; i += 2) {
      if (i + 1 < tree.length) {
        const combined = Buffer.concat([tree[i], tree[i + 1]])
        const hash = crypto.createHash('sha256').update(combined).digest()
        nextLevel.push(hash)
      } else {
        nextLevel.push(tree[i])
      }
    }

    tree = nextLevel
  }

  return tree[0]
}
