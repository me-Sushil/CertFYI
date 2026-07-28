import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AuditService } from '../audit/audit.service';
import { IpfsService } from '../ipfs/ipfs.service';
export declare class AdminService {
    private readonly prisma;
    private readonly blockchain;
    private readonly audit;
    private readonly ipfs;
    constructor(prisma: PrismaService, blockchain: BlockchainService, audit: AuditService, ipfs: IpfsService);
    getRequests(statusParam?: string): Promise<{
        requests: $Public.PrismaPromise<T>;
    }>;
    approveUser(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        accessRequest: $Utils.JsPromise<R>;
    }>;
    rejectUser(walletAddress: string, reason: string | undefined, adminAddress: string): Promise<{
        accessRequest: any;
    }>;
    getStats(): Promise<{
        totalIssuers: any;
        pendingApprovals: any;
        documentsAnchored: any;
        suspendedIssuers: any;
    }>;
    getIssuers(params: {
        status?: string;
        search?: string;
        cursor?: string;
        limit?: number;
    }): Promise<{
        issuers: $Public.PrismaPromise<T>;
        nextCursor: any;
    }>;
    getIssuerDetail(address: string): Promise<{
        issuer: any;
        recentActivity: $Public.PrismaPromise<T>;
    }>;
    suspendIssuer(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        issuer: $Utils.JsPromise<R>;
    }>;
    reactivateIssuer(walletAddress: string, txHash: string, adminAddress: string): Promise<{
        issuer: $Utils.JsPromise<R>;
    }>;
    uploadIssuerMetadata(address: string): Promise<{
        metadataUri: string;
        cid: string;
    }>;
    setIssuerMetadataOnChain(address: string, txHash: string, adminAddress: string): Promise<{
        issuer: any;
    }>;
    getAuditLog(params: {
        action?: string;
        actor?: string;
        from?: string;
        to?: string;
        cursor?: string;
        limit?: number;
    }): Promise<{
        entries: {
            actorName: {};
            id: string;
            action: string;
            actorAddress: string;
            targetRef: string;
            txHash: string | null;
            detail: string | null;
            createdAt: Date;
        }[];
        nextCursor: any;
    }>;
    exportAuditLog(params: {
        action?: string;
        actor?: string;
        from?: string;
        to?: string;
    }, res: Response): Promise<void>;
    getIpfsPinFailures(): Promise<{
        count: $Public.PrismaPromise<T>;
    }>;
}
