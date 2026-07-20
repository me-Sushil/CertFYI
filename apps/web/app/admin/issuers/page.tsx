'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, MoreVertical, Shield, AlertTriangle } from 'lucide-react'

interface Issuer {
  id: string
  name: string
  email: string
  wallet: string
  documents: number
  status: 'approved' | 'suspended'
  joinedDate: string
}

export default function IssuerManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'suspended'>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const issuers: Issuer[] = [
    {
      id: '1',
      name: 'Stanford University',
      email: 'admin@stanford.edu',
      wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
      documents: 2847,
      status: 'approved',
      joinedDate: '3 months ago'
    },
    {
      id: '2',
      name: 'MIT',
      email: 'contact@mit.edu',
      wallet: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      documents: 1956,
      status: 'approved',
      joinedDate: '2 months ago'
    },
    {
      id: '3',
      name: 'Harvard University',
      email: 'support@harvard.edu',
      wallet: '0x555555555555555555555555555555555555555555',
      documents: 0,
      status: 'suspended',
      joinedDate: '1 month ago'
    },
  ]

  const filteredIssuers = issuers.filter(issuer => {
    const matchesSearch = issuer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issuer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || issuer.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Issuer Management</h1>
          <p className="text-muted-foreground">Manage verified issuers and their credentials</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search issuers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'approved', 'suspended'] as const).map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All' : status}
              </Button>
            ))}
          </div>
        </div>

        {/* Issuers Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold">Organization</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden sm:table-cell">Documents</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden md:table-cell">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssuers.map((issuer) => (
                  <React.Fragment key={issuer.id}>
                    <tr className="border-b border-border hover:bg-muted/30 transition">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium">{issuer.name}</p>
                          <p className="text-xs text-muted-foreground">{issuer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm hidden sm:table-cell">{issuer.documents.toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          issuer.status === 'approved'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${issuer.status === 'approved' ? 'bg-accent' : 'bg-destructive'}`} />
                          {issuer.status === 'approved' ? 'Approved' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => setShowDetails(showDetails === issuer.id ? null : issuer.id)}
                          className="p-2 hover:bg-muted rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {showDetails === issuer.id && (
                      <tr className="border-b border-border bg-muted/20">
                        <td colSpan={4} className="px-4 sm:px-6 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                                <p className="font-mono text-xs break-all">{issuer.wallet}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Joined</p>
                                <p className="font-medium text-sm">{issuer.joinedDate}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <p className="font-medium capitalize text-sm">{issuer.status}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2 flex-wrap">
                              {issuer.status === 'approved' ? (
                                <Button size="sm" variant="outline" className="gap-2 text-destructive hover:text-destructive">
                                  <AlertTriangle className="w-4 h-4" />
                                  Suspend Issuer
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Shield className="w-4 h-4" />
                                  Reactivate
                                </Button>
                              )}
                            </div>
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

        {filteredIssuers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issuers found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}
