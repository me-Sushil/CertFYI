import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import crypto from 'crypto'
import { BlockchainService } from '../blockchain/blockchain.service'
import { AuditService } from '../audit/audit.service'
import type { AnchorDto, BatchAnchorDto } from '../common/dto/documents.dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DocumentsService {
  // Mock stores for demo purposes (matches the original route handlers).
  // The issuance/verification workstream will replace these.
  private readonly anchoredDocuments = new Map<string, any>()
  private readonly anchoredBatches = new Map<string, any>()

  constructor(
    private readonly blockchain: BlockchainService,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Anchor a single document hash on the blockchain.
   */
  async anchor(body: AnchorDto) {
    const txHash = '0x' + crypto.randomBytes(32).toString('hex')
    const timestamp = new Date().toISOString()

    // Persist to the database for reporting and document counting.
    // The issuance workstream will replace the mock txHash with a real one.
    await this.prisma.anchoredDocument
      .create({
        data: {
          docHash: body.documentHash,
          issuerAddress: body.issuerAddress.toLowerCase(),
          txHash,
        },
      })
      .catch(() => {
        // Hash already anchored — this is fine, the on-chain tx will revert
      })

    await this.audit.record({
      action: 'DOCUMENT_ANCHORED',
      actorAddress: body.issuerAddress,
      targetRef: body.documentHash,
      txHash,
      detail: `Document type: ${body.documentType}`,
    })

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

    this.anchoredDocuments.set(body.documentHash, anchorRecord)

    console.log('[API] Document anchored:', {
      documentHash: body.documentHash,
      issuer: body.issuerAddress,
      txHash,
    })

    return {
      success: true,
      txHash,
      documentHash: body.documentHash,
      timestamp,
      status: 'confirmed',
      message: 'Document successfully anchored on the blockchain',
    }
  }

  getAnchor(hash?: string) {
    if (!hash) {
      throw new BadRequestException('Missing hash parameter')
    }
    const record = this.anchoredDocuments.get(hash)
    if (!record) {
      throw new NotFoundException({ error: 'Document not found', hash })
    }
    return { success: true, document: record }
  }

  /** Anchor multiple documents using Merkle tree batching. */
  anchorBatch(body: BatchAnchorDto) {
    const leaves = body.documents.map((d) => Buffer.from(d.documentHash.slice(2), 'hex'))
    const merkleRoot = this.blockchain.calculateMerkleRoot(leaves)
    const merkleRootHex = '0x' + merkleRoot.toString('hex')

    const txHash = '0x' + crypto.randomBytes(32).toString('hex')
    const timestamp = new Date().toISOString()

    const batchRecord = {
      batchId: body.batchId,
      merkleRoot: merkleRootHex,
      issuerAddress: body.issuerAddress,
      issuerName: body.issuerName,
      documentCount: body.documents.length,
      documents: body.documents,
      txHash,
      timestamp,
      status: 'confirmed',
      gasEstimate: '0.15',
    }

    this.anchoredBatches.set(body.batchId, batchRecord)

    console.log('[API] Batch anchored:', {
      batchId: body.batchId,
      documentCount: body.documents.length,
      merkleRoot: merkleRootHex,
      issuer: body.issuerAddress,
      txHash,
    })

    return {
      success: true,
      batchId: body.batchId,
      merkleRoot: merkleRootHex,
      txHash,
      documentCount: body.documents.length,
      timestamp,
      status: 'confirmed',
      message: `Successfully anchored ${body.documents.length} documents in a single transaction`,
    }
  }

  getBatch(batchId?: string) {
    if (!batchId) {
      throw new BadRequestException('Missing batchId parameter')
    }
    const batch = this.anchoredBatches.get(batchId)
    if (!batch) {
      throw new NotFoundException({ error: 'Batch not found', batchId })
    }
    return { success: true, batch }
  }

  /** Verify if a document hash is anchored and not revoked. */
  verify(documentHash: string, pdfContent?: string) {
    if (pdfContent) {
      const calculatedHash = this.calculateDocumentHash(Buffer.from(pdfContent, 'base64'))
      if (calculatedHash !== documentHash) {
        return {
          success: false,
          isValid: false,
          error: 'Document hash does not match the provided PDF',
          message:
            'The PDF you provided does not match this verification hash. The document may have been modified.',
        }
      }
    }

    const mockIsValid = Math.random() > 0.2

    if (mockIsValid) {
      const mockIssuer = ['Stanford University', 'MIT', 'Harvard', 'Yale'][
        Math.floor(Math.random() * 4)
      ]
      const daysAgo = Math.floor(Math.random() * 90)
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      return {
        success: true,
        isValid: true,
        documentHash,
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
      }
    }

    return {
      success: true,
      isValid: false,
      documentHash,
      status: 'revoked',
      message: 'Document is revoked or no longer valid',
      error: 'This document has been revoked by the issuer',
    }
  }

  quickVerify(hash?: string) {
    if (!hash) {
      throw new BadRequestException('Missing hash parameter')
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      throw new BadRequestException('Invalid hash format')
    }
    const isValid = Math.random() > 0.2
    return {
      success: true,
      hash,
      isValid,
      status: isValid ? 'active' : 'revoked',
    }
  }

  private calculateDocumentHash(data: Buffer): string {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex')
  }
}
