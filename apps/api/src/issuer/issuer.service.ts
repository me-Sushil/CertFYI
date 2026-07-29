import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { IpfsService } from '../ipfs/ipfs.service'
import { BlockchainService } from '../blockchain/blockchain.service'
import type { AccessRequestDto } from '../common/dto/issuer.dto'
import { DEFAULT_PAGE_SIZE } from '../common/constants/shared.constant'
import { buildMetadataSidecar } from '../common/utils/metadata-sidecar.util'

@Injectable()
export class IssuerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly ipfs: IpfsService,
    private readonly blockchain: BlockchainService,
  ) {}

  async submitRequest(address: string, data: AccessRequestDto) {
    const existing = await this.prisma.accessRequest.findUnique({
      where: { walletAddress: address },
    })

    if (existing && existing.status !== 'REJECTED') {
      throw new ConflictException(`Request already ${existing.status.toLowerCase()}`)
    }

    const accessRequest = await this.prisma.accessRequest.upsert({
      where: { walletAddress: address },
      create: {
        walletAddress: address,
        ...data,
        status: 'PENDING',
      },
      update: {
        ...data,
        status: 'PENDING',
        decidedAt: null,
        rejectionReason: null,
      },
    })

    return { requestStatus: accessRequest.status }
  }

  async getStatus(address: string) {
    const accessRequest = await this.prisma.accessRequest.findUnique({
      where: { walletAddress: address },
    })

    return { requestStatus: accessRequest?.status ?? 'NONE' }
  }

  async getStats(address: string) {
    const normalized = address.toLowerCase()

    const [totalIssued, activeDocuments, revokedCount, recentActivityCount] = await Promise.all([
      this.prisma.anchoredDocument.count({ where: { issuerAddress: normalized } }),
      this.prisma.anchoredDocument.count({ where: { issuerAddress: normalized, revokedAt: null } }),
      this.prisma.anchoredDocument.count({ where: { issuerAddress: normalized, revokedAt: { not: null } } }),
      this.prisma.auditLog.count({
        where: { actorAddress: normalized },
      }),
    ])

    return { totalIssued, activeDocuments, revokedCount, recentActivityCount }
  }

  async getDocuments(
    address: string,
    params: { status?: 'all' | 'active' | 'revoked'; search?: string; cursor?: string } = {},
  ) {
    const normalized = address.toLowerCase()
    const limit = DEFAULT_PAGE_SIZE
    const cursorObj = params.cursor ? { docHash: params.cursor } : undefined

    const where: Record<string, unknown> = { issuerAddress: normalized }
    if (params.status === 'active') where.revokedAt = null
    if (params.status === 'revoked') where.revokedAt = { not: null }
    if (params.search) {
      where.OR = [
        { recipientName: { contains: params.search, mode: 'insensitive' } },
        { recipientEmail: { contains: params.search, mode: 'insensitive' } },
        { documentType: { contains: params.search, mode: 'insensitive' } },
        { docHash: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const docs = await this.prisma.anchoredDocument.findMany({
      where,
      orderBy: { anchoredAt: 'desc' },
      take: limit + 1,
      ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
    })

    const hasMore = docs.length > limit
    if (hasMore) docs.pop()

    const documents = docs.map((d) => ({
      docHash: d.docHash,
      documentType: d.documentType ?? undefined,
      recipientName: d.recipientName ?? undefined,
      recipientEmail: d.recipientEmail ?? undefined,
      txHash: d.txHash,
      cid: d.cid,
      metadataCid: d.metadataCid,
      anchoredAt: d.anchoredAt.toISOString(),
      revokedAt: d.revokedAt?.toISOString() ?? null,
      revokeTxHash: d.revokeTxHash ?? undefined,
      status: d.revokedAt ? 'revoked' as const : 'active' as const,
    }))

    return {
      documents,
      nextCursor: hasMore ? documents[documents.length - 1]?.docHash ?? null : null,
    }
  }

  async getActivity(address: string, params: { action?: string; cursor?: string } = {}) {
    const normalized = address.toLowerCase()
    const limit = DEFAULT_PAGE_SIZE

    const where: Record<string, unknown> = { actorAddress: normalized }
    if (params.action && params.action !== 'ALL') where.action = params.action
    const cursorObj = params.cursor ? { id: params.cursor } : undefined

    const entries = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
      select: { id: true, action: true, detail: true, createdAt: true, txHash: true, targetRef: true },
    })

    const hasMore = entries.length > limit
    if (hasMore) entries.pop()

    return {
      entries: entries.map((e) => ({
        action: e.action,
        detail: e.detail ?? undefined,
        createdAt: e.createdAt.toISOString(),
        txHash: e.txHash ?? undefined,
        docHash: /^0x[a-fA-F0-9]{64}$/.test(e.targetRef) ? e.targetRef : undefined,
      })),
      nextCursor: hasMore ? entries[entries.length - 1]?.id ?? null : null,
    }
  }

  /**
   * Retries pinning the metadata sidecar for a document this issuer owns.
   *
   * The original PDF bytes are never stored server-side (hash first, upload
   * second - §7.5), so a failed *PDF* pin cannot be retried without the issuer
   * re-uploading the file. The metadata sidecar is different: everything it
   * contains already lives in `AnchoredDocument`, so it can be rebuilt and
   * re-pinned from the database alone.
   */
  async retryPin(address: string, docHash: string) {
    const normalized = address.toLowerCase()
    const record = await this.prisma.anchoredDocument.findUnique({ where: { docHash } })

    if (!record) {
      throw new NotFoundException({ error: 'Document not found', docHash })
    }
    if (record.issuerAddress !== normalized) {
      throw new ForbiddenException('This document was not issued by the current session')
    }
    if (record.metadataCid) {
      return { success: true, metadataCid: record.metadataCid, message: 'Already pinned' }
    }
    if (!this.ipfs.isConfigured()) {
      throw new NotFoundException({ error: 'IPFS is not configured' })
    }

    const sidecar = buildMetadataSidecar({
      documentHash: record.docHash,
      issuerAddress: record.issuerAddress,
      issuerName: record.issuerName,
      documentType: record.documentType,
      issuedAt: record.anchoredAt.toISOString(),
      chainId: this.blockchain.contractChainId,
      txHash: record.txHash,
      cid: record.cid,
      revoked: !!record.revokedAt,
      recipientEmail: record.recipientEmail,
      recipientName: record.recipientName,
    })

    const outcome = await this.ipfs.pinJson(sidecar, `${docHash}.metadata`)

    if (!outcome.pinned) {
      return { success: false, metadataCid: null, message: outcome.error }
    }

    await this.prisma.anchoredDocument.update({
      where: { docHash },
      data: { metadataCid: outcome.cid },
    })
    await this.audit.record({
      action: 'IPFS_PIN_RETRIED',
      actorAddress: normalized,
      targetRef: docHash,
      detail: 'Metadata sidecar pin retried successfully',
    })

    return { success: true, metadataCid: outcome.cid, message: 'Metadata sidecar pinned successfully' }
  }

  /**
   * Records an anchoring attempt that failed before or during confirmation -
   * a wallet rejection or an on-chain revert. There is nothing to verify
   * on-chain (that is the point: nothing was anchored), so this simply trusts
   * the session-authenticated issuer's report and writes an audit row. It
   * exists purely so a failed attempt is visible in Activity instead of
   * disappearing the moment the browser tab moves on.
   */
  async logFailedAnchor(address: string, docHash: string, txHash: string | undefined, reason: string) {
    await this.audit.record({
      action: 'DOCUMENT_ANCHOR_FAILED',
      actorAddress: address.toLowerCase(),
      targetRef: docHash,
      txHash,
      detail: reason,
    })
    return { success: true }
  }
}
