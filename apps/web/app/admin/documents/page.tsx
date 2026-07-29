'use client'

import { Fragment, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { SearchInput } from '@/components/ui/search-input'
import { FilterGroup } from '@/components/ui/filter-group'
import { LoadMoreButton } from '@/components/ui/load-more-button'
import { FileSpreadsheet, ExternalLink, ChevronDown, Loader2, Layers } from 'lucide-react'
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

function BatchStatusSummary({ docs }: { docs: AdminDocumentRow[] }) {
  const activeCount = docs.filter((d) => d.status === 'active').length
  const revokedCount = docs.length - activeCount
  if (revokedCount === 0) return <StatusBadge {...DOC_BADGE.active} />
  if (activeCount === 0) return <StatusBadge {...DOC_BADGE.revoked} />
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
      {activeCount} active, {revokedCount} revoked
    </span>
  )
}

type DocListItem =
  | { kind: 'single'; doc: AdminDocumentRow }
  | { kind: 'batch'; batchId: string; docs: AdminDocumentRow[] }

function groupDocuments(documents: AdminDocumentRow[]): DocListItem[] {
  const items: DocListItem[] = []
  const batchIndex = new Map<string, number>()
  for (const doc of documents) {
    if (doc.batchId) {
      const idx = batchIndex.get(doc.batchId)
      if (idx === undefined) {
        batchIndex.set(doc.batchId, items.length)
        items.push({ kind: 'batch', batchId: doc.batchId, docs: [doc] })
      } else {
        const item = items[idx]
        if (item.kind === 'batch') item.docs.push(doc)
      }
    } else {
      items.push({ kind: 'single', doc })
    }
  }
  return items
}

function DocumentMobileCard({
  doc,
  isOpen,
  onToggle,
  nested = false,
}: {
  doc: AdminDocumentRow
  isOpen: boolean
  onToggle: () => void
  nested?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-[20px] bg-card shadow-card ring-1 ring-border/5 transition-all duration-200',
        nested && 'bg-muted/10 shadow-none ring-border/10',
      )}
    >
      <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-sm font-semibold text-foreground">
            {doc.recipientName || doc.documentType || 'Document'}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {doc.issuerName || formatAddress(doc.issuerAddress, 4)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge {...DOC_BADGE[doc.status]} />
          <ChevronDown
            className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')}
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
}

export default function AdminDocumentsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch] = useDebounce(searchInput, 300)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) => {
      const next = new Set(prev)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })
  }

  const docsQuery = useAdminDocuments(true, {
    status: statusFilter,
    search: debouncedSearch || undefined,
  })

  const documents = useMemo(
    () => docsQuery.data?.pages.flatMap((p) => p.documents) ?? [],
    [docsQuery.data],
  )
  const totalLoaded = documents.length
  const listItems = useMemo(() => groupDocuments(documents), [documents])
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
                {listItems.map((item) => {
                  if (item.kind === 'single') {
                    const doc = item.doc
                    return (
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
                    )
                  }

                  const isBatchOpen = expandedBatches.has(item.batchId)
                  const first = item.docs[0]
                  const sharedType = item.docs.every((d) => d.documentType === first.documentType)
                    ? first.documentType || '—'
                    : '—'
                  return (
                    <Fragment key={`batch-${item.batchId}`}>
                      <tr
                        onClick={() => toggleBatch(item.batchId)}
                        className="cursor-pointer border-b border-border/5 bg-accent/5 transition-colors hover:bg-accent/10"
                      >
                        <td className="px-6 py-4">
                          <p className="truncate font-semibold text-foreground">
                            {first.issuerName || formatAddress(first.issuerAddress, 6)}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {first.issuerName ? formatAddress(first.issuerAddress, 6) : null}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 shrink-0 text-accent transition-transform duration-200',
                                isBatchOpen && 'rotate-180',
                              )}
                              aria-hidden
                            />
                            <Layers className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                            <span className="truncate font-semibold text-foreground">
                              Batch &middot; {item.docs.length} document{item.docs.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="truncate px-6 py-4 text-sm text-muted-foreground">{sharedType}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <span title={formatDate(first.anchoredAt)}>{formatRelativeTime(first.anchoredAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <BatchStatusSummary docs={item.docs} />
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-semibold text-accent">
                          {isBatchOpen ? 'Hide' : 'View'}
                        </td>
                      </tr>
                      {isBatchOpen &&
                        item.docs.map((doc) => (
                          <tr
                            key={doc.docHash}
                            className="group border-b border-border/5 bg-muted/10 transition-colors last:border-b-0 hover:bg-muted/20"
                          >
                            <td className="px-6 py-4">
                              <p className="truncate text-sm text-muted-foreground">
                                {doc.issuerName || formatAddress(doc.issuerAddress, 6)}
                              </p>
                            </td>
                            <td className="py-4 pl-12 pr-6">
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
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {listItems.map((item) => {
              if (item.kind === 'single') {
                return (
                  <DocumentMobileCard
                    key={item.doc.docHash}
                    doc={item.doc}
                    isOpen={expanded === item.doc.docHash}
                    onToggle={() => setExpanded(expanded === item.doc.docHash ? null : item.doc.docHash)}
                  />
                )
              }

              const isBatchOpen = expandedBatches.has(item.batchId)
              return (
                <div key={`batch-${item.batchId}`} className="rounded-[20px] bg-card shadow-card ring-1 ring-border/5 transition-all duration-200">
                  <button
                    onClick={() => toggleBatch(item.batchId)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2 pr-3">
                      <Layers className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                      <p className="truncate text-sm font-semibold text-foreground">
                        Batch &middot; {item.docs.length} document{item.docs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <BatchStatusSummary docs={item.docs} />
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform duration-200',
                          isBatchOpen && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </div>
                  </button>
                  {isBatchOpen && (
                    <div className="space-y-2 border-t border-border/10 p-3">
                      {item.docs.map((doc) => (
                        <DocumentMobileCard
                          key={doc.docHash}
                          doc={doc}
                          isOpen={expanded === doc.docHash}
                          onToggle={() => setExpanded(expanded === doc.docHash ? null : doc.docHash)}
                          nested
                        />
                      ))}
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
