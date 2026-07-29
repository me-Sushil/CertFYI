import { Injectable } from '@nestjs/common'
import type { AuditAction } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export interface AuditRecordParams {
  action: AuditAction
  actorAddress: string
  targetRef: string
  txHash?: string
  detail?: string
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: AuditRecordParams): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: params.action,
        actorAddress: params.actorAddress.toLowerCase(),
        targetRef: params.targetRef,
        txHash: params.txHash ?? null,
        detail: params.detail ?? null,
      },
    })
  }

  async find(params: {
    action?: string
    actor?: string
    from?: string
    to?: string
    cursor?: string
    limit?: number
  }) {
    const limit = Math.min(params.limit ?? 20, 100)
    const where = this.buildWhere(params)
    const cursorObj = params.cursor ? { id: params.cursor } : undefined

    const entries = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
    })

    const hasMore = entries.length > limit
    if (hasMore) entries.pop()

    return {
      entries: await this.resolveNames(entries),
      nextCursor: hasMore ? entries[entries.length - 1]?.id ?? null : null,
    }
  }

  /** Unpaginated fetch for CSV export - bypasses the 100-row page-size cap on `find`. */
  async findForExport(params: { action?: string; actor?: string; from?: string; to?: string }) {
    const where = this.buildWhere(params)
    const entries = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10_000,
    })
    return { entries: await this.resolveNames(entries) }
  }

  private buildWhere(params: { action?: string; actor?: string; from?: string; to?: string }) {
    const where: Record<string, unknown> = {}
    if (params.action && params.action !== 'ALL') {
      where.action = params.action
    }
    if (params.actor) {
      where.actorAddress = params.actor.toLowerCase()
    }
    if (params.from || params.to) {
      const createdAt: Record<string, Date> = {}
      if (params.from) createdAt.gte = new Date(params.from)
      if (params.to) createdAt.lte = new Date(params.to)
      where.createdAt = createdAt
    }
    return where
  }

  private async resolveNames(
    entries: Array<{
      id: string
      action: string
      actorAddress: string
      targetRef: string
      txHash: string | null
      detail: string | null
      createdAt: Date
    }>,
  ) {
    const walletAddresses = entries.map((e) => e.actorAddress)
    const issuers = await this.prisma.issuer.findMany({
      where: { walletAddress: { in: walletAddresses } },
      select: { walletAddress: true, organization: true, name: true },
    })
    const nameMap = new Map(
      issuers.map((i) => [i.walletAddress, i.organization ?? i.name ?? i.walletAddress.slice(0, 10)]),
    )

    return entries.map((e) => ({
      ...e,
      actorName: nameMap.get(e.actorAddress) ?? e.actorAddress.slice(0, 10),
    }))
  }

  async countByAction(action: AuditAction): Promise<number> {
    return this.prisma.auditLog.count({ where: { action } })
  }
}
