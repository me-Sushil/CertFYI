'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ChainBanner } from '@/components/admin/chain-banner'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { useAuditLog } from '@/queries/admin'
import { CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import { formatDateTime, formatAddress } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AuditLogEntry } from '@/lib/api-types'

const ACTION_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ISSUER_APPROVED', label: 'Approved' },
  { value: 'ISSUER_REJECTED', label: 'Rejected' },
  { value: 'ISSUER_SUSPENDED', label: 'Suspended' },
  { value: 'ISSUER_REACTIVATED', label: 'Reactivated' },
  { value: 'ISSUER_METADATA_SET', label: 'Metadata Set' },
  { value: 'DOCUMENT_ANCHORED', label: 'Anchored' },
  { value: 'IPFS_PIN_FAILED', label: 'IPFS Failed' },
] as const

const ACTION_DOT: Record<string, string> = {
  ISSUER_APPROVED: 'bg-success',
  ISSUER_REACTIVATED: 'bg-success',
  DOCUMENT_ANCHORED: 'bg-success',
  ISSUER_REJECTED: 'bg-destructive',
  ISSUER_SUSPENDED: 'bg-destructive',
  IPFS_PIN_FAILED: 'bg-destructive',
}

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')

  const {
    data: pagesData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useAuditLog(true, {
    action: filterAction !== 'ALL' ? filterAction : undefined,
    actor: searchTerm || undefined,
  })

  const entries = pagesData?.pages.flatMap((p) => p.entries) ?? []

  const exportUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/audit-log/export${filterAction !== 'ALL' ? `?action=${filterAction}` : ''}${searchTerm ? `${filterAction !== 'ALL' ? '&' : '?'}actor=${encodeURIComponent(searchTerm)}` : ''}`

  return (
    <div className="animate-fade-in">
      <ChainBanner />

      <div className="mb-8">
        <h1 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
          Audit Log
        </h1>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Complete audit trail of all platform activity
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {ACTION_FILTERS.map((action) => (
            <Button
              key={action.value}
              variant={filterAction === action.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterAction(action.value)}
            >
              {action.label}
            </Button>
          ))}
        </div>
        <a href={exportUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        </a>
      </div>

      <div className="relative mb-8">
        <Search
          className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          placeholder="Filter by actor address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 w-full rounded-full border border-border/15 bg-card pr-5 pl-10 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
      </div>

      {isLoading ? (
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 border-b border-border/15 p-5 last:border-b-0">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon={FileText} title="No entries found" description="No audit entries match your current filters." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg bg-card shadow-card">
            {entries.map((entry, idx) => (
              <AuditLogEntryRow key={entry.id} entry={entry} isLast={idx === entries.length - 1} />
            ))}
          </div>

          {hasNextPage && (
            <div className="py-6 text-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AuditLogEntryRow({ entry, isLast }: { entry: AuditLogEntry; isLast: boolean }) {
  const explorerUrl = entry.txHash ? getExplorerUrl(entry.txHash, CONTRACT_CHAIN_ID) : null
  const dotTone = ACTION_DOT[entry.action] ?? 'bg-accent'

  return (
    <div
      className={cn(
        'p-5 transition-colors duration-150 ease-[var(--ease-premium)] hover:bg-muted/30 sm:p-6',
        !isLast && 'border-b border-border/15',
      )}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1.5 shrink-0">
          <div className={cn('h-2.5 w-2.5 rounded-full', dotTone)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-col items-start justify-between gap-4 sm:flex-row">
            <p className="text-sm font-extrabold text-foreground">{entry.action.replace(/_/g, ' ')}</p>
            <time className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
              {formatDateTime(entry.createdAt)}
            </time>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold">Actor:</span> {entry.actorName}
            </p>
            <p>
              <span className="font-semibold">Target:</span> {formatAddress(entry.targetRef)}
            </p>
            {entry.detail && (
              <p className="break-words">
                <span className="font-semibold">Details:</span> {entry.detail}
              </p>
            )}
            {explorerUrl && (
              <p>
                <span className="font-semibold">Tx:</span>{' '}
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-accent transition-opacity duration-150 hover:opacity-80"
                >
                  {formatAddress(entry.txHash!, 8)}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
