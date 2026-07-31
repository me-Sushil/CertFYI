import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { issuerApi } from '@/lib/api'
import type {
  IssuerRequestStatusResponse,
  IssuerStatsResponse,
  IssuerDocumentsResponse,
  IssuerActivityResponse,
} from '@/lib/api-types'
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

export function useIssuerDocuments(
  enabled: boolean,
  params?: { search?: string },
) {
  return useInfiniteQuery<IssuerDocumentsResponse>({
    queryKey: keys.issuer.documents.list(params),
    queryFn: ({ pageParam }) =>
      issuerApi.getDocuments({
        search: params?.search,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: DOCUMENTS_STALE_MS,
    enabled,
  })
}

export function useIssuerActivity(enabled: boolean, params?: { action?: string }) {
  return useInfiniteQuery<IssuerActivityResponse>({
    queryKey: keys.issuer.activity.list(params),
    queryFn: ({ pageParam }) =>
      issuerApi.getActivity({ action: params?.action, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: ACTIVITY_STALE_MS,
    enabled,
  })
}

export function useRetryPin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (docHash: string) => issuerApi.retryPin(docHash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.issuer.activity.all })
      queryClient.invalidateQueries({ queryKey: keys.issuer.documents.all })
    },
  })
}

export function useLogFailedAnchor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { docHash: string; txHash?: string; reason: string }) =>
      issuerApi.logFailedAnchor(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.issuer.activity.all })
    },
  })
}
