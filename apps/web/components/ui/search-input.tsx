'use client'

import { Search, Loader2 } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isSearchPending?: boolean
  isFetching?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  isSearchPending = false,
  isFetching = false,
}: SearchInputProps) {
  const showLoader = isSearchPending || (isFetching)
  return (
    <div className="relative flex-1 max-w-md">
      {showLoader ? (
        <Loader2
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      ) : (
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-border/10 bg-card pl-10 pr-4 text-sm text-foreground outline-none ring-1 ring-border/5 transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-accent/30 focus:ring-accent/10"
      />
    </div>
  )
}
