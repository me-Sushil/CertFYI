import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import type { IpfsProvider, IpfsUploadResult, IpfsStatusResult } from '../ipfs-provider.interface'

@Injectable()
export class StorachaProvider implements IpfsProvider, OnModuleInit {
  private readonly logger = new Logger(StorachaProvider.name)
  private client: any = null

  async onModuleInit() {
    const agentKey = process.env.STORACHA_AGENT_KEY
    const delegationProof = process.env.STORACHA_DELEGATION_PROOF
    const spaceDid = process.env.STORACHA_SPACE_DID

    if (!agentKey || !delegationProof || !spaceDid) {
      this.logger.warn(
        'Storacha credentials not fully configured. IPFS uploads will fail until STORACHA_AGENT_KEY, ' +
          'STORACHA_DELEGATION_PROOF, and STORACHA_SPACE_DID are set.',
      )
      return
    }

    try {
      const mod = await this.loadModule()
      const { create } = mod
      const principal = mod.Signer.fromRaw(Buffer.from(agentKey, 'base64'))
      const store = new mod.StoreMemory()
      this.client = await create({ principal, store })

      const delegationBytes = Buffer.from(delegationProof, 'base64')
      const delegation = await this.client.addSpace(delegationBytes)
      await this.client.setCurrentSpace(delegation.space?.did() ?? spaceDid)

      this.logger.log('Storacha client initialised successfully')
    } catch (error) {
      this.logger.error('Failed to initialise Storacha client', error)
    }
  }

  private async loadModule(): Promise<{
    create: (opts: any) => Promise<any>
    StoreMemory: new () => any
    Signer: { fromRaw: (key: Uint8Array) => any }
  }> {
    try {
      // Dynamic imports with type assertions to avoid compile-time module resolution
      const w3up: any = await Function('return import("@web3-storage/w3up-client")')()
      const upload: any = await Function('return import("@web3-storage/upload-client")')()
      const principal: any = await Function('return import("@web3-storage/w3up-client/principal")')()
      return {
        create: w3up.create,
        StoreMemory: upload.StoreMemory,
        Signer: principal.Signer,
      }
    } catch {
      this.logger.error(
        '@web3-storage packages not installed. Install with: pnpm --filter @certfyi/api add @web3-storage/w3up-client @web3-storage/upload-client',
      )
      throw new Error('Storacha dependencies not available')
    }
  }

  async uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<IpfsUploadResult> {
    if (!this.client) {
      throw new Error('Storacha client not initialised')
    }

    const file = new File([buffer], filename, { type: contentType })
    const cid = await this.client.uploadFile(file)

    return { cid: cid.toString(), size: buffer.length }
  }

  async uploadJson(data: unknown, name: string): Promise<IpfsUploadResult> {
    if (!this.client) {
      throw new Error('Storacha client not initialised')
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const file = new File([blob], `${name}.json`, { type: 'application/json' })
    const cid = await this.client.uploadFile(file)

    const size = JSON.stringify(data).length
    return { cid: cid.toString(), size }
  }

  async fetch(cid: string): Promise<Buffer> {
    const gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://w3s.link/ipfs'
    const url = `${gatewayUrl}/${cid}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cid} from IPFS gateway: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async status(cid: string): Promise<IpfsStatusResult> {
    try {
      const gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://w3s.link/ipfs'
      const url = `${gatewayUrl}/${cid}`
      const response = await fetch(url, { method: 'HEAD' })
      return { pinned: response.ok }
    } catch {
      return { pinned: false }
    }
  }
}
