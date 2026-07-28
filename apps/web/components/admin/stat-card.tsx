import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: string | number | null | undefined
  icon: LucideIcon
  color?: string
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, color = 'text-primary', loading }: StatCardProps) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      {loading ? (
        <Skeleton className="h-9 w-20" />
      ) : (
        <p className="text-3xl font-bold">{value ?? '—'}</p>
      )}
    </div>
  )
}
