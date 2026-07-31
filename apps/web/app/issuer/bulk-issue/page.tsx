'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Hex } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import {
  Upload, Download, X, Menu, Wallet, Loader2, FileText, Trash2,
  ExternalLink, CheckCircle, AlertTriangle,
} from 'lucide-react'

import { Sidebar } from '@/components/issuer-sidebar'
import { useUploadPdfMutation, useAnchorBatchMutation } from '@/queries/documents'
import { useRequiredChain } from '@/hooks/use-required-chain'
import {
  CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_CHAIN_ID,
  calculateMerkleRoot, getExplorerUrl,
} from '@/lib/contracts/document-anchor'
import { cn } from '@/lib/utils'

const STEPS = ['select', 'map', 'review', 'success'] as const
type Step = (typeof STEPS)[number]

type Phase = 'idle' | 'uploading' | 'awaiting-signature' | 'confirming' | 'recording' | 'error' | 'reverted'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024
// Flat gas cost regardless of batch size - anchorMerkleBatch writes one
// storage slot no matter how many documents are under the root. Same fix as
// the single-issue and revoke flows: wallet auto-estimation has been
// observed returning values that exceed the RPC provider's hard per-tx cap.
const BATCH_GAS_LIMIT = BigInt(300_000)

interface MappedRow {
  sn: number
  pdfName: string
  recipientName: string
  recipientEmail: string
  file: File
}

