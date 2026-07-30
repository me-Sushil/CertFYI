'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HeaderWrapper } from '@/components/header-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/lib/auth-context'
import { useIssuerRequestStatus, useSubmitIssuerRequest } from '@/queries/issuer'
import { Loader2, Clock, Shield } from 'lucide-react'

const issuerRequestSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  organization: z.string().min(2, 'Organization name is required'),
  description: z.string().min(10, 'Please describe your organization (at least 10 characters)'),
  website: z.string().url('Please enter a valid URL').or(z.literal('')),
})

type IssuerRequestFormData = z.infer<typeof issuerRequestSchema>

const HOW_IT_WORKS = [
  { num: '1', title: 'Submit Request', desc: 'Tell us about your organization' },
  { num: '2', title: 'Admin Review', desc: 'An admin verifies your request' },
  { num: '3', title: 'On-Chain Approval', desc: 'ISSUER_ROLE is granted to your wallet on-chain' },
]

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        {children}
      </div>
    </div>
  )
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
      <p className="text-sm font-semibold text-destructive">{children}</p>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p>
}

export default function RequestAccessPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { address, role, isLoading: sessionLoading } = useSession()
  const queryClient = useQueryClient()
  const requestQuery = useIssuerRequestStatus(role === 'UNAPPROVED')
  const submitRequest = useSubmitIssuerRequest()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<IssuerRequestFormData>({
    resolver: zodResolver(issuerRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      description: '',
      website: '',
    },
  })

  useEffect(() => {
    if (role === 'ADMIN') router.replace('/admin')
    else if (role === 'ISSUER') router.replace('/issuer')
  }, [role, router])

  useEffect(() => {
    if (!isConnected) {
      router.replace('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  if (sessionLoading || role === 'ADMIN' || role === 'ISSUER') {
    return (
      <Shell>
        <Card className="mx-auto max-w-md animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-foreground" aria-hidden />
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
        <Card className="mx-auto max-w-md animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" aria-hidden />
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
        <Card className="mx-auto max-w-md animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-foreground" aria-hidden />
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
        <Card className="mx-auto max-w-md animate-fade-in-up shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Clock className="h-6 w-6" aria-hidden />
              Awaiting Admin Approval
            </CardTitle>
            <CardDescription>Your application is under review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              Your issuer access request is being reviewed by an admin. This page will
              automatically unlock your dashboard once approved.
            </p>
            <div className="rounded-lg bg-muted/40 p-4 text-xs">
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

  const onSubmit = async (data: IssuerRequestFormData) => {
    try {
      await submitRequest.mutateAsync(data)
      queryClient.invalidateQueries({ queryKey: ['issuer-request-status'] })
    } catch (err) {
      console.error('Access request error:', err)
      setFormError('root', {
        message: err instanceof Error ? err.message : 'An error occurred while submitting your request',
      })
    }
  }

  return (
    <Shell>
      <div className="grid animate-fade-in-up gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-[22px] leading-[28.6px] tracking-[-0.5px]">
                Request Issuer Access
              </CardTitle>
              <CardDescription>
                {requestStatus === 'REJECTED'
                  ? 'Your previous request was rejected. You may re-apply below.'
                  : 'Tell us about your organization to request issuer access on the blockchain'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="rounded-lg bg-muted/40 p-5">
                  <p className="mb-1 text-sm font-semibold text-muted-foreground">
                    Connected Wallet Address
                  </p>
                  <p className="font-mono text-sm break-all text-foreground">{address}</p>
                </div>

                {requestStatus === 'REJECTED' && (
                  <ErrorBanner>Your previous request was rejected.</ErrorBanner>
                )}
                {errors.root && <ErrorBanner>{errors.root.message}</ErrorBanner>}

                <div>
                  <Label htmlFor="name" className="mb-2 block">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    aria-invalid={!!errors.name}
                    {...register('name')}
                  />
                  <FieldError message={errors.name?.message} />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
                <div>
                  <Label htmlFor="organization" className="mb-2 block">
                    Organization Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="organization"
                    placeholder="Acme Corp"
                    aria-invalid={!!errors.organization}
                    {...register('organization')}
                  />
                  <FieldError message={errors.organization?.message} />
                </div>
                <div>
                  <Label htmlFor="website" className="mb-2 block">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    aria-invalid={!!errors.website}
                    {...register('website')}
                  />
                  <FieldError message={errors.website?.message} />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Organization Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your organization and why you want to issue certificates..."
                    className="h-24"
                    aria-invalid={!!errors.description}
                    {...register('description')}
                  />
                  <FieldError message={errors.description?.message} />
                </div>

                <Button type="submit" disabled={isSubmitting} className="h-12 w-full">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
            <CardContent className="space-y-5 text-sm">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.num} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-primary-foreground">
                    {item.num}
                  </span>
                  <div>
                    <p className="font-extrabold text-foreground">{item.title}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
