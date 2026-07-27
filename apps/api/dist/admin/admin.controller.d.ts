import { AdminService } from './admin.service';
import { ApproveUserDto, RejectUserDto, RequestsQueryDto } from '../common/dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getRequests(query: RequestsQueryDto): Promise<{
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
    approveUser(body: ApproveUserDto): Promise<{
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
    rejectUser(body: RejectUserDto): Promise<{
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
