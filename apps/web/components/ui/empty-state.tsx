import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-card p-12 text-center shadow-card ring-1 ring-border/5 animate-fade-in-up">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10">
        <Icon className="h-7 w-7 text-accent" aria-hidden />
      </div>
      <h3 className="mb-1 text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
        {title}
      </h3>
      <p className="max-w-sm text-sm font-medium text-muted-foreground">{description}</p>
    </div>
  )
}
