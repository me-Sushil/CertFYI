/**
 * ⚙️ GENERATED from apps/api's OpenAPI spec — never hand-edited.
 * Run `pnpm generate:web-types` (scripts/generate-web-types.ts) to refresh.
 */

export type SessionRole = 'ADMIN' | 'ISSUER' | 'UNAPPROVED'

export interface SessionResponse {
  address: string | null
  role: SessionRole | null
}

export interface NonceResponse {
  nonce: string
}

export interface VerifyRequest {
  message: string
  signature: string
}

export interface VerifyResponse {
  address: string
  role: SessionRole
  requestStatus?: string
}

export interface LogoutResponse {
  success: boolean
}

export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AccessRequestRow {
  id: string
  walletAddress: string
  name: string | null
  email: string | null
  organization: string | null
  createdAt: string
  status: AccessRequestStatus
}

export interface AdminRequestsResponse {
  requests: AccessRequestRow[]
}

export interface ApproveUserRequest {
  walletAddress: string
  txHash: string
}

export interface RejectUserRequest {
  walletAddress: string
  reason?: string
}

export interface IssuerRequestStatusResponse {
  requestStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface IssuerAccessRequestBody {
  name?: string
  email?: string
  organization?: string
  website?: string
  description?: string
}

export interface AnchorDocumentRequest {
  documentHash: string
  documentType: string
  recipientEmail?: string
  recipientName?: string
  issuerAddress: string
  issuerName?: string
}

export interface BatchAnchorDocumentEntry {
  documentHash: string
  recipientEmail?: string
  recipientName?: string
}

export interface BatchAnchorRequest {
  documents: BatchAnchorDocumentEntry[]
  issuerAddress: string
  issuerName?: string
  batchId: string
}

export interface VerifyDocumentRequest {
  documentHash: string
  pdfContent?: string
}

export interface PdfHashRequest {
  pdfContent: string
  filename: string
}

export interface IssuerRow {
  walletAddress: string
  name: string | null
  email: string | null
  organization: string | null
  approvedAt: string | null
  documentCount: number
}

export interface AuditLogEntry {
  id: string
  action: string
  actor: string
  target: string | null
  details: string | null
  timestamp: string
}

export interface ApiErrorBody {
  error?: string
  message?: string | string[]
}
