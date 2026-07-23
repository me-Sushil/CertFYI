import { useMutation, useQuery } from '@tanstack/react-query'
import { documentsApi, pdfApi } from '@/lib/api'

export function useDocumentAnchor(hash: string, enabled: boolean) {
  return useQuery({
    queryKey: ['document-anchor', hash],
    queryFn: () => documentsApi.getAnchor(hash),
    enabled,
  })
}

export function useAnchorDocument() {
  return useMutation({
    mutationFn: documentsApi.anchor,
  })
}

export function useAnchorBatch() {
  return useMutation({
    mutationFn: documentsApi.anchorBatch,
  })
}

export function useVerifyDocument() {
  return useMutation({
    mutationFn: documentsApi.verify,
  })
}

export function useUploadPdf() {
  return useMutation({
    mutationFn: pdfApi.upload,
  })
}
