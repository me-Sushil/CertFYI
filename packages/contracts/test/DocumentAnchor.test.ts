import { expect } from 'chai'
import { ethers } from 'hardhat'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { DocumentAnchor } from '../typechain-types'

describe('DocumentAnchor', () => {
  async function deploy() {
    const [deployer, admin2, issuer, outsider] = await ethers.getSigners()
    const Factory = await ethers.getContractFactory('DocumentAnchor')
    const contract = (await Factory.deploy()) as unknown as DocumentAnchor
    await contract.waitForDeployment()
    return { contract, deployer, admin2, issuer, outsider }
  }

  it('grants the deployer ADMIN_ROLE and DEFAULT_ADMIN_ROLE', async () => {
    const { contract, deployer } = await deploy()
    const ADMIN_ROLE = await contract.ADMIN_ROLE()
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE()
    expect(await contract.hasRole(ADMIN_ROLE, deployer.address)).to.equal(true)
    expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.equal(true)
  })

  it('lets an admin grant ISSUER_ROLE, which then allows anchoring', async () => {
    const { contract, deployer, issuer } = await deploy()
    const ISSUER_ROLE = await contract.ISSUER_ROLE()

    await expect(contract.connect(deployer).grantRole(ISSUER_ROLE, issuer.address))
      .to.emit(contract, 'RoleGranted')
      .withArgs(ISSUER_ROLE, issuer.address, deployer.address)

    expect(await contract.isIssuerApproved(issuer.address)).to.equal(true)

    const docHash = ethers.keccak256(ethers.toUtf8Bytes('doc-1'))
    await expect(contract.connect(issuer).anchorDocument(docHash, 'diploma'))
      .to.emit(contract, 'DocumentAnchored')
      .withArgs(docHash, issuer.address, 'diploma', anyValue)
  })

  it('rejects anchoring from a wallet without ISSUER_ROLE', async () => {
    const { contract, outsider } = await deploy()
    const docHash = ethers.keccak256(ethers.toUtf8Bytes('doc-2'))
    await expect(
      contract.connect(outsider).anchorDocument(docHash, 'diploma')
    ).to.be.revertedWithCustomError(contract, 'AccessControlUnauthorizedAccount')
  })

  it('lets a second admin grant ISSUER_ROLE too (ADMIN_ROLE is role-admin of ISSUER_ROLE)', async () => {
    const { contract, deployer, admin2, issuer } = await deploy()
    const ADMIN_ROLE = await contract.ADMIN_ROLE()
    const ISSUER_ROLE = await contract.ISSUER_ROLE()

    await contract.connect(deployer).grantRole(ADMIN_ROLE, admin2.address)
    await expect(contract.connect(admin2).grantRole(ISSUER_ROLE, issuer.address)).to.not.be
      .reverted
    expect(await contract.isIssuerApproved(issuer.address)).to.equal(true)
  })

  it('revoking ISSUER_ROLE blocks further anchoring', async () => {
    const { contract, deployer, issuer } = await deploy()
    const ISSUER_ROLE = await contract.ISSUER_ROLE()
    await contract.connect(deployer).grantRole(ISSUER_ROLE, issuer.address)
    await contract.connect(deployer).revokeRole(ISSUER_ROLE, issuer.address)

    expect(await contract.isIssuerApproved(issuer.address)).to.equal(false)
    const docHash = ethers.keccak256(ethers.toUtf8Bytes('doc-3'))
    await expect(
      contract.connect(issuer).anchorDocument(docHash, 'diploma')
    ).to.be.revertedWithCustomError(contract, 'AccessControlUnauthorizedAccount')
  })
})
