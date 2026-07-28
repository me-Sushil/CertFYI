import { Inject, Injectable, Logger } from '@nestjs/common'
import type { IpfsProvider } from './ipfs-provider.interface'
import { IPFS_PROVIDER_TOKEN } from './ipfs.constants'

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name)

  constructor(@Inject(IPFS_PROVIDER_TOKEN) private readonly provider: IpfsProvider) {}

  async uploadFile(buffer: Buffer, filename: string, contentType: string) {
    try {
      const result = await this.provider.uploadFile(buffer, filename, contentType)
      this.logger.log(`File uploaded to IPFS: ${result.cid} (${result.size} bytes)`)
      return result
    } catch (error) {
      this.logger.error('IPFS file upload failed', error)
      throw error
    }
  }

  async uploadJson(data: unknown, name: string) {
    try {
      const result = await this.provider.uploadJson(data, name)
      this.logger.log(`JSON uploaded to IPFS: ${result.cid}`)
      return result
    } catch (error) {
      this.logger.error('IPFS JSON upload failed', error)
      throw error
    }
  }

  async fetch(cid: string): Promise<Buffer> {
    try {
      return await this.provider.fetch(cid)
    } catch (error) {
      this.logger.error(`IPFS fetch failed for ${cid}`, error)
      throw error
    }
  }

  async status(cid: string) {
    try {
      return await this.provider.status(cid)
    } catch (error) {
      this.logger.error(`IPFS status check failed for ${cid}`, error)
      return { pinned: false }
    }
  }
}
