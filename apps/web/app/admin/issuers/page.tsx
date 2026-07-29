'use client'

import { useState } from 'react'
import type { Hex } from 'viem'
import { Button } from '@/components/ui/button'
import { OnChainButton } from '@/components/admin/on-chain-button'
import { ChainBanner } from '@/components/admin/chain-banner'
import { IssuerMetadataPanel } from '@/components/admin/issuer-metadata-panel'
import { StatusBadge } from '@/components/ui/status-badge'
import { SearchInput } from '@/components/ui/search-input'
import { FilterGroup } from '@/components/ui/filter-group'
import { LoadMoreButton } from '@/components/ui/load-more-button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Shield, AlertTriangle, Users, ChevronDown } from 'lucide-react'
import { ISSUER_ROLE } from '@/lib/contracts/document-anchor'
import { useIssuers, useSuspendIssuer, useReactivateIssuer } from '@/queries/admin'
import { formatAddress, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { IssuerRow } from '@/lib/api-types'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
]

const ISSUER_BADGE: Record<string, { label: string; tone: 'success' | 'destructive' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  SUSPENDED: { label: 'Suspended', tone: 'destructive' },
}

export default function IssuerManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [confirmSuspend, setConfirmSuspend] = useState<IssuerRow | null>(null)
  const reactivateUser = useReactivateIssuer()

  const {
    data: pagesData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useIssuers(true, { status: filterStatus, search: searchTerm || undefined })
  const issuers = pagesData?.pages.flatMap((p) => p.issuers) ?? []

  return (
    <div>
      <ChainBanner />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, organization, or wallet..."
        />
        <FilterGroup options={STATUS_FILTERS} value={filterStatus} onChange={setFilterStatus} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[20px] bg-card/50 shadow-soft ring-1 ring-border/5" />
          ))}
        </div>
      ) : issuers.length === 0 ? (
        <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
          <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-semibold text-muted-foreground">
            {searchTerm ? 'No issuers match your search' : 'No issuers found'}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[20px] bg-card shadow-card ring-1 ring-border/5 sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/10">
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Organization</th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Docs</th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Status</th>
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

          <div className="space-y-3 sm:hidden">
            {issuers.map((issuer) => {
              const isOpen = expandedRow === issuer.walletAddress
              return (
                <div key={issuer.walletAddress} className="rounded-[20px] bg-card shadow-card ring-1 ring-border/5 transition-all duration-200">
                  <button
                    onClick={() => setExpandedRow(isOpen ? null : issuer.walletAddress)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {issuer.organization || issuer.name || 'Unnamed Issuer'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {issuer.email || formatAddress(issuer.walletAddress)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge {...ISSUER_BADGE[issuer.status]} />
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
                          <p className="font-semibold text-muted-foreground mb-0.5">Wallet</p>
                          <p className="font-mono text-foreground">{formatAddress(issuer.walletAddress, 8)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground mb-0.5">Registered</p>
                          <p className="text-foreground">{formatDate(issuer.registeredAt)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground mb-0.5">Documents</p>
                          <p className="text-foreground">{issuer.documentCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground mb-0.5">Status</p>
                          <StatusBadge {...ISSUER_BADGE[issuer.status]} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {issuer.status === 'ACTIVE' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmSuspend(issuer)}
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
                      {issuer.status === 'ACTIVE' && (
                        <div className="border-t border-border/10 pt-3">
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">Off-Chain Profile</p>
                          <IssuerMetadataPanel issuer={issuer} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <LoadMoreButton hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} />
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
        className="cursor-pointer border-b border-border/5 transition-colors last:border-b-0 hover:bg-muted/20"
        onClick={onToggle}
      >
        <td className="px-6 py-4">
          <p className="text-sm font-semibold text-foreground">
            {issuer.organization || issuer.name || 'Unnamed Issuer'}
          </p>
          <p className="text-xs text-muted-foreground">{issuer.email || formatAddress(issuer.walletAddress)}</p>
        </td>
        <td className="px-6 py-4 text-sm text-muted-foreground">
          {issuer.documentCount.toLocaleString()}
        </td>
        <td className="px-6 py-4">
          <StatusBadge {...ISSUER_BADGE[issuer.status]} />
        </td>
        <td className="px-6 py-4 text-right">
          <ChevronDown
            className={cn(
              'inline-block h-4 w-4 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
            aria-hidden
          />
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
                <StatusBadge {...ISSUER_BADGE[issuer.status]} />
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
            {issuer.status === 'ACTIVE' && (
              <div className="mt-4 border-t border-border/10 pt-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Off-Chain Profile</p>
                <IssuerMetadataPanel issuer={issuer} />
              </div>
            )}
          </td>
        </tr>
      )}
    </>
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
