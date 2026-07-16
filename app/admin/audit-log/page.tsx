'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, Download } from 'lucide-react'

interface AuditEntry {
  id: string
  timestamp: string
  action: string
  actor: string
  target: string
  details: string
  status: 'success' | 'pending' | 'failed'
}

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<'all' | 'issue' | 'revoke' | 'approve' | 'suspend'>('all')

  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      timestamp: '2024-07-16 14:30:00',
      action: 'Document Issued',
      actor: 'Stanford University',
      target: 'Certificate Batch #2847',
      details: '142 documents issued with Merkle root 0xab12...',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2024-07-16 12:15:00',
      action: 'Issuer Approved',
      actor: 'Admin',
      target: 'MIT',
      details: 'New issuer registration approved',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2024-07-16 10:45:00',
      action: 'Document Revoked',
      actor: 'Harvard University',
      target: 'Diploma #4521',
      details: 'Document revoked: Superseded by updated version',
      status: 'success'
    },
    {
      id: '4',
      timestamp: '2024-07-16 08:20:00',
      action: 'Issuer Suspended',
      actor: 'Admin',
      target: 'TestOrg Inc',
      details: 'Suspended due to compliance violation',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2024-07-15 16:00:00',
      action: 'Document Issued',
      actor: 'Yale University',
      target: 'Diploma Batch #1956',
      details: '87 documents issued',
      status: 'success'
    },
  ]

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = entry.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterAction === 'all' || entry.action.toLowerCase().includes(filterAction)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Audit Log</h1>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-muted-foreground">Complete audit trail of all platform activity</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'issue', 'revoke', 'approve', 'suspend'] as const).map(action => (
              <Button
                key={action}
                variant={filterAction === action ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction(action)}
                className="capitalize"
              >
                {action === 'all' ? 'All' : action}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredEntries.length} of {auditEntries.length} entries
        </p>

        {/* Audit Log Timeline */}
        <div className="space-y-0 border border-border rounded-lg overflow-hidden">
          {filteredEntries.map((entry, idx) => (
            <div
              key={entry.id}
              className={`p-4 sm:p-6 border-b border-border hover:bg-muted/30 transition ${
                idx === filteredEntries.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2 flex-col sm:flex-row">
                    <div>
                      <p className="font-semibold">{entry.action}</p>
                      <p className="text-sm text-muted-foreground">{entry.target}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent">
                        {entry.status}
                      </span>
                      <time className="whitespace-nowrap">{entry.timestamp}</time>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Actor:</span> {entry.actor}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Details:</span> {entry.details}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No audit entries found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}
