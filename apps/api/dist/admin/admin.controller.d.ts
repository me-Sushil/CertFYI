import { AdminService } from './admin.service';
import { ApproveUserDto, RejectUserDto, RequestsQueryDto } from '../common/dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getRequests(query: RequestsQueryDto): Promise<{
        requests: $Public.PrismaPromise<T>;
    }>;
    approveUser(body: ApproveUserDto): Promise<{
        accessRequest: $Result.GetResult<import(".prisma/client").Prisma.$AccessRequestPayload<ExtArgs>, T, "upsert">;
    }>;
    rejectUser(body: RejectUserDto): Promise<{
        accessRequest: any;
    }>;
}
