export type Theme = 'light' | 'dark';
export interface Document {
    id: string;
    name: string;
    hash: string;
    issuerId: string;
    issuerName: string;
    issuerEmail: string;
    issuedAt: Date;
    expiresAt?: Date;
    transactionHash?: string;
    blockNumber?: number;
}
export interface Issuer {
    id: string;
    name: string;
    email: string;
    organization: string;
    website?: string;
    description?: string;
    walletAddress: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
}
export interface VerificationResult {
    valid: boolean;
    document?: Document;
    issuer?: Issuer;
    message: string;
    timestamp: Date;
}
export type RequestStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export interface SessionUser {
    address: string;
    role: 'ADMIN' | 'ISSUER' | 'UNAPPROVED';
}
export interface AuditLog {
    id: string;
    action: string;
    actor: string;
    targetId: string;
    targetType: 'document' | 'issuer' | 'admin';
    details: Record<string, unknown>;
    createdAt: Date;
}
