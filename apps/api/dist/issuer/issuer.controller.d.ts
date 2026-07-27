import { IssuerService } from './issuer.service';
import { AccessRequestDto } from '../common/dto/issuer.dto';
import type { SessionPayload } from '../common/constants/roles.constant';
export declare class IssuerController {
    private readonly issuerService;
    constructor(issuerService: IssuerService);
    submitRequest(user: SessionPayload, body: AccessRequestDto): Promise<{
        requestStatus: import("@prisma/client").$Enums.RequestStatus;
    }>;
    getStatus(user: SessionPayload): Promise<{
        requestStatus: string;
    }>;
}
