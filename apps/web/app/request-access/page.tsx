'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { HeaderWrapper } from '@/components/header-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/lib/auth-context'
import { useIssuerRequestStatus, useSubmitIssuerRequest } from '@/hooks/use-issuer-queries'
import { Loader2, AlertCircle, Wallet, Clock, ShieldCheck } from 'lucide-react'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <div className="mx-auto max-w-7xl px-4 py-16">{children}</div>
    </div>
  )
}

export default function RequestAccessPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { address, role, isLoading: sessionLoading } = useSession()
  const queryClient = useQueryClient()

  const requestQuery = useIssuerRequestStatus(role === 'UNAPPROVED')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    description: '',
    website: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (role === 'ADMIN') router.replace('/admin')
    else if (role === 'ISSUER') router.replace('/issuer')
  }, [role, router])

  if (!isConnected) {
    return (
      <Shell>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection Required
            </CardTitle>
            <CardDescription>Connect your wallet to request issuer access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the connect button in the header to connect and sign in with your wallet.
            </p>
          </CardContent>
        </Card>
      </Shell>
    )
  }

  if (sessionLoading || role === 'ADMIN' || role === 'ISSUER') {
    return (
      <Shell>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading
            </CardTitle>
          </CardHeader>
        </Card>
      </Shell>
    )
  }

  if (!address) {
    return (
      <Shell>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Sign-In Required
            </CardTitle>
            <CardDescription>Verify wallet ownership to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your wallet is connected but not yet verified. Use the &quot;Verify&quot; prompt in
              the header to sign the SIWE message and continue.
            </p>
          </CardContent>
        </Card>
      </Shell>
    )
  }

  if (requestQuery.isLoading) {
    return (
      <Shell>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking Status
            </CardTitle>
          </CardHeader>
        </Card>
      </Shell>
    )
  }

  const requestStatus = requestQuery.data?.requestStatus ?? 'NONE'

  if (requestStatus === 'PENDING') {
    return (
      <Shell>
        <Card className="mx-auto max-w-md border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-6 w-6" />
              Awaiting Admin Approval
            </CardTitle>
            <CardDescription>Your application is under review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Your issuer access request is being reviewed by an admin. This page will
              automatically unlock your dashboard once approved.
            </p>
            <div className="bg-background/50 p-3 rounded-lg text-xs">
              <p className="font-mono break-all text-muted-foreground">{address}</p>
            </div>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['session'] })}
              variant="outline"
              className="w-full"
            >
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </Shell>
    )
  }

  const submitRequest = useSubmitIssuerRequest()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await submitRequest.mutateAsync(formData)
      queryClient.invalidateQueries({ queryKey: ['issuer-request-status'] })
    } catch (err) {
      console.error('Access request error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Shell>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Issuer Access</CardTitle>
              <CardDescription>
                {requestStatus === 'REJECTED'
                  ? 'Your previous request was rejected. You may re-apply below.'
                  : 'Tell us about your organization to request issuer access on the blockchain'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Connected Wallet Address</p>
                  <p className="font-mono text-sm break-all text-foreground">{address}</p>
                </div>

                {requestStatus === 'REJECTED' && (
                  <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm">Your previous request was rejected.</p>
                  </div>
                )}

                {error && (
                  <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="text-sm font-medium mb-2 block">
                    Organization Name
                  </label>
                  <Input
                    id="organization"
                    placeholder="Acme Corp"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="website" className="text-sm font-medium mb-2 block">
                    Website
                  </label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="text-sm font-medium mb-2 block">
                    Organization Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe your organization and why you want to issue certificates..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-24"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">Submit Request</p>
                  <p className="text-muted-foreground text-xs">Tell us about your organization</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">Admin Review</p>
                  <p className="text-muted-foreground text-xs">An admin verifies your request</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">On-Chain Approval</p>
                  <p className="text-muted-foreground text-xs">
                    ISSUER_ROLE is granted to your wallet on-chain
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
