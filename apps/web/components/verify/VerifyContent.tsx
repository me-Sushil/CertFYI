'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { HeaderWrapper } from '@/components/header-wrapper'
import { Button } from '@/components/ui/button'
import { Upload, X, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react'

interface VerificationResult {
  status: 'verified' | 'revoked' | 'not_found' | 'error'
  documentHash: string
  issuerName: string
  issuerAddress: string
  issuanceDate: string
  revocationReason?: string
  transactionHash?: string
  explorerUrl?: string
}

async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyDocument(hash: string): Promise<VerificationResult> {
  await new Promise(resolve => setTimeout(resolve, 2000))

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

  return mockResults[hash] || {
    status: 'not_found',
    documentHash: hash,
    issuerName: 'Unknown',
    issuerAddress: 'N/A',
    issuanceDate: 'N/A',
  }
}

export default function VerifyContent() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        alert('Please drop a PDF file')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      handleVerify(selectedFile)
    } else {
      alert('Please select a PDF file')
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
      setResult({
        status: 'error',
        documentHash: 'N/A',
        issuerName: 'N/A',
        issuerAddress: 'N/A',
        issuanceDate: 'N/A',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-accent'
      case 'revoked': return 'text-destructive'
      case 'not_found': return 'text-muted-foreground'
      case 'error': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-accent/10 border-accent/30'
      case 'revoked': return 'bg-destructive/10 border-destructive/30'
      case 'not_found': return 'bg-muted'
      case 'error': return 'bg-destructive/10 border-destructive/30'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {!file && !result ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Verify Document Authenticity</h2>
              <p className="text-lg text-muted-foreground">
                Upload any PDF to check if it&apos;s been verified on the blockchain and view issuer details.
              </p>
            </div>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative rounded-lg border-2 border-dashed transition-all duration-300 p-12 sm:p-16 text-center cursor-pointer ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center transition ${isDragging ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <Upload className={`w-8 h-8 transition ${isDragging ? 'text-primary' : 'text-primary/70'}`} />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">{isDragging ? 'Drop your PDF here' : 'Drag and drop your PDF here'}</p>
                  <p className="text-muted-foreground">or click to select a file from your computer</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Maximum file size: 50 MB • Accepted format: PDF</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: CheckCircle, title: 'Instant Results', desc: 'Verify in seconds' },
                { icon: AlertCircle, title: 'No Login Required', desc: 'Public verification' },
                { icon: Clock, title: 'Always Available', desc: '24/7 verification' },
              ].map((info, idx) => {
                const Icon = info.icon
                return (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-card">
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <p className="font-semibold text-sm">{info.title}</p>
                    <p className="text-xs text-muted-foreground">{info.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {loading && (
          <div className="space-y-6 py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verifying Your Document</h2>
              <p className="text-muted-foreground">Calculating hash and checking blockchain...</p>
            </div>
            {file && (
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm text-muted-foreground">📄 {file.name}</p>
              </div>
            )}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold">Verification Result</h2>
              <button onClick={clearFile} className="p-2 hover:bg-muted rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            {file && (
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm font-semibold mb-1">File</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-2">Hash: {result.documentHash.substring(0, 32)}...</p>
              </div>
            )}
            <div className={`p-6 sm:p-8 rounded-lg border ${getStatusBgColor(result.status)}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {result.status === 'verified' && <CheckCircle className={`w-8 h-8 ${getStatusColor(result.status)}`} />}
                  {(result.status === 'revoked' || result.status === 'not_found' || result.status === 'error') && (
                    <AlertCircle className={`w-8 h-8 ${getStatusColor(result.status)}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-2 ${getStatusColor(result.status)}`}>
                    {result.status === 'verified' && '✓ Document Verified'}
                    {result.status === 'revoked' && '⚠ Document Revoked'}
                    {result.status === 'not_found' && 'Document Not Found'}
                    {result.status === 'error' && 'Verification Error'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.status === 'verified' && 'This document has been verified and anchored on the blockchain.'}
                    {result.status === 'revoked' && `This document was revoked by the issuer. Reason: ${result.revocationReason}`}
                    {result.status === 'not_found' && 'This document was not found on the blockchain. It may not be verified.'}
                    {result.status === 'error' && 'An error occurred during verification. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
            {result.status !== 'error' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Issuer</label>
                  <p className="font-semibold mb-1">{result.issuerName}</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">{result.issuerAddress}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Issued On</label>
                  <p className="font-semibold">{new Date(result.issuanceDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(result.issuanceDate).toLocaleTimeString()}</p>
                </div>
                {result.transactionHash && (
                  <div className="p-4 rounded-lg border border-border bg-card sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Transaction Hash</label>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-mono text-primary break-all">{result.transactionHash}</p>
                      {result.explorerUrl && (
                        <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-4 flex-col sm:flex-row">
              <Button onClick={clearFile} variant="outline" className="flex-1">Verify Another PDF</Button>
              <Link href="/" className="flex-1"><Button className="w-full">Back to Home</Button></Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

