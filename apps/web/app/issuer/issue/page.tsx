//certfyi/apps/web/app/issuer/issue/page.tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Hex } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Upload, CheckCircle, Plus, ExternalLink,
  X, Menu, Wallet, Loader2, AlertTriangle, ShieldCheck,
} from 'lucide-react'

import { Sidebar } from '@/components/issuer-sidebar'
import { PinStatus } from '@/components/ipfs/pin-status'
import { CidBadge } from '@/components/ipfs/cid-badge'
import { useUploadPdfMutation, useAnchorDocumentMutation } from '@/queries/documents'
import { useLogFailedAnchor } from '@/queries/issuer'
import { useRequiredChain } from '@/hooks/use-required-chain'
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import { resolvePinState } from '@/lib/ipfs'
import { cn } from '@/lib/utils'

const STEPS = ['form', 'preview', 'success'] as const
type Step = (typeof STEPS)[number]

type Phase = 'idle' | 'uploading' | 'awaiting-signature' | 'confirming' | 'recording' | 'error' | 'reverted'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024
// Fixed gas limit for anchorDocument - see the comment at the writeContract
// call for why this isn't left to wallet auto-estimation.
const ANCHOR_GAS_LIMIT = BigInt(300_000)

export default function SingleIssuancePage() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { isCorrectChain, requiredChainName, switchToCorrectChain } = useRequiredChain()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [step, setStep] = useState<Step>('form')
  const [phase, setPhase] = useState<Phase>('idle')
  const [phaseError, setPhaseError] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Belt-and-braces re-entrancy guard: `phase` state may not have re-rendered
  // yet when a second click lands in the same tick, so the disabled prop alone
  // cannot be trusted to prevent a double submission of an irreversible tx.
  const submittingRef = useRef(false)
  const retryingRef = useRef(false)

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    documentType: 'Certificate',
  })

  const [upload, setUpload] = useState<{
    documentHash: string
    cid: string | null
    gatewayUrl: string | null
    pinned: boolean
    pinError?: string
  } | null>(null)

  const [result, setResult] = useState<{
    txHash: string
    cid: string | null
    metadataCid: string | null
  } | null>(null)

  const uploadPdf = useUploadPdfMutation()
  const anchorDocument = useAnchorDocumentMutation()
  const logFailedAnchor = useLogFailedAnchor()

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract()
  const { isSuccess: isTxConfirmed, isError: isTxFailed } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (writeError) {
      submittingRef.current = false
      setPhase('error')
      setPhaseError(writeError.message)
      toast.error('Transaction rejected or failed')
    }
  }, [writeError])

  useEffect(() => {
    if (!isTxFailed || !upload) return
    submittingRef.current = false
    setPhase('reverted')
    setPhaseError(
      'Common causes: this exact document (same file + document type) was already anchored ' +
        'previously, or the connected wallet no longer holds issuer access.',
    )
    logFailedAnchor.mutate({
      docHash: upload.documentHash,
      txHash,
      reason: 'Transaction reverted on-chain',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxFailed])

  // Once the wallet confirms the anchor tx, record it with the API.
  useEffect(() => {
    if (!isTxConfirmed || !txHash || !upload) return
    let cancelled = false
    setPhase('recording')
    ;(async () => {
      try {
        const response = await anchorDocument.mutateAsync({
          documentHash: upload.documentHash,
          txHash,
          documentType: formData.documentType,
          recipientEmail: formData.recipientEmail || undefined,
          recipientName: formData.recipientName || undefined,
          cid: upload.cid ?? undefined,
        })
        if (cancelled) return
        submittingRef.current = false
        setResult({ txHash: response.txHash, cid: response.cid, metadataCid: response.metadataCid })
        setPhase('idle')
        setStep('success')
        toast.success('Document issued')
      } catch (err) {
        if (cancelled) return
        submittingRef.current = false
        const reason =
          err instanceof Error ? err.message : 'The transaction confirmed on-chain, but recording it failed.'
        setPhase('error')
        setPhaseError(reason)
        logFailedAnchor.mutate({ docHash: upload.documentHash, txHash, reason })
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxConfirmed, txHash])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      toast.error('File exceeds the 50 MB limit')
      return
    }
    setPdfFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) {
      toast.error('Please select a PDF file')
      return
    }
    if (!formData.recipientName.trim()) {
      toast.error('Recipient name is required')
      return
    }
    if (!EMAIL_REGEX.test(formData.recipientEmail.trim())) {
      toast.error('Enter a valid recipient email address')
      return
    }
    setFormData((prev) => ({
      ...prev,
      recipientName: prev.recipientName.trim(),
      recipientEmail: prev.recipientEmail.trim().toLowerCase(),
    }))
    setStep('preview')
  }

  const handleConfirm = async () => {
    if (!pdfFile || submittingRef.current) return

    if (!isCorrectChain) {
      switchToCorrectChain()
      toast.error(`Please switch to ${requiredChainName ?? 'the required network'} first`)
      return
    }

    submittingRef.current = true
    setPhaseError(null)
    setPhase('uploading')

    let uploaded
    try {
      uploaded = await uploadPdf.mutateAsync({ file: pdfFile, storeOnIpfs: true })
    } catch (err) {
      submittingRef.current = false
      setPhase('error')
      setPhaseError(err instanceof Error ? err.message : 'Failed to hash and upload the PDF')
      return
    }

    setUpload({
      documentHash: uploaded.documentHash,
      cid: uploaded.cid,
      gatewayUrl: uploaded.gatewayUrl,
      pinned: uploaded.pinned,
      pinError: uploaded.pinError,
    })

    if (!uploaded.pinned) {
      toast.warning('IPFS storage failed - continuing without it. The document is still anchored and verifiable by hash.')
    }

    setPhase('awaiting-signature')
    resetWrite()
    writeContract({
      address: CONTRACT_ADDRESS as Hex,
      abi: CONTRACT_ABI,
      functionName: 'anchorDocument',
      args: [uploaded.documentHash as Hex, formData.documentType],
      chainId: CONTRACT_CHAIN_ID,
      // Some wallets' automatic gas estimation is unreliable and has been
      // observed returning values (e.g. 21,000,000) that exceed Infura's
      // hard per-tx cap (16,777,216) on Sepolia. anchorDocument is a single
      // SSTORE plus an event emit - comfortably under 200k gas - so a fixed,
      // generous limit sidesteps bad estimates entirely rather than trusting
      // the wallet.
      gas: ANCHOR_GAS_LIMIT,
    })
    setPhase('confirming')
  }

  const handleRetryRecording = async () => {
    if (!txHash || !upload || retryingRef.current) return
    retryingRef.current = true
    setPhase('recording')
    setPhaseError(null)
    try {
      const response = await anchorDocument.mutateAsync({
        documentHash: upload.documentHash,
        txHash,
        documentType: formData.documentType,
        recipientEmail: formData.recipientEmail || undefined,
        recipientName: formData.recipientName || undefined,
        cid: upload.cid ?? undefined,
      })
      submittingRef.current = false
      setResult({ txHash: response.txHash, cid: response.cid, metadataCid: response.metadataCid })
      setPhase('idle')
      setStep('success')
      toast.success('Document issued')
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Failed to record the transaction'
      setPhase('error')
      setPhaseError(reason)
      logFailedAnchor.mutate({ docHash: upload.documentHash, txHash, reason })
    } finally {
      retryingRef.current = false
    }
  }

  const resetForm = () => {
    submittingRef.current = false
    setStep('form')
    setPhase('idle')
    setPhaseError(null)
    setPdfFile(null)
    setUpload(null)
    setResult(null)
    setFormData({ recipientName: '', recipientEmail: '', documentType: 'Certificate' })
    resetWrite()
  }

  const stepIndex = STEPS.indexOf(step)
  const isBusy = phase === 'uploading' || phase === 'awaiting-signature' || phase === 'confirming' || phase === 'recording' || isWritePending

  const phaseLabel: Record<Phase, string> = {
    idle: 'Confirm & Issue',
    uploading: 'Hashing PDF...',
    'awaiting-signature': 'Confirm in wallet...',
    confirming: 'Confirming on-chain...',
    recording: 'Recording...',
    error: 'Retry',
    reverted: 'Retry',
  }


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
              <div className="rounded-lg bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                <Wallet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                <p className="text-sm font-semibold text-muted-foreground">Connect your wallet to issue documents</p>
              </div>
            )}

            {isConnected && !isCorrectChain && step !== 'success' && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4 shadow-card ring-1 ring-accent/5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                <p className="flex-1 text-sm text-foreground">
                  Wrong network. Switch to <strong>{requiredChainName ?? 'the required chain'}</strong> to issue documents.
                </p>
                <Button size="sm" variant="outline" onClick={switchToCorrectChain}>
                  Switch Network
                </Button>
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
                  <div className="rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
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

                  <div className="rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
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
                        className="h-12 w-full rounded-lg border border-border/15 bg-background px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                      />
                      <input
                        type="email"
                        name="recipientEmail"
                        placeholder="Recipient Email"
                        value={formData.recipientEmail}
                        onChange={handleInputChange}
                        required
                        className="h-12 w-full rounded-lg border border-border/15 bg-background px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                    <label className="mb-4 block text-sm font-extrabold text-foreground">
                      Document Type
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="h-12 w-full rounded-lg border border-border/15 bg-background px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] focus:border-primary focus:ring-3 focus:ring-primary/15"
                    >
                      <option>Certificate</option>
                      <option>Diploma</option>
                      <option>License</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="flex gap-3 rounded-lg border border-accent/20 bg-accent/5 p-5 shadow-card ring-1 ring-border/5">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                    <p className="text-sm font-semibold text-accent">
                      This document is stored on IPFS and anchored on-chain. The file itself,
                      not just its hash, is permanently retrievable and cannot be changed or removed.
                    </p>
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

                <div className="space-y-6 rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 transition-shadow duration-300 ease-[var(--ease-premium)] sm:p-8">
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
                        { label: 'Store on IPFS:', value: 'Always' },
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
                      <span className="font-semibold text-foreground">{requiredChainName ?? 'Configured chain'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Contract:</span>
                      <span className="font-mono text-xs font-semibold text-foreground">{CONTRACT_ADDRESS}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg bg-accent/5 p-5 shadow-card ring-1 ring-border/5">
                  <p className="text-sm font-semibold text-accent">
                    This document will be permanently recorded on the blockchain. This action cannot be undone.
                  </p>
                </div>

                {(phase === 'error' || phase === 'reverted') && phaseError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-5">
                    <p className="mb-1 text-sm font-semibold text-destructive">
                      {phase === 'reverted'
                        ? 'Transaction reverted on-chain'
                        : txHash
                          ? 'Transaction confirmed, but recording it failed'
                          : 'Something went wrong'}
                    </p>
                    <p className="text-xs text-muted-foreground">{phaseError}</p>
                    {txHash && (
                      <div className="mt-2 flex items-center gap-2">
                        <p className="font-mono text-xs break-all text-muted-foreground">Tx: {txHash}</p>
                        {getExplorerUrl(txHash) && (
                          <a
                            href={getExplorerUrl(txHash)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs font-semibold text-accent hover:opacity-80"
                          >
                            View details
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" className="h-12 flex-1" onClick={resetForm} disabled={isBusy}>
                    Back
                  </Button>
                  {phase === 'error' && txHash ? (
                    <Button className="h-12 flex-1" onClick={handleRetryRecording} disabled={isBusy}>
                      {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Retry Recording
                    </Button>
                  ) : (
                    <Button className="h-12 flex-1" onClick={handleConfirm} disabled={isBusy || !isCorrectChain}>
                      {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {phase === 'reverted' ? 'Try Again' : phaseLabel[phase]}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {isConnected && step === 'success' && result && (
              <div className="animate-scale-in space-y-8 py-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-button ring-1 ring-border/5">
                  <CheckCircle className="h-10 w-10 text-success" aria-hidden />
                </div>
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Document Issued Successfully!
                  </h2>
                  <p className="mx-auto max-w-md text-lg leading-[30.6px] text-muted-foreground">
                    Your document has been anchored on the blockchain and is ready to verify.
                  </p>
                </div>
                <div className="mx-auto max-w-md space-y-4 rounded-lg bg-card p-6 text-left text-sm shadow-card ring-1 ring-border/5">
                  <div>
                    <p className="mb-2 font-semibold text-muted-foreground">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs break-all text-foreground">{result.txHash}</p>
                      {getExplorerUrl(result.txHash) && (
                        <a
                          href={getExplorerUrl(result.txHash)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-accent hover:opacity-80"
                          aria-label="View on block explorer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-border/15 pt-4">
                    <p className="mb-2 font-semibold text-muted-foreground">IPFS Storage</p>
                    <PinStatus
                      state={resolvePinState({ pinned: !!result.cid, cid: result.cid, pinError: upload?.pinError })}
                      reason={upload?.pinError}
                    />
                    {result.cid && (
                      <div className="mt-2">
                        <CidBadge cid={result.cid} />
                      </div>
                    )}
                  </div>
                  {result.metadataCid && (
                    <div className="border-t border-border/15 pt-4">
                      <p className="mb-2 font-semibold text-muted-foreground">Metadata Sidecar</p>
                      <CidBadge cid={result.metadataCid} />
                    </div>
                  )}
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-3">
                  <Link href="/issuer">
                    <Button className="h-12 w-full">Back to Dashboard</Button>
                  </Link>
                  <Button variant="outline" className="h-12 w-full" onClick={resetForm}>
                    Issue Another
                  </Button>
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
