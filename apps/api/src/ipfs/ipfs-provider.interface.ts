export interface IpfsUploadResult {
  cid: string
  size: number
}

export interface IpfsStatusResult {
  pinned: boolean
}

export interface IpfsProvider {
  uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<IpfsUploadResult>
  uploadJson(data: unknown, name: string): Promise<IpfsUploadResult>
  fetch(cid: string): Promise<Buffer>
  status(cid: string): Promise<IpfsStatusResult>
}
