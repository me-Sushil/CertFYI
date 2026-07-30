'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import type { Hex } from 'viem'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { OnChainButton } from '@/components/admin/on-chain-button'
import { StatCard } from '@/components/admin/stat-card'
import { ChainBanner } from '@/components/admin/chain-banner'
import { Users, FileText, AlertCircle, AlertTriangle, Loader2, Inbox, ChevronDown, ExternalLink } from 'lucide-react'
import { ISSUER_ROLE } from '@/lib/contracts/document-anchor'
import {
  useAdminRequests,
  useApproveUser,
  useRejectUser,
  useAdminStats,
  useAuditLog,
} from '@/queries/admin'
import { keys } from '@/queries/keys'
import { formatRelativeTime, formatAddress, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AccessRequestRow, AuditLogEntry } from '@/lib/api-types'

function PendingRequestCard({
  request,
  onSettled,
}: {
  request: AccessRequestRow
  onSettled: () => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const approveUser = useApproveUser()
  const rejectUser = useRejectUser()

  const isProcessing = isApproving || rejecting

  const handleReject = async () => {
    setRejecting(true)
    try {
      await rejectUser.mutateAsync({ walletAddress: request.walletAddress })
      toast.success('Request rejected')
      onSettled()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject')
    } finally {
      setRejecting(false)
    }
  }

  return (
    <div className="rounded-lg bg-card shadow-card ring-1 ring-border/5 transition-all duration-300 ease-[var(--ease-premium)] hover:shadow-button">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6 text-left sm:p-8"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-extrabold tracking-[-0.3px] text-foreground">
            {request.organization || request.name || 'Unnamed Applicant'}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {request.email || 'No email provided'} &middot; {formatRelativeTime(request.createdAt)}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'ml-4 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="border-t border-border/10 px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
          <dl className="space-y-4 text-sm">
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Full Name</dt>
              <dd className="text-foreground">{request.name || '-'}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Email</dt>
              <dd className="text-foreground">{request.email || '-'}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Organization</dt>
              <dd className="text-foreground">{request.organization || '-'}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Website</dt>
              <dd className="text-foreground">
                {request.website ? (
                  <a
                    href={request.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:opacity-80"
                  >
                    {request.website}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : (
                  '-'
                )}
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Description</dt>
              <dd className="text-foreground leading-relaxed">{request.description || '-'}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Wallet</dt>
              <dd className="font-mono text-xs text-foreground break-all">{request.walletAddress}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Applied</dt>
              <dd className="text-foreground">{formatDate(request.createdAt)}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 font-semibold text-muted-foreground">Status</dt>
              <dd>
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {request.status}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2 border-t border-border/10 pt-5 sm:flex-row">
            <OnChainButton
              functionName="grantRole"
              args={[ISSUER_ROLE, request.walletAddress as Hex]}
              gas={BigInt(300_000)}
              onConfirmed={async (txHash) => {
                await approveUser.mutateAsync({ walletAddress: request.walletAddress, txHash })
                onSettled()
              }}
              successMessage="Issuer approved"
              errorMessage="Approval failed to record"
              className="w-full sm:flex-1"
              onLoadingChange={setIsApproving}
            >
              Approve On-Chain
            </OnChainButton>
            <Button size="sm" variant="outline" className="w-full sm:flex-1" onClick={handleReject} disabled={isProcessing}>
              {rejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: typeof Users
  title: string
  description: string
}) {
  return (
    <Link href={href}>
      <div className="cursor-pointer rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:shadow-button sm:p-8">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
          <Icon className="h-5 w-5 text-accent" aria-hidden />
        </div>
        <h3 className="mb-1 text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const requestsQuery = useAdminRequests(true)
  const statsQuery = useAdminStats(true)
  const { data: auditPages } = useAuditLog(true)

  const pendingApplications = requestsQuery.data ?? []
  const recentActivity = (auditPages?.pages?.[0]?.entries ?? []).slice(0, 5)
  const stats = statsQuery.data
  const statsLoading = statsQuery.isLoading

  const statTiles = [
    { label: 'Total Issuers', value: stats?.totalIssuers, icon: Users, tone: 'default' as const, loading: statsLoading },
    { label: 'Pending Approvals', value: String(pendingApplications.length), icon: AlertCircle, tone: 'accent' as const, loading: requestsQuery.isLoading },
    { label: 'Documents Anchored', value: stats?.documentsAnchored?.toLocaleString(), icon: FileText, tone: 'success' as const, loading: statsLoading },
    { label: 'Suspended Issuers', value: stats?.suspendedIssuers, icon: AlertTriangle, tone: 'default' as const, loading: statsLoading },
  ]

  return (
    <div className="space-y-8 sm:space-y-10">
      <ChainBanner />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statTiles.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
            Pending Applications
          </h2>
          <span className="rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            {pendingApplications.length} pending
          </span>
        </div>

        {requestsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : pendingApplications.length === 0 ? (
          <div className="rounded-lg bg-card p-12 text-center shadow-card ring-1 ring-border/5">
            <Inbox className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
            <p className="text-sm font-semibold text-muted-foreground">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApplications.map((request) => (
              <PendingRequestCard
                key={request.id}
                request={request}
                onSettled={() => queryClient.invalidateQueries({ queryKey: keys.admin.requests.all })}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <QuickLinkCard
          href="/admin/issuers"
          icon={Users}
          title="Issuer Management"
          description="View, approve, and manage all registered issuers"
        />
        <QuickLinkCard
          href="/admin/audit-log"
          icon={FileText}
          title="Audit Log"
          description="View platform-wide activity and transactions"
        />
      </div>

      <div>
        <h2 className="mb-5 text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <div className="rounded-lg bg-card p-12 text-center shadow-card ring-1 ring-border/5">
            <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
            <p className="text-sm font-semibold text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity: AuditLogEntry) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg bg-card p-5 shadow-card ring-1 ring-border/5 transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:shadow-button sm:p-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-foreground">
                      {activity.action.replace(/_/g, ' ')}
                    </p>
                    <p className="truncate text-xs font-semibold text-muted-foreground">
                      {activity.actorName} &middot; {formatAddress(activity.targetRef)}
                    </p>
                  </div>
                </div>
                <span className="ml-4 shrink-0 text-xs font-semibold text-muted-foreground">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
