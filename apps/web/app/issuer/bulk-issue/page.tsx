'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['upload', 'preview', 'processing'] as const
type Step = (typeof STEPS)[number]

const PROGRESS_ITEMS = [
  { label: 'Computing document hashes', done: true },
  { label: 'Building Merkle tree', done: true, pulse: true },
  { label: 'Awaiting blockchain confirmation', done: false },
]

export default function BulkIssuancePage() {
  const [step, setStep] = useState<Step>('upload')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [previewData, setPreviewData] = useState({ totalRecords: 0, templateFile: '', csvFile: '' })

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file && file.type === 'text/csv') setCsvFile(file)
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file && file.type === 'application/pdf') setPdfFile(file)
  }

  const handleContinue = () => {
    if (!csvFile || !pdfFile) {
      toast.error('Please select both CSV and PDF files')
      return
    }
    setPreviewData({ totalRecords: 142, templateFile: pdfFile.name, csvFile: csvFile.name })
    setStep('preview')
  }

  const handleProcess = async () => {
    setProcessing(true)
    setStep('processing')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    setProcessing(false)
  }

  const downloadTemplate = () => {
    const csvContent =
      'name,email,document_type\nJohn Doe,john@example.com,Certificate\nJane Smith,jane@example.com,Certificate'
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`)
    element.setAttribute('download', 'recipients-template.csv')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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

        {step === 'upload' && (
          <div className="animate-fade-in space-y-8">
            <div>
              <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Bulk Issue Documents
              </h2>
              <p className="text-lg leading-[30.6px] text-muted-foreground">
                Upload a CSV file with recipient data and a PDF template to issue hundreds of
                documents at once.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-extrabold text-foreground">
                  1. Download CSV Template
                </label>
                <div className="rounded-lg bg-card p-6 shadow-card">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Download the template CSV file and fill in your recipient information.
                  </p>
                  <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" aria-hidden /> Download Template (CSV)
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-extrabold text-foreground">
                  2. Upload Your CSV File
                </label>
                <div
                  onClick={() => csvInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') csvInputRef.current?.click()
                  }}
                  className="cursor-pointer rounded-lg border-2 border-dashed border-border/15 bg-card p-10 text-center shadow-card transition-colors duration-150 ease-[var(--ease-premium)] hover:border-foreground/25"
                >
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvSelect}
                    className="hidden"
                  />
                  <Upload className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden />
                  {csvFile ? (
                    <div>
                      <p className="font-extrabold text-foreground">{csvFile.name}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        Ready to upload
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-foreground">
                        Drop CSV here or click to select
                      </p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        Maximum 10 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-extrabold text-foreground">
                3. Upload PDF Template
              </label>
              <p className="mb-3 text-sm text-muted-foreground">
                Upload a PDF template. Recipient information from the CSV will be merged with
                this template.
              </p>
              <div
                onClick={() => pdfInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') pdfInputRef.current?.click()
                }}
                className="cursor-pointer rounded-lg border-2 border-dashed border-border/15 bg-card p-10 text-center shadow-card transition-colors duration-150 ease-[var(--ease-premium)] hover:border-foreground/25"
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfSelect}
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

            <div className="flex gap-4 pt-6">
              <Link href="/issuer" className="flex-1">
                <Button variant="outline" className="h-12 w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                className="h-12 flex-1"
                onClick={handleContinue}
                disabled={!csvFile || !pdfFile}
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="animate-fade-in space-y-8">
            <div>
              <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Review Bulk Issuance
              </h2>
              <p className="text-lg leading-[30.6px] text-muted-foreground">
                Verify the details before proceeding with blockchain submission.
              </p>
            </div>

            <div className="space-y-6 rounded-lg bg-card p-6 shadow-card sm:p-8">
              <h3 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
                Issuance Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Total Documents:</span>
                  <span className="text-[22px] font-extrabold text-success">
                    {previewData.totalRecords}
                  </span>
                </div>
                <div className="border-t border-border/15 pt-3">
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">CSV File:</p>
                  <p className="font-mono text-sm break-all text-foreground">{previewData.csvFile}</p>
                </div>
                <div className="border-t border-border/15 pt-3">
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">PDF Template:</p>
                  <p className="font-mono text-sm break-all text-foreground">
                    {previewData.templateFile}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/15 pt-6 text-sm">
                <h4 className="font-extrabold text-foreground">Transaction Details</h4>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-semibold text-foreground">Ethereum Mainnet</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Gas (Merkle Batch):</span>
                  <span className="font-semibold text-foreground">~0.15 ETH</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Cost per Document:</span>
                  <span className="font-semibold text-success">~0.001 ETH</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg bg-accent/5 p-5 shadow-card">
              <div className="text-sm">
                <p className="mb-1 font-extrabold text-accent">Merkle Tree Batching</p>
                <p className="text-muted-foreground">
                  All {previewData.totalRecords} documents will be anchored in a single
                  transaction using Merkle tree optimization.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="h-12 flex-1" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button className="h-12 flex-1" onClick={handleProcess} disabled={processing}>
                {processing ? 'Processing...' : 'Submit to Blockchain'}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="animate-fade-in space-y-8 py-12">
            <div className="space-y-5 text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-border/15 border-t-accent" />
              <h2 className="text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
                Processing Bulk Issuance
              </h2>
              <p className="text-lg leading-[30.6px] text-muted-foreground">
                Your {previewData.totalRecords} documents are being anchored on the blockchain.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-border/15">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-accent" />
              </div>
              <p className="text-center text-xs font-semibold text-muted-foreground">
                Merkle root being computed...
              </p>
            </div>

            <div className="rounded-lg bg-card p-6 text-center text-sm shadow-card">
              <p className="mb-2 font-semibold text-muted-foreground">
                Do not close this page. You can track progress below.
              </p>
              <p className="font-mono text-xs text-accent">Pending transaction confirmation...</p>
            </div>

            <div className="mx-auto max-w-sm space-y-3">
              {PROGRESS_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-full bg-card p-3 shadow-card"
                >
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      item.done ? 'bg-success' : 'bg-border/15',
                      item.pulse && 'animate-pulse',
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      item.done ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
