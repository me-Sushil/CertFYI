import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import type { AccessRequestDto } from '../common/dto/issuer.dto'

@Injectable()
export class IssuerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
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

  async getDocuments(address: string, cursor?: string) {
    const normalized = address.toLowerCase()
    const limit = 20
    const cursorObj = cursor ? { docHash: cursor } : undefined

    const docs = await this.prisma.anchoredDocument.findMany({
      where: { issuerAddress: normalized },
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
      anchoredAt: d.anchoredAt.toISOString(),
      revokedAt: d.revokedAt?.toISOString() ?? null,
      status: d.revokedAt ? 'revoked' as const : 'active' as const,
    }))

    return {
      documents,
      nextCursor: hasMore ? documents[documents.length - 1]?.docHash ?? null : null,
    }
  }

  async getActivity(address: string) {
    const normalized = address.toLowerCase()

    const entries = await this.prisma.auditLog.findMany({
      where: { actorAddress: normalized },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { action: true, detail: true, createdAt: true, txHash: true },
    })

    return {
      entries: entries.map((e) => ({
        action: e.action,
        detail: e.detail ?? undefined,
        createdAt: e.createdAt.toISOString(),
        txHash: e.txHash ?? undefined,
      })),
    }
  }
}
