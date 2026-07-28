import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { issuerApi } from '@/lib/api'
import type { IssuerRequestStatusResponse, IssuerStatsResponse, IssuerDocumentsResponse, IssuerActivityResponse } from '@/lib/api-types'
import { keys } from './keys'

const STATUS_STALE_MS = 10_000
const STATS_STALE_MS = 15_000
const DOCUMENTS_STALE_MS = 10_000
const ACTIVITY_STALE_MS = 15_000

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

export function useIssuerStats(enabled: boolean) {
  return useQuery<IssuerStatsResponse>({
    queryKey: keys.issuer.stats.all,
    queryFn: () => issuerApi.getStats(),
    staleTime: STATS_STALE_MS,
    enabled,
  })
}

export function useIssuerDocuments(enabled: boolean, cursor?: string) {
  return useQuery<IssuerDocumentsResponse>({
    queryKey: keys.issuer.documents.list(cursor),
    queryFn: () => issuerApi.getDocuments(cursor),
    staleTime: DOCUMENTS_STALE_MS,
    enabled,
  })
}

export function useIssuerActivity(enabled: boolean) {
  return useQuery<IssuerActivityResponse>({
    queryKey: keys.issuer.activity.all,
    queryFn: () => issuerApi.getActivity(),
    staleTime: ACTIVITY_STALE_MS,
    enabled,
  })
}
