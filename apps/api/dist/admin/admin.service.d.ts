import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
export declare class AdminService {
    private readonly prisma;
    private readonly blockchain;
    constructor(prisma: PrismaService, blockchain: BlockchainService);
    getRequests(statusParam?: string): Promise<{
        requests: {
            name: string | null;
            description: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            id: string;
            walletAddress: string;
            email: string | null;
            organization: string | null;
            website: string | null;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        }[];
    }>;
    approveUser(walletAddress: string, txHash: string): Promise<{
        accessRequest: {
            name: string | null;
            description: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            id: string;
            walletAddress: string;
            email: string | null;
            organization: string | null;
            website: string | null;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        };
    }>;
    rejectUser(walletAddress: string, reason?: string): Promise<{
        accessRequest: {
            name: string | null;
            description: string | null;
            status: import("@prisma/client").$Enums.RequestStatus;
            id: string;
            walletAddress: string;
            email: string | null;
            organization: string | null;
            website: string | null;
            createdAt: Date;
            decidedAt: Date | null;
            rejectionReason: string | null;
        };
    }>;
}
