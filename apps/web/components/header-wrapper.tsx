'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'

export function HeaderWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return null on server-side to prevent hydration mismatch
  if (!mounted) {
    return <div style={{ height: '92px' }} />
  }

  return <Header />
}
