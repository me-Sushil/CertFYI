'use client'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, X } from 'lucide-react'
import { useSiweSignIn } from '@/hooks/useSiweSignIn'
import { issuerApi } from '@/lib/api'

export function IssuerRequestForm({ onClose }: { onClose: () => void }) {
  const { address } = useAccount()
  const { signIn } = useSiweSignIn()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'signing' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    try {
      // Lazy SIWE: only prompt for wallet signature on form submit
      const storedRole = localStorage.getItem('certfyi_role')
      if (!storedRole) {
        setStatus('signing')
        await signIn() // prompts MetaMask signature only at this point
      }

      setStatus('submitting')
      const res = await issuerApi.submitRequest({
        name,
        email,
        organization,
        description,
        website: website || undefined,
      })

      // Success — update cache so the request-access page picks up the new status
      queryClient.invalidateQueries({ queryKey: ['issuer-request-status'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
      setStatus('done')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err?.message ?? 'Something went wrong, please retry')
    }
  }

  if (status === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="mx-auto max-w-md w-full border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Request Submitted</CardTitle>
            <CardDescription>Your application is under review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Your issuer access request has been submitted. An admin will review it — you will
              be notified once approved. This page will automatically unlock your dashboard when
              your request is approved.
            </p>
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="mx-auto max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-muted rounded-md transition"
          >
            <X className="h-5 w-5" />
          </button>
          <CardTitle>Request Issuer Access</CardTitle>
          <CardDescription>
            Fill in your details to request issuer access on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
              <p className="font-mono text-xs break-all text-foreground">{address}</p>
            </div>

            {errorMsg && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            <div>
              <label htmlFor="form-name" className="text-sm font-medium mb-1.5 block">
                Full Name
              </label>
              <Input
                id="form-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="form-email" className="text-sm font-medium mb-1.5 block">
                Email Address
              </label>
              <Input
                id="form-email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="form-org" className="text-sm font-medium mb-1.5 block">
                Organization Name
              </label>
              <Input
                id="form-org"
                placeholder="Acme Corp"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="form-website" className="text-sm font-medium mb-1.5 block">
                Website (optional)
              </label>
              <Input
                id="form-website"
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="form-desc" className="text-sm font-medium mb-1.5 block">
                Organization Description
              </label>
              <Textarea
                id="form-desc"
                placeholder="Describe your organization and why you want to issue certificates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={status === 'signing' || status === 'submitting'} className="flex-1">
                {(status === 'signing' || status === 'submitting') && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {status === 'signing'
                  ? 'Confirm Signature in Wallet…'
                  : status === 'submitting'
                    ? 'Submitting…'
                    : 'Submit Request'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

