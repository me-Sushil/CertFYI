import { OnModuleInit } from '@nestjs/common';
import type { IpfsFetchResult, IpfsPinStatus, IpfsProvider } from './ipfs-provider.interface';
export type PinOutcome = {
    pinned: true;
    cid: string;
    size: number;
    gatewayUrl: string;
    error?: undefined;
} | {
    pinned: false;
    cid: null;
    size: null;
    gatewayUrl: null;
    error: string;
};
export declare class IpfsService implements OnModuleInit {
    private readonly provider;
    private readonly logger;
    constructor(provider: IpfsProvider);
    onModuleInit(): void;
    isConfigured(): boolean;
    get providerName(): string;
    gatewayUrl(cid: string): string;
    pinFile(buffer: Buffer, filename: string, contentType: string): Promise<PinOutcome>;
    pinJson(data: unknown, name: string): Promise<PinOutcome>;
    fetchFile(cid: string): Promise<IpfsFetchResult>;
    status(cid: string): Promise<IpfsPinStatus>;
    private assertCid;
    private degraded;
    private describe;
}
