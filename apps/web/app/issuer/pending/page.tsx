'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { HeaderWrapper } from '@/components/header-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function PendingPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<'loading' | 'pending' | 'approved' | 'rejected' | 'not_found'>('loading')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      if (!isConnected || !address) {
        setStatus('not_found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/issuer/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        })

        const data = await response.json()

        if (data.status === 'approved') {
          setStatus('approved')
          // Redirect to issuer dashboard after 2 seconds
          setTimeout(() => {
            router.push('/issuer')
          }, 2000)
        } else if (data.status === 'pending') {
          setStatus('pending')
        } else {
          setStatus('not_found')
        }
      } catch (error) {
        console.error('[v0] Status check error:', error)
        setStatus('not_found')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [isConnected, address, router])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Wallet Connection Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your MetaMask wallet to check your registration status.
              </p>
              <Button onClick={() => router.back()} variant="outline" className="w-full">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Checking Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please wait while we check your registration status...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Card className="mx-auto max-w-md border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <CheckCircle className="h-6 w-6" />
                Registration Approved!
              </CardTitle>
              <CardDescription>
                Your issuer account has been activated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Congratulations! Your issuer registration has been approved by the admin team. You now have access to your issuer dashboard.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Wallet Address:</p>
                <p className="font-mono break-all">{address}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecting to dashboard in 2 seconds...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Card className="mx-auto max-w-md border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="h-6 w-6" />
                Waiting for Approval
              </CardTitle>
              <CardDescription>
                Your application is under review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  Your issuer registration is currently being reviewed by our admin team. This process typically takes 1-2 business days.
                </p>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll receive an email notification once your registration is approved.
                </p>
              </div>

              <div className="bg-background/50 p-3 rounded-lg text-xs">
                <p className="font-mono break-all text-muted-foreground">{address}</p>
              </div>

              <div className="space-y-2 pt-4">
                <p className="text-xs font-medium text-muted-foreground">Check again in:</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 rounded bg-background text-center">
                    <p className="text-lg font-bold">24</p>
                    <p className="text-xs">hours</p>
                  </div>
                  <div className="p-2 rounded bg-background text-center">
                    <p className="text-lg font-bold">48</p>
                    <p className="text-xs">hours</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                  Refresh
                </Button>
                <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                  Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Not found or no registration
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <div className="mx-auto max-w-7xl px-4 py-16">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              No Registration Found
            </CardTitle>
            <CardDescription>
              This wallet address has no pending registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              It looks like this wallet hasn&apos;t submitted an issuer registration yet. Would you like to start the registration process?
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/issuer/register')} className="flex-1">
                Register Now
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
