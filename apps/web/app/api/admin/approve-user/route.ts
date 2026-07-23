import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseEventLogs, type Hex } from 'viem'
import { requireRole } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { CONTRACT_ADDRESS, ISSUER_ROLE } from '@/lib/contracts'

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

// Admin has already sent `grantRole(ISSUER_ROLE, walletAddress)` from their own
// wallet client-side. This confirms the tx actually succeeded and granted the
// right role to the right account before trusting it and updating the DB -
// the DB should never be marked APPROVED based solely on the client's word.
export async function POST(request: NextRequest) {
  const guard = await requireRole(request, 'ADMIN')
  if ('response' in guard) return guard.response

  const body = await request.json().catch(() => null)
  const walletAddress: string | undefined = body?.walletAddress?.toLowerCase?.()
  const txHash: Hex | undefined = body?.txHash

  if (!walletAddress || !txHash) {
    return NextResponse.json({ error: 'walletAddress and txHash are required' }, { status: 400 })
  }

  const rpcUrl = process.env.RPC_URL
  if (!rpcUrl) {
    return NextResponse.json({ error: 'Server RPC_URL is not configured' }, { status: 500 })
  }

  const publicClient = createPublicClient({ transport: http(rpcUrl) })

  let receipt
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash })
  } catch {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 400 })
  }

  if (receipt.status !== 'success') {
    return NextResponse.json({ error: 'On-chain transaction did not succeed' }, { status: 400 })
  }

  if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
    return NextResponse.json(
      { error: 'Transaction does not target the document contract' },
      { status: 400 }
    )
  }

  const grantedEvents = parseEventLogs({ abi: [RoleGrantedEvent], logs: receipt.logs })
  const grantedIssuerRole = grantedEvents.some(
    (event) =>
      event.eventName === 'RoleGranted' &&
      event.args.role === ISSUER_ROLE &&
      event.args.account.toLowerCase() === walletAddress
  )

  if (!grantedIssuerRole) {
    return NextResponse.json(
      { error: 'Transaction did not grant ISSUER_ROLE to this wallet' },
      { status: 400 }
    )
  }

  const accessRequest = await prisma.accessRequest.upsert({
    where: { walletAddress },
    create: { walletAddress, status: 'APPROVED', decidedAt: new Date() },
    update: { status: 'APPROVED', decidedAt: new Date(), rejectionReason: null },
  })

  return NextResponse.json({ accessRequest })
}
