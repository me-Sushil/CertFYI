'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi } from './api'
import type { SessionRole } from './api-types'
import { keys } from '@/queries/keys'

export type { SessionRole }

export function useSession() {
  const query = useQuery({
    queryKey: keys.session.all,
    queryFn: authApi.getSession,
    staleTime: 30_000,
    retry: false,
  })

  return {
    address: query.data?.address ?? null,
    role: query.data?.role ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
