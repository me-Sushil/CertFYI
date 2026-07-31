'use client'

import { Fragment, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { Hex } from 'viem'
import {
  Search, FileText, History, ExternalLink, ChevronDown,
  X, Menu, Loader2, Ban, MoreVertical, Copy, Check, Layers,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/issuer-sidebar'
import { OnChainButton } from '@/components/admin/on-chain-button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIssuerDocuments } from '@/queries/issuer'
import { useRevokeDocumentMutation } from '@/queries/documents'
import { useDebounce } from 'use-debounce'
import { cn } from '@/lib/utils'
import { formatAddress, formatDate, formatRelativeTime } from '@/lib/format'
import { CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import type { IssuerDocumentRow } from '@/lib/api-types'

const STATUS_OPTIONS = ['all', 'active', 'revoked'] as const
// Fixed gas limit for revokeDocument - a single SSTORE plus an event emit,
// comfortably under 200k gas. See the same fix on the anchor flow: some
// wallets' auto-estimation has returned values that exceed the RPC
// provider's hard per-tx cap.
const REVOKE_GAS_LIMIT = BigInt(300_000)

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

function BatchStatusSummary({ docs }: { docs: IssuerDocumentRow[] }) {
  const activeCount = docs.filter((d) => d.status === 'active').length
  const revokedCount = docs.length - activeCount
  if (revokedCount === 0) return <StatusBadge status="active" />
  if (activeCount === 0) return <StatusBadge status="revoked" />
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
      {activeCount} active, {revokedCount} revoked
    </span>
  )
}

type DocListItem =
  | { kind: 'single'; doc: IssuerDocumentRow }
  | { kind: 'batch'; batchId: string; docs: IssuerDocumentRow[] }

function groupDocuments(documents: IssuerDocumentRow[]): DocListItem[] {
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

function RowActionsMenu({ doc, onRevoke }: { doc: IssuerDocumentRow; onRevoke: (doc: IssuerDocumentRow) => void }) {
  const [copied, setCopied] = useState(false)

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(doc.docHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable over plain HTTP on some browsers - not worth surfacing.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="ml-auto flex h-8 w-8 items-center cursor-pointer justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Document actions"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Document Hash</DropdownMenuLabel>
          <DropdownMenuItem onClick={copyHash} className="justify-between cursor-pointer  font-mono text-xs">
            {formatAddress(doc.docHash, 8)}
            {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden /> : <Copy className="h-3.5 w-3.5 " aria-hidden />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {doc.txHash && (
          <DropdownMenuItem className="cursor-pointer"
            render={
              <a href={getExplorerUrl(doc.txHash, CONTRACT_CHAIN_ID) ?? '#'} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            View on Explorer
          </DropdownMenuItem>
        )}
        {doc.status === 'active' && (
          <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={() => onRevoke(doc)}>
            <Ban className="h-3.5 w-3.5" aria-hidden />
            Revoke
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DocumentMobileCard({
  doc,
  isOpen,
  onToggle,
  onRevoke,
  nested = false,
}: {
  doc: IssuerDocumentRow
  isOpen: boolean
  onToggle: () => void
  onRevoke: (doc: IssuerDocumentRow) => void
  nested?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg bg-card shadow-card ring-1 ring-border/5 transition-all duration-200',
        nested && 'bg-muted/10 shadow-none ring-border/10',
      )}
    >
      <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-sm font-semibold text-foreground">
            {doc.recipientName || doc.documentType || 'Document'}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {doc.recipientEmail || formatAddress(doc.docHash, 4)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={doc.status} />
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
              <p className="font-semibold text-muted-foreground mb-0.5">Type</p>
              <p className="text-foreground">{doc.documentType || '-'}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground mb-0.5">Issued</p>
              <p className="text-foreground">{formatRelativeTime(doc.anchoredAt)}</p>
            </div>
            <div className="col-span-2">
              <p className="font-semibold text-muted-foreground mb-0.5">Document Hash</p>
              <p className="font-mono break-all text-foreground">{formatAddress(doc.docHash, 8)}</p>
            </div>
            {doc.txHash && (
              <div className="col-span-2">
                <p className="font-semibold text-muted-foreground mb-0.5">Transaction</p>
                <p className="font-mono break-all text-foreground">{formatAddress(doc.txHash, 8)}</p>
              </div>
            )}
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
          {doc.status === 'active' && (
            <button
              onClick={() => onRevoke(doc)}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              <Ban className="h-4 w-4" aria-hidden />
              Revoke
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function IssuanceHistoryPage() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch] = useDebounce(searchInput, 300)
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())
  const [confirmRevoke, setConfirmRevoke] = useState<IssuerDocumentRow | null>(null)

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) => {
      const next = new Set(prev)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })
  }

  const docsQuery = useIssuerDocuments(true, { status: statusFilter, search: debouncedSearch || undefined })
  const revokeDocument = useRevokeDocumentMutation()

  const handleRevokeConfirmed = async (doc: IssuerDocumentRow, txHash: Hex) => {
    await revokeDocument.mutateAsync({ documentHash: doc.docHash, txHash })
    setConfirmRevoke(null)
  }

  const documents = useMemo(
    () => docsQuery.data?.pages.flatMap((p) => p.documents) ?? [],
    [docsQuery.data],
  )
  const totalLoaded = documents.length
  const listItems = useMemo(() => groupDocuments(documents), [documents])

  // Search input differs from the debounced value while the user is still typing.
  const isSearchPending = searchInput !== debouncedSearch
  const docsLoading = docsQuery.isLoading

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border/10">
          <Sidebar pathname={pathname} onNavigate={() => {}} />
        </div>
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/10 bg-card/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground hover:bg-muted/50"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-sm font-extrabold text-foreground">CertFyi</span>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <History className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <h1 className="text-base font-extrabold text-foreground">Issuance History</h1>
            </div>
            <div className="flex-1 lg:hidden" />
            <div className="flex items-center gap-2 sm:gap-3">
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-10">
            <section>
              {/* Search + Filters */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
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
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStatusFilter(opt)}
                      aria-pressed={statusFilter === opt}
                      className={cn(
                        'rounded-xl px-4 py-2 cursor-pointer text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)]',
                        statusFilter === opt
                          ? 'bg-primary text-primary-foreground shadow-button'
                          : 'bg-card text-muted-foreground shadow-soft ring-1 ring-border/5 hover:text-foreground',
                      )}
                    >
                      {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mb-5 text-sm font-semibold text-muted-foreground">
                {`Showing ${totalLoaded} document${totalLoaded !== 1 ? 's' : ''}${docsQuery.hasNextPage ? '+' : ''}`}
              </p>

              {docsLoading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-card/50 shadow-soft ring-1 ring-border/5" />
                  ))}
                </div>
              )}

              {!docsLoading && documents.length === 0 && (
                <div className="rounded-lg bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                  <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                  <p className="text-sm font-semibold text-muted-foreground">
                    {debouncedSearch || statusFilter !== 'all' ? 'No documents match your search' : 'No documents issued yet'}
                  </p>
                  {!debouncedSearch && statusFilter === 'all' && (
                    <Link href="/issuer/issue" className="mt-3 inline-block text-sm font-semibold text-accent hover:opacity-80">
                      Issue your first document &rarr;
                    </Link>
                  )}
                </div>
              )}

              {!docsLoading && documents.length > 0 && (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-hidden rounded-lg bg-card shadow-card ring-1 ring-border/5 sm:block">
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] table-fixed">
                      <thead>
                        <tr className="border-b border-border/10">
                          <th className="w-[32%] px-6 py-4 text-left text-sm font-extrabold text-foreground">Recipient</th>
                          <th className="w-[18%] px-6 py-4 text-left text-sm font-extrabold text-foreground">Type</th>
                          <th className="w-[18%] px-6 py-4 text-left text-sm font-extrabold text-foreground">Issued</th>
                          <th className="w-[18%] px-6 py-4 text-left text-sm font-extrabold text-foreground">Status</th>
                          <th className="w-[14%] px-6 py-4 text-right text-sm font-extrabold text-foreground">Details</th>
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
                                  <p className="truncate font-semibold text-foreground">{doc.recipientName || '-'}</p>
                                  {doc.recipientEmail && (
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{doc.recipientEmail}</p>
                                  )}
                                </td>
                                <td className="truncate px-6 py-4 text-sm text-muted-foreground">{doc.documentType || '-'}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                  <span title={formatDate(doc.anchoredAt)}>{formatRelativeTime(doc.anchoredAt)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={doc.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <RowActionsMenu doc={doc} onRevoke={setConfirmRevoke} />
                                </td>
                              </tr>
                            )
                          }

                          const isBatchOpen = expandedBatches.has(item.batchId)
                          const sharedType = item.docs.every((d) => d.documentType === item.docs[0].documentType)
                            ? item.docs[0].documentType || '-'
                            : '-'
                          const latestAnchoredAt = item.docs[0].anchoredAt
                          return (
                            <Fragment key={`batch-${item.batchId}`}>
                              <tr
                                onClick={() => toggleBatch(item.batchId)}
                                className="cursor-pointer border-b border-border/5 bg-accent/5 transition-colors hover:bg-accent/10"
                              >
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
                                  <span title={formatDate(latestAnchoredAt)}>{formatRelativeTime(latestAnchoredAt)}</span>
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
                                    <td className="py-4 pl-12 pr-6">
                                      <p className="truncate font-semibold text-foreground">{doc.recipientName || '-'}</p>
                                      {doc.recipientEmail && (
                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{doc.recipientEmail}</p>
                                      )}
                                    </td>
                                    <td className="truncate px-6 py-4 text-sm text-muted-foreground">{doc.documentType || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                      <span title={formatDate(doc.anchoredAt)}>{formatRelativeTime(doc.anchoredAt)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <StatusBadge status={doc.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <RowActionsMenu doc={doc} onRevoke={setConfirmRevoke} />
                                    </td>
                                  </tr>
                                ))}
                            </Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                    </div>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 sm:hidden">
                    {listItems.map((item) => {
                      if (item.kind === 'single') {
                        return (
                          <DocumentMobileCard
                            key={item.doc.docHash}
                            doc={item.doc}
                            isOpen={expanded === item.doc.docHash}
                            onToggle={() => setExpanded(expanded === item.doc.docHash ? null : item.doc.docHash)}
                            onRevoke={setConfirmRevoke}
                          />
                        )
                      }

                      const isBatchOpen = expandedBatches.has(item.batchId)
                      return (
                        <div key={`batch-${item.batchId}`} className="rounded-lg bg-card shadow-card ring-1 ring-border/5 transition-all duration-200">
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
                                  onRevoke={setConfirmRevoke}
                                  nested
                                />
                              ))}
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
            </section>
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-72 max-w-[80vw] animate-fade-in shadow-large">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground shadow-button hover:bg-muted/50"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Revoke confirmation */}
      <AlertDialog open={!!confirmRevoke} onOpenChange={(open) => !open && setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Document</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark{' '}
              <strong>{confirmRevoke?.recipientName || confirmRevoke?.documentType || 'this document'}</strong>{' '}
              as revoked on-chain. This cannot be undone, and it costs gas. Verification will show
              it as revoked, but the anchor record itself remains permanently on the blockchain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {confirmRevoke && (
              <OnChainButton
                functionName="revokeDocument"
                args={[confirmRevoke.docHash as Hex]}
                gas={REVOKE_GAS_LIMIT}
                onConfirmed={(txHash) => handleRevokeConfirmed(confirmRevoke, txHash)}
                successMessage="Document revoked"
                errorMessage="Revocation failed"
                variant="destructive"
              >
                Confirm Revocation
              </OnChainButton>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
