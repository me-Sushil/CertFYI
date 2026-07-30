'use client'

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeProvider } from '@/lib/theme-context'
import {
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  lightTheme,
  type AuthenticationStatus,
  type Theme,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClientProvider, QueryClient, useQueryClient } from '@tanstack/react-query'
import { base, sepolia, mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'
import { SiweMessage } from 'siwe'
import { authApi } from '@/lib/api'
import { usePostConnectRedirect } from '@/lib/post-connect-redirect'
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

  const certfyiTheme: Theme = {
    ...lightTheme({
      accentColor: '#6C4CF5',
      accentColorForeground: '#ffffff',
      borderRadius: 'large',
      fontStack: 'system',
    }),
    colors: {
      ...lightTheme().colors,
      accentColor: '#6C4CF5',
      accentColorForeground: '#ffffff',
      modalBackground: '#ffffff',
      modalBorder: 'rgba(17, 18, 19, 0.08)',
      modalText: '#111213',
      modalTextDim: 'rgba(17, 18, 19, 0.6)',
      modalTextSecondary: 'rgba(17, 18, 19, 0.5)',
      profileForeground: '#f9f9fb',
      closeButton: 'rgba(17, 18, 19, 0.5)',
      closeButtonBackground: 'rgba(17, 18, 19, 0.06)',
      actionButtonBorder: 'rgba(108, 76, 245, 0.15)',
      actionButtonBorderMobile: 'rgba(108, 76, 245, 0.15)',
      actionButtonSecondaryBackground: 'rgba(108, 76, 245, 0.08)',
      connectButtonBackground: '#6C4CF5',
      connectButtonBackgroundError: '#ef4444',
      connectButtonInnerBackground: 'rgba(108, 76, 245, 0.12)',
      connectButtonText: '#ffffff',
      connectButtonTextError: '#ffffff',
      connectionIndicator: '#0eb579',
      downloadBottomCardBackground: '#f9f9fb',
      downloadTopCardBackground: '#6C4CF5',
      error: '#ef4444',
      generalBorder: 'rgba(17, 18, 19, 0.08)',
      generalBorderDim: 'rgba(17, 18, 19, 0.04)',
      menuItemBackground: 'rgba(108, 76, 245, 0.06)',
      profileAction: 'rgba(108, 76, 245, 0.06)',
      profileActionHover: 'rgba(108, 76, 245, 0.12)',
      selectedOptionBorder: 'rgba(108, 76, 245, 0.4)',
      standby: '#fe8f57',
    },
    shadows: {
      ...lightTheme().shadows,
      connectButton: '0px 4px 12px rgba(108, 76, 245, 0.2)',
      dialog: '0px 24px 60px -8px rgba(17, 18, 19, 0.16), 0px 0px 0px 1px rgba(108, 76, 245, 0.08)',
      profileDetailsAction: '0px 2px 6px rgba(17, 18, 19, 0.04)',
      selectedOption: '0px 0px 0px 2px rgba(108, 76, 245, 0.3)',
      selectedWallet: '0px 0px 0px 2px rgba(108, 76, 245, 0.3)',
      walletLogo: '0px 2px 8px rgba(17, 18, 19, 0.08)',
    },
    radii: {
      ...lightTheme().radii,
      modal: '20px',
      modalMobile: '20px',
      actionButton: '12px',
      connectButton: '12px',
      menuButton: '12px',
    },
  }

  return (
    <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
      <RainbowKitProvider theme={certfyiTheme}>
        <PostConnectNavigator status={status} />
        {children}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}

function PostConnectNavigator({ status }: { status: AuthenticationStatus }) {
  const router = useRouter()
  const consume = usePostConnectRedirect((s) => s.consume)
  const prevStatus = useRef(status)

  useEffect(() => {
    if (prevStatus.current !== 'authenticated' && status === 'authenticated') {
      const redirect = consume()
      if (redirect) {
        router.push(redirect)
      }
    }
    prevStatus.current = status
  }, [status, consume, router])

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
          <AuthedRainbowKit>{children}</AuthedRainbowKit>
        </QueryClientProvider>
      </WagmiProvider>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  )
}
