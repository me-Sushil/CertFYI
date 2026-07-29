'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Activity, ExternalLink, RefreshCw, X, Menu, Loader2, Wallet } from 'lucide-react'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/issuer-sidebar'
import { toast } from 'sonner'
import { useIssuerActivity, useRetryPin } from '@/queries/issuer'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import { CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import type { IssuerActivityEntry } from '@/lib/api-types'

const ACTION_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'DOCUMENT_ANCHORED', label: 'Anchored' },
  { value: 'DOCUMENT_ANCHOR_FAILED', label: 'Failed' },
  { value: 'BATCH_ANCHORED', label: 'Batch' },
  { value: 'IPFS_PIN_FAILED', label: 'IPFS Failed' },
  { value: 'IPFS_PIN_RETRIED', label: 'IPFS Retried' },
] as const

const ACTION_DOT: Record<string, string> = {
  DOCUMENT_ANCHORED: 'bg-success',
  BATCH_ANCHORED: 'bg-success',
  DOCUMENT_ANCHOR_FAILED: 'bg-destructive',
  IPFS_PIN_FAILED: 'bg-destructive',
  IPFS_PIN_RETRIED: 'bg-accent',
}

const ACTION_LABEL: Record<string, string> = {
  DOCUMENT_ANCHORED: 'Anchored',
  DOCUMENT_ANCHOR_FAILED: 'Failed',
  BATCH_ANCHORED: 'Batch',
  IPFS_PIN_FAILED: 'IPFS Failed',
  IPFS_PIN_RETRIED: 'IPFS Retried',
}

function ActionBadge({ action }: { action: string }) {
  const isBad = action === 'IPFS_PIN_FAILED' || action === 'DOCUMENT_ANCHOR_FAILED'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        isBad ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', ACTION_DOT[action] ?? 'bg-accent')} />
      {ACTION_LABEL[action] ?? action.replace(/_/g, ' ')}
    </span>
  )
}

export default function IssuerActivityPage() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [actionFilter, setActionFilter] = useState('ALL')

  const activityQuery = useIssuerActivity(true, { action: actionFilter })
  const retryPin = useRetryPin()

  const activityEntries = useMemo(
    () => activityQuery.data?.pages.flatMap((p) => p.entries) ?? [],
    [activityQuery.data],
  )
  const activityLoading = activityQuery.isLoading

  const handleRetry = async (entry: IssuerActivityEntry) => {
    if (!entry.docHash) return
    try {
      const result = await retryPin.mutateAsync(entry.docHash)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message || 'Retry failed. Please try again.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retry failed. Please try again.')
    }
  }

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
                <Activity className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <h1 className="text-base font-extrabold text-foreground">Activity</h1>
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
          <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-6">
            <div>
              <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Activity
              </h2>
              <p className="text-lg leading-[30.6px] text-muted-foreground">
                Every anchoring attempt, on-chain and off - including failures, so nothing that
                happened to a document is ever silently lost.
              </p>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by action">
              {ACTION_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActionFilter(f.value)}
                  aria-pressed={actionFilter === f.value}
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

            {activityLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-[20px] bg-card/50 shadow-soft ring-1 ring-border/5" />
                ))}
              </div>
            )}

            {!activityLoading && activityEntries.length === 0 && (
              <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                <Wallet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                <p className="text-sm font-semibold text-muted-foreground">
                  {actionFilter !== 'ALL' ? 'No activity for this filter' : 'No activity yet'}
                </p>
              </div>
            )}

            {!activityLoading && activityEntries.length > 0 && (
              <>
                <div className="space-y-3">
                  {activityEntries.map((entry, idx) => {
                    const isFailedPin = entry.action === 'IPFS_PIN_FAILED'
                    const isRetrying = retryPin.isPending && retryPin.variables === entry.docHash
                    return (
                      <div
                        key={`${entry.action}-${entry.createdAt}-${idx}`}
                        className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5 transition-all duration-200 hover:shadow-button"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1.5 shrink-0">
                            <div className={cn('h-2.5 w-2.5 rounded-full', ACTION_DOT[entry.action] ?? 'bg-accent')} />
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
                            {entry.docHash && (
                              <p className="mt-1 font-mono text-xs text-muted-foreground/70">
                                {entry.docHash.slice(0, 10)}...{entry.docHash.slice(-8)}
                              </p>
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
                              {isFailedPin && entry.docHash && (
                                <button
                                  onClick={() => handleRetry(entry)}
                                  disabled={isRetrying}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                                >
                                  {isRetrying ? (
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

                {activityQuery.hasNextPage && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => activityQuery.fetchNextPage()}
                      disabled={activityQuery.isFetchingNextPage}
                    >
                      {activityQuery.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
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
