'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Loader2, ShieldAlert, Wallet, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-context'
import { formatAddress } from '@/lib/format'

function GateScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center animate-fade-in">
      {children}
    </div>
  )
}

/**
 * Gates every `/issuer/*` route.
 *
 * A valid `ISSUER` session is not enough on its own: the session cookie can
 * outlive a wallet switch in the browser extension, so a connected wallet
 * that differs from the session's wallet must be blocked too - otherwise the
 * dashboard would render using a different issuer's data than the wallet
 * actually in control of the page.
 */
export default function IssuerLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, address: connectedAddress } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { address: sessionAddress, role, isLoading } = useSession()

  if (!isConnected) {
    return (
      <GateScreen>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
          <Wallet className="h-7 w-7 text-accent" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">Connect your wallet</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Connect the wallet approved as an issuer to access this dashboard.
        </p>
        <Button onClick={openConnectModal} className="mt-2 bg-accent text-accent-foreground">
          Connect Wallet
        </Button>
      </GateScreen>
    )
  }

  if (isLoading) {
    return (
      <GateScreen>
        <Loader2 className="h-6 w-6 animate-spin text-foreground" aria-hidden />
      </GateScreen>
    )
  }

  if (role !== 'ISSUER') {
    return (
      <GateScreen>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">Issuer access required</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This wallet is not an approved issuer. Request access to issue documents on CertFyi.
        </p>
        <Link href="/request-access">
          <Button className="mt-2">Request Issuer Access</Button>
        </Link>
      </GateScreen>
    )
  }

  const walletMismatch =
    !!sessionAddress &&
    !!connectedAddress &&
    sessionAddress.toLowerCase() !== connectedAddress.toLowerCase()

  if (walletMismatch) {
    return (
      <GateScreen>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
          <RefreshCw className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">Wrong wallet connected</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your session is signed in as {formatAddress(sessionAddress)}, but the wallet connected
          in your browser is different. Switch back to the approved issuer wallet in your wallet
          extension, or disconnect and sign in again with this one.
        </p>
        <Button onClick={openConnectModal} className="mt-2 bg-accent text-accent-foreground">
          Switch Wallet
        </Button>
      </GateScreen>
    )
  }

  return <>{children}</>
}
