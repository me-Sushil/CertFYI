'use client'

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from '@/lib/theme-context'
import {
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  lightTheme,
  type AuthenticationStatus,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClientProvider, QueryClient, useQueryClient } from '@tanstack/react-query'
import { base, sepolia, mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'
import { SiweMessage } from 'siwe'
import { authApi } from '@/lib/api'
import { Toaster } from 'sonner'

const CHAIN_MAP = { 1: mainnet, 137: polygon, 42161: arbitrum, 8453: base, 10: optimism, 11155111: sepolia } as const

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')
const targetChain = (CHAIN_MAP as Record<number, (typeof CHAIN_MAP)[keyof typeof CHAIN_MAP]>)[chainId] ?? sepolia

function createWagmiConfig() {
  return createConfig({
    chains: [targetChain],
    transports: { [targetChain.id]: http() } as Record<number, ReturnType<typeof http>>,
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
        // RainbowKit passes whatever this returns straight to wagmi's
        // signMessage, which only accepts a string - so prepare it here rather
        // than handing back a SiweMessage instance.
        // Deliberately re-fetches the nonce rather than using the one RainbowKit
        // passes in. The API consumes the nonce cookie on every verify attempt,
        // success or failure, but RainbowKit only calls getNonce once per modal
        // mount - so after a single failure its cached nonce is already spent and
        // every retry would 401. Fetching here, on each sign attempt, keeps the
        // signed message and the cookie in step.
        createMessage: async ({ address, chainId }) => {
          const { nonce } = await authApi.getNonce()
          return new SiweMessage({
            domain: window.location.host,
            address,
            statement: 'Sign in to CertFyi with your Ethereum wallet.',
            uri: window.location.origin,
            version: '1',
            chainId,
            nonce,
          }).prepareMessage()
        },
        verify: async ({ message, signature }) => {
          let ok = false
          try {
            await authApi.verify({ message, signature })
            ok = true
          } catch (error) {
            // RainbowKit only surfaces a generic "please retry", so log the real
            // reason - otherwise sign-in failures are undiagnosable.
            console.error('[siwe] verify failed:', error)
          }
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
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: '#6C4CF5',
          accentColorForeground: '#ffffff',
          borderRadius: 'large',
          fontStack: 'system',
        })}
      >{children}</RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  const wagmiConfig = useMemo(() => createWagmiConfig(), [])
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  return (
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthedRainbowKit>{children}</AuthedRainbowKit>
        </QueryClientProvider>
      </WagmiProvider>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  )
}
