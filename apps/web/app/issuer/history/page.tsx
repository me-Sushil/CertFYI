'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  Search, FileText, History, Upload, Plus,
  ExternalLink, Wallet, ChevronDown, RefreshCw, CheckCircle, XCircle,
  LayoutDashboard, X, Menu, Activity, Loader2,
} from 'lucide-react'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/issuer-sidebar'
import { toast } from 'sonner'
import { useSession } from '@/lib/auth-context'
import { useIssuerDocuments, useIssuerActivity } from '@/queries/issuer'
import { cn } from '@/lib/utils'
import { formatAddress, formatDate, formatRelativeTime } from '@/lib/format'
import { CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import type { IssuerDocumentRow, IssuerActivityEntry } from '@/lib/api-types'

const STATUS_OPTIONS = ['all', 'active', 'revoked'] as const

const ACTION_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'DOCUMENT_ANCHORED', label: 'Anchored' },
  { value: 'BATCH_ANCHORED', label: 'Batch' },
  { value: 'IPFS_PIN_FAILED', label: 'IPFS Failed' },
] as const

const ACTION_TONE: Record<string, string> = {
  DOCUMENT_ANCHORED: 'text-success',
  BATCH_ANCHORED: 'text-success',
  IPFS_PIN_FAILED: 'text-destructive',
}

const ACTION_DOT: Record<string, string> = {
  DOCUMENT_ANCHORED: 'bg-success',
  BATCH_ANCHORED: 'bg-success',
  IPFS_PIN_FAILED: 'bg-destructive',
}

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

function ActionBadge({ action }: { action: string }) {
  const isIPFS = action === 'IPFS_PIN_FAILED'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        isIPFS ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isIPFS ? 'bg-destructive' : 'bg-success')} />
      {action === 'DOCUMENT_ANCHORED' ? 'Anchored' : action === 'BATCH_ANCHORED' ? 'Batch' : action.replace(/_/g, ' ')}
    </span>
  )
}

