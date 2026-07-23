import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { issuerApi } from '@/lib/api'
import type { IssuerRequestStatusResponse } from '@/lib/api-types'

export function useIssuerRequestStatus(enabled: boolean) {
  return useQuery<IssuerRequestStatusResponse>({
    queryKey: ['issuer-request-status'],
    queryFn: async () => {
      try {
        return await issuerApi.getRequestStatus()
      } catch {
        return { requestStatus: 'NONE' as const }
      }
    },
    enabled,
  })
}

export function useSubmitIssuerRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: issuerApi.submitRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issuer-request-status'] })
    },
  })
}
