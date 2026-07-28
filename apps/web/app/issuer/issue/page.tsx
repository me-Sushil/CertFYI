'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['form', 'preview', 'success'] as const
type Step = (typeof STEPS)[number]

export default function SingleIssuancePage() {
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
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border/15 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center px-6 py-5">
          <Link
            href="/issuer"
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="font-extrabold">Back</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
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

        {step === 'form' && (
          <div className="animate-fade-in space-y-8">
            <div>
              <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Issue Document
              </h2>
              <p className="text-lg leading-[30.6px] text-muted-foreground">
                Upload a PDF and enter recipient details to issue a verified document on the
                blockchain.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-extrabold text-foreground">
                  PDF Document
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                  }}
                  className="cursor-pointer rounded-lg border-2 border-dashed border-border/15 bg-card p-10 text-center shadow-card transition-colors duration-150 ease-[var(--ease-premium)] hover:border-foreground/25"
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

              <div className="space-y-4">
                <label className="block text-sm font-extrabold text-foreground">
                  Recipient Information
                </label>
                <input
                  type="text"
                  name="recipientName"
                  placeholder="Recipient Name"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  required
                  className="h-12 w-full rounded-full border border-border/15 bg-card px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
                <input
                  type="email"
                  name="recipientEmail"
                  placeholder="Recipient Email"
                  value={formData.recipientEmail}
                  onChange={handleInputChange}
                  required
                  className="h-12 w-full rounded-full border border-border/15 bg-card px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold text-foreground">
                  Document Type
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className="h-12 w-full rounded-full border border-border/15 bg-card px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] focus:border-primary focus:ring-3 focus:ring-primary/15"
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

        {step === 'preview' && (
          <div className="animate-fade-in space-y-8">
            <div>
              <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Review &amp; Confirm
              </h2>
              <p className="text-lg leading-[30.6px] text-muted-foreground">
                Please review the information before submitting to the blockchain.
              </p>
            </div>

            <div className="space-y-6 rounded-lg bg-card p-6 shadow-card transition-shadow duration-300 ease-[var(--ease-premium)] hover:shadow-button sm:p-8">
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

            <div className="flex gap-3 rounded-lg bg-accent/5 p-5 shadow-card">
              <p className="text-sm font-semibold text-accent">
                This document will be permanently recorded on the blockchain. This action cannot
                be undone.
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

        {step === 'success' && (
          <div className="animate-scale-in space-y-8 py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-button">
              <CheckCircle className="h-10 w-10 text-success" aria-hidden />
            </div>
            <div>
              <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Document Issued Successfully!
              </h2>
              <p className="mx-auto max-w-md text-lg leading-[30.6px] text-muted-foreground">
                Your document has been anchored on the blockchain and a confirmation has been sent
                to {formData.recipientEmail}
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 text-left text-sm shadow-card">
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
      </main>
    </div>
  )
}
