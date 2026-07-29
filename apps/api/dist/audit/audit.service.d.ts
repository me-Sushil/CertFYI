import type { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface AuditRecordParams {
    action: AuditAction;
    actorAddress: string;
    targetRef: string;
    txHash?: string;
    detail?: string;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(params: AuditRecordParams): Promise<void>;
    find(params: {
        action?: string;
        actor?: string;
        from?: string;
        to?: string;
        cursor?: string;
        limit?: number;
    }): Promise<{
        entries: {
            actorName: string;
            id: string;
            action: string;
            actorAddress: string;
            targetRef: string;
            txHash: string | null;
            detail: string | null;
            createdAt: Date;
        }[];
        nextCursor: string | null;
    }>;
    private resolveNames;
    countByAction(action: AuditAction): Promise<number>;
}
