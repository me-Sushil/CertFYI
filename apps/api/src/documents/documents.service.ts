import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import crypto from 'crypto'
import type { AnchoredDocument } from '@prisma/client'
import type { Hex } from 'viem'
import { BlockchainService } from '../blockchain/blockchain.service'
import { AuditService } from '../audit/audit.service'
import { IpfsService } from '../ipfs/ipfs.service'
import type { AnchorDto, BatchAnchorDto } from '../common/dto/documents.dto'
import { PrismaService } from '../prisma/prisma.service'
import { buildMetadataSidecar } from '../common/utils/metadata-sidecar.util'

@Injectable()
export class DocumentsService {
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
        status: 'confirmed',
        merkleRoot: null,
        batchId: null,
      },
    }
  }

  /**
   * Record a bulk anchor: many documents committed under one Merkle root in a
   * single transaction.
   *
   * The Merkle root is never trusted from the client - it is recomputed here
   * from the document hashes the caller wants persisted, then that exact
   * root is what gets verified against the chain. A client cannot claim a
   * document was part of a batch it wasn't actually anchored in.
   */
  async anchorBatch(body: BatchAnchorDto, issuerAddress: string) {
    const leaves = body.documents.map((d) => Buffer.from(d.documentHash.slice(2), 'hex'))
    const merkleRoot = this.blockchain.calculateMerkleRoot(leaves)
    const merkleRootHex = ('0x' + merkleRoot.toString('hex')) as Hex

    const verification = await this.blockchain.verifyMerkleBatchAnchor(
      merkleRootHex,
      body.txHash as Hex,
      issuerAddress,
    )
    if (!verification.ok) {
      throw new BadRequestException(verification.error ?? 'Could not verify the batch anchoring transaction')
    }

    const issuer = await this.prisma.issuer.findUnique({ where: { walletAddress: issuerAddress } })
    const issuerName = issuer?.organization ?? issuer?.name ?? null

    const existing = await this.prisma.anchoredDocument.findMany({
      where: { docHash: { in: body.documents.map((d) => d.documentHash) } },
      select: { docHash: true, txHash: true },
    })
    const conflicting = existing.find((e) => e.txHash.toLowerCase() !== body.txHash.toLowerCase())
    if (conflicting) {
      throw new ConflictException(
        `Document ${conflicting.docHash} was already anchored by a different transaction`,
      )
    }
    const alreadyRecorded = new Set(existing.map((e) => e.docHash))

    const records: AnchoredDocument[] = []
    for (const doc of body.documents) {
      if (alreadyRecorded.has(doc.documentHash)) {
        records.push(await this.prisma.anchoredDocument.findUniqueOrThrow({ where: { docHash: doc.documentHash } }))
        continue
      }

      const metadataCid = await this.pinMetadataSidecar({
        documentHash: doc.documentHash,
        issuerAddress,
        issuerName,
        documentType: body.documentType,
        txHash: body.txHash,
        cid: doc.cid ?? null,
        recipientEmail: doc.recipientEmail,
        recipientName: doc.recipientName,
      })

      records.push(
        await this.prisma.anchoredDocument.create({
          data: {
            docHash: doc.documentHash,
            issuerAddress,
            issuerName,
            documentType: body.documentType,
            recipientName: doc.recipientName,
            recipientEmail: doc.recipientEmail,
            cid: doc.cid ?? null,
            metadataCid,
            txHash: body.txHash,
            batchId: body.batchId,
          },
        }),
      )
    }

    if (existing.length === 0) {
      await this.audit.record({
        action: 'BATCH_ANCHORED',
        actorAddress: issuerAddress,
        targetRef: body.batchId,
        txHash: body.txHash,
        detail: `${body.documents.length} documents, merkleRoot: ${merkleRootHex}`,
      })
    }

    return {
      success: true,
      batchId: body.batchId,
      merkleRoot: merkleRootHex,
      txHash: body.txHash,
      documentCount: records.length,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      message: `Successfully anchored ${records.length} documents in a single transaction`,
    }
  }

  async getBatch(batchId?: string) {
    if (!batchId) {
      throw new BadRequestException('Missing batchId parameter')
    }
    const documents = await this.prisma.anchoredDocument.findMany({ where: { batchId } })
    if (documents.length === 0) {
      throw new NotFoundException({ error: 'Batch not found', batchId })
    }

    return {
      success: true,
      batch: {
        batchId,
        issuerAddress: documents[0].issuerAddress,
        issuerName: documents[0].issuerName ?? undefined,
        documentCount: documents.length,
        documents: documents.map((d) => ({
          documentHash: d.docHash,
          recipientEmail: d.recipientEmail ?? undefined,
          recipientName: d.recipientName ?? undefined,
          cid: d.cid ?? undefined,
        })),
        txHash: documents[0].txHash,
        timestamp: documents[0].anchoredAt.toISOString(),
        status: 'confirmed',
      },
    }
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

    // Fire-and-forget: log every verification for platform stats without
    // slowing the response or failing the request on a db hiccup.
    this.prisma.verificationLog.create({ data: {} }).catch(() => {})

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

    this.prisma.verificationLog.create({ data: {} }).catch(() => {})

    const onChain = await this.blockchain.getOnChainDocument(hash as Hex)
    return {
      success: true,
      hash,
      isValid: !!onChain,
      status: onChain ? 'active' : 'not_found',
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
