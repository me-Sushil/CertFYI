import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { SessionRole } from '@/lib/api-types'
import { keys } from './keys'

export type { SessionRole }

const SESSION_STALE_MS = 30_000

export function useSession() {
  const query = useQuery({
    queryKey: keys.session.all,
    queryFn: authApi.getSession,
    staleTime: SESSION_STALE_MS,
    retry: false,
  })

  return {
    address: query.data?.address ?? null,
    role: query.data?.role ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useNonceMutation() {
  return useMutation({
    mutationFn: authApi.getNonce,
  })
}

export function useVerifySiweMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.verify,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.session.all })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.session.all })
    },
  })
}
