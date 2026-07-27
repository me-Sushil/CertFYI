import { type SessionRole } from '../constants/roles.constant';
export declare class VerifyDto {
    message: string;
    signature: string;
}
export declare class NonceResponseDto {
    nonce: string;
}
export declare class VerifyResponseDto {
    address: string;
    role: SessionRole;
    requestStatus?: string;
}
export declare class SessionResponseDto {
    address: string | null;
    role: SessionRole | null;
}
export declare class LogoutResponseDto {
    success: boolean;
}
