import { z } from 'zod'

// Issuer Registration Schema
export const IssuerRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  organization: z.string().min(2, 'Organization must be at least 2 characters'),
  website: z.string().url('Invalid URL').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
})

export type IssuerRegistration = z.infer<typeof IssuerRegistrationSchema>

// Document Verification Schema
export const DocumentVerificationSchema = z.object({
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid document hash'),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
})

export type DocumentVerification = z.infer<typeof DocumentVerificationSchema>

// Approval Schema
export const ApprovalSchema = z.object({
  issuerId: z.string().uuid('Invalid issuer ID'),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
})

export type Approval = z.infer<typeof ApprovalSchema>

// Revocation Schema
export const RevocationSchema = z.object({
  documentHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid document hash'),
  reason: z.string().optional(),
})

export type Revocation = z.infer<typeof RevocationSchema>
