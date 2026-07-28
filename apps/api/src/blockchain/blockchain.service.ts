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

const HasRoleFn = {
  type: 'function',
  name: 'hasRole',
  stateMutability: 'view',
  inputs: [
    { name: 'role', type: 'bytes32' },
    { name: 'account', type: 'address' },
  ],
  outputs: [{ type: 'bool' }],
} as const

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

    // The sender check applies regardless of which branch below succeeds.
    if (receipt.from.toLowerCase() !== adminAddress.toLowerCase()) {
      return {
        ok: false,
        error: `Transaction was sent by a different wallet than the current session. ` +
          `Only the wallet that signed the transaction can record it.`,
        status: 403,
      }
    }

    const events = parseEventLogs({ abi: ROLE_EVENTS, logs: receipt.logs })
    const matched = events.some(
      (event) =>
        event.eventName === eventName &&
        event.args.role === ISSUER_ROLE &&
        event.args.account.toLowerCase() === walletAddress.toLowerCase(),
    )

    if (matched) {
      return { ok: true }
    }

    // OpenZeppelin's AccessControl only emits Role{Granted,Revoked} when the
    // role actually changes - calling grantRole on an account that already
    // holds it (or revokeRole on one that doesn't) succeeds silently with no
    // event. Without this fallback, a retry after a grant whose *recording*
    // failed (network blip, server restart) is permanently stuck: the
    // transaction is genuinely valid and admin-signed, but can never satisfy
    // an event-only check again. Read the live role state instead - it is a
    // fact about the contract right now, independent of which transaction
    // produced it.
    const hasRole = await this.publicClient.readContract({
      address: this.contractAddress as Hex,
      abi: [HasRoleFn],
      functionName: 'hasRole',
      args: [ISSUER_ROLE, walletAddress as Hex],
    })
    const expectedState = eventName === 'RoleGranted'
    if (hasRole === expectedState) {
      return { ok: true }
    }

    return {
      ok: false,
      error: `Transaction did not emit ${eventName} for ISSUER_ROLE on this wallet, and the ` +
        `wallet's current on-chain role state does not match either.`,
      status: 400,
    }
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
