'use client'

import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { SearchInput } from '@/components/ui/search-input'
import { FilterGroup } from '@/components/ui/filter-group'
import { LoadMoreButton } from '@/components/ui/load-more-button'
import { FileSpreadsheet, ExternalLink, ChevronDown, Loader2 } from 'lucide-react'
import { useAdminDocuments } from '@/queries/admin'
import { cn } from '@/lib/utils'
import { formatAddress, formatDate, formatRelativeTime } from '@/lib/format'
import { CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import type { AdminDocumentRow } from '@/lib/api-types'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REVOKED', label: 'Revoked' },
]

const DOC_BADGE: Record<string, { label: string; tone: 'success' | 'destructive' }> = {
  active: { label: 'Active', tone: 'success' },
  revoked: { label: 'Revoked', tone: 'destructive' },
}

export default function AdminDocumentsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch] = useDebounce(searchInput, 300)
  const [statusFilter, setStatusFilter] = useState('ALL')
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
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by name, email, type, or hash..."
          isSearchPending={isSearchPending}
          isFetching={docsQuery.isFetching && !docsQuery.isFetchingNextPage}
        />
        <FilterGroup options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
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
                      <StatusBadge {...DOC_BADGE[doc.status]} />
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
                      <StatusBadge {...DOC_BADGE[doc.status]} />
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

          <LoadMoreButton hasNextPage={docsQuery.hasNextPage} isFetchingNextPage={docsQuery.isFetchingNextPage} fetchNextPage={docsQuery.fetchNextPage} />
        </>
      )}
    </div>
  )
}
