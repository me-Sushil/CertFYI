'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ChainBanner } from '@/components/admin/chain-banner'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { useAuditLog } from '@/queries/admin'
import { CONTRACT_CHAIN_ID, getExplorerUrl } from '@/lib/contracts/document-anchor'
import { formatDateTime, formatAddress } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AuditLogEntry } from '@/lib/api-types'

const ACTION_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ISSUER_APPROVED', label: 'Approved' },
  { value: 'ISSUER_REJECTED', label: 'Rejected' },
  { value: 'ISSUER_SUSPENDED', label: 'Suspended' },
  { value: 'ISSUER_REACTIVATED', label: 'Reactivated' },
  { value: 'ISSUER_METADATA_SET', label: 'Metadata Set' },
  { value: 'DOCUMENT_ANCHORED', label: 'Anchored' },
  { value: 'IPFS_PIN_FAILED', label: 'IPFS Failed' },
] as const

const ACTION_DOT: Record<string, string> = {
  ISSUER_APPROVED: 'bg-success',
  ISSUER_REACTIVATED: 'bg-success',
  DOCUMENT_ANCHORED: 'bg-success',
  ISSUER_REJECTED: 'bg-destructive',
  ISSUER_SUSPENDED: 'bg-destructive',
  IPFS_PIN_FAILED: 'bg-destructive',
}

export default function AuditLogPage() {
  const router = useRouter()
  const { role, isLoading: sessionLoading } = useSession()
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && role !== 'ADMIN') {
      router.replace('/')
      return
    }
    if (role === 'ADMIN') {
      adminApi.getAuditLog()
        .then((data) => { setEntries(data.entries); setLoading(false) })
        .catch(() => { setError('Failed to load audit log'); setLoading(false) })
    }
  }, [sessionLoading, role, router])

  const filteredEntries = entries.filter((entry) => {
    const q = searchTerm.toLowerCase()
    return (
      entry.action.toLowerCase().includes(q) ||
      (entry.actor ?? '').toLowerCase().includes(q) ||
      (entry.target ?? '').toLowerCase().includes(q) ||
      (entry.details ?? '').toLowerCase().includes(q)
    )
  })

  if (sessionLoading || role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

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
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-muted-foreground">Platform-wide activity feed from access request decisions</p>
        </div>

        {error && (
          <div className="flex gap-2 p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search entries by action, actor, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredEntries.length} of {entries.length} entries
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
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
                        <p className="text-sm text-muted-foreground">{entry.target ?? '—'}</p>
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </time>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Actor:</span>{' '}
                        <span className="font-mono text-xs">{entry.actor}</span>
                      </p>
                      {entry.details && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Details:</span> {entry.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No audit entries found matching your criteria.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
