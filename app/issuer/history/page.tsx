'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, Filter, MoreVertical, Trash2, Eye } from 'lucide-react'

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

export default function IssuanceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const documents: Document[] = [
    {
      id: '1',
      recipient: 'John Doe',
      email: 'john@example.com',
      type: 'Certificate',
      issued: '2 days ago',
      hash: 'a1b2c3d4e5f6...',
      status: 'active',
      txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE'
    },
    {
      id: '2',
      recipient: 'Jane Smith',
      email: 'jane@example.com',
      type: 'Diploma',
      issued: '5 days ago',
      hash: 'f6e5d4c3b2a1...',
      status: 'active',
      txHash: '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
    },
    {
      id: '3',
      recipient: 'Bob Johnson',
      email: 'bob@example.com',
      type: 'Certificate',
      issued: '1 week ago',
      hash: 'z9y8x7w6v5u4...',
      status: 'revoked',
      txHash: '0x555555555555555555555555555555555555555555'
    },
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/issuer" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Issuance History</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'revoked'] as const).map(status => (
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

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredDocuments.length} of {documents.length} documents
        </p>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold">Recipient</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden sm:table-cell">Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden md:table-cell">Issued</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, idx) => (
                  <React.Fragment key={doc.id}>
                    <tr className="border-b border-border hover:bg-muted/30 transition">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium">{doc.recipient}</p>
                          <p className="text-xs text-muted-foreground">{doc.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm hidden sm:table-cell">{doc.type}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm hidden md:table-cell text-muted-foreground">{doc.issued}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'active'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'active' ? 'bg-accent' : 'bg-destructive'}`} />
                          {doc.status === 'active' ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => setShowDetails(showDetails === doc.id ? null : doc.id)}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {showDetails === doc.id && (
                      <tr className="border-b border-border bg-muted/20">
                        <td colSpan={5} className="px-4 sm:px-6 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Document Hash</p>
                                <p className="font-mono text-xs break-all">{doc.hash}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                                <p className="font-mono text-xs break-all text-primary">{doc.txHash}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <p className="font-medium capitalize">{doc.status}</p>
                              </div>
                            </div>
                            {doc.status === 'active' && (
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  View on Explorer
                                </Button>
                                <Button size="sm" variant="outline" className="gap-2 text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                  Revoke Document
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No documents found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}
