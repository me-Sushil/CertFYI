import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const TONE_CLASSES = {
  default: 'bg-muted text-foreground',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
} as const

interface StatCardProps {
  label: string
  value: string | number | null | undefined
  icon: LucideIcon
  tone?: keyof typeof TONE_CLASSES
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, tone = 'default', loading }: StatCardProps) {
  return (
    <div className="group rounded-[20px] bg-card p-6 shadow-card ring-1 ring-border/5 transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:shadow-button">
      <div className="mb-5 flex items-start justify-between">
        <div className={cn('flex size-11 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mb-2 text-sm font-semibold text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-9 w-20" />
      ) : (
        <p className="text-4xl font-extrabold tabular-nums text-foreground">{value ?? '—'}</p>
      )}
    </div>
  )
}
