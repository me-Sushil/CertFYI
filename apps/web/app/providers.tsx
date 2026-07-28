'use client'

import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { ThemeProvider } from '@/lib/theme-context'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider, createConfig, http, useAccount } from 'wagmi'
import { QueryClientProvider, QueryClient, useQueryClient } from '@tanstack/react-query'
import { mainnet, polygon, arbitrum, base, optimism, sepolia } from 'wagmi/chains'
import { authApi } from '@/lib/api'
import { clearToken } from '@/lib/authClient'

const CHAIN_MAP = { 1: mainnet, 137: polygon, 42161: arbitrum, 8453: base, 10: optimism, 11155111: sepolia } as const

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')
const targetChain = (CHAIN_MAP as Record<number, (typeof CHAIN_MAP)[keyof typeof CHAIN_MAP]>)[chainId] ?? sepolia

function createWagmiConfig() {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  if (!projectId) {
    console.warn(
      '[CertFyi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. ' +
        'RainbowKit will fall back to injected wallets only (MetaMask, etc.). ' +
        'Set this env var to enable WalletConnect.',
    )
  }

  return createConfig({
    chains: [targetChain],
    transports: { [targetChain.id]: http() } as Record<number, ReturnType<typeof http>>,
    ssr: true,
  })
}

/** Syncs wallet disconnect → backend logout + localStorage clear. Replaces "Sign Out" button. */
function SessionSync() {
  const { isConnected } = useAccount()
  const wasConnectedRef = useRef(isConnected)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (wasConnectedRef.current && !isConnected) {
      // Wallet was just disconnected — clear the backend session too.
      authApi.logout().catch(() => {})
      clearToken()
      try {
        localStorage.removeItem('certfyi_role')
        localStorage.removeItem('certfyi_address')
      } catch { /* ignore */ }
      queryClient.invalidateQueries({ queryKey: ['session'] })
    }
    wasConnectedRef.current = isConnected
  }, [isConnected, queryClient])

  return null
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
          <RainbowKitProvider>
            <SessionSync />
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  )
}
