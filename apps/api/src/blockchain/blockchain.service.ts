import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import crypto from 'crypto'
import { createPublicClient, http, keccak256, parseEventLogs, stringToBytes, type Hex, getAddress } from 'viem'

export const ADMIN_ROLE = keccak256(stringToBytes('ADMIN_ROLE'))
export const ISSUER_ROLE = keccak256(stringToBytes('ISSUER_ROLE'))

const RoleGrantedEvent = {
  type: 'event',
  name: 'RoleGranted',
  inputs: [
    { indexed: true, name: 'role', type: 'bytes32' },
    { indexed: true, name: 'account', type: 'address' },
    { indexed: true, name: 'sender', type: 'address' },
  ],
} as const

const RoleRevokedEvent = {
  type: 'event',
  name: 'RoleRevoked',
  inputs: [
    { indexed: true, name: 'role', type: 'bytes32' },
    { indexed: true, name: 'account', type: 'address' },
    { indexed: true, name: 'sender', type: 'address' },
  ],
} as const

const ROLE_EVENTS = [RoleGrantedEvent, RoleRevokedEvent]

export interface RoleGrantVerification {
  ok: boolean
  error?: string
  status?: number
}

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name)
  private publicClient!: ReturnType<typeof createPublicClient>

  readonly contractAddress: string
  readonly contractChainId: number

  constructor() {
    // BUG-6: Fail-fast CONTRACT_ADDRESS validation. No fallback — a silent
    // wrong address is worse than a startup crash.
    const rawAddress =
      process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
    if (!rawAddress) {
      throw new Error(
        'CONTRACT_ADDRESS is not set. Set CONTRACT_ADDRESS (or NEXT_PUBLIC_CONTRACT_ADDRESS) ' +
        'in the environment before starting the server.',
      )
    }
    try {
      this.contractAddress = getAddress(rawAddress)
    } catch {
      throw new Error(
        `CONTRACT_ADDRESS "${rawAddress}" is not a valid EVM address. ` +
        'Provide a 40-character hex address with 0x prefix.',
      )
    }

    const rawChainId = process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID
    if (!rawChainId) {
      throw new Error(
        'CHAIN_ID is not set. Set CHAIN_ID (or NEXT_PUBLIC_CHAIN_ID) in the environment.',
      )
    }
    this.contractChainId = parseInt(rawChainId, 10)
    if (isNaN(this.contractChainId) || this.contractChainId <= 0) {
      throw new Error(`CHAIN_ID "${rawChainId}" is not a valid chain ID.`)
    }
  }

  async onModuleInit() {
    const rpcUrl = process.env.RPC_URL
    if (!rpcUrl) {
      throw new Error('RPC_URL is not set. Provide an RPC endpoint for the configured chain.')
    }

    this.publicClient = createPublicClient({ transport: http(rpcUrl) })

    // BUG-7: Assert the RPC endpoint matches the configured chain
    try {
      const actualChainId = await this.publicClient.getChainId()
      if (actualChainId !== this.contractChainId) {
        throw new Error(
          `RPC_URL chain ID (${actualChainId}) does not match CHAIN_ID (${this.contractChainId}). ` +
          'The RPC endpoint must point at the same chain the contract is deployed on.',
        )
      }
      this.logger.log(
        `BlockchainService initialised: chain=${this.contractChainId} contract=${this.contractAddress}`,
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('RPC_URL chain ID')) {
        throw error
      }
      throw new Error(
        `Failed to connect to RPC_URL: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Check that RPC_URL is reachable and points to the configured chain.',
      )
    }
  }

  async verifyIssuerRoleGrant(
    walletAddress: string,
    txHash: Hex,
    adminAddress: string,
  ): Promise<RoleGrantVerification> {
    return this.verifyRoleEvent(walletAddress, txHash, 'RoleGranted', adminAddress)
  }

  async verifyIssuerRoleRevoke(
    walletAddress: string,
    txHash: Hex,
    adminAddress: string,
  ): Promise<RoleGrantVerification> {
    return this.verifyRoleEvent(walletAddress, txHash, 'RoleRevoked', adminAddress)
  }

  private async verifyRoleEvent(
    walletAddress: string,
    txHash: Hex,
    eventName: 'RoleGranted' | 'RoleRevoked',
    adminAddress: string,
  ): Promise<RoleGrantVerification> {
    let receipt
    try {
      receipt = await this.publicClient.getTransactionReceipt({ hash: txHash })
    } catch {
      return { ok: false, error: 'Transaction not found', status: 400 }
    }

    if (receipt.status !== 'success') {
      return { ok: false, error: 'On-chain transaction did not succeed', status: 400 }
    }

    if (receipt.to?.toLowerCase() !== this.contractAddress.toLowerCase()) {
      return { ok: false, error: 'Transaction does not target the document contract', status: 400 }
    }

    const events = parseEventLogs({ abi: ROLE_EVENTS, logs: receipt.logs })
    const matched = events.filter(
      (event) =>
        event.eventName === eventName &&
        event.args.role === ISSUER_ROLE &&
        event.args.account.toLowerCase() === walletAddress.toLowerCase(),
    )

    if (matched.length === 0) {
      return {
        ok: false,
        error: `Transaction did not emit ${eventName} for ISSUER_ROLE on this wallet`,
        status: 400,
      }
    }

    // BUG-8: Verify the transaction sender matches the calling admin's session
    const senderMatch = matched.some(
      (event) => event.args.sender?.toLowerCase() === adminAddress.toLowerCase(),
    )
    if (!senderMatch) {
      return {
        ok: false,
        error: `Transaction was sent by a different wallet than the current session. ` +
          `Only the wallet that signed the transaction can record it.`,
        status: 403,
      }
    }

    return { ok: true }
  }

  calculateDocumentHash(data: Buffer | string): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    return '0x' + crypto.createHash('sha256').update(buffer).digest('hex')
  }

  calculateMerkleRoot(leaves: Buffer[]): Buffer {
    if (leaves.length === 0) {
      throw new Error('Cannot calculate Merkle root from empty array')
    }

    let tree = leaves.slice()

    while (tree.length > 1) {
      const nextLevel: Buffer[] = []
      for (let i = 0; i < tree.length; i += 2) {
        if (i + 1 < tree.length) {
          const combined = Buffer.concat([tree[i], tree[i + 1]])
          nextLevel.push(crypto.createHash('sha256').update(combined).digest())
        } else {
          nextLevel.push(tree[i])
        }
      }
      tree = nextLevel
    }

    return tree[0]
  }
}
