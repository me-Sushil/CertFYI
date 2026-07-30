'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  FileText, Upload, History, Wallet,
  Plus, Loader2, ShieldAlert, CheckCircle, Clock, Activity,
  ArrowUpRight, Menu, X, ChevronRight, LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import { Sidebar } from '@/components/issuer-sidebar'
import { useSession } from '@/lib/auth-context'
import { useIssuerStats, useIssuerDocuments, useIssuerActivity } from '@/queries/issuer'
import { cn } from '@/lib/utils'
import { formatAddress, formatRelativeTime } from '@/lib/format'

function StatCard({ label, value, icon: IconComponent, tone }: { label: string; value: string | number; icon: typeof FileText; tone: 'accent' | 'success' | 'default' }) {
  return (
    <div className="rounded-lg bg-card p-5 shadow-card ring-1 ring-border/5 transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:shadow-button sm:p-6">
      <div className={cn(
        'mb-4 flex h-10 w-10 items-center justify-center rounded-xl',
        tone === 'accent' ? 'bg-accent/10' : tone === 'success' ? 'bg-success/10' : 'bg-muted',
      )}>
        <IconComponent className={cn(
          'h-5 w-5',
          tone === 'accent' ? 'text-accent' : tone === 'success' ? 'text-success' : 'text-muted-foreground',
        )} aria-hidden />
      </div>
      <p className="mb-1 text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="text-3xl font-extrabold tabular-nums text-foreground sm:text-4xl">{value}</p>
    </div>
  )
}

