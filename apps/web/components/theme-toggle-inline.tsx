'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggleInline() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return <div className="h-9 w-[72px] rounded-full bg-foreground/5" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative flex h-9 w-[72px] items-center rounded-full bg-muted p-1 transition-colors duration-200 ease-[var(--ease-premium)]"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-button transition-transform duration-200 ease-[var(--ease-premium)] ${
          theme === 'dark' ? 'translate-x-9' : 'translate-x-0'
        }`}
      >
        {theme === 'light' ? (
          <Sun className="h-3.5 w-3.5 text-accent" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-foreground" />
        )}
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
