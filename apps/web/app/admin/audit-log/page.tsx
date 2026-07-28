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

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')

  const { data: pagesData, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = useAuditLog(true, {
    action: filterAction !== 'ALL' ? filterAction : undefined,
    actor: searchTerm || undefined,
  })

  const entries = pagesData?.pages.flatMap((p) => p.entries) ?? []

  const exportUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/audit-log/export${filterAction !== 'ALL' ? `?action=${filterAction}` : ''}${searchTerm ? `${filterAction !== 'ALL' ? '&' : '?'}actor=${encodeURIComponent(searchTerm)}` : ''}`

  return (
    <>
      <ChainBanner />

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all platform activity</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex gap-2 flex-wrap">
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
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </a>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by actor address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />
      </div>

      {isLoading ? (
        <div className="border border-border rounded-lg overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 sm:p-6 border-b border-border space-y-2">
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
          <div className="space-y-0 border border-border rounded-lg overflow-hidden">
            {entries.map((entry, idx) => (
              <AuditLogEntryRow
                key={entry.id}
                entry={entry}
                isLast={idx === entries.length - 1}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="text-center py-6">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </>
  )
}

function AuditLogEntryRow({ entry, isLast }: { entry: AuditLogEntry; isLast: boolean }) {
  const explorerUrl = entry.txHash ? getExplorerUrl(entry.txHash, CONTRACT_CHAIN_ID) : null

  return (
    <div className={`p-4 sm:p-6 border-b border-border hover:bg-muted/30 transition ${isLast ? 'border-b-0' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="mt-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2 flex-col sm:flex-row">
            <p className="font-semibold text-sm">{entry.action.replace(/_/g, ' ')}</p>
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDateTime(entry.createdAt)}
            </time>
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium">Actor:</span> {entry.actorName}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium">Target:</span> {formatAddress(entry.targetRef)}
            </p>
            {entry.detail && (
              <p className="text-muted-foreground break-words">
                <span className="font-medium">Details:</span> {entry.detail}
              </p>
            )}
            {explorerUrl && (
              <p className="text-muted-foreground">
                <span className="font-medium">Tx:</span>{' '}
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {formatAddress(entry.txHash!, 8)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
