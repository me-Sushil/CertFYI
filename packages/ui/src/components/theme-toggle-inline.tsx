'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggleInline() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <div className="flex gap-1 p-1 rounded-lg border border-border bg-muted">
        <Button variant="ghost" size="sm" disabled className="w-10 h-10 p-0">
          <Sun className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" disabled className="w-10 h-10 p-0">
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-1 p-1 rounded-lg border border-border bg-muted">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="w-10 h-10 p-0"
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light mode</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="w-10 h-10 p-0"
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark mode</span>
      </Button>
    </div>
  )
}
