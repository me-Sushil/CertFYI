'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authApi } from './api'
import type { SessionRole } from './api-types'

export type { SessionRole }

function readLocalSession(): { address: string | null; role: SessionRole | null } {
  try {
    const role = localStorage.getItem('certfyi_role') as SessionRole | null
    const address = localStorage.getItem('certfyi_address')
    if (role && address) return { address, role }
  } catch { /* localStorage unavailable */ }
  return { address: null, role: null }
}

/**
 * Reads the caller's SIWE session from apps/api (httpOnly cookie, verified server-side).
 * Falls back to localStorage for instant initial render — the server is the source of truth.
 */
export function useSession() {
  const [localSession] = useState(readLocalSession)

  const query = useQuery({
    queryKey: ['session'],
    queryFn: authApi.getSession,
    staleTime: 30_000,
    // On first call, if the server says "not signed in" but localStorage
    // has a saved session, wait a moment before showing "unauthenticated"
    //        — the cookie may just not be ready yet.
    retry: 1,
    retryDelay: 500,
  })

  // If the server confirms a session, sync it down to localStorage
  const serverSession = query.data
  useEffect(() => {
    if (serverSession?.address && serverSession?.role) {
      try {
        localStorage.setItem('certfyi_role', serverSession.role)
        localStorage.setItem('certfyi_address', serverSession.address)
      } catch { /* ignore */ }
    }
  }, [serverSession])

  // Use localStorage as instant fallback during loading
  if (query.isLoading && localSession.address) {
    return {
      address: localSession.address,
      role: localSession.role,
      isLoading: true,
      refetch: query.refetch,
    }
  }

  return {
    address: query.data?.address ?? null,
    role: query.data?.role ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