interface ProcessedDoc {
  documentHash: string
  cid: string | null
  recipientName: string
  recipientEmail: string
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default function BulkIssuancePage() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { isCorrectChain, requiredChainName, switchToCorrectChain } = useRequiredChain()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [step, setStep] = useState<Step>('select')
  const [documentType, setDocumentType] = useState('Certificate')
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [mappedRows, setMappedRows] = useState<MappedRow[] | null>(null)
  // Identifies which file selection a downloaded CSV belongs to - stamped
  // into both the filename and a hidden column, so re-uploading a stale CSV
  // from an earlier selection is caught instead of silently mismatched.
  const [csvToken, setCsvToken] = useState<string | null>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [phaseError, setPhaseError] = useState<string | null>(null)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [batchContext, setBatchContext] = useState<{
    processed: ProcessedDoc[]
    merkleRoot: string
    batchId: string
  } | null>(null)
  const [result, setResult] = useState<{
    batchId: string
    merkleRoot: string
    txHash: string
    documentCount: number
  } | null>(null)

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  const uploadPdf = useUploadPdfMutation()
  const anchorBatch = useAnchorBatchMutation()

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
    if (!isTxFailed) return
    submittingRef.current = false
    setPhase('reverted')
    setPhaseError('The batch anchoring transaction failed on-chain.')
  }, [isTxFailed])

  // Once the wallet confirms the batch tx, record every document with the API.
  useEffect(() => {
    if (!isTxConfirmed || !txHash || !batchContext) return
    let cancelled = false
    setPhase('recording')
    ;(async () => {
      try {
        const response = await anchorBatch.mutateAsync({
          batchId: batchContext.batchId,
          txHash,
          documentType,
          documents: batchContext.processed.map((d) => ({
            documentHash: d.documentHash,
            recipientName: d.recipientName,
            recipientEmail: d.recipientEmail,
            cid: d.cid ?? undefined,
          })),
        })
        if (cancelled) return
        submittingRef.current = false
        setResult({
          batchId: response.batchId,
          merkleRoot: response.merkleRoot,
          txHash: response.txHash,
          documentCount: response.documentCount,
        })
        setPhase('idle')
        setStep('success')
        toast.success('Batch issued')
      } catch (err) {
        if (cancelled) return
        submittingRef.current = false
        setPhase('error')
        setPhaseError(
          err instanceof Error ? err.message : 'The transaction confirmed on-chain, but recording it failed.',
        )
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxConfirmed, txHash])

  const [isDraggingPdf, setIsDraggingPdf] = useState(false)
  const [isDraggingCsv, setIsDraggingCsv] = useState(false)

  const addPdfFiles = (incoming: File[]) => {
    const seen = new Set(pdfFiles.map((f) => `${f.name}:${f.size}`))
    const valid: File[] = []
    for (const file of incoming) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF - skipped`)
        continue
      }
      if (file.size > MAX_PDF_SIZE_BYTES) {
        toast.error(`${file.name} exceeds the 50 MB limit - skipped`)
        continue
      }
      const key = `${file.name}:${file.size}`
      if (seen.has(key)) continue
      seen.add(key)
      valid.push(file)
    }
    if (valid.length > 0) setPdfFiles((prev) => [...prev, ...valid])
  }

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    addPdfFiles(Array.from(e.currentTarget.files ?? []))
    e.currentTarget.value = ''
  }

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingPdf(false)
    addPdfFiles(Array.from(e.dataTransfer.files ?? []))
  }

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const generateToken = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

  /**
   * Re-downloading reuses the existing token (same file selection, same
   * batch) - only a fresh `Continue` click from step 1 mints a new one, since
   * that's the only point the underlying file selection can actually change.
   */
  const downloadRecipientsCsv = (token: string) => {
    const rows = pdfFiles.map((f, i) => ({ SN: i + 1, 'PDF Name': f.name, Name: '', Email: '', Batch: token }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bulk-issue-recipients-${token}.csv`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleContinueToMap = () => {
    if (pdfFiles.length === 0) {
      toast.error('Select at least one PDF file')
      return
    }
    const token = generateToken()
    setCsvToken(token)
    downloadRecipientsCsv(token)
    toast.success(`Downloaded a CSV listing your ${pdfFiles.length} file${pdfFiles.length !== 1 ? 's' : ''}`)
    setStep('map')
  }

  /**
   * Normalizes a row's keys (trims, strips a stray BOM, lowercases) so the
   * match survives whatever a spreadsheet app did on re-save - Excel/Numbers
   * routinely add a UTF-8 BOM, retitle-case headers, or re-quote fields.
   */
  const BOM_PREFIX = /^﻿/

  const normalizeRow = (raw: Record<string, string>): Record<string, string> => {
    const normalized: Record<string, string> = {}
    for (const [key, value] of Object.entries(raw)) {
      const cleanKey = key.replace(BOM_PREFIX, '').trim().toLowerCase()
      normalized[cleanKey] = (value ?? '').toString().trim()
    }
    return normalized
  }

  const processCsvFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(BOM_PREFIX, '').trim(),
      complete: (results) => {
        if (csvToken) {
          const firstRow = results.data[0] ? normalizeRow(results.data[0]) : undefined
          const rowToken = firstRow?.['batch']
          if (rowToken && rowToken !== csvToken) {
            toast.error(
              'This CSV is from a different file selection. Re-download the template for your current files, or click Continue again.',
            )
            return
          }
        }

        const filesByName = new Map(pdfFiles.map((f) => [f.name.trim().toLowerCase(), f]))
        const errors: string[] = []
        const rows: MappedRow[] = []
        const matchedFiles = new Set<File>()

        results.data.forEach((raw, idx) => {
          const row = normalizeRow(raw)
          const rowLabel = `Row ${idx + 2}`

          // SN survives spreadsheet re-saves far better than a filename with
          // spaces/parentheses/ampersands, which Excel/Numbers can re-quote
          // or mangle - prefer it, and only fall back to a name match.
          const sn = Number(row['sn'])
          const pdfNameRaw = row['pdf name'] ?? ''
          const bySn = Number.isInteger(sn) && sn >= 1 && sn <= pdfFiles.length ? pdfFiles[sn - 1] : undefined
          const matchedFile = bySn ?? filesByName.get(pdfNameRaw.toLowerCase())

          const recipientName = row['name'] ?? ''
          const recipientEmail = (row['email'] ?? '').toLowerCase()

          if (!matchedFile) {
            errors.push(`${rowLabel}: "${pdfNameRaw || '(empty)'}" doesn't match any selected PDF`)
            return
          }
          if (!recipientName) {
            errors.push(`${rowLabel} (${matchedFile.name}): Name is required`)
            return
          }
          if (!EMAIL_REGEX.test(recipientEmail)) {
            errors.push(`${rowLabel} (${matchedFile.name}): "${recipientEmail || '(empty)'}" is not a valid email`)
            return
          }

          matchedFiles.add(matchedFile)
          rows.push({
            sn: rows.length + 1,
            pdfName: matchedFile.name,
            recipientName,
            recipientEmail,
            file: matchedFile,
          })
        })

        const missing = pdfFiles.filter((f) => !matchedFiles.has(f))
        if (missing.length > 0) {
          errors.push(`${missing.length} selected PDF${missing.length !== 1 ? 's have' : ' has'} no row in the CSV: ${missing.map((f) => f.name).join(', ')}`)
        }

        if (errors.length > 0) {
          toast.error(errors[0])
          if (errors.length > 1) {
            errors.slice(1, 4).forEach((msg) => toast.error(msg))
          }
          return
        }

        setMappedRows(rows)
        setStep('review')
      },
      error: (err) => {
        toast.error(`Failed to parse CSV: ${err.message}`)
      },
    })
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    e.currentTarget.value = ''
    if (file) processCsvFile(file)
  }

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingCsv(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please drop a CSV file')
      return
    }
    processCsvFile(file)
  }

  const handleConfirmIssueAll = async () => {
    if (!mappedRows || mappedRows.length === 0 || submittingRef.current) return

    if (!isCorrectChain) {
      switchToCorrectChain()
      toast.error(`Please switch to ${requiredChainName ?? 'the required network'} first`)
      return
    }

    submittingRef.current = true
    setPhaseError(null)
    setPhase('uploading')
    setProgress({ done: 0, total: mappedRows.length })

    const processed: ProcessedDoc[] = []
    try {
      for (let i = 0; i < mappedRows.length; i++) {
        const row = mappedRows[i]
        const uploaded = await uploadPdf.mutateAsync({ file: row.file, storeOnIpfs: true })
        processed.push({
          documentHash: uploaded.documentHash,
          cid: uploaded.cid,
          recipientName: row.recipientName,
          recipientEmail: row.recipientEmail,
        })
        setProgress({ done: i + 1, total: mappedRows.length })
      }
    } catch (err) {
      submittingRef.current = false
      setPhase('error')
      setPhaseError(err instanceof Error ? err.message : 'Failed to hash and upload one of the PDFs')
      return
    }

    let merkleRoot: string
    try {
      merkleRoot = await calculateMerkleRoot(processed.map((d) => d.documentHash))
    } catch (err) {
      submittingRef.current = false
      setPhase('error')
      setPhaseError(err instanceof Error ? err.message : 'Failed to compute the Merkle root')
      return
    }

    const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setBatchContext({ processed, merkleRoot, batchId })

    setPhase('awaiting-signature')
    resetWrite()
    writeContract({
      address: CONTRACT_ADDRESS as Hex,
      abi: CONTRACT_ABI,
      functionName: 'anchorMerkleBatch',
      args: [merkleRoot as Hex, BigInt(processed.length), batchId],
      chainId: CONTRACT_CHAIN_ID,
      gas: BATCH_GAS_LIMIT,
    })
    setPhase('confirming')
  }

  const resetAll = () => {
    submittingRef.current = false
    setStep('select')
    setDocumentType('Certificate')
    setPdfFiles([])
    setMappedRows(null)
    setCsvToken(null)
    setPhase('idle')
    setPhaseError(null)
    setProgress({ done: 0, total: 0 })
    setBatchContext(null)
    setResult(null)
    resetWrite()
  }

  const stepIndex = STEPS.indexOf(step)
  const isBusy = phase === 'uploading' || phase === 'awaiting-signature' || phase === 'confirming' || phase === 'recording' || isWritePending

  const phaseLabel: Record<Phase, string> = {
    idle: `Confirm & Issue All (${mappedRows?.length ?? 0})`,
    uploading: `Hashing & pinning ${progress.done}/${progress.total}...`,
    'awaiting-signature': 'Confirm in wallet...',
    confirming: 'Confirming on-chain...',
    recording: 'Recording batch...',
    error: 'Retry',
    reverted: 'Try Again',
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
                <Upload className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <h1 className="text-base font-extrabold text-foreground">Bulk Issue</h1>
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
                  {idx < STEPS.length - 1 && (
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

            {!isConnected && (
              <div className="rounded-lg bg-card p-12 text-center shadow-card ring-1 ring-border/5">
                <Wallet className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden />
                <p className="text-sm font-semibold text-muted-foreground">Connect your wallet to issue documents in bulk</p>
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

            {/* Step 1: Select files */}
            {isConnected && step === 'select' && (
              <div className="space-y-8">
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Bulk Issue Documents
                  </h2>
                  <p className="text-lg leading-[30.6px] text-muted-foreground">
                    Select every PDF you want to issue - 10, 20, or any number. You'll fill in recipient
                    details for each one next.
                  </p>
                </div>

                <div className="rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                  <label className="mb-4 block text-sm font-extrabold text-foreground">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="h-12 w-full rounded-lg border border-border/15 bg-background px-5 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] focus:border-primary focus:ring-3 focus:ring-primary/15"
                  >
                    <option>Certificate</option>
                    <option>Diploma</option>
                    <option>License</option>
                    <option>Other</option>
                  </select>
                  <p className="mt-2 text-xs text-muted-foreground">Applies to every document in this batch.</p>
                </div>

                <div className="rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                  <label className="mb-4 block text-sm font-extrabold text-foreground">PDF Documents</label>
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') pdfInputRef.current?.click()
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingPdf(true)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingPdf(false)
                    }}
                    onDrop={handlePdfDrop}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors duration-150 ease-[var(--ease-premium)]',
                      isDraggingPdf
                        ? 'border-foreground/40 bg-card'
                        : 'border-border/15 bg-background hover:border-foreground/25',
                    )}
                  >
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleSelectFiles}
                      className="hidden"
                    />
                    <Upload className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden />
                    <p className="font-extrabold text-foreground">
                      {isDraggingPdf
                        ? 'Drop your PDFs here'
                        : pdfFiles.length > 0
                          ? `${pdfFiles.length} file${pdfFiles.length !== 1 ? 's' : ''} selected - click or drop to add more`
                          : 'Drop PDFs here or click to select'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">Any number of files, up to 50 MB each</p>
                  </div>

                  {pdfFiles.length > 0 && (
                    <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                      {pdfFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${file.size}-${idx}`}
                          className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                            <span className="truncate text-sm font-semibold text-foreground">{file.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          </div>
                          <button
                            onClick={() => removeFile(idx)}
                            aria-label={`Remove ${file.name}`}
                            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <Link href="/issuer" className="flex-1">
                    <Button variant="outline" className="h-12 cursor-pointer w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button className="h-12 cursor-pointer flex-1" onClick={handleContinueToMap} disabled={pdfFiles.length === 0}>
                    Continue ({pdfFiles.length})
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Download + re-upload mapping CSV */}
            {isConnected && step === 'map' && (
              <div className="space-y-8">
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Map Recipients
                  </h2>
                  <p className="text-lg leading-[30.6px] text-muted-foreground">
                    We downloaded a CSV unique to this selection, listing your {pdfFiles.length} file
                    {pdfFiles.length !== 1 ? 's' : ''} by serial number and PDF name.
                  </p>
                </div>

                <div className="rounded-lg bg-accent/5 p-5 shadow-card ring-1 ring-border/5">
                  <p className="text-sm font-semibold text-accent">
                    Open the CSV, fill in a <strong>Name</strong> and <strong>Email</strong> for every row
                    (document type is already set for the whole batch), save it, then upload the completed
                    file below.
                  </p>
                </div>

                <div className="rounded-lg bg-card p-6 shadow-card ring-1 ring-border/5 sm:p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <label className="block text-sm font-extrabold text-foreground">Upload Completed CSV</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => csvToken && downloadRecipientsCsv(csvToken)}
                      className="gap-2"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden /> Re-download
                    </Button>
                  </div>
                  <div
                    onClick={() => csvInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') csvInputRef.current?.click()
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingCsv(true)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingCsv(false)
                    }}
                    onDrop={handleCsvDrop}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors duration-150 ease-[var(--ease-premium)]',
                      isDraggingCsv
                        ? 'border-foreground/40 bg-card'
                        : 'border-border/15 bg-background hover:border-foreground/25',
                    )}
                  >
                    <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                    <Upload className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden />
                    <p className="font-extrabold text-foreground">
                      {isDraggingCsv ? 'Drop your CSV here' : 'Drop the completed CSV here or click to select'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Must include PDF Name, Name, and Email for every file
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="h-12 cursor-pointer flex-1" onClick={() => setStep('select')}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review + process */}
            {isConnected && step === 'review' && mappedRows && (
              <div className="space-y-8">
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Review & Confirm
                  </h2>
                  <p className="text-lg leading-[30.6px] text-muted-foreground">
                    {mappedRows.length} document{mappedRows.length !== 1 ? 's' : ''} will be hashed, optionally
                    pinned to IPFS, and anchored together under one Merkle root.
                  </p>
                </div>

                <div className="overflow-hidden rounded-lg bg-card shadow-card ring-1 ring-border/5">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full table-fixed">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border/10">
                          <th className="w-[10%] px-4 py-3 text-left text-xs font-extrabold text-foreground">SN</th>
                          <th className="w-[35%] px-4 py-3 text-left text-xs font-extrabold text-foreground">PDF Name</th>
                          <th className="w-[30%] px-4 py-3 text-left text-xs font-extrabold text-foreground">Name</th>
                          <th className="w-[25%] px-4 py-3 text-left text-xs font-extrabold text-foreground">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappedRows.map((row) => (
                          <tr key={row.pdfName} className="border-b border-border/5 last:border-b-0">
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.sn}</td>
                            <td className="truncate px-4 py-2.5 text-sm text-foreground">{row.pdfName}</td>
                            <td className="truncate px-4 py-2.5 text-sm text-foreground">{row.recipientName}</td>
                            <td className="truncate px-4 py-2.5 text-sm text-muted-foreground">{row.recipientEmail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg bg-accent/5 p-5 shadow-card ring-1 ring-border/5">
                  <p className="text-sm font-semibold text-accent">
                    Every document is stored on IPFS and anchored on-chain together under one
                    Merkle root. This action cannot be undone.
                  </p>
                </div>

                {(phase === 'error' || phase === 'reverted') && phaseError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-5">
                    <p className="mb-1 text-sm font-semibold text-destructive">
                      {phase === 'reverted' ? 'Transaction reverted on-chain' : 'Something went wrong'}
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
                  <Button variant="outline" className="h-12 cursor-pointer flex-1" onClick={() => setStep('map')} disabled={isBusy}>
                    Back
                  </Button>
                  <Button className="h-12 flex-1" onClick={handleConfirmIssueAll} disabled={isBusy || !isCorrectChain}>
                    {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {phaseLabel[phase]}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {isConnected && step === 'success' && result && (
              <div className="animate-scale-in -mt-15 space-y-8 py-12 text-center">
                <div>
                  <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                    Batch Issued Successfully!
                  </h2>
                  <p className="mx-auto max-w-2xl text-lg leading-[30.6px] text-muted-foreground">
                    {result.documentCount} documents were anchored under one Merkle root in a single transaction.
                  </p>
                </div>
                <div className="mx-auto max-xl-md space-y-4 rounded-lg bg-card p-6 text-left text-sm shadow-card ring-1 ring-border/5">
                  <div>
                    <p className="mb-2 font-semibold text-muted-foreground">Batch ID</p>
                    <p className="font-mono text-xs break-all text-foreground">{result.batchId}</p>
                  </div>
                  <div className="border-t border-border/15 pt-4">
                    <p className="mb-2 font-semibold text-muted-foreground">Merkle Root</p>
                    <p className="font-mono text-xs break-all text-foreground">{result.merkleRoot}</p>
                  </div>
                  <div className="border-t border-border/15 pt-4">
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
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/issuer/history" className="flex-1">
                  <Button className="h-11 w-full cursor-pointer rounded-lg font-medium shadow-sm transition-all hover:shadow">
                    View in History</Button>
                  </Link>
                  <Button variant="outline"  className="h-11 flex-1 cursor-pointer rounded-lg font-medium transition-colors hover:bg-accent/5" onClick={resetAll}>
                    Issue Another Batch
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