function ActivityItem({ action, detail, createdAt, txHash }: { action: string; detail?: string; createdAt: string; txHash?: string }) {
  const IconComp = action === 'DOCUMENT_ANCHORED' || action === 'BATCH_ANCHORED' ? CheckCircle : Activity
  return (
    <div className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-card ring-1 ring-border/5 transition-all duration-200 hover:shadow-button sm:gap-4 sm:p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
        <IconComp className="h-4 w-4 text-accent" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{action.replace(/_/g, ' ')}</p>
        {detail && <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-medium text-muted-foreground">{formatRelativeTime(createdAt)}</span>
          {txHash && (
            <span className="font-mono text-xs text-accent">{formatAddress(txHash, 4)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IssuerDashboard() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { role, isLoading: sessionLoading, address } = useSession()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const isDashboard = pathname === '/issuer'

  const { data: stats, isLoading: statsLoading } = useIssuerStats(isDashboard && role === 'ISSUER' && isConnected)
  const { data: docsData, isLoading: docsLoading } = useIssuerDocuments(role === 'ISSUER' && isConnected)
  const { data: activityData, isLoading: activityLoading } = useIssuerActivity(isDashboard && role === 'ISSUER' && isConnected)

  // Connection, session, and wallet-match gating all live in app/issuer/layout.tsx.
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" aria-hidden />
      </div>
    )
  }

  const documents = docsData?.pages?.[0]?.documents ?? []
  const activity = activityData?.pages?.[0]?.entries ?? []

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
        {/* Global header — always visible, wallet top-right */}
        <header className="sticky top-0 z-30 border-b border-border/10 bg-card/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: mobile hamburger */}
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

            {/* Center: page title (desktop) */}
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <LayoutDashboard className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <h1 className="text-base font-extrabold text-foreground">Dashboard</h1>
            </div>

            {/* Spacer on mobile so ConnectButton stays right */}
            <div className="flex-1 lg:hidden" />

            {/* Right: wallet */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 sm:space-y-10">
            {/* Welcome banner */}
            <div className="rounded-lg bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6 shadow-card ring-1 ring-accent/5 sm:p-8">
              <h2 className="mb-2 text-2xl font-extrabold tracking-[-0.8px] text-foreground sm:text-[30px] sm:leading-[36px]">
                Welcome back
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-[30.6px]">
                {isConnected && stats
                  ? `You have issued ${stats.totalIssued.toLocaleString()} verified documents on the blockchain.`
                  : 'Connect your wallet to manage your issuer dashboard.'}
              </p>
            </div>

            {/* Stats grid */}
            {isConnected && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard label="Total Issued" value={statsLoading ? '...' : (stats?.totalIssued ?? 0).toLocaleString()} icon={FileText} tone="accent" />
                <StatCard label="Active" value={statsLoading ? '...' : (stats?.activeDocuments ?? 0).toLocaleString()} icon={CheckCircle} tone="success" />
                <StatCard label="Revoked" value={statsLoading ? '...' : (stats?.revokedCount ?? 0).toLocaleString()} icon={ShieldAlert} tone="default" />
                <StatCard label="Activities" value={statsLoading ? '...' : (stats?.recentActivityCount ?? 0).toLocaleString()} icon={Activity} tone="accent" />
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="mb-4 text-lg font-extrabold tracking-[-0.5px] text-foreground sm:text-[22px] sm:leading-[28.6px]">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Link href="/issuer/issue">
                  <Button className="h-12 w-full justify-start gap-2.5 text-sm font-bold sm:h-14 sm:text-base">
                    <Plus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                    Issue Single
                  </Button>
                </Link>
                <Link href="/issuer/bulk-issue">
                  <Button variant="outline" className="h-12 w-full justify-start gap-2.5 text-sm font-bold sm:h-14 sm:text-base">
                    <Upload className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                    Bulk Issue
                  </Button>
                </Link>
                <Link href="/issuer/history">
                  <Button variant="outline" className="h-12 w-full justify-start gap-2.5 text-sm font-bold sm:h-14 sm:text-base">
                    <History className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                    History
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button variant="outline" className="h-12 w-full justify-start gap-2.5 text-sm font-bold sm:h-14 sm:text-base">
                    <ArrowUpRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                    Verify
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Documents + Activity */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {/* Recent Documents */}
              <div>
                <div className="mb-4 flex items-center justify-between sm:mb-5">
                  <h3 className="text-lg font-extrabold tracking-[-0.5px] text-foreground sm:text-[22px] sm:leading-[28.6px]">
                    Recent Documents
                  </h3>
                  <Link href="/issuer/history" className="flex items-center gap-1 text-sm font-semibold text-accent transition-opacity hover:opacity-80">
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {!isConnected ? (
                  <div className="rounded-lg bg-card p-8 text-center shadow-card ring-1 ring-border/5">
                    <Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden />
                    <p className="text-sm font-semibold text-muted-foreground">Connect wallet to see documents</p>
                  </div>
                ) : docsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[72px] animate-pulse rounded-lg bg-card/50 shadow-soft ring-1 ring-border/5" />
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="rounded-lg bg-card p-8 text-center shadow-card ring-1 ring-border/5">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden />
                    <p className="text-sm font-semibold text-muted-foreground">No documents issued yet</p>
                    <Link href="/issuer/issue" className="mt-3 inline-block text-sm font-semibold text-accent hover:opacity-80">
                      Issue your first document &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.slice(0, 5).map((doc) => (
                      <div key={doc.docHash} className="flex items-center justify-between rounded-lg bg-card p-4 shadow-card ring-1 ring-border/5 transition-all duration-200 hover:shadow-button">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {doc.recipientName || doc.documentType || 'Document'}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                            {formatAddress(doc.docHash, 4)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatRelativeTime(doc.anchoredAt)}
                          </p>
                        </div>
                        <span className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                          doc.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
                        )}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', doc.status === 'active' ? 'bg-success' : 'bg-destructive')} />
                          {doc.status === 'active' ? 'Active' : 'Revoked'}
                        </span>
                      </div>
                    ))}
                    {documents.length > 5 && (
                      <Link href="/issuer/history" className="flex items-center justify-center gap-1 rounded-lg bg-card/50 py-3 text-sm font-semibold text-muted-foreground shadow-soft ring-1 ring-border/5 transition-all hover:bg-card hover:text-foreground hover:shadow-button">
                        View all {documents.length} documents <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div>
                <div className="mb-4 flex items-center justify-between sm:mb-5">
                  <h3 className="text-lg font-extrabold tracking-[-0.5px] text-foreground sm:text-[22px] sm:leading-[28.6px]">
                    Recent Activity
                  </h3>
                  <Link href="/issuer/activity" className="flex items-center gap-1 text-sm font-semibold text-accent transition-opacity hover:opacity-80">
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {!isConnected ? (
                  <div className="rounded-lg bg-card p-8 text-center shadow-card ring-1 ring-border/5">
                    <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden />
                    <p className="text-sm font-semibold text-muted-foreground">Connect wallet to see activity</p>
                  </div>
                ) : activityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[72px] animate-pulse rounded-lg bg-card/50 shadow-soft ring-1 ring-border/5" />
                    ))}
                  </div>
                ) : activity.length === 0 ? (
                  <div className="rounded-lg bg-card p-8 text-center shadow-card ring-1 ring-border/5">
                    <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden />
                    <p className="text-sm font-semibold text-muted-foreground">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activity.slice(0, 5).map((entry, idx) => (
                      <ActivityItem key={`${entry.createdAt}-${idx}`} {...entry} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile drawer overlay */}
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
