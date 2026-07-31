# CertFyi Smart Contracts

This directory contains the Solidity smart contracts for the CertFyi blockchain document verification system.

## Contracts

### DocumentAnchor.sol

The core contract for anchoring documents on the blockchain with support for:

- **Single Document Anchoring**: Store individual document hashes with metadata
- **Merkle Tree Batching**: Efficiently anchor multiple documents in a single transaction using Merkle roots
- **Issuer Management**: Grant/revoke `ISSUER_ROLE` for document anchoring, via OpenZeppelin AccessControl
- **Merkle Proof Verification**: Verify that a specific document is part of an anchored batch

#### Key Features

1. **Gas Efficient**: Uses Merkle root batching to anchor 100+ documents in a single transaction
2. **Non-Custodial**: Documents are anchored by issuing organizations directly
3. **Immutable Records**: Once anchored, a document's hash, issuer, and timestamp cannot be modified

#### Main Functions

- `grantRole(ISSUER_ROLE, address)` - Approve an issuer to anchor documents (`ADMIN_ROLE` only)
- `revokeRole(ISSUER_ROLE, address)` - Suspend an issuer's anchoring privileges (`ADMIN_ROLE` only)
- `anchorDocument(bytes32, string)` - Anchor a single document
- `anchorMerkleBatch(bytes32, uint256, string)` - Anchor a batch using Merkle root
- `verifyDocument(bytes32)` - Check if a document hash is anchored
- `getDocument(bytes32)` - Get document details
- `getMerkleBatch(bytes32)` - Get batch details
- `verifyMerkleProof(bytes32[], bytes32, bytes32)` - Verify Merkle proof

## Deployment

### Requirements

- Node.js v18+
- Hardhat or Foundry
- Web3 wallet with testnet ETH

### Environment Setup

Create a `.env` file in the contracts directory:

```
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
OWNER_ADDRESS=deployment_owner_address
```

### Deploy to Testnet

```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# Using Foundry
forge script scripts/Deploy.s.sol --rpc-url $ETHEREUM_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Contract Addresses

### Sepolia Testnet
```
DocumentAnchor: 0x742d35Cc6634C0532925a3b844Bc9e7595f42bE
```

### Ethereum Mainnet
```
DocumentAnchor: [To be deployed]
```

## Integration with Frontend

The frontend connects to the contract via:

1. **Web3 Provider**: ethers.js or wagmi
2. **Contract Interface**: JSON ABI file at `/contracts/abi/DocumentAnchor.json`
3. **API Endpoints**: Backend service at `/api/blockchain/*`

### Example Usage

```typescript
// In frontend component
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts'
import { ethers } from 'ethers'

// Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

// Anchor a document
const tx = await contract.anchorDocument(
  documentHash,
  'Certificate'
)

// Verify a document
const isValid = await contract.verifyDocument(documentHash)
```

## Security Audit

This contract is designed with security best practices:

- **Reentrancy Protection**: ReentrancyGuard from OpenZeppelin
- **Access Control**: Owner-based administration
- **State Validation**: Input validation on all functions
- **Immutability**: Once-only anchoring prevents double-counting

Recommended: Conduct professional audit before mainnet deployment.

## Testing

```bash
# Run test suite
npx hardhat test

# With coverage
npx hardhat coverage
```

## License

MIT License - See LICENSE file for details
