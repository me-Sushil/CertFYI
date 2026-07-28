'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { HeaderWrapper } from '@/components/header-wrapper'
import { Button } from '@/components/ui/button'
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Shield,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationResult {
  status: 'verified' | 'revoked' | 'not_found' | 'error'
  documentHash: string
  issuerName: string
  issuerAddress: string
  issuanceDate: string
  revocationReason?: string
  transactionHash?: string
  explorerUrl?: string
  errorMessage?: string
}

const STATUS_TONE: Record<VerificationResult['status'], string> = {
  verified: 'text-success',
  revoked: 'text-destructive',
  not_found: 'text-muted-foreground',
  error: 'text-destructive',
}

const INFO_TILES = [
  { icon: CheckCircle, title: 'Instant Results', desc: 'Verify in seconds', tone: 'text-success' },
  { icon: Shield, title: 'No Login Required', desc: 'Public verification', tone: 'text-accent' },
  { icon: Clock, title: 'Always Available', desc: '24/7 verification', tone: 'text-accent' },
] as const

export default function VerifierPortal() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const calculateFileHash = async (file: File): Promise<string> => {
    if (!globalThis.crypto?.subtle) {
      throw new Error(
        'Secure context required to hash the file. Open this page over HTTPS or on localhost.',
      )
    }
    const buffer = await file.arrayBuffer()
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', buffer)
    const hex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return `0x${hex}`
  }

  const verifyDocument = async (hash: string): Promise<VerificationResult> => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const mockResults: { [key: string]: VerificationResult } = {
      ['a'.repeat(64)]: {
        status: 'verified',
        documentHash: 'a'.repeat(64),
        issuerName: 'Stanford University',
        issuerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
        issuanceDate: '2026-06-15T14:30:00Z',
        transactionHash: '0x123456789abcdef',
        explorerUrl: 'https://etherscan.io/tx/0x123456789abcdef',
      },
      ['b'.repeat(64)]: {
        status: 'revoked',
        documentHash: 'b'.repeat(64),
        issuerName: 'MIT',
        issuerAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        issuanceDate: '2026-05-01T09:00:00Z',
        revocationReason: 'Document superseded by updated version',
        transactionHash: '0x987654321fedcba',
        explorerUrl: 'https://etherscan.io/tx/0x987654321fedcba',
      },
    }
    return (
      mockResults[hash] || {
        status: 'not_found',
        documentHash: hash,
        issuerName: 'Unknown',
        issuerAddress: 'N/A',
        issuanceDate: 'N/A',
      }
    )
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
        handleVerify(droppedFile)
      } else {
        toast.error('Please drop a PDF file')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      handleVerify(selectedFile)
    } else {
      toast.error('Please select a PDF file')
    }
  }

  const handleVerify = async (pdfFile: File) => {
    setLoading(true)
    setResult(null)
    try {
      const hash = await calculateFileHash(pdfFile)
      const verificationResult = await verifyDocument(hash)
      setResult(verificationResult)
    } catch (error) {
      console.error('[verify] verification failed:', error)
      setResult({
        status: 'error',
        documentHash: 'N/A',
        issuerName: 'N/A',
        issuerAddress: 'N/A',
        issuanceDate: 'N/A',
        errorMessage: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-16 sm:px-8 sm:pt-28 sm:pb-20 lg:px-10">
        {!file && !result && (
          <div className="animate-fade-in space-y-8">
            <div className="mb-10 text-center">
              <h1 className="mb-4 text-3xl leading-tight font-extrabold tracking-[-1px] text-foreground sm:text-4xl md:text-5xl lg:text-[60px] lg:leading-[1.12]">
                Verify Document{' '}
                <span className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
                  Authenticity
                </span>
              </h1>
              <p className="mx-auto max-w-xl text-lg leading-[30.6px] text-muted-foreground">
                Upload any PDF to check if it&apos;s been verified on the blockchain and view
                issuer details.
              </p>
            </div>

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
              }}
              className={cn(
                'cursor-pointer rounded-[20px] border-2 border-dashed bg-card/50 p-10 text-center shadow-card ring-1 ring-border/5 transition-all duration-300 ease-[var(--ease-premium)] sm:p-16 md:p-20',
                isDragging
                  ? 'border-foreground/40 bg-card'
                  : 'border-border/15 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-card/80 hover:shadow-button',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-5">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300 ease-[var(--ease-premium)]',
                    isDragging
                      ? 'scale-110 bg-primary text-primary-foreground'
                      : 'bg-card text-foreground shadow-button',
                  )}
                >
                  <Upload className="h-7 w-7" aria-hidden />
                </div>
                <div>
                  <p className="mb-1 text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
                    {isDragging ? 'Drop your PDF here' : 'Drag and drop your PDF here'}
                  </p>
                  <p className="text-lg leading-[30.6px] text-muted-foreground">
                    or click to select a file from your computer
                  </p>
                </div>
                <p className="mt-2 text-[15px] font-semibold text-muted-foreground">
                  Maximum file size: 50 MB &bull; Accepted format: PDF
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {INFO_TILES.map((info) => {
                const Icon = info.icon
                return (
                  <div
                    key={info.title}
                    className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5 transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:shadow-button"
                  >
                    <Icon className={cn('mb-3 h-5 w-5', info.tone)} aria-hidden />
                    <p className="mb-1 text-sm font-extrabold text-foreground">{info.title}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{info.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {loading && (
          <div className="animate-fade-in space-y-8 py-16">
            <div className="text-center">
              <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-border/15 border-t-accent" />
              <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Verifying Your Document
              </h2>
              <p className="text-lg leading-[30.6px] text-muted-foreground">
                Calculating hash and checking blockchain...
              </p>
            </div>
            {file && (
              <div className="flex items-center gap-2 rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <p className="truncate text-sm font-semibold text-muted-foreground">{file.name}</p>
              </div>
            )}
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Verification Result
              </h2>
              <button
                onClick={clearFile}
                aria-label="Close"
                className="rounded-full p-2 text-muted-foreground transition-colors duration-150 ease-[var(--ease-premium)] hover:bg-muted/50 hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {file && (
              <div className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5">
                <p className="mb-1 text-sm font-extrabold text-foreground">File</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="mt-2 font-mono text-xs font-semibold text-muted-foreground">
                  Hash: {result.documentHash.substring(0, 32)}...
                </p>
              </div>
            )}

            <div
              className={cn(
                'rounded-[20px] bg-card p-8 shadow-card ring-1 ring-border/5',
                result.status === 'verified' && 'animate-scale-in',
              )}
            >
              <div className="flex items-start gap-5">
                <div className="mt-1 shrink-0">
                  {result.status === 'verified' ? (
                    <CheckCircle className="h-8 w-8 text-success" aria-hidden />
                  ) : (
                    <AlertCircle className={cn('h-8 w-8', STATUS_TONE[result.status])} aria-hidden />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      'mb-2 text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px]',
                      STATUS_TONE[result.status],
                    )}
                  >
                    {result.status === 'verified' && 'Document Verified'}
                    {result.status === 'revoked' && 'Document Revoked'}
                    {result.status === 'not_found' && 'Document Not Found'}
                    {result.status === 'error' && 'Verification Error'}
                  </h3>
                  <p className="text-lg leading-[30.6px] text-muted-foreground">
                    {result.status === 'verified' &&
                      'This document has been verified and anchored on the blockchain.'}
                    {result.status === 'revoked' &&
                      `This document was revoked by the issuer. Reason: ${result.revocationReason}`}
                    {result.status === 'not_found' &&
                      'This document was not found on the blockchain. It may not be verified.'}
                    {result.status === 'error' &&
                      (result.errorMessage ??
                        'An error occurred during verification. Please try again.')}
                  </p>
                </div>
              </div>
            </div>

            {result.status !== 'error' && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5">
                  <label className="mb-2 block text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
                    Issuer
                  </label>
                  <p className="mb-1 font-extrabold text-foreground">{result.issuerName}</p>
                  <p className="font-mono text-xs break-all text-muted-foreground">
                    {result.issuerAddress}
                  </p>
                </div>
                <div className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5">
                  <label className="mb-2 block text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
                    Issued On
                  </label>
                  <p className="font-extrabold text-foreground">
                    {new Date(result.issuanceDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {new Date(result.issuanceDate).toLocaleTimeString()}
                  </p>
                </div>
                {result.transactionHash && (
                  <div className="rounded-[20px] bg-card p-5 shadow-card ring-1 ring-border/5 sm:col-span-2">
                    <label className="mb-2 block text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
                      Transaction Hash
                    </label>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-sm break-all text-accent">
                        {result.transactionHash}
                      </p>
                      {result.explorerUrl && (
                        <a
                          href={result.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View on block explorer"
                          className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors duration-150 ease-[var(--ease-premium)] hover:bg-muted/50 hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button onClick={clearFile} variant="outline" className="h-12 flex-1">
                Verify Another PDF
              </Button>
              <Link href="/" className="flex-1">
                <Button className="h-12 w-full">Back to Home</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
