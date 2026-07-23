export declare class ApproveUserDto {
    walletAddress: string;
    txHash: string;
}
export declare class RejectUserDto {
    walletAddress: string;
    reason?: string;
}
export declare class RequestsQueryDto {
    status?: string;
}
