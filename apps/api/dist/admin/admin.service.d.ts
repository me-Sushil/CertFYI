import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
export declare class AdminService {
    private readonly prisma;
    private readonly blockchain;
    constructor(prisma: PrismaService, blockchain: BlockchainService);
    getRequests(statusParam?: string): Promise<{
        requests: $Public.PrismaPromise<T>;
    }>;
    approveUser(walletAddress: string, txHash: string): Promise<{
        accessRequest: $Result.GetResult<import(".prisma/client").Prisma.$AccessRequestPayload<ExtArgs>, T, "upsert">;
    }>;
    rejectUser(walletAddress: string, reason?: string): Promise<{
        accessRequest: any;
    }>;
}
