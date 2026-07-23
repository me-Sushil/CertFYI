import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'

export function useNonce() {
  return useMutation({
    mutationFn: authApi.getNonce,
  })
}

export function useVerifySiwe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.verify,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}
