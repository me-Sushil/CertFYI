import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface FilterGroupProps {
  options: readonly FilterOption[] | FilterOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterGroup({ options, value, onChange }: FilterGroupProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            'rounded-xl px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)]',
            value === opt.value
              ? 'bg-primary text-primary-foreground shadow-button'
              : 'bg-card text-muted-foreground shadow-soft ring-1 ring-border/5 hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
