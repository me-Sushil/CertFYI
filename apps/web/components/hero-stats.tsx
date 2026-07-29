'use client'

import { Check } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlatformStats } from '@/queries/platform'

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function StatTile({ value, isLoading, isError, label }: { value?: number; isLoading: boolean; isError: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/10 bg-card/50 px-6 py-5 shadow-soft backdrop-blur-sm">
      {isLoading ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <span className="text-3xl font-extrabold tracking-tight text-foreground">
          {isError || value === undefined ? '—' : formatCount(value)}
        </span>
      )}
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-accent" aria-hidden />
        {label}
      </span>
    </div>
  )
}

export function HeroStats() {
  const { data: stats, isLoading, isError } = usePlatformStats()

  return (
    <div className="stagger-5 mx-auto grid max-w-2xl animate-fade-in-up grid-cols-2 gap-6 opacity-0">
      <StatTile value={stats?.totalDocumentsAnchored} isLoading={isLoading} isError={isError} label="Documents Issued" />
      <StatTile value={stats?.totalVerifications} isLoading={isLoading} isError={isError} label="Verifications" />
    </div>
  )
}
