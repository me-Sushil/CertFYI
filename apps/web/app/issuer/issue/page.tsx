'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Upload, CheckCircle, ArrowLeft, LayoutDashboard, Plus, History,
  X, Menu, Wallet,
} from 'lucide-react'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { Sidebar } from '@/components/issuer-sidebar'
import { cn } from '@/lib/utils'

const STEPS = ['form', 'preview', 'success'] as const
type Step = (typeof STEPS)[number]

export default function SingleIssuancePage() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    documentType: 'Certificate',
    organizationName: 'Your Organization',
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file && file.type === 'application/pdf') setPdfFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) {
      toast.error('Please select a PDF file')
      return
    }
    setStep('preview')
  }

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setLoading(false)
    setStep('success')
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border/10">
          <Sidebar pathname={pathname} onNavigate={() => {}} />
        </div>
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/10 bg-card/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground hover:bg-muted/50"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-sm font-extrabold text-foreground">CertFyi</span>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Plus className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <h1 className="text-base font-extrabold text-foreground">Issue Document</h1>
            </div>
            <div className="flex-1 lg:hidden" />
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggleInline />
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            {/* Stepper */}
            <div className="mb-10 flex items-center justify-between">
              {STEPS.map((s, idx) => (
                <React.Fragment key={s}>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold transition-all duration-300 ease-[var(--ease-premium)]',
                      step === s
                        ? 'scale-110 bg-primary text-primary-foreground shadow-button'
                        : stepIndex > idx
                          ? 'bg-success text-success-foreground'
                          : 'bg-card text-muted-foreground shadow-soft',
                    )}
                  >
                    {idx + 1}
                  </div>
                  {idx < 2 && (
                    <div
                      className={cn(
                        'mx-3 h-0.5 flex-1 transition-colors duration-300',
                        stepIndex > idx ? 'bg-success' : 'bg-border/15',
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Not connected */}
            {!isConnected && (
              <div className="rounded-[20px] bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                <Wallet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                <p className="text-sm font-semibold text-muted-foreground">Connect your wallet to issue documents</p>
              </div>
            )}

            {isConnected && step === 'form' && (
              <div className="space-y-8">
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Issue Document
                  </h2>
                  <p className="text-lg leading-[30.6px] text-muted-foreground">
                    Upload a PDF and enter recipient details to issue a verified document on the blockchain.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="rounded-[20px] bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                    <label className="mb-4 block text-sm font-extrabold text-foreground">
                      PDF Document
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                      }}
                      className="cursor-pointer rounded-xl border-2 border-dashed border-border/15 bg-background p-10 text-center transition-colors duration-150 ease-[var(--ease-premium)] hover:border-foreground/25"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden />
                      {pdfFile ? (
                        <div>
                          <p className="font-extrabold text-foreground">{pdfFile.name}</p>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-extrabold text-foreground">
                            Drop PDF here or click to select
                          </p>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            Maximum 50 MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                    <label className="mb-4 block text-sm font-extrabold text-foreground">
                      Recipient Information
                    </label>
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="recipientName"
                        placeholder="Recipient Name"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        required
                        className="h-12 w-full rounded-full border border-border/15 bg-background px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                      />
                      <input
                        type="email"
                        name="recipientEmail"
                        placeholder="Recipient Email"
                        value={formData.recipientEmail}
                        onChange={handleInputChange}
                        required
                        className="h-12 w-full rounded-full border border-border/15 bg-background px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                    <label className="mb-4 block text-sm font-extrabold text-foreground">
                      Document Type
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="h-12 w-full rounded-full border border-border/15 bg-background px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] focus:border-primary focus:ring-3 focus:ring-primary/15"
                    >
                      <option>Certificate</option>
                      <option>Diploma</option>
                      <option>License</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Link href="/issuer" className="flex-1">
                      <Button variant="outline" className="h-12 w-full">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" className="h-12 flex-1" disabled={!pdfFile}>
                      Continue to Preview
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {isConnected && step === 'preview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Review & Confirm
                  </h2>
                  <p className="text-lg leading-[30.6px] text-muted-foreground">
                    Please review the information before submitting to the blockchain.
                  </p>
                </div>

                <div className="space-y-6 rounded-[20px] bg-card p-6 shadow-card ring-1 ring-border/5 transition-shadow duration-300 ease-[var(--ease-premium)] sm:p-8">
                  <div className="space-y-3">
                    <h3 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
                      Document Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Document:', value: pdfFile?.name },
                        { label: 'Type:', value: formData.documentType },
                        {
                          label: 'Size:',
                          value: pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : '0 MB',
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between py-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border/15 pt-6 text-sm">
                    <h3 className="font-extrabold text-foreground">Recipient</h3>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-semibold text-foreground">{formData.recipientName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-semibold text-foreground">{formData.recipientEmail}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border/15 pt-6 text-sm">
                    <h3 className="font-extrabold text-foreground">Transaction Details</h3>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-semibold text-foreground">Ethereum Mainnet</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Estimated Gas:</span>
                      <span className="font-semibold text-foreground">~0.025 ETH</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 rounded-[20px] bg-accent/5 p-5 shadow-card ring-1 ring-border/5">
                  <p className="text-sm font-semibold text-accent">
                    This document will be permanently recorded on the blockchain. This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="h-12 flex-1" onClick={() => setStep('form')}>
                    Back
                  </Button>
                  <Button className="h-12 flex-1" onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm & Issue'}
                  </Button>
                </div>
              </div>
            )}

            {isConnected && step === 'success' && (
              <div className="animate-scale-in space-y-8 py-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-button ring-1 ring-border/5">
                  <CheckCircle className="h-10 w-10 text-success" aria-hidden />
                </div>
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Document Issued Successfully!
                  </h2>
                  <p className="mx-auto max-w-md text-lg leading-[30.6px] text-muted-foreground">
                    Your document has been anchored on the blockchain and a confirmation has been sent to {formData.recipientEmail}
                  </p>
                </div>
                <div className="rounded-[20px] bg-card p-6 text-left text-sm shadow-card ring-1 ring-border/5">
                  <p className="mb-2 font-semibold text-muted-foreground">Transaction Hash:</p>
                  <p className="font-mono text-xs break-all text-accent">
                    0x742d35Cc6634C0532925a3b844Bc9e7595f42bE
                  </p>
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-3">
                  <Link href="/issuer">
                    <Button className="h-12 w-full">Back to Dashboard</Button>
                  </Link>
                  <Link href="/issuer/issue">
                    <Button variant="outline" className="h-12 w-full">
                      Issue Another
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-72 max-w-[80vw] animate-fade-in shadow-large">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground shadow-button hover:bg-muted/50"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
