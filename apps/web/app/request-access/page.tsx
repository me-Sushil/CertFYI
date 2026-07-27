'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RequestAccessRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/issue-certificate')
  }, [router])

  return null
}

