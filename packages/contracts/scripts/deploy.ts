import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying DocumentAnchor with account:', deployer.address)

  const DocumentAnchor = await ethers.getContractFactory('DocumentAnchor')
  const documentAnchor = await DocumentAnchor.deploy()
  await documentAnchor.waitForDeployment()

  const address = await documentAnchor.getAddress()
  console.log('DocumentAnchor deployed to:', address)
  console.log('Deployer holds ADMIN_ROLE and DEFAULT_ADMIN_ROLE.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
