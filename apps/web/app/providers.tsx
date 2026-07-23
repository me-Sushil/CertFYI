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
import { authApi } from '@/lib/api'

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

function AuthedRainbowKit({ children }: { children: ReactNode }) {
  const reactQueryClient = useQueryClient()
  const [status, setStatus] = useState<AuthenticationStatus>('loading')

  const refreshStatus = useCallback(async () => {
    const data = await authApi.getSession().catch(() => ({ address: null, role: null }))
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
          const { nonce } = await authApi.getNonce()
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
          const ok = await authApi
            .verify({ message: message.prepareMessage(), signature })
            .then(() => true)
            .catch(() => false)
          await refreshStatus()
          return ok
        },
        signOut: async () => {
          await authApi.logout().catch(() => undefined)
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
