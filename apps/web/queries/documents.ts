import { useMutation, useQuery } from '@tanstack/react-query'
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

export function useAnchorBatchMutation() {
  return useMutation({
    mutationFn: documentsApi.anchorBatch,
  })
}

export function useVerifyDocumentMutation() {
  return useMutation({
    mutationFn: documentsApi.verify,
  })
}

export function useUploadPdfMutation() {
  return useMutation({
    mutationFn: pdfApi.upload,
  })
}
