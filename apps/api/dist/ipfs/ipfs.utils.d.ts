export declare function isValidCid(cid: string): boolean;
export declare function buildGatewayUrl(gatewayBase: string, cid: string): string;
export declare function sanitizeFilename(filename: string, fallback?: string): string;
export declare function formatBytes(bytes: number): string;
export declare class PermanentIpfsError extends Error {
    readonly status?: number | undefined;
    constructor(message: string, status?: number | undefined);
}
export declare function isRetryableStatus(status: number): boolean;
export interface RetryOptions {
    attempts?: number;
    baseDelayMs?: number;
    onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
