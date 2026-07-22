'use client'

import { useQuery } from '@tanstack/react-query'
import type { SessionRole } from './session'

interface SessionResponse {
  address: string | null
  role: SessionRole | null
}

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch('/api/auth/session')
  if (!res.ok) return { address: null, role: null }
  return res.json()
}

export function useSession() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: 30_000,
  })

  return {
    address: query.data?.address ?? null,
    role: query.data?.role ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
