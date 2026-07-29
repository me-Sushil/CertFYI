import type {
  AccessRequestStatus,
  AdminDocumentsResponse,
  AdminRequestsResponse,
  AdminStatsResponse,
  AnchorDocumentRequest,
  AnchorDocumentResponse,
  ApiErrorBody,
  ApproveUserRequest,
  AuditLogResponse,
  BatchAnchorRequest,
  BatchAnchorResponse,
  IpfsHealthResponse,
  IpfsPinStatusResponse,
  IssuerAccessRequestBody,
  IssuerDetailResponse,
  IssuerListResponse,
  IssuerRequestStatusResponse,
  IssuerStatsResponse,
  IssuerDocumentsResponse,
  IssuerDocumentsQuery,
  IssuerActivityResponse,
  IssuerActivityQuery,
  PlatformStatsResponse,
  RetryPinResponse,
  LogoutResponse,
  NonceResponse,
  PdfHashRequest,
  PdfUploadResponse,
  ReactivateIssuerRequest,
  RejectUserRequest,
  RevokeDocumentRequest,
  RevokeDocumentResponse,
  SessionResponse,
  SetIssuerMetadataRequest,
  SetIssuerMetadataResponse,
  SuspendIssuerRequest,
  UploadIssuerMetadataResponse,
  VerifyDocumentRequest,
  VerifyDocumentResponse,
  VerifyRequest,
  VerifyResponse,
} from './api-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export class ApiError extends Error {
  status: number
  body?: ApiErrorBody

  constructor(status: number, body?: ApiErrorBody) {
    super(ApiError.describe(status, body))
    this.status = status
    this.body = body
  }

  /**
   * Nest puts the useful detail in `message` (an array, for validation errors)
   * and a generic label like "Bad Request" in `error`. Prefer `message`, or
   * every validation failure surfaces as the same unhelpful string.
   */
  private static describe(status: number, body?: ApiErrorBody): string {
    const message = body?.message
    if (Array.isArray(message) && message.length > 0) return message.join('; ')
    if (typeof message === 'string' && message.length > 0) return message
    if (body?.error) return body.error
    return `Request failed with status ${status}`
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(typeof init?.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => undefined)
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

/** Auth */
export const authApi = {
  getSession: () => request<SessionResponse>('/auth/session'),
  getNonce: () => request<NonceResponse>('/auth/nonce'),
  verify: (body: VerifyRequest) =>
    request<VerifyResponse>('/auth/verify', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<LogoutResponse>('/auth/logout', { method: 'POST' }),
}

/** Admin */
export const adminApi = {
  getRequests: (status?: AccessRequestStatus | 'ALL') =>
    request<AdminRequestsResponse>(`/admin/requests${status ? `?status=${status}` : ''}`),
  approveUser: (body: ApproveUserRequest) =>
    request('/admin/approve-user', { method: 'POST', body: JSON.stringify(body) }),
  rejectUser: (body: RejectUserRequest) =>
    request('/admin/reject-user', { method: 'POST', body: JSON.stringify(body) }),
  getStats: () => request<AdminStatsResponse>('/admin/stats'),
  getIssuers: (params?: { status?: string; search?: string; cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<IssuerListResponse>(`/admin/issuers${qs ? `?${qs}` : ''}`)
  },
  getIssuer: (address: string) => request<IssuerDetailResponse>(`/admin/issuers/${encodeURIComponent(address)}`),
  suspendIssuer: (body: SuspendIssuerRequest) =>
    request('/admin/suspend-issuer', { method: 'POST', body: JSON.stringify(body) }),
  reactivateIssuer: (body: ReactivateIssuerRequest) =>
    request('/admin/reactivate-issuer', { method: 'POST', body: JSON.stringify(body) }),
  uploadIssuerMetadata: (address: string) =>
    request<UploadIssuerMetadataResponse>(`/admin/issuers/${encodeURIComponent(address)}/metadata-upload`, {
      method: 'POST',
    }),
  setIssuerMetadata: (address: string, body: SetIssuerMetadataRequest) =>
    request<SetIssuerMetadataResponse>(`/admin/issuers/${encodeURIComponent(address)}/metadata`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getDocuments: (params?: { status?: string; search?: string; cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<AdminDocumentsResponse>(`/admin/documents${qs ? `?${qs}` : ''}`)
  },
  getAuditLog: (params?: { action?: string; actor?: string; from?: string; to?: string; cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.action) searchParams.set('action', params.action)
    if (params?.actor) searchParams.set('actor', params.actor)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<AuditLogResponse>(`/admin/audit-log${qs ? `?${qs}` : ''}`)
  },
}

/** Issuer */
function toQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const issuerApi = {
  getRequestStatus: () => request<IssuerRequestStatusResponse>('/issuer/request'),
  submitRequest: (body: IssuerAccessRequestBody) =>
    request('/issuer/request', { method: 'POST', body: JSON.stringify(body) }),
  getStats: () => request<IssuerStatsResponse>('/issuer/stats'),
  getDocuments: (query: IssuerDocumentsQuery = {}) =>
    request<IssuerDocumentsResponse>(
      `/issuer/documents${toQueryString({ status: query.status, search: query.search, cursor: query.cursor })}`,
    ),
  getActivity: (query: IssuerActivityQuery = {}) =>
    request<IssuerActivityResponse>(
      `/issuer/activity${toQueryString({ action: query.action, cursor: query.cursor })}`,
    ),
  retryPin: (docHash: string) =>
    request<RetryPinResponse>('/issuer/retry-pin', {
      method: 'POST',
      body: JSON.stringify({ docHash }),
    }),
  logFailedAnchor: (body: { docHash: string; txHash?: string; reason: string }) =>
    request<{ success: boolean }>('/issuer/log-failed-anchor', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

/** Documents */
export const documentsApi = {
  anchor: (body: AnchorDocumentRequest) =>
    request<AnchorDocumentResponse>('/documents/anchor', { method: 'POST', body: JSON.stringify(body) }),
  revoke: (body: RevokeDocumentRequest) =>
    request<RevokeDocumentResponse>('/documents/revoke', { method: 'POST', body: JSON.stringify(body) }),
  getAnchor: (hash: string) => request(`/documents/anchor?hash=${encodeURIComponent(hash)}`),
  anchorBatch: (body: BatchAnchorRequest) =>
    request<BatchAnchorResponse>('/documents/anchor-batch', { method: 'POST', body: JSON.stringify(body) }),
  getBatch: (batchId: string) =>
    request(`/documents/anchor-batch?batchId=${encodeURIComponent(batchId)}`),
  verify: (body: VerifyDocumentRequest) =>
    request<VerifyDocumentResponse>('/documents/verify', { method: 'POST', body: JSON.stringify(body) }),
  quickVerify: (hash: string) => request(`/documents/verify?hash=${encodeURIComponent(hash)}`),
}

/** PDF */
export const pdfApi = {
  /**
   * Hashes a PDF, and pins it to IPFS only when `storeOnIpfs` is true.
   *
   * Defaults to false: a CID is a permanent public handle, so publishing a
   * document that names its recipient has to be a deliberate choice.
   */
  upload: (file: File, storeOnIpfs = false) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storeOnIpfs', String(storeOnIpfs))
    return request<PdfUploadResponse>('/pdf/upload', {
      method: 'POST',
      body: formData as unknown as BodyInit,
    })
  },
  hash: (body: PdfHashRequest) =>
    request('/pdf/upload', { method: 'PATCH', body: JSON.stringify(body) }),
}

/** Platform (public) */
export const platformApi = {
  getStats: () => request<PlatformStatsResponse>('/stats'),
}

/** IPFS */
export const ipfsApi = {
  health: () => request<IpfsHealthResponse>('/ipfs/health'),
  status: (cid: string) =>
    request<IpfsPinStatusResponse>(`/ipfs/${encodeURIComponent(cid)}/status`),
  /** Direct URL for streaming content through the API rather than the gateway. */
  contentUrl: (cid: string) => `${API_URL}/ipfs/${encodeURIComponent(cid)}`,
}
