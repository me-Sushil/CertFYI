'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react'

export default function BulkIssuancePage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [previewData, setPreviewData] = useState({
    totalRecords: 0,
    templateFile: '',
    csvFile: '',
  })

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
    }
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    }
  }

  const handleContinue = () => {
    if (!csvFile || !pdfFile) {
      alert('Please select both CSV and PDF files')
      return
    }
    // Mock: parse CSV to count records
    setPreviewData({
      totalRecords: 142,
      templateFile: pdfFile.name,
      csvFile: csvFile.name,
    })
    setStep('preview')
  }

  const handleProcess = async () => {
    setProcessing(true)
    setStep('processing')
    // Simulate blockchain processing
    await new Promise(resolve => setTimeout(resolve, 5000))
    setProcessing(false)
  }

  const downloadTemplate = () => {
    const csvContent = 'name,email,document_type\nJohn Doe,john@example.com,Certificate\nJane Smith,jane@example.com,Certificate'
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`)
    element.setAttribute('download', 'recipients-template.csv')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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
          {['upload', 'preview', 'processing'].map((s, idx) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                step === s ? 'bg-primary text-primary-foreground' :
                ['upload', 'preview', 'processing'].indexOf(step) > idx ? 'bg-accent text-accent-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {idx + 1}
              </div>
              {idx < 2 && <div className="flex-1 h-1 mx-2 bg-border" />}
            </React.Fragment>
          ))}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bulk Issue Documents</h2>
              <p className="text-muted-foreground">Upload a CSV file with recipient data and a PDF template to issue hundreds of documents at once.</p>
            </div>

            {/* CSV Template Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3">1. Download CSV Template</label>
                <div className="p-6 rounded-lg border border-border bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-4">
                    Download the template CSV file and fill in your recipient information. Each row represents one document to be issued.
                  </p>
                  <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Template (CSV)
                  </Button>
                </div>
              </div>

              {/* CSV Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3">2. Upload Your CSV File</label>
                <div
                  onClick={() => csvInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
                >
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvSelect}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-primary/70 mx-auto mb-2" />
                  {csvFile ? (
                    <div>
                      <p className="font-semibold">{csvFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ready to upload</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">Drop CSV here or click to select</p>
                      <p className="text-xs text-muted-foreground mt-1">Maximum 10 MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PDF Template Section */}
            <div>
              <label className="block text-sm font-semibold mb-3">3. Upload PDF Template</label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a PDF template. Recipient information from the CSV will be merged with this template for each document.
              </p>
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfSelect}
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

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Link href="/issuer" className="flex-1">
                <Button variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button 
                className="flex-1" 
                onClick={handleContinue}
                disabled={!csvFile || !pdfFile}
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Review Bulk Issuance</h2>
              <p className="text-muted-foreground">Verify the details before proceeding with blockchain submission.</p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg mb-4">Issuance Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Documents:</span>
                  <span className="font-bold text-lg text-accent">{previewData.totalRecords}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground mb-2">CSV File:</p>
                  <p className="font-mono text-sm break-all text-foreground">{previewData.csvFile}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground mb-2">PDF Template:</p>
                  <p className="font-mono text-sm break-all text-foreground">{previewData.templateFile}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <h4 className="font-semibold">Transaction Details</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>Ethereum Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas (Merkle Batch):</span>
                  <span>~0.15 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost per Document:</span>
                  <span className="text-accent font-semibold">~0.001 ETH</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Merkle Tree Batching</p>
                <p className="text-muted-foreground">All {previewData.totalRecords} documents will be anchored in a single transaction using Merkle tree optimization for maximum gas efficiency.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleProcess} disabled={processing}>
                {processing ? 'Processing...' : 'Submit to Blockchain'}
              </Button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="space-y-8 py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin mx-auto" />
              <h2 className="text-2xl font-bold">Processing Bulk Issuance</h2>
              <p className="text-muted-foreground">
                Your {previewData.totalRecords} documents are being anchored on the blockchain. This may take a few minutes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 rounded-full animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground text-center">Merkle root being computed...</p>
            </div>

            <div className="bg-muted p-6 rounded-lg text-sm text-center">
              <p className="text-muted-foreground mb-2">Do not close this page. You can track progress below.</p>
              <p className="font-mono text-xs text-primary">Pending transaction confirmation...</p>
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <p className="text-sm">Computing document hashes</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <p className="text-sm">Building Merkle tree</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-border rounded-full" />
                <p className="text-sm text-muted-foreground">Awaiting blockchain confirmation</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
