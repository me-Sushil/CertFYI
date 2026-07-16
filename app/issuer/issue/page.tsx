'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react'

export default function SingleIssuancePage() {
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form')
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
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) {
      alert('Please select a PDF file')
      return
    }
    setStep('preview')
  }

  const handleConfirm = async () => {
    setLoading(true)
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000))
    setLoading(false)
    setStep('success')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/issuer" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-12">
          {['form', 'preview', 'success'].map((s, idx) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                step === s ? 'bg-primary text-primary-foreground' :
                ['form', 'preview', 'success'].indexOf(step) > idx ? 'bg-accent text-accent-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {idx + 1}
              </div>
              {idx < 2 && <div className="flex-1 h-1 mx-2 bg-border" />}
            </React.Fragment>
          ))}
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Issue Document</h2>
              <p className="text-muted-foreground">Upload a PDF and enter recipient details to issue a verified document on the blockchain.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3">PDF Document</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-primary/70 mx-auto mb-2" />
                  {pdfFile ? (
                    <div>
                      <p className="font-semibold">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">Drop PDF here or click to select</p>
                      <p className="text-xs text-muted-foreground mt-1">Maximum 50 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold">Recipient Information</label>
                <input
                  type="text"
                  name="recipientName"
                  placeholder="Recipient Name"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
                <input
                  type="email"
                  name="recipientEmail"
                  placeholder="Recipient Email"
                  value={formData.recipientEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">Document Type</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                >
                  <option>Certificate</option>
                  <option>Diploma</option>
                  <option>License</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <Link href="/issuer" className="flex-1">
                  <Button variant="outline" className="w-full">Cancel</Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={!pdfFile}>
                  Continue to Preview
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Review & Confirm</h2>
              <p className="text-muted-foreground">Please review the information before submitting to the blockchain.</p>
            </div>

            <div className="space-y-6 p-6 rounded-lg border border-border bg-card">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Document Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Document:</span>
                    <span className="font-medium">{pdfFile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{formData.documentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{pdfFile ? (pdfFile.size / 1024 / 1024).toFixed(2) : 0} MB</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-2 text-sm">
                <h3 className="font-semibold">Recipient</h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{formData.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.recipientEmail}</span>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-2 text-sm">
                <h3 className="font-semibold">Transaction Details</h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-medium">Ethereum Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Gas:</span>
                  <span className="font-medium">~0.025 ETH</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">This document will be permanently recorded on the blockchain. This action cannot be undone.</p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm & Issue'}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="space-y-8 text-center py-12">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">Document Issued Successfully!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your document has been anchored on the blockchain and a confirmation has been sent to {formData.recipientEmail}
              </p>
            </div>

            <div className="bg-muted p-6 rounded-lg text-sm text-left">
              <p className="text-muted-foreground mb-2">Transaction Hash:</p>
              <p className="font-mono text-xs break-all text-primary">0x742d35Cc6634C0532925a3b844Bc9e7595f42bE</p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/issuer" className="w-full">
                <Button className="w-full">Back to Dashboard</Button>
              </Link>
              <Link href="/issuer/issue" className="w-full">
                <Button variant="outline" className="w-full">Issue Another</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
