'use client'
import { useAccount, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'
import { saveToken } from '@/lib/authClient'
import { authApi } from '@/lib/api'

export function useSiweSignIn() {
  const { address, chainId } = useAccount()
  const { signMessageAsync } = useSignMessage()

  async function signIn(): Promise<{ address: string; role: string; requestStatus?: string }> {
    if (!address) throw new Error('Connect wallet first')

    // Step 1: Get a fresh nonce from the server, with validation
    const nonceRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/nonce`,
      {
        credentials: 'include',
      },
    )
    if (!nonceRes.ok) {
      const errBody = await nonceRes.json().catch(() => null)
      throw new Error(errBody?.error || 'Could not get nonce from server')
    }

    const { nonce } = await nonceRes.json()
    if (!nonce || typeof nonce !== 'string') {
      throw new Error('Server returned an invalid nonce')
    }

    // Step 2: Build the SIWE message
    const siweMessage = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to CertFyi with your Ethereum wallet.',
      uri: window.location.origin,
      version: '1',
      chainId: chainId ?? 1,
      nonce,
    })

    const preparedMessage = siweMessage.prepareMessage()

    // Step 3: Request signature from wallet
    let signature: string
    try {
      signature = await signMessageAsync({ message: preparedMessage })
    } catch (err: any) {
      // User rejected in MetaMask or RPC error
      throw new Error(err?.message || 'Signature request was rejected in your wallet')
    }

    // Step 4: Send signature to server for verification
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/verify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: preparedMessage, signature }),
      },
    )

    if (!verifyRes.ok) {
      const errBody = await verifyRes.json().catch(() => null)
      throw new Error(errBody?.error || 'Signature verification failed')
    }

    const data = await verifyRes.json()

    // Step 5: Store role + address in localStorage for quick UI checks
    try {
      localStorage.setItem('certfyi_role', data.role)
      localStorage.setItem('certfyi_address', data.address)
    } catch {
      // localStorage might be unavailable
    }

    return { address: data.address, role: data.role, requestStatus: data.requestStatus }
  }

  return { signIn }
}

