import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import crypto from 'crypto'
import type { Hex } from 'viem'
import { BlockchainService } from '../blockchain/blockchain.service'
import { AuditService } from '../audit/audit.service'
import { IpfsService } from '../ipfs/ipfs.service'
import type { AnchorDto, BatchAnchorDto, RevokeDocumentDto } from '../common/dto/documents.dto'
import { PrismaService } from '../prisma/prisma.service'
import { buildMetadataSidecar } from '../common/utils/metadata-sidecar.util'

@Injectable()
export class DocumentsService {
  // Batch anchoring is out of scope for this workstream (owned by the
  // issuance/bulk-issue workstream) - kept as the original in-memory mock.
  private readonly anchoredBatches = new Map<string, any>()

  constructor(
    private readonly blockchain: BlockchainService,
    private readonly audit: AuditService,
    private readonly ipfs: IpfsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Record a single document anchor.
   *
   * The issuer has already signed and confirmed `anchorDocument` on-chain in
   * their own wallet; this verifies that receipt before writing anything, so
   * the database can never disagree with the chain (BUG-8's pattern, applied
   * to issuance).
   */
  async anchor(body: AnchorDto, issuerAddress: string) {
    const verification = await this.blockchain.verifyDocumentAnchor(
      body.documentHash as Hex,
      body.txHash as Hex,
      issuerAddress,
    )
    if (!verification.ok) {
      throw new BadRequestException(verification.error ?? 'Could not verify the anchoring transaction')
    }

    const existing = await this.prisma.anchoredDocument.findUnique({
      where: { docHash: body.documentHash },
    })
    // The contract itself reverts a second anchorDocument for the same hash,
    // so a successful receipt for a hash we already recorded is a retried
    // recording call after a network blip, not a new document - idempotent.
    if (existing && existing.txHash.toLowerCase() !== body.txHash.toLowerCase()) {
      throw new ConflictException('This document hash was anchored by a different transaction')
    }

    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: issuerAddress } })
    const issuerName = issuer?.organization ?? issuer?.name ?? null

    const metadataCid = await this.pinMetadataSidecar({
      documentHash: body.documentHash,
      issuerAddress,
      issuerName,
      documentType: body.documentType,
      txHash: body.txHash,
      cid: body.cid ?? null,
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
    })

    const record = await this.prisma.anchoredDocument.upsert({
      where: { docHash: body.documentHash },
      create: {
        docHash: body.documentHash,
        issuerAddress,
        issuerName,
        documentType: body.documentType,
        recipientName: body.recipientName ?? null,
        recipientEmail: body.recipientEmail ?? null,
        cid: body.cid ?? null,
        metadataCid,
        txHash: body.txHash,
      },
      update: {},
    })

    if (!existing) {
      await this.audit.record({
        action: 'DOCUMENT_ANCHORED',
        actorAddress: issuerAddress,
        targetRef: body.documentHash,
        txHash: body.txHash,
        detail: `Document type: ${body.documentType}`,
      })

      if (this.ipfs.isConfigured() && !metadataCid) {
        await this.audit.record({
          action: 'IPFS_PIN_FAILED',
          actorAddress: issuerAddress,
          targetRef: body.documentHash,
          detail: 'Metadata sidecar pin failed',
        })
      }
    }

    return {
      success: true,
      txHash: record.txHash,
      documentHash: record.docHash,
      cid: record.cid,
      metadataCid: record.metadataCid,
      timestamp: record.anchoredAt.toISOString(),
      status: 'confirmed',
      message: 'Document successfully anchored on the blockchain',
    }
  }

  /**
   * Record a document revocation.
   *
   * Mirrors `anchor`: the issuer has already signed and confirmed
   * `revokeDocument` on-chain in their own wallet; this verifies that receipt
   * before writing anything. Scoped to the document's own issuer - the
   * contract also allows ADMIN_ROLE to revoke, but that path belongs to an
   * admin-facing endpoint, not this issuer-only one.
   */
  async revoke(body: RevokeDocumentDto, issuerAddress: string) {
    const record = await this.prisma.anchoredDocument.findUnique({
      where: { docHash: body.documentHash },
    })
    if (!record) {
      throw new NotFoundException({ error: 'Document not found', hash: body.documentHash })
    }
    if (record.issuerAddress !== issuerAddress) {
      throw new ForbiddenException('This document was not issued by the current session')
    }

    if (record.revokedAt) {
      return {
        success: true,
        documentHash: record.docHash,
        txHash: record.revokeTxHash ?? record.txHash,
        revokedAt: record.revokedAt.toISOString(),
        message: 'Document already revoked',
      }
    }

    const verification = await this.blockchain.verifyDocumentRevoke(
      body.documentHash as Hex,
      body.txHash as Hex,
      issuerAddress,
    )
    if (!verification.ok) {
      throw new BadRequestException(verification.error ?? 'Could not verify the revocation transaction')
    }

    const updated = await this.prisma.anchoredDocument.update({
      where: { docHash: body.documentHash },
      data: { revokedAt: new Date(), revokeTxHash: body.txHash },
    })

    await this.audit.record({
      action: 'DOCUMENT_REVOKED',
      actorAddress: issuerAddress,
      targetRef: body.documentHash,
      txHash: body.txHash,
    })

    return {
      success: true,
      documentHash: updated.docHash,
      txHash: body.txHash,
      revokedAt: updated.revokedAt!.toISOString(),
      message: 'Document revoked',
    }
  }

  async getAnchor(hash?: string) {
    if (!hash) {
      throw new BadRequestException('Missing hash parameter')
    }
    const record = await this.prisma.anchoredDocument.findUnique({ where: { docHash: hash } })
    if (!record) {
      throw new NotFoundException({ error: 'Document not found', hash })
    }
    return {
      success: true,
      document: {
        documentHash: record.docHash,
        documentType: record.documentType ?? '',
        recipientEmail: record.recipientEmail ?? undefined,
        recipientName: record.recipientName ?? undefined,
        issuerAddress: record.issuerAddress,
        issuerName: record.issuerName ?? undefined,
        txHash: record.txHash,
        cid: record.cid,
        metadataCid: record.metadataCid,
        timestamp: record.anchoredAt.toISOString(),
        status: record.revokedAt ? 'revoked' : 'confirmed',
        merkleRoot: null,
        batchId: null,
      },
    }
  }

  /** Anchor multiple documents using Merkle tree batching. Out of scope - kept as the original mock. */
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

  /**
   * Verify a document hash against the chain.
   *
   * The chain is the trust root (NFR Availability): this reads directly from
   * `DocumentAnchor.getDocument`, not from our database, so verification keeps
   * working even if the index is stale or the database is unreachable for
   * anything but the display-only fields (issuer name, CID).
   */
  async verify(documentHash: string, pdfContent?: string) {
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

    const onChain = await this.blockchain.getOnChainDocument(documentHash as Hex)

    if (!onChain) {
      return {
        success: true,
        isValid: false,
        documentHash,
        status: 'not_found',
        message: 'This hash has not been anchored on the blockchain.',
        error: 'Document not found on-chain',
      }
    }

    const record = await this.prisma.anchoredDocument.findUnique({ where: { docHash: documentHash } })
    const issuer = await this.prisma.issuer.findUnique({
      where: { walletAddress: onChain.issuer.toLowerCase() },
    })
    const issuerLabel =
      record?.issuerName ?? issuer?.organization ?? issuer?.name ?? onChain.issuer

    const receiptSummary = record ? await this.blockchain.getReceiptSummary(record.txHash as Hex) : null

    const base = {
      success: true,
      documentHash,
      issuer: issuerLabel,
      documentType: onChain.documentType,
      issuedDate: new Date(onChain.timestamp * 1000).toISOString(),
      cid: record?.cid ?? null,
      gatewayUrl: record?.cid ? this.ipfs.gatewayUrl(record.cid) : null,
      onchainData: record
        ? {
            transactionHash: record.txHash,
            blockNumber: receiptSummary?.blockNumber ?? 0,
            network: this.blockchain.chainName(),
          }
        : undefined,
    }

    if (onChain.revoked) {
      return {
        ...base,
        isValid: false,
        status: 'revoked',
        message: 'This document has been revoked by its issuer.',
        error: 'Document is revoked',
      }
    }

    return {
      ...base,
      isValid: true,
      status: 'active',
      message: 'Document verified successfully',
    }
  }

  async quickVerify(hash?: string) {
    if (!hash) {
      throw new BadRequestException('Missing hash parameter')
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      throw new BadRequestException('Invalid hash format')
    }
    const onChain = await this.blockchain.getOnChainDocument(hash as Hex)
    const isValid = !!onChain && !onChain.revoked
    return {
      success: true,
      hash,
      isValid,
      status: !onChain ? 'not_found' : onChain.revoked ? 'revoked' : 'active',
    }
  }

  /**
   * Pins the public, non-identifying metadata sidecar (SRS §8.2, adjusted per
   * §5/§12 - see docs/adr). Never includes plaintext recipient PII: only an
   * opaque `recipientRef` hash, mirroring SRS §8.1's on-chain rule.
   */
  private async pinMetadataSidecar(input: {
    documentHash: string
    issuerAddress: string
    issuerName: string | null
    documentType: string
    txHash: string
    cid: string | null
    recipientEmail?: string
    recipientName?: string
  }): Promise<string | null> {
    if (!this.ipfs.isConfigured()) return null

    const sidecar = buildMetadataSidecar({
      documentHash: input.documentHash,
      issuerAddress: input.issuerAddress,
      issuerName: input.issuerName,
      documentType: input.documentType,
      issuedAt: new Date().toISOString(),
      chainId: this.blockchain.contractChainId,
      txHash: input.txHash,
      cid: input.cid,
      revoked: false,
      recipientEmail: input.recipientEmail,
      recipientName: input.recipientName,
    })

    const outcome = await this.ipfs.pinJson(sidecar, `${input.documentHash}.metadata`)
    return outcome.pinned ? outcome.cid : null
  }

  private calculateDocumentHash(data: Buffer): string {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex')
  }
}
