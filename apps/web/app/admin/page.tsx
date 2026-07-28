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
import { Users, FileText, AlertCircle, CheckCircle, Loader2, Inbox } from 'lucide-react'
import { ISSUER_ROLE } from '@/lib/contracts/document-anchor'
import {
  useAdminRequests,
  useApproveUser,
  useRejectUser,
  useAdminStats,
  useAuditLog,
} from '@/queries/admin'
import { keys } from '@/queries/keys'
import { formatRelativeTime, formatAddress } from '@/lib/format'
import type { AccessRequestRow, AuditLogEntry } from '@/lib/api-types'

function PendingRequestCard({
  request,
  onSettled,
}: {
  request: AccessRequestRow
  onSettled: () => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const approveUser = useApproveUser()
  const rejectUser = useRejectUser()

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
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="font-semibold text-lg mb-1">
        {request.organization || request.name || 'Unnamed Applicant'}
      </h3>
      <p className="text-sm text-muted-foreground mb-2">{request.email || 'No email provided'}</p>
      <p className="font-mono text-xs text-muted-foreground mb-4 break-all">
        {formatAddress(request.walletAddress, 8)}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Applied {formatRelativeTime(request.createdAt)}
      </p>
      <div className="flex gap-2">
        <OnChainButton
          functionName="grantRole"
          args={[ISSUER_ROLE, request.walletAddress as Hex]}
          onConfirmed={async (txHash) => {
            await approveUser.mutateAsync({ walletAddress: request.walletAddress, txHash })
            onSettled()
          }}
          successMessage="Issuer approved"
          errorMessage="Approval failed to record"
          className="flex-1"
        >
          Approve On-Chain
        </OnChainButton>
        <Button size="sm" variant="outline" className="flex-1" onClick={handleReject} disabled={rejecting}>
          {rejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reject
        </Button>
      </div>
    </div>
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
    { label: 'Total Issuers', value: stats?.totalIssuers, icon: Users, color: 'text-primary', loading: statsLoading },
    { label: 'Pending Approvals', value: String(pendingApplications.length), icon: AlertCircle, color: 'text-destructive', loading: requestsQuery.isLoading },
    { label: 'Documents Anchored', value: stats?.documentsAnchored?.toLocaleString(), icon: FileText, color: 'text-accent', loading: statsLoading },
    { label: 'Suspended Issuers', value: stats?.suspendedIssuers, icon: CheckCircle, color: 'text-secondary', loading: statsLoading },
  ]

  return (
    <>
      <ChainBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statTiles.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Pending Applications</h2>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-destructive/10 text-destructive">
            {pendingApplications.length} pending
          </span>
        </div>

        {requestsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-card space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingApplications.length === 0 ? (
          <EmptyState icon={Inbox} title="No pending applications" description="New issuer requests will appear here." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link href="/admin/issuers">
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-lg transition cursor-pointer">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">Issuer Management</h3>
            <p className="text-sm text-muted-foreground">View, approve, and manage all registered issuers</p>
          </div>
        </Link>
        <Link href="/admin/audit-log">
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-lg transition cursor-pointer">
            <FileText className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">Audit Log</h3>
            <p className="text-sm text-muted-foreground">View platform-wide activity and transactions</p>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <EmptyState icon={FileText} title="No recent activity" description="Platform activity will appear here." />
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity: AuditLogEntry) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{activity.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.actorName} &middot; {formatAddress(activity.targetRef)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// Make OnChainButton accept className prop via Button's native support
