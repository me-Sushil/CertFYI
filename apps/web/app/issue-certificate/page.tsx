'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { HeaderWrapper } from '@/components/header-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Wallet, Clock, AlertCircle } from 'lucide-react'
import { useSession } from '@/lib/auth-context'
import { issuerApi } from '@/lib/api'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useSiweSignIn } from '@/hooks/useSiweSignIn'
import { useState } from 'react'

// ─── View A: Not connected ──────────────────────────────────
function ConnectPrompt() {
  const { openConnectModal } = useConnectModal()
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>Connect your wallet to request issuer access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the button below to connect your wallet and get started.
        </p>
        <Button onClick={() => openConnectModal?.()} className="w-full">
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── View C: Awaiting approval ──────────────────────────────
function AwaitingApproval() {
  return (
    <Card className="mx-auto max-w-md border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="h-6 w-6" />
          Awaiting for approval
        </CardTitle>
        <CardDescription>Your application is under review</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your issuer request is being reviewed by an admin. You&apos;ll get issuer
          access as soon as it&apos;s approved — no further action is needed.
        </p>
      </CardContent>
    </Card>
  )
}

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// ─── View B: Request form ───────────────────────────────────
function IssuerRequestFormView() {
  const { address } = useAccount()
  const { signIn } = useSiweSignIn()
  const queryClient = useQueryClient()
  const sessionData = useSession()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [status, setStatus] = useState<'idle' | 'signing' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    try {
      // Lazy SIWE: only prompt for wallet signature on form submit
      if (!sessionData.role) {
        setStatus('signing')
        await signIn()
      }

      setStatus('submitting')
      await issuerApi.submitRequest({ name, email, organization })
      queryClient.invalidateQueries({ queryKey: ['issuer-request', 'me'] })
      setStatus('done')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err?.message ?? 'Something went wrong, please retry')
    }
  }

  if (status === 'done') {
    // Auto-flip to "Awaiting approval" — the parent will re-evaluate
    return <AwaitingApproval />
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Request Issuer Access</CardTitle>
        <CardDescription>
          Fill in your details to request issuer access on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
            <p className="font-mono text-xs break-all text-foreground">{address}</p>
          </div>

          {errorMsg && (
            <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-sm font-medium mb-1.5 block">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label htmlFor="org" className="text-sm font-medium mb-1.5 block">
              Organization Name <span className="text-destructive">*</span>
            </label>
            <Input id="org" placeholder="Acme Corp" value={organization} onChange={(e) => setOrganization(e.target.value)} required />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <Button type="submit" disabled={status === 'signing' || status === 'submitting'} className="w-full">
            {(status === 'signing' || status === 'submitting') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === 'signing' ? 'Confirm Signature in Wallet…' : status === 'submitting' ? 'Submitting…' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Main page ──────────────────────────────────────────────
export default function IssueCertificatePage() {
  const { isConnected } = useAccount()
  const { role, isLoading: sessionLoading } = useSession()
  const router = useRouter()

  const { data: myRequest, isLoading: reqLoading } = useQuery({
    queryKey: ['issuer-request', 'me'],
    queryFn: async () => {
      try {
        const res = await issuerApi.getRequestStatus()
        return res
      } catch {
        return { requestStatus: 'NONE' }
      }
    },
    enabled: isConnected,
    refetchInterval: 30_000, // poll every 30s so approval auto-navigates
  })

  // View D: Already has a role → redirect to dashboard
  useEffect(() => {
    if (role === 'ISSUER') router.replace('/issuer')
    if (role === 'ADMIN') router.replace('/admin')
  }, [role, router])

  // View A: No wallet connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <ConnectPrompt />
        </div>
      </div>
    )
  }

  // Loading
  if (sessionLoading || reqLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <PageSpinner />
        </div>
      </div>
    )
  }

  // Redirecting (role is ISSUER or ADMIN)
  if (role === 'ISSUER' || role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <PageSpinner />
        </div>
      </div>
    )
  }

  // View C: Request is pending approval
  if (myRequest?.requestStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <AwaitingApproval />
        </div>
      </div>
    )
  }

  // View B: No pending request → show form (will also handle REJECTED by showing form again)
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <div className="mx-auto max-w-7xl px-4 py-16">
        {myRequest?.requestStatus === 'REJECTED' && (
          <div className="flex gap-2 p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive max-w-lg mx-auto">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">Your previous request was rejected. You may re-apply below.</p>
          </div>
        )}
        <IssuerRequestFormView />
      </div>
    </div>
  )
}

