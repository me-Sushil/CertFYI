import { cn } from '@/lib/utils'

type BadgeTone = 'success' | 'destructive' | 'accent' | 'warning'

const TONE_CLASSES: Record<BadgeTone, { bg: string; dot: string }> = {
  success: { bg: 'bg-success/10 text-success', dot: 'bg-success' },
  destructive: { bg: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  accent: { bg: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  warning: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
}

interface StatusBadgeProps {
  label: string
  tone?: BadgeTone
}

export function StatusBadge({ label, tone = 'success' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        TONE_CLASSES[tone].bg,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', TONE_CLASSES[tone].dot)} />
      {label}
    </span>
  )
}
