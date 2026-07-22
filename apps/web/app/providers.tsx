'use client'

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from '@/lib/theme-context'
import {
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  type AuthenticationStatus,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClientProvider, QueryClient, useQueryClient } from '@tanstack/react-query'
import { mainnet, polygon, arbitrum, base, optimism, sepolia } from 'wagmi/chains'
import { SiweMessage } from 'siwe'

const queryClient = new QueryClient()

function createWagmiConfig() {
  return createConfig({
    chains: [
      mainnet,
      polygon,
      arbitrum,
      base,
      optimism,
      ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
      [optimism.id]: http(),
      [sepolia.id]: http(),
    },
    ssr: true,
  })
}

//jckahf ciajcjaskcsjcliajkc doduvei ckjh  9jlfjjcn iho ccmhb ic 
// ;cpou cj'smnc8 hc
// kcj 9pj
// C\
// 'OJ CCPJC L'OM OCJ
// PCC 
// 'I CKJ D[  
// ;PC; CUHK 0'

function AuthedRainbowKit({ children }: { children: ReactNode }) {
  const reactQueryClient = useQueryClient()
  const [status, setStatus] = useState<AuthenticationStatus>('loading')

  const refreshStatus = useCallback(async () => {
    const res = await fetch('/api/auth/session')
    const data = await res.json().catch(() => ({ address: null }))
    setStatus(data.address ? 'authenticated' : 'unauthenticated')
    reactQueryClient.invalidateQueries({ queryKey: ['session'] })
  }, [reactQueryClient])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const res = await fetch('/api/auth/nonce')
          const { nonce } = await res.json()
          return nonce
        },
        createMessage: ({ nonce, address, chainId }) =>
          new SiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign in to CertFyi with your Ethereum wallet.',
            uri: window.location.origin,
            version: '1',
            chainId,
            nonce,
          }),
        verify: async ({ message, signature }) => {
          const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message.prepareMessage(), signature }),
          })
          await refreshStatus()
          return res.ok
        },
        signOut: async () => {
          await fetch('/api/auth/logout', { method: 'POST' })
          await refreshStatus()
        },
      }),
    [refreshStatus]
  )

  return (
    <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  const wagmiConfig = useMemo(() => createWagmiConfig(), [])

  return (
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthedRainbowKit>{children}</AuthedRainbowKit>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
