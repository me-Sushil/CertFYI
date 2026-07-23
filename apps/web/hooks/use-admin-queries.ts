import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import type { AccessRequestRow } from '@/lib/api-types'

export function useAdminRequests(enabled: boolean) {
  return useQuery<AccessRequestRow[]>({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const data = await adminApi.getRequests()
      return data.requests ?? []
    },
    enabled,
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] })
    },
  })
}

export function useRejectUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] })
    },
  })
}
