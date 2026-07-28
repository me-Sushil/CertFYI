'use client'

import { useState } from 'react'
import type { Hex } from 'viem'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { OnChainButton } from '@/components/admin/on-chain-button'
import { ChainBanner } from '@/components/admin/chain-banner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, Shield, AlertTriangle, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { ISSUER_ROLE } from '@/lib/contracts/document-anchor'
import { useIssuers, useSuspendIssuer, useReactivateIssuer } from '@/queries/admin'
import { formatAddress, formatDate } from '@/lib/format'
import type { IssuerRow } from '@/lib/api-types'

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'SUSPENDED'] as const

export default function IssuerManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [confirmSuspend, setConfirmSuspend] = useState<IssuerRow | null>(null)

  const { data: pagesData, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = useIssuers(true, {
    status: filterStatus,
    search: searchTerm || undefined,
  })
  const issuers = pagesData?.pages.flatMap((p) => p.issuers) ?? []

  return (
    <>
      <ChainBanner />

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Issuer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage verified issuers and their credentials</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, organization, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
        </div>

        <div className="flex gap-2">
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Organization', 'Documents', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 sm:px-6 py-3 text-left text-sm font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 sm:px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                  <td className="px-4 sm:px-6 py-4"><Skeleton className="h-5 w-12" /></td>
                  <td className="px-4 sm:px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-4 sm:px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : issuers.length === 0 ? (
        <EmptyState icon={Users} title="No issuers found" description="Try adjusting your search or filter criteria." />
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold">Organization</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden sm:table-cell">Docs</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden md:table-cell">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-sm font-semibold" />
                </tr>
              </thead>
              <tbody>
                {issuers.map((issuer) => {
                  const isExpanded = expandedRow === issuer.walletAddress
                  return (
                    <IssuerRowComponent
                      key={issuer.walletAddress}
                      issuer={issuer}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedRow(isExpanded ? null : issuer.walletAddress)}
                      onSuspend={() => setConfirmSuspend(issuer)}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>

          {hasNextPage && (
            <div className="text-center py-6">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      <SuspendConfirmDialog
        issuer={confirmSuspend}
        onClose={() => setConfirmSuspend(null)}
      />
    </>
  )
}

function IssuerRowComponent({
  issuer,
  isExpanded,
  onToggle,
  onSuspend,
}: {
  issuer: IssuerRow
  isExpanded: boolean
  onToggle: () => void
  onSuspend: () => void
}) {
  const reactivateUser = useReactivateIssuer()

  return (
    <>
      <tr className="border-t border-border hover:bg-muted/30 transition cursor-pointer" onClick={onToggle}>
        <td className="px-4 sm:px-6 py-4">
          <p className="font-medium text-sm">{issuer.organization || issuer.name || 'Unnamed Issuer'}</p>
          <p className="text-xs text-muted-foreground">{issuer.email || formatAddress(issuer.walletAddress)}</p>
        </td>
        <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
          {issuer.documentCount.toLocaleString()}
        </td>
        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
          <StatusBadge status={issuer.status} />
        </td>
        <td className="px-4 sm:px-6 py-4 text-right">
          {isExpanded ? <ChevronUp className="w-4 h-4 inline-block text-muted-foreground" /> : <ChevronDown className="w-4 h-4 inline-block text-muted-foreground" />}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/20">
          <td colSpan={4} className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Wallet</p>
                <p className="font-mono text-xs">{formatAddress(issuer.walletAddress, 8)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Registered</p>
                <p className="text-sm font-medium">{formatDate(issuer.registeredAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                <StatusBadge status={issuer.status} />
              </div>
            </div>
            <div className="flex gap-2">
              {issuer.status === 'ACTIVE' ? (
                <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={onSuspend}>
                  <AlertTriangle className="w-4 h-4" />
                  Suspend
                </Button>
              ) : (
                <OnChainButton
                  functionName="grantRole"
                  args={[ISSUER_ROLE, issuer.walletAddress as Hex]}
                  onConfirmed={async (txHash) => {
                    await reactivateUser.mutateAsync({ walletAddress: issuer.walletAddress, txHash })
                  }}
                  successMessage="Issuer reactivated"
                  errorMessage="Reactivation failed"
                  variant="outline"
                >
                  <Shield className="w-4 h-4" />
                  Reactivate
                </OnChainButton>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function StatusBadge({ status }: { status: 'ACTIVE' | 'SUSPENDED' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      status === 'ACTIVE'
        ? 'bg-accent/10 text-accent'
        : 'bg-destructive/10 text-destructive'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-accent' : 'bg-destructive'}`} />
      {status === 'ACTIVE' ? 'Active' : 'Suspended'}
    </span>
  )
}

function SuspendConfirmDialog({
  issuer,
  onClose,
}: {
  issuer: IssuerRow | null
  onClose: () => void
}) {
  const suspendUser = useSuspendIssuer()

  if (!issuer) return null

  return (
    <AlertDialog open={!!issuer} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend Issuer</AlertDialogTitle>
          <AlertDialogDescription>
            This will revoke <strong>{issuer.organization || issuer.name || 'this issuer'}</strong>&apos;s
            ISSUER_ROLE on-chain ({formatAddress(issuer.walletAddress)}).
            They have <strong>{issuer.documentCount}</strong> documents anchored.
            Documents issued before suspension will remain valid.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <OnChainButton
            functionName="revokeRole"
            args={[ISSUER_ROLE, issuer.walletAddress as Hex]}
            onConfirmed={async (txHash) => {
              await suspendUser.mutateAsync({ walletAddress: issuer.walletAddress, txHash })
              onClose()
            }}
            successMessage="Issuer suspended"
            errorMessage="Suspension failed"
            variant="default"
          >
            Confirm Suspension
          </OnChainButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
