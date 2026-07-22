import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * POST /api/pdf/upload
 * Upload and hash a PDF file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Calculate SHA256 hash
    const documentHash = '0x' + crypto.createHash('sha256').update(buffer).digest('hex')

    // In a real implementation, we would:
    // 1. Store the file in a cloud storage (Vercel Blob)
    // 2. Create a database record with file metadata
    // 3. Return a file reference for later verification

    console.log('[API] PDF uploaded:', {
      filename: file.name,
      size: file.size,
      documentHash,
    })

    return NextResponse.json(
      {
        success: true,
        filename: file.name,
        fileSize: file.size,
        documentHash,
        timestamp: new Date().toISOString(),
        message: 'PDF uploaded and hashed successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API] PDF upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload PDF' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pdf/hash
 * Calculate hash of a PDF already in the system
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.pdfContent || !body.filename) {
      return NextResponse.json(
        { error: 'Missing pdfContent or filename' },
        { status: 400 }
      )
    }

    // Decode base64 PDF
    const buffer = Buffer.from(body.pdfContent, 'base64')

    // Calculate hash
    const documentHash = '0x' + crypto.createHash('sha256').update(buffer).digest('hex')

    return NextResponse.json({
      success: true,
      filename: body.filename,
      documentHash,
      fileSize: buffer.length,
    })
  } catch (error) {
    console.error('[API] PDF hash error:', error)
    return NextResponse.json(
      { error: 'Failed to hash PDF' },
      { status: 500 }
    )
  }
}
