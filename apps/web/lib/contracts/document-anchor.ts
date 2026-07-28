import { keccak256, stringToBytes } from 'viem'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE'

export const CONTRACT_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')

export const ADMIN_ROLE = keccak256(stringToBytes('ADMIN_ROLE'))
export const ISSUER_ROLE = keccak256(stringToBytes('ISSUER_ROLE'))

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ISSUER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_documentHash', type: 'bytes32' },
      { internalType: 'string', name: '_documentType', type: 'string' },
    ],
    name: 'anchorDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_documentCount', type: 'uint256' },
      { internalType: 'string', name: '_batchId', type: 'string' },
    ],
    name: 'anchorMerkleBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_documentHash', type: 'bytes32' }],
    name: 'revokeDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_documentHash', type: 'bytes32' }],
    name: 'verifyDocument',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_documentHash', type: 'bytes32' }],
    name: 'getDocument',
    outputs: [
      { internalType: 'address', name: 'issuer', type: 'address' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bool', name: 'revoked', type: 'bool' },
      { internalType: 'string', name: 'documentType', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' }],
    name: 'getMerkleBatch',
    outputs: [
      { internalType: 'address', name: 'issuer', type: 'address' },
      { internalType: 'uint256', name: 'documentCount', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'string', name: 'batchId', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_issuer', type: 'address' }],
    name: 'isIssuerApproved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32[]', name: '_proof', type: 'bytes32[]' },
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'bytes32', name: '_leaf', type: 'bytes32' },
    ],
    name: 'verifyMerkleProof',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_issuer', type: 'address' },
      { internalType: 'string', name: '_metadataURI', type: 'string' },
    ],
    name: 'setIssuerMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'issuer', type: 'address' },
      { indexed: false, internalType: 'string', name: 'documentType', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'DocumentAnchored',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'issuer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'DocumentRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'issuer', type: 'address' },
      { indexed: false, internalType: 'string', name: 'metadataURI', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'IssuerMetadataSet',
    type: 'event',
  },
] as const

export function calculateDocumentHash(data: string | Buffer): string {
  const crypto = require('crypto')
  if (typeof data === 'string') {
    data = Buffer.from(data)
  }
  return '0x' + crypto.createHash('sha256').update(data).digest('hex')
}

export function calculateMerkleRoot(leafHashes: string[]): string {
  if (leafHashes.length === 0) {
    throw new Error('Cannot calculate Merkle root from empty array')
  }

  let tree = leafHashes.map(hash => hash.toLowerCase())

  while (tree.length > 1) {
    const nextLevel = []
    for (let i = 0; i < tree.length; i += 2) {
      if (i + 1 < tree.length) {
        const combined = tree[i] + tree[i + 1].substring(2)
        const crypto = require('crypto')
        const hash = '0x' + crypto.createHash('sha256').update(combined).digest('hex')
        nextLevel.push(hash)
      } else {
        nextLevel.push(tree[i])
      }
    }
    tree = nextLevel
  }

  return tree[0]
}

export const CHAIN_CONFIG = {
  11155111: { name: 'Sepolia', explorerUrl: 'https://sepolia.etherscan.io' },
  1: { name: 'Ethereum Mainnet', explorerUrl: 'https://etherscan.io' },
  137: { name: 'Polygon', explorerUrl: 'https://polygonscan.com' },
  42161: { name: 'Arbitrum', explorerUrl: 'https://arbiscan.io' },
  8453: { name: 'Base', explorerUrl: 'https://basescan.org' },
  10: { name: 'Optimism', explorerUrl: 'https://optimistic.etherscan.io' },
}

export function getExplorerUrl(txHash: string, chainId: number = CONTRACT_CHAIN_ID): string | null {
  const config = (CHAIN_CONFIG as Record<number, { name: string; explorerUrl: string }>)[chainId]
  if (!config) return null
  return `${config.explorerUrl}/tx/${txHash}`
}

export function getExplorerAddressUrl(address: string, chainId: number = CONTRACT_CHAIN_ID): string | null {
  const config = (CHAIN_CONFIG as Record<number, { name: string; explorerUrl: string }>)[chainId]
  if (!config) return null
  return `${config.explorerUrl}/address/${address}`
}
