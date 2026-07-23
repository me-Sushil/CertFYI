'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount only
  useEffect(() => {
    const stored = localStorage.getItem('certfyi-theme') as Theme | null
    const initialTheme = (stored && (stored === 'light' || stored === 'dark')) ? stored : 'dark'

    setThemeState(initialTheme)

    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(initialTheme)
    
    setMounted(true)
  }, [])

  // Apply theme changes to document
  useEffect(() => {
    if (!mounted) return

    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('certfyi-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
