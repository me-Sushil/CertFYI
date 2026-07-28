'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, MoreVertical, Eye, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  recipient: string
  email: string
  type: string
  issued: string
  hash: string
  status: 'active' | 'revoked'
  txHash?: string
}

const DOCUMENTS: Document[] = [
  {
    id: '1',
    recipient: 'John Doe',
    email: 'john@example.com',
    type: 'Certificate',
    issued: '2 days ago',
    hash: 'a1b2c3d4e5f6...',
    status: 'active',
    txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
  },
  {
    id: '2',
    recipient: 'Jane Smith',
    email: 'jane@example.com',
    type: 'Diploma',
    issued: '5 days ago',
    hash: 'f6e5d4c3b2a1...',
    status: 'active',
    txHash: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  },
  {
    id: '3',
    recipient: 'Bob Johnson',
    email: 'bob@example.com',
    type: 'Certificate',
    issued: '1 week ago',
    hash: 'z9y8x7w6v5u4...',
    status: 'revoked',
    txHash: '0x555555555555555555555555555555555555555555',
  },
]

const STATUS_FILTERS = ['all', 'active', 'revoked'] as const

function StatusBadge({ status }: { status: Document['status'] }) {
  const isActive = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold',
        isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-success' : 'bg-destructive')} />
      {isActive ? 'Active' : 'Revoked'}
    </span>
  )
}

export default function IssuanceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const filteredDocuments = DOCUMENTS.filter((doc) => {
    const matchesSearch =
      doc.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border/15 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-10">
          <Link
            href="/issuer"
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="font-extrabold">Back</span>
          </Link>
          <h1 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
            Issuance History
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="mb-8 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-full border border-border/15 bg-card pr-5 pl-11 text-sm text-foreground outline-none transition-all duration-150 ease-[var(--ease-premium)] placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </div>
            <Button variant="outline" className="h-12 gap-2">
              <Search className="h-4 w-4" aria-hidden />
              More Filters
            </Button>
          </div>

          <div className="flex gap-2">
            {STATUS_FILTERS.map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All Documents' : status}
              </Button>
            ))}
          </div>
        </div>

        <p className="mb-5 text-sm font-semibold text-muted-foreground">
          Showing {filteredDocuments.length} of {DOCUMENTS.length} documents
        </p>

        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/15">
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Recipient</th>
                  <th className="hidden px-6 py-4 text-left text-sm font-extrabold text-foreground sm:table-cell">
                    Type
                  </th>
                  <th className="hidden px-6 py-4 text-left text-sm font-extrabold text-foreground md:table-cell">
                    Issued
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-extrabold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <React.Fragment key={doc.id}>
                    <tr
                      className="cursor-pointer border-b border-border/15 transition-colors duration-150 ease-[var(--ease-premium)] hover:bg-muted/30"
                      onClick={() => setShowDetails(showDetails === doc.id ? null : doc.id)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{doc.recipient}</p>
                        <p className="text-xs text-muted-foreground">{doc.email}</p>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground sm:table-cell">
                        {doc.type}
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                        {doc.issued}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <MoreVertical className="inline-block h-4 w-4 text-muted-foreground" aria-hidden />
                      </td>
                    </tr>
                    {showDetails === doc.id && (
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="px-6 py-5">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                              <div>
                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                  Document Hash
                                </p>
                                <p className="font-mono text-xs break-all text-foreground">{doc.hash}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                  Transaction Hash
                                </p>
                                <p className="font-mono text-xs break-all text-accent">{doc.txHash}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-semibold text-muted-foreground">Status</p>
                                <p className="font-semibold text-foreground capitalize">{doc.status}</p>
                              </div>
                            </div>
                            {doc.status === 'active' && (
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Eye className="h-4 w-4" aria-hidden /> View on Explorer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden /> Revoke Document
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-semibold text-muted-foreground">
              No documents found matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
