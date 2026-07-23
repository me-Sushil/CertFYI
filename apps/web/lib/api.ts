import type {
  AccessRequestStatus,
  AdminRequestsResponse,
  AnchorDocumentRequest,
  ApiErrorBody,
  ApproveUserRequest,
  BatchAnchorRequest,
  IssuerAccessRequestBody,
  IssuerRequestStatusResponse,
  LogoutResponse,
  NonceResponse,
  PdfHashRequest,
  RejectUserRequest,
  SessionResponse,
  VerifyDocumentRequest,
  VerifyRequest,
  VerifyResponse,
} from './api-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export class ApiError extends Error {
  status: number
  body?: ApiErrorBody

  constructor(status: number, body?: ApiErrorBody) {
    super((body && (body.error || body.message)) ? String(body.error || body.message) : `Request failed with status ${status}`)
    this.status = status
    this.body = body
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
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request('/pdf/upload', { method: 'POST', body: formData as unknown as BodyInit })
  },
  hash: (body: PdfHashRequest) =>
    request('/pdf/upload', { method: 'PATCH', body: JSON.stringify(body) }),
}
