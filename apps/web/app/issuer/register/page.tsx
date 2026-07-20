'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { HeaderWrapper } from '@/components/header-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, CheckCircle, AlertCircle, Wallet } from 'lucide-react'

export default function IssuerRegisterPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    description: '',
    website: '',
  })

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Connection Required
              </CardTitle>
              <CardDescription>
                Connect your MetaMask wallet to proceed with registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Click the connect button in the header to connect your wallet with MetaMask.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!address) {
      setError('Wallet not connected')
      return
    }

    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/issuer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          walletAddress: address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setRegistrationId(data.id)
      setSuccess(true)
    } catch (err) {
      console.error('[v0] Registration error:', err)
      setError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Card className="mx-auto max-w-2xl border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <CheckCircle className="h-6 w-6" />
                Registration Submitted Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Registration ID</h3>
                <p className="font-mono text-sm text-muted-foreground break-all">{registrationId}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Your application has been submitted to the admin team</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>You&apos;ll receive an email confirmation at {formData.email}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Check your approval status using your wallet address</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => router.push('/issuer/pending')} className="flex-1">
                  Check Approval Status
                </Button>
                <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Become an Issuer</CardTitle>
                <CardDescription>
                  Register your organization to issue verified digital certificates on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Connected Wallet Info */}
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Connected Wallet Address</p>
                    <p className="font-mono text-sm break-all text-foreground">{address}</p>
                  </div>

                  {error && (
                    <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="text-sm font-medium mb-2 block">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="text-sm font-medium mb-2 block">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* Organization */}
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

                  {/* Website */}
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

                  {/* Description */}
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

                  {/* Submit Button */}
                  <Button
                    onClick={() => setShowConfirm(true)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Submitting...' : 'Submit Registration'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registration Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Submit Application</p>
                      <p className="text-muted-foreground text-xs">Fill out your details</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-medium">Admin Review</p>
                      <p className="text-muted-foreground text-xs">Our team verifies your info</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <div>
                      <p className="font-medium">Get Approved</p>
                      <p className="text-muted-foreground text-xs">Access your issuer dashboard</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Valid email address</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Connected MetaMask wallet</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Organization details</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Admin approval</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;re about to submit your issuer registration with wallet address:
            <p className="font-mono text-xs mt-2 p-2 bg-muted rounded break-all">
              {address}
            </p>
            This wallet will be used for all certificate issuance transactions on the blockchain.
          </AlertDialogDescription>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm & Submit'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
