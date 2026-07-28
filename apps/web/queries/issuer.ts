import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { issuerApi } from '@/lib/api'
import type { IssuerRequestStatusResponse } from '@/lib/api-types'
import { keys } from './keys'

const STATUS_STALE_MS = 10_000

export function useIssuerRequestStatus(enabled: boolean) {
  return useQuery<IssuerRequestStatusResponse>({
    queryKey: keys.issuer.requestStatus.all,
    queryFn: async () => {
      try {
        return await issuerApi.getRequestStatus()
      } catch {
        return { requestStatus: 'NONE' as const }
      }
    },
    staleTime: STATUS_STALE_MS,
    enabled,
  })
}

export function useSubmitIssuerRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: issuerApi.submitRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.issuer.requestStatus.all })
    },
  })
}
