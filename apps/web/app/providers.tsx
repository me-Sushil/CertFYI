'use client'

import { ReactNode, useMemo } from 'react'
import { ThemeProvider } from '@/lib/theme-context'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { mainnet, polygon, arbitrum, base, optimism, sepolia } from 'wagmi/chains'

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

export function Providers({ children }: { children: ReactNode }) {
  const wagmiConfig = useMemo(() => createWagmiConfig(), [])

  return (
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
