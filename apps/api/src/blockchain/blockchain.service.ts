import { Injectable } from '@nestjs/common'
import crypto from 'crypto'
import { createPublicClient, http, keccak256, parseEventLogs, stringToBytes, type Hex } from 'viem'

// Contract configuration (was apps/web/lib/contracts.ts). The blockchain service
// owns all chain access and exposes clean methods to the rest of the API.
export const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE'

export const CONTRACT_CHAIN_ID = parseInt(
  process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || '11155111',
) // Sepolia

// Role identifiers, matching `keccak256("ADMIN_ROLE")` / `keccak256("ISSUER_ROLE")` on-chain
export const ADMIN_ROLE = keccak256(stringToBytes('ADMIN_ROLE'))
export const ISSUER_ROLE = keccak256(stringToBytes('ISSUER_ROLE'))

// Minimal AccessControl event fragment, just enough to confirm the grant happened.
const RoleGrantedEvent = {
  type: 'event',
  name: 'RoleGranted',
  inputs: [
    { indexed: true, name: 'role', type: 'bytes32' },
    { indexed: true, name: 'account', type: 'address' },
    { indexed: true, name: 'sender', type: 'address' },
  ],
} as const

export interface RoleGrantVerification {
  ok: boolean
  error?: string
  status?: number
}

@Injectable()
export class BlockchainService {
  /**
   * Confirms an admin-submitted `grantRole(ISSUER_ROLE, walletAddress)` tx actually
   * succeeded on-chain and granted the right role to the right account before the
   * DB is trusted and marked APPROVED. The DB should never be marked APPROVED based
   * solely on the client's word.
   */
  async verifyIssuerRoleGrant(walletAddress: string, txHash: Hex): Promise<RoleGrantVerification> {
    const rpcUrl = process.env.RPC_URL
    if (!rpcUrl) {
      return { ok: false, error: 'Server RPC_URL is not configured', status: 500 }
    }

    const publicClient = createPublicClient({ transport: http(rpcUrl) })

    let receipt
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash })
    } catch {
      return { ok: false, error: 'Transaction not found', status: 400 }
    }

    if (receipt.status !== 'success') {
      return { ok: false, error: 'On-chain transaction did not succeed', status: 400 }
    }

    if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
      return { ok: false, error: 'Transaction does not target the document contract', status: 400 }
    }

    const grantedEvents = parseEventLogs({ abi: [RoleGrantedEvent], logs: receipt.logs })
    const grantedIssuerRole = grantedEvents.some(
      (event) =>
        event.eventName === 'RoleGranted' &&
        event.args.role === ISSUER_ROLE &&
        event.args.account.toLowerCase() === walletAddress.toLowerCase(),
    )

    if (!grantedIssuerRole) {
      return { ok: false, error: 'Transaction did not grant ISSUER_ROLE to this wallet', status: 400 }
    }

    return { ok: true }
  }

  /** SHA256 hash of document data, 0x-prefixed. */
  calculateDocumentHash(data: Buffer | string): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    return '0x' + crypto.createHash('sha256').update(buffer).digest('hex')
  }

  /** Merkle root from leaf hashes using SHA256 over concatenated 0x-hex leaves. */
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