export default function IssuanceHistoryPage() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { role } = useSession()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const [actionFilter, setActionFilter] = useState('ALL')
  const [retrying, setRetrying] = useState<string | null>(null)

  const { data, isLoading: docsLoading } = useIssuerDocuments(role === 'ISSUER' && isConnected)
  const { data: activityData, isLoading: activityLoading } = useIssuerActivity(role === 'ISSUER' && isConnected)

  const documents = data?.documents ?? []
  const activityEntries = activityData?.entries ?? []

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        !q ||
        doc.recipientName?.toLowerCase().includes(q) ||
        doc.recipientEmail?.toLowerCase().includes(q) ||
        doc.documentType?.toLowerCase().includes(q) ||
        doc.docHash.toLowerCase().includes(q)
      const matchesFilter = statusFilter === 'all' || doc.status === statusFilter
      return matchesSearch && matchesFilter
    })
  }, [documents, searchTerm, statusFilter])

  const filteredActivity = useMemo(() => {
    if (actionFilter === 'ALL') return activityEntries
    return activityEntries.filter((e) => e.action === actionFilter)
  }, [activityEntries, actionFilter])

  const handleRetry = async (entry: IssuerActivityEntry) => {
    setRetrying(entry.txHash ?? entry.action)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/issuer/retry-pin`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: entry.txHash }),
      })
      if (!res.ok) throw new Error('Retry failed')
      toast.success('Retrying IPFS pinning')
    } catch {
      toast.error('Retry failed. Please try again.')
    } finally {
      setRetrying(null)
    }
  }

  const isLoading = docsLoading || activityLoading

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
              <ThemeToggleInline />
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-10">
            {/* ── Documents Section ── */}
            <section>
              {/* Search + Filters */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <input
                    type="text"
                    placeholder="Search by name, email, type, or hash..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mb-5 text-sm font-semibold text-muted-foreground">
                {isConnected
                  ? `Showing ${filteredDocs.length} of ${documents.length} document${documents.length !== 1 ? 's' : ''}`
                  : 'Connect your wallet to view issuance history'}
              </p>

              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-[20px] bg-card/50 shadow-soft ring-1 ring-border/5" />
                  ))}
                </div>
              )}

              {!isConnected && !isLoading && (
                <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                  <Wallet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                  <p className="text-sm font-semibold text-muted-foreground">Connect your wallet to view issuance history</p>
                </div>
              )}

              {isConnected && !isLoading && filteredDocs.length === 0 && (
                <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                  <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                  <p className="text-sm font-semibold text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' ? 'No documents match your search' : 'No documents issued yet'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Link href="/issuer/issue" className="mt-3 inline-block text-sm font-semibold text-accent hover:opacity-80">
                      Issue your first document &rarr;
                    </Link>
                  )}
                </div>
              )}

              {isConnected && !isLoading && filteredDocs.length > 0 && (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-hidden rounded-[20px] bg-card shadow-card ring-1 ring-border/5 sm:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/10">
                          <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Recipient</th>
                          <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Document Hash</th>
                          <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Issued</th>
                          <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Status</th>
                          <th className="px-6 py-4 text-right text-sm font-extrabold text-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocs.map((doc) => (
                          <tr
                            key={doc.docHash}
                            className="group border-b border-border/5 transition-colors last:border-b-0 hover:bg-muted/20"
                          >
                            <td className="px-6 py-4">
                              <p className="font-semibold text-foreground">{doc.recipientName || '—'}</p>
                              {doc.recipientEmail && (
                                <p className="mt-0.5 text-xs text-muted-foreground">{doc.recipientEmail}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{doc.documentType || '—'}</td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-muted-foreground">{formatAddress(doc.docHash, 6)}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              <span title={formatDate(doc.anchoredAt)}>{formatRelativeTime(doc.anchoredAt)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={doc.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              {doc.txHash ? (
                                <a
                                  href={getExplorerUrl(doc.txHash, CONTRACT_CHAIN_ID) ?? '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
                                >
                                  Explorer <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 sm:hidden">
                    {filteredDocs.map((doc) => {
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
                                {doc.recipientEmail || formatAddress(doc.docHash, 4)}
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
                                  <p className="font-semibold text-muted-foreground mb-0.5">Type</p>
                                  <p className="text-foreground">{doc.documentType || '—'}</p>
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
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </section>

            {/* ── Activity Feed Section ── */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <Activity className="h-4 w-4 text-accent" aria-hidden />
                  </div>
                  <h2 className="text-lg font-extrabold text-foreground">Activity</h2>
                </div>
                <div className="flex gap-2">
                  {ACTION_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setActionFilter(f.value)}
                      className={cn(
                        'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)]',
                        actionFilter === f.value
                          ? 'bg-primary text-primary-foreground shadow-button'
                          : 'bg-card text-muted-foreground shadow-soft ring-1 ring-border/5 hover:text-foreground',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {activityLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-[20px] bg-card/50 shadow-soft ring-1 ring-border/5" />
                  ))}
                </div>
              )}

              {!isConnected && !activityLoading && (
                <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                  <Wallet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                  <p className="text-sm font-semibold text-muted-foreground">Connect your wallet to view activity</p>
                </div>
              )}

              {isConnected && !activityLoading && filteredActivity.length === 0 && (
                <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                  <Activity className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                  <p className="text-sm font-semibold text-muted-foreground">
                    {actionFilter !== 'ALL' ? 'No activity for this filter' : 'No activity yet'}
                  </p>
                </div>
              )}

              {isConnected && !activityLoading && filteredActivity.length > 0 && (
                <div className="space-y-3">
                  {filteredActivity.map((entry, idx) => {
                    const isFailed = entry.action === 'IPFS_PIN_FAILED'
                    const dotTone = ACTION_DOT[entry.action] ?? 'bg-accent'
                    return (
                      <div
                        key={`${entry.action}-${entry.createdAt}-${idx}`}
                        className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5 transition-all duration-200 hover:shadow-button"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1.5 shrink-0">
                            <div className={cn('h-2.5 w-2.5 rounded-full', dotTone)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                              <div className="flex items-center gap-3">
                                <ActionBadge action={entry.action} />
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground shrink-0">
                                {formatRelativeTime(entry.createdAt)}
                              </span>
                            </div>
                            {entry.detail && (
                              <p className="mt-1.5 text-sm text-muted-foreground">{entry.detail}</p>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                              {entry.txHash && (
                                <a
                                  href={getExplorerUrl(entry.txHash, CONTRACT_CHAIN_ID) ?? '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:opacity-80"
                                >
                                  <ExternalLink className="h-3 w-3" aria-hidden />
                                  Explorer
                                </a>
                              )}
                              {isFailed && entry.txHash && (
                                <button
                                  onClick={() => handleRetry(entry)}
                                  disabled={retrying === (entry.txHash ?? entry.action)}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                                >
                                  {retrying === (entry.txHash ?? entry.action) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" aria-hidden />
                                  )}
                                  Retry
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
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
    </div>
  )
}
