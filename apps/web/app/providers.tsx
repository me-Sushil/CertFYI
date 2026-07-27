'use client'

import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { ThemeProvider } from '@/lib/theme-context'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider, createConfig, http, useAccount } from 'wagmi'
import { QueryClientProvider, QueryClient, useQueryClient } from '@tanstack/react-query'
import { mainnet, polygon, arbitrum, base, optimism, sepolia } from 'wagmi/chains'
import { authApi } from '@/lib/api'
import { clearToken } from '@/lib/authClient'

const queryClient = new QueryClient()

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
    </ThemeProvider>
  )
}
