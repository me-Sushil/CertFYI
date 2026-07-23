'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi } from './api'
import type { SessionRole } from './api-types'

export type { SessionRole }

/** Reads the caller's SIWE session from apps/api (httpOnly cookie, verified server-side). */
export function useSession() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: authApi.getSession,
    staleTime: 30_000,
  })

  return {
    address: query.data?.address ?? null,
    role: query.data?.role ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
