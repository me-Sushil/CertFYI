import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentsApi, pdfApi } from '@/lib/api'
import { keys } from './keys'

const ANCHOR_STALE_MS = 60_000

export function useDocumentAnchorQuery(hash: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.document.anchor.detail(hash),
    queryFn: () => documentsApi.getAnchor(hash),
    staleTime: ANCHOR_STALE_MS,
    enabled,
  })
}

export function useAnchorDocumentMutation() {
  return useMutation({
    mutationFn: documentsApi.anchor,
  })
}

export function useRevokeDocumentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: documentsApi.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.issuer.documents.all })
      queryClient.invalidateQueries({ queryKey: keys.issuer.activity.all })
      queryClient.invalidateQueries({ queryKey: keys.issuer.stats.all })
    },
  })
}

export function useAnchorBatchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: documentsApi.anchorBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.issuer.documents.all })
      queryClient.invalidateQueries({ queryKey: keys.issuer.activity.all })
      queryClient.invalidateQueries({ queryKey: keys.issuer.stats.all })
    },
  })
}

export function useVerifyDocumentMutation() {
  return useMutation({
    mutationFn: documentsApi.verify,
  })
}

/**
 * Uploads a PDF, optionally pinning it to IPFS.
 *
 * Takes an object rather than a bare File: TanStack Query passes a context
 * object as the second argument to mutationFn, which would otherwise be
 * received as `storeOnIpfs`. Defaults to false - pinning publishes a permanent
 * public copy, so it has to be opted into explicitly.
 */
export function useUploadPdfMutation() {
  return useMutation({
    mutationFn: ({ file, storeOnIpfs = false }: { file: File; storeOnIpfs?: boolean }) =>
      pdfApi.upload(file, storeOnIpfs),
  })
}
