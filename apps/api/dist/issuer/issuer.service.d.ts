import { PrismaService } from '../prisma/prisma.service';
import type { AccessRequestDto } from '../common/dto/issuer.dto';
export declare class IssuerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    submitRequest(address: string, data: AccessRequestDto): Promise<{
        requestStatus: any;
    }>;
    getStatus(address: string): Promise<{
        requestStatus: any;
    }>;
}
