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
import { cn } from '@/lib/utils'
import type { IssuerRow } from '@/lib/api-types'

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'SUSPENDED'] as const
const TABLE_HEAD = ['Organization', 'Docs', 'Status', '']

export default function IssuerManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [confirmSuspend, setConfirmSuspend] = useState<IssuerRow | null>(null)

  const {
    data: pagesData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useIssuers(true, { status: filterStatus, search: searchTerm || undefined })
  const issuers = pagesData?.pages.flatMap((p) => p.issuers) ?? []

  return (
    <div className="animate-fade-in">
      <ChainBanner />

      <div className="mb-8">
        <h1 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
          Issuer Management
        </h1>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Manage verified issuers and their credentials
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Search by name, organization, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-full border border-border/15 bg-card pr-5 pl-10 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
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
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/15">
                {TABLE_HEAD.map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-extrabold text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/15">
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-48" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-12" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : issuers.length === 0 ? (
        <EmptyState icon={Users} title="No issuers found" description="Try adjusting your search or filter criteria." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg bg-card shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/15">
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Organization</th>
                  <th className="hidden px-6 py-4 text-left text-sm font-extrabold text-foreground sm:table-cell">
                    Docs
                  </th>
                  <th className="hidden px-6 py-4 text-left text-sm font-extrabold text-foreground md:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-extrabold text-foreground" />
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
            <div className="py-6 text-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      <SuspendConfirmDialog issuer={confirmSuspend} onClose={() => setConfirmSuspend(null)} />
    </div>
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
      <tr
        className="cursor-pointer border-b border-border/15 transition-colors duration-150 ease-[var(--ease-premium)] hover:bg-muted/30"
        onClick={onToggle}
      >
        <td className="px-6 py-4">
          <p className="text-sm font-semibold text-foreground">
            {issuer.organization || issuer.name || 'Unnamed Issuer'}
          </p>
          <p className="text-xs text-muted-foreground">{issuer.email || formatAddress(issuer.walletAddress)}</p>
        </td>
        <td className="hidden px-6 py-4 text-sm text-muted-foreground sm:table-cell">
          {issuer.documentCount.toLocaleString()}
        </td>
        <td className="hidden px-6 py-4 md:table-cell">
          <StatusBadge status={issuer.status} />
        </td>
        <td className="px-6 py-4 text-right">
          {isExpanded ? (
            <ChevronUp className="inline-block h-4 w-4 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronDown className="inline-block h-4 w-4 text-muted-foreground" aria-hidden />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={4} className="px-6 py-5">
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-0.5 text-xs font-semibold text-muted-foreground">Wallet</p>
                <p className="font-mono text-xs text-foreground">{formatAddress(issuer.walletAddress, 8)}</p>
              </div>
              <div>
                <p className="mb-0.5 text-xs font-semibold text-muted-foreground">Registered</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(issuer.registeredAt)}</p>
              </div>
              <div>
                <p className="mb-0.5 text-xs font-semibold text-muted-foreground">Status</p>
                <StatusBadge status={issuer.status} />
              </div>
            </div>
            <div className="flex gap-2">
              {issuer.status === 'ACTIVE' ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-destructive hover:bg-destructive/10"
                  onClick={onSuspend}
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden /> Suspend
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
                  <Shield className="h-4 w-4" aria-hidden /> Reactivate
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
  const isActive = status === 'ACTIVE'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
        isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-success' : 'bg-destructive')} />
      {isActive ? 'Active' : 'Suspended'}
    </span>
  )
}

function SuspendConfirmDialog({ issuer, onClose }: { issuer: IssuerRow | null; onClose: () => void }) {
  const suspendUser = useSuspendIssuer()
  if (!issuer) return null

  return (
    <AlertDialog open={!!issuer} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend Issuer</AlertDialogTitle>
          <AlertDialogDescription>
            This will revoke <strong>{issuer.organization || issuer.name || 'this issuer'}</strong>&apos;s
            ISSUER_ROLE on-chain ({formatAddress(issuer.walletAddress)}). They have{' '}
            <strong>{issuer.documentCount}</strong> documents anchored, which remain valid after
            suspension.
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
