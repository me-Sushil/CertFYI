import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getHealth(): {
        status: string;
        service: string;
    };
    getPlatformStats(): Promise<{
        totalDocumentsAnchored: number;
        totalVerifications: number;
    }>;
}
