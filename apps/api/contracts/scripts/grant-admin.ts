import { ethers } from 'hardhat'

/**
 * Grants ADMIN_ROLE on the already-deployed DocumentAnchor contract to a
 * second wallet. Must be run with the deployer's key (the wallet holding
 * DEFAULT_ADMIN_ROLE) as PRIVATE_KEY in contracts/.env - that's the only
 * wallet allowed to grant ADMIN_ROLE.
 *
 * Usage:
 *   CONTRACT_ADDRESS=0x... NEW_ADMIN=0x... npx hardhat run scripts/grant-admin.ts --network sepolia
 */
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  const newAdmin = process.env.NEW_ADMIN

  if (!contractAddress) throw new Error('Set CONTRACT_ADDRESS to the deployed DocumentAnchor address')
  if (!newAdmin) throw new Error('Set NEW_ADMIN to the wallet address to grant ADMIN_ROLE to')

  const [signer] = await ethers.getSigners()
  console.log('Granting ADMIN_ROLE from:', signer.address)

  const documentAnchor = await ethers.getContractAt('DocumentAnchor', contractAddress, signer)

  const ADMIN_ROLE = await documentAnchor.ADMIN_ROLE()
  const alreadyAdmin = await documentAnchor.hasRole(ADMIN_ROLE, newAdmin)
  if (alreadyAdmin) {
    console.log(`${newAdmin} already holds ADMIN_ROLE. Nothing to do.`)
    return
  }

  const tx = await documentAnchor.grantRole(ADMIN_ROLE, newAdmin)
  console.log('Tx sent:', tx.hash)
  await tx.wait()
  console.log(`ADMIN_ROLE granted to ${newAdmin}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
