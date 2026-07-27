import { z } from 'zod';
export declare const IssuerRegistrationSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    organization: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    walletAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    walletAddress: string;
    email: string;
    organization: string;
    description?: string | undefined;
    website?: string | undefined;
}, {
    name: string;
    walletAddress: string;
    email: string;
    organization: string;
    description?: string | undefined;
    website?: string | undefined;
}>;
export type IssuerRegistration = z.infer<typeof IssuerRegistrationSchema>;
export declare const DocumentVerificationSchema: z.ZodObject<{
    hash: z.ZodString;
    transactionHash: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    hash: string;
    transactionHash?: string | undefined;
}, {
    hash: string;
    transactionHash?: string | undefined;
}>;
export type DocumentVerification = z.infer<typeof DocumentVerificationSchema>;
export declare const ApprovalSchema: z.ZodObject<{
    issuerId: z.ZodString;
    approved: z.ZodBoolean;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    approved: boolean;
    issuerId: string;
    rejectionReason?: string | undefined;
}, {
    approved: boolean;
    issuerId: string;
    rejectionReason?: string | undefined;
}>;
export type Approval = z.infer<typeof ApprovalSchema>;
export declare const RevocationSchema: z.ZodObject<{
    documentHash: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    documentHash: string;
    reason?: string | undefined;
}, {
    documentHash: string;
    reason?: string | undefined;
}>;
export type Revocation = z.infer<typeof RevocationSchema>;
