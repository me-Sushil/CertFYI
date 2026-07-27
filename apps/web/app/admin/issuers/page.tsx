'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth-context'
import { adminApi } from '@/lib/api'
import type { IssuerRow } from '@/lib/api-types'

export default function IssuerManagementPage() {
  const router = useRouter()
  const { role, isLoading: sessionLoading } = useSession()
  const [issuers, setIssuers] = useState<IssuerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && role !== 'ADMIN') {
      router.replace('/')
      return
    }
    if (role === 'ADMIN') {
      adminApi.getIssuers()
        .then((data) => { setIssuers(data.issuers); setLoading(false) })
        .catch(() => { setError('Failed to load issuers'); setLoading(false) })
    }
  }, [sessionLoading, role, router])

  const handleSuspend = async (walletAddress: string) => {
    try {
      await adminApi.suspendIssuer({ walletAddress })
      setIssuers((prev) => prev.filter((i) => i.walletAddress !== walletAddress))
    } catch {
      setError('Failed to suspend issuer')
    }
  }

  const filteredIssuers = issuers.filter((issuer) => {
    const name = issuer.name ?? ''
    const email = issuer.email ?? ''
    const org = issuer.organization ?? ''
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.toLowerCase().includes(searchTerm.toLowerCase())
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

        {error && (
          <div className="flex gap-2 p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search issuers by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold">Organization / Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden sm:table-cell">Wallet</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold hidden md:table-cell">Approved</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssuers.map((issuer) => (
                    <tr key={issuer.walletAddress} className="border-b border-border hover:bg-muted/30 transition">
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-medium">{issuer.organization || issuer.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{issuer.email || 'No email'}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <p className="font-mono text-xs text-muted-foreground break-all max-w-[200px] truncate" title={issuer.walletAddress}>
                          {issuer.walletAddress}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell text-sm text-muted-foreground">
                        {issuer.approvedAt ? new Date(issuer.approvedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={() => handleSuspend(issuer.walletAddress)}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Suspend
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && filteredIssuers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issuers found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}
