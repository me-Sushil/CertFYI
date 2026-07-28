import type {
  AccessRequestStatus,
  AdminRequestsResponse,
  AdminStatsResponse,
  AnchorDocumentRequest,
  ApiErrorBody,
  ApproveUserRequest,
  AuditLogEntry,
  BatchAnchorRequest,
  IpfsHealthResponse,
  IpfsPinStatusResponse,
  IssuerAccessRequestBody,
  IssuerDetailResponse,
  IssuerListResponse,
  IssuerRequestStatusResponse,
  IssuerRow,
  LogoutResponse,
  NonceResponse,
  PdfHashRequest,
  PdfUploadResponse,
  ReactivateIssuerRequest,
  RejectUserRequest,
  SessionResponse,
  SuspendIssuerRequest,
  VerifyDocumentRequest,
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
export const issuerApi = {
  getRequestStatus: () => request<IssuerRequestStatusResponse>('/issuer/request'),
  submitRequest: (body: IssuerAccessRequestBody) =>
    request('/issuer/request', { method: 'POST', body: JSON.stringify(body) }),
}

/** Documents */
export const documentsApi = {
  anchor: (body: AnchorDocumentRequest) =>
    request('/documents/anchor', { method: 'POST', body: JSON.stringify(body) }),
  getAnchor: (hash: string) => request(`/documents/anchor?hash=${encodeURIComponent(hash)}`),
  anchorBatch: (body: BatchAnchorRequest) =>
    request('/documents/anchor-batch', { method: 'POST', body: JSON.stringify(body) }),
  getBatch: (batchId: string) =>
    request(`/documents/anchor-batch?batchId=${encodeURIComponent(batchId)}`),
  verify: (body: VerifyDocumentRequest) =>
    request('/documents/verify', { method: 'POST', body: JSON.stringify(body) }),
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

/** IPFS */
export const ipfsApi = {
  health: () => request<IpfsHealthResponse>('/ipfs/health'),
  status: (cid: string) =>
    request<IpfsPinStatusResponse>(`/ipfs/${encodeURIComponent(cid)}/status`),
  /** Direct URL for streaming content through the API rather than the gateway. */
  contentUrl: (cid: string) => `${API_URL}/ipfs/${encodeURIComponent(cid)}`,
}
