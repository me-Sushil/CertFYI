'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Hex } from 'viem'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth-context'
import { CONTRACT_ADDRESS, CONTRACT_ABI, ISSUER_ROLE } from '@/lib/contracts/document-anchor'
import { useAdminRequests, useApproveUser, useRejectUser } from '@/hooks/use-admin-queries'
import type { AccessRequestRow } from '@/lib/api-types'

function PendingRequestCard({
  request,
  onSettled,
}: {
  request: AccessRequestRow
  onSettled: () => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [approvalError, setApprovalError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash })
  const approveUser = useApproveUser()
  const rejectUser = useRejectUser()

  useEffect(() => {
    if (!isTxConfirmed || !txHash) return

    let cancelled = false
    setConfirming(true)
    approveUser
      .mutateAsync({ walletAddress: request.walletAddress, txHash })
      .then(() => {
        if (cancelled) return
        onSettled()
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setApprovalError(error instanceof Error ? error.message : 'Approval failed to record')
      })
      .finally(() => {
        if (!cancelled) setConfirming(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxConfirmed, txHash])

  const handleApprove = () => {
    setApprovalError(null)
    writeContract({
      address: CONTRACT_ADDRESS as Hex,
      abi: CONTRACT_ABI,
      functionName: 'grantRole',
      args: [ISSUER_ROLE, request.walletAddress as Hex],
    })
  }

  const handleReject = async () => {
    setRejecting(true)
    try {
      await rejectUser.mutateAsync({ walletAddress: request.walletAddress })
      onSettled()
    } catch {
      // surfaced via rejectUser.error if needed
    } finally {
      setRejecting(false)
    }
  }

  const busy = isWritePending || confirming || rejecting

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="font-semibold text-lg mb-1">
        {request.organization || request.name || 'Unnamed Applicant'}
      </h3>
      <p className="text-sm text-muted-foreground mb-2">{request.email || 'No email provided'}</p>
      <p className="font-mono text-xs text-muted-foreground mb-4 break-all">
        {request.walletAddress}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Applied {new Date(request.createdAt).toLocaleString()}
      </p>
      {(writeError || approvalError) && (
        <p className="text-xs text-destructive mb-3">
          {approvalError || 'Transaction failed or was rejected'}
        </p>
      )}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleApprove} disabled={busy}>
          {(isWritePending || confirming) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Approve On-Chain
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={handleReject} disabled={busy}>
          Reject
        </Button>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { role, isLoading: sessionLoading } = useSession()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!sessionLoading && role !== 'ADMIN') {
      router.replace('/')
    }
  }, [sessionLoading, role, router])

  const requestsQuery = useAdminRequests(role === 'ADMIN')

  const pendingApplications = requestsQuery.data ?? []

  const stats = [
    { label: 'Total Issuers', value: '42', icon: Users, color: 'text-primary' },
    {
      label: 'Pending Approvals',
      value: String(pendingApplications.length),
      icon: AlertCircle,
      color: 'text-destructive',
    },
    { label: 'Documents Anchored', value: '52,481', icon: FileText, color: 'text-accent' },
    { label: 'Active Users', value: '1,283', icon: CheckCircle, color: 'text-secondary' },
  ]

  const recentActivity = [
    { action: 'Document Issued', actor: 'Stanford', target: 'Certificate Batch', time: '5 min ago' },
    { action: 'Issuer Approved', actor: 'Admin', target: 'MIT', time: '1 hour ago' },
    { action: 'Document Revoked', actor: 'Harvard', target: 'Diploma #4521', time: '2 hours ago' },
    { action: 'Issuer Suspended', actor: 'Admin', target: 'TestOrg Inc', time: '1 day ago' },
  ]

  if (sessionLoading || role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Pending Applications */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Pending Issuer Applications</h2>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-destructive/10 text-destructive">
              {pendingApplications.length} pending
            </span>
          </div>

          {requestsQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : pendingApplications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No pending issuer applications.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pendingApplications.map((request) => (
                <PendingRequestCard
                  key={request.id}
                  request={request}
                  onSettled={() => queryClient.invalidateQueries({ queryKey: ['admin-requests'] })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Management Links */}
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

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Platform Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.actor} • {activity.target}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
