import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
const client = createPublicClient({ chain: sepolia, transport: http(process.env.RPC_URL) })
const CONTRACT = '0x69D2f9880532d171fC76DDF9C6D9D092fDE8abF3'
const ADMIN = '0xC756fF51A6b7da9Ea261e4bA4f048179c98caa32'

const latest = await client.getBlockNumber()
console.log('latest block:', latest)
const from = latest - 150n
for (let b = latest; b >= from; b--) {
  const block = await client.getBlock({ blockNumber: b, includeTransactions: true })
  for (const tx of block.transactions) {
    if (typeof tx === 'string') continue
    if (tx.from?.toLowerCase() === ADMIN.toLowerCase() && tx.to?.toLowerCase() === CONTRACT.toLowerCase()) {
      console.log('FOUND tx:', tx.hash, 'in block', b)
    }
  }
}
console.log('scan complete')
