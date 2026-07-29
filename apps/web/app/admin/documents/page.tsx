'use client'

import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileSpreadsheet, Search, Loader2, ExternalLink, ChevronDown, Inbox } from 'lucide-react'
import { useAdminDocuments } from '@/queries/admin'
import { cn } from '@/lib/utils'
import { formatAddress, formatDate, formatRelativeTime } from '@/lib/format'
import { CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import type { AdminDocumentRow } from '@/lib/api-types'

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'REVOKED'] as const

function StatusBadge({ status }: { status: 'active' | 'revoked' }) {
  const isActive = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-success' : 'bg-destructive')} />
      {isActive ? 'Active' : 'Revoked'}
    </span>
  )
}

export default function AdminDocumentsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch] = useDebounce(searchInput, 300)
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  const docsQuery = useAdminDocuments(true, {
    status: statusFilter,
    search: debouncedSearch || undefined,
  })

  const documents = useMemo(
    () => docsQuery.data?.pages.flatMap((p) => p.documents) ?? [],
    [docsQuery.data],
  )
  const totalLoaded = documents.length
  const isSearchPending = searchInput !== debouncedSearch
  const docsLoading = docsQuery.isLoading

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          {isSearchPending || (docsQuery.isFetching && !docsQuery.isFetchingNextPage) ? (
            <Loader2
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : (
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          )}
          <input
            type="text"
            placeholder="Search by name, email, type, or hash..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 w-full rounded-xl border border-border/10 bg-card pl-10 pr-4 text-sm text-foreground outline-none ring-1 ring-border/5 transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-accent/30 focus:ring-accent/10"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)]',
                statusFilter === opt
                  ? 'bg-primary text-primary-foreground shadow-button'
                  : 'bg-card text-muted-foreground shadow-soft ring-1 ring-border/5 hover:text-foreground',
              )}
            >
              {opt === 'ALL' ? 'All' : opt.charAt(0) + opt.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-5 text-sm font-semibold text-muted-foreground">
        {docsLoading ? 'Loading...' : `Showing ${totalLoaded} document${totalLoaded !== 1 ? 's' : ''}${docsQuery.hasNextPage ? '+' : ''}`}
      </p>

      {docsLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[20px] bg-card/50 shadow-soft ring-1 ring-border/5" />
          ))}
        </div>
      )}

      {!docsLoading && documents.length === 0 && (
        <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
          <FileSpreadsheet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-semibold text-muted-foreground">
            {debouncedSearch || statusFilter !== 'ALL' ? 'No documents match your search' : 'No documents anchored yet'}
          </p>
        </div>
      )}

      {!docsLoading && documents.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-[20px] bg-card shadow-card ring-1 ring-border/5 sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/10">
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Issuer</th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Recipient</th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Anchored</th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-extrabold text-foreground" />
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.docHash}
                    className="group border-b border-border/5 transition-colors last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-6 py-4">
                      <p className="truncate font-semibold text-foreground">
                        {doc.issuerName || formatAddress(doc.issuerAddress, 6)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {doc.issuerName ? formatAddress(doc.issuerAddress, 6) : null}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {doc.recipientName || '—'}
                      </p>
                      {doc.recipientEmail && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{doc.recipientEmail}</p>
                      )}
                    </td>
                    <td className="truncate px-6 py-4 text-sm text-muted-foreground">{doc.documentType || '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <span title={formatDate(doc.anchoredAt)}>{formatRelativeTime(doc.anchoredAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.txHash && (
                        <a
                          href={getExplorerUrl(doc.txHash, CONTRACT_CHAIN_ID) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                          aria-label="View on explorer"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {documents.map((doc) => {
              const isOpen = expanded === doc.docHash
              return (
                <div key={doc.docHash} className="rounded-[20px] bg-card shadow-card ring-1 ring-border/5 transition-all duration-200">
                  <button
                    onClick={() => setExpanded(isOpen ? null : doc.docHash)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {doc.recipientName || doc.documentType || 'Document'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {doc.issuerName || formatAddress(doc.issuerAddress, 4)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={doc.status} />
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-border/10 px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-semibold text-muted-foreground mb-0.5">Issuer</p>
                          <p className="text-foreground">{doc.issuerName || formatAddress(doc.issuerAddress, 6)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground mb-0.5">Type</p>
                          <p className="text-foreground">{doc.documentType || '—'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground mb-0.5">Recipient</p>
                          <p className="text-foreground">{doc.recipientName || '—'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground mb-0.5">Anchored</p>
                          <p className="text-foreground">{formatRelativeTime(doc.anchoredAt)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-semibold text-muted-foreground mb-0.5">Document Hash</p>
                          <p className="font-mono break-all text-foreground">{formatAddress(doc.docHash, 8)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-semibold text-muted-foreground mb-0.5">Transaction</p>
                          <p className="font-mono break-all text-foreground">{formatAddress(doc.txHash, 8)}</p>
                        </div>
                      </div>
                      {doc.txHash && (
                        <a
                          href={getExplorerUrl(doc.txHash, CONTRACT_CHAIN_ID) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-accent/10 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                          View on Explorer
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {docsQuery.hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => docsQuery.fetchNextPage()}
                disabled={docsQuery.isFetchingNextPage}
              >
                {docsQuery.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
