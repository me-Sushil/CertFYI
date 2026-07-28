import type { IpfsFetchResult, IpfsPinStatus, IpfsProvider, IpfsUploadResult } from '../ipfs-provider.interface';
export declare class PinataProvider implements IpfsProvider {
    readonly name = "pinata";
    private readonly logger;
    private readonly jwt;
    private readonly network;
    private readonly gateway;
    isConfigured(): boolean;
    gatewayUrl(cid: string): string;
    uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<IpfsUploadResult>;
    uploadJson(data: unknown, name: string): Promise<IpfsUploadResult>;
    fetchFile(cid: string): Promise<IpfsFetchResult>;
    status(cid: string): Promise<IpfsPinStatus>;
    private post;
}
