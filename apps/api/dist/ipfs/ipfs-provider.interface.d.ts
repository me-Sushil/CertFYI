import type { Readable } from 'stream';
export interface IpfsUploadResult {
    cid: string;
    size: number;
}
export interface IpfsPinStatus {
    pinned: boolean;
}
export interface IpfsFetchResult {
    stream: Readable;
    contentType: string;
    contentLength?: number;
}
export interface IpfsProvider {
    readonly name: string;
    isConfigured(): boolean;
    uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<IpfsUploadResult>;
    uploadJson(data: unknown, name: string): Promise<IpfsUploadResult>;
    fetchFile(cid: string): Promise<IpfsFetchResult>;
    status(cid: string): Promise<IpfsPinStatus>;
    gatewayUrl(cid: string): string;
}
