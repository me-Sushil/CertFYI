import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import type { AccessRequestRow, AdminDocumentRow, AuditLogEntry, IssuerRow } from '@/lib/api-types'
import { keys } from './keys'

const LISTS_STALE_MS = 15_000
const STATS_REFRESH_MS = 30_000

export function useAdminRequests(enabled: boolean) {
  return useQuery<AccessRequestRow[]>({
    queryKey: keys.admin.requests.all,
    queryFn: async () => {
      const data = await adminApi.getRequests()
      return data.requests ?? []
    },
    staleTime: LISTS_STALE_MS,
    enabled,
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.admin.requests.all })
      queryClient.invalidateQueries({ queryKey: keys.admin.stats.all })
      queryClient.invalidateQueries({ queryKey: keys.admin.issuers.lists() })
    },
  })
}

export function useRejectUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.admin.requests.all })
    },
  })
}

export function useAdminStats(enabled: boolean) {
  return useQuery({
    queryKey: keys.admin.stats.all,
    queryFn: adminApi.getStats,
    staleTime: STATS_REFRESH_MS,
    refetchInterval: STATS_REFRESH_MS,
    enabled,
  })
}

export function useIssuers(enabled: boolean, params?: { status?: string; search?: string }) {
  return useInfiniteQuery<{ issuers: IssuerRow[]; nextCursor: string | null }>({
    queryKey: keys.admin.issuers.list(params),
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined
      return adminApi.getIssuers({
        status: params?.status,
        search: params?.search,
        cursor,
        limit: 20,
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: LISTS_STALE_MS,
    enabled,
  })
}

export function useAdminDocuments(enabled: boolean, params?: { search?: string }) {
  return useInfiniteQuery<{ documents: AdminDocumentRow[]; nextCursor: string | null }>({
    queryKey: keys.admin.documents.list(params),
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined
      return adminApi.getDocuments({
        search: params?.search,
        cursor,
        limit: 20,
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: LISTS_STALE_MS,
    enabled,
  })
}

export function useSuspendIssuer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.suspendIssuer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.admin.issuers.lists() })
      queryClient.invalidateQueries({ queryKey: keys.admin.stats.all })
    },
  })
}

export function useReactivateIssuer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.reactivateIssuer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.admin.issuers.lists() })
      queryClient.invalidateQueries({ queryKey: keys.admin.stats.all })
    },
  })
}

export function useUploadIssuerMetadata() {
  return useMutation({
    mutationFn: (address: string) => adminApi.uploadIssuerMetadata(address),
  })
}

export function useConfirmIssuerMetadata() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ address, txHash }: { address: string; txHash: string }) =>
      adminApi.setIssuerMetadata(address, { txHash }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.admin.issuers.lists() })
    },
  })
}

export function useAuditLog(
  enabled: boolean,
  params?: { action?: string; actor?: string; from?: string; to?: string },
) {
  return useInfiniteQuery<{ entries: AuditLogEntry[]; nextCursor: string | null }>({
    queryKey: keys.admin.auditLog.list(params),
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined
      return adminApi.getAuditLog({
        action: params?.action,
        actor: params?.actor,
        from: params?.from,
        to: params?.to,
        cursor,
        limit: 20,
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: LISTS_STALE_MS,
    enabled,
  })
}
