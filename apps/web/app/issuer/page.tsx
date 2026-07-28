'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut, Plus, Upload, FileText, CheckCircle, Loader2, BarChart3 } from 'lucide-react'
import { useSession } from '@/lib/auth-context'

const STATS = [
  { label: 'Total Issued', value: '1,247', icon: FileText, tone: 'text-accent' },
  { label: 'Active Documents', value: '1,198', icon: CheckCircle, tone: 'text-success' },
  { label: 'Revoked', value: '49', icon: BarChart3, tone: 'text-accent' },
]

const RECENT_DOCUMENTS = [
  { id: 1, name: 'Stanford Certificate 2026', issued: '2 hours ago', count: 142, status: 'Completed' },
  { id: 2, name: 'MIT Diploma June 2026', issued: '1 day ago', count: 87, status: 'Completed' },
  { id: 3, name: 'Yale Certificate Batch', issued: '3 days ago', count: 256, status: 'Completed' },
]

export default function IssuerDashboard() {
  const router = useRouter()
  const { role, isLoading: sessionLoading } = useSession()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    if (!sessionLoading && role !== 'ISSUER') router.replace('/request-access')
  }, [sessionLoading, role, router])

  if (sessionLoading || role !== 'ISSUER') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" aria-hidden />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border/15 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="font-extrabold">Back</span>
          </Link>
          <h1 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
            Issuer Dashboard
          </h1>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => disconnect()}>
            <LogOut className="h-4 w-4" aria-hidden />
            Disconnect
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="animate-fade-in space-y-8">
          <div className="rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 p-8 shadow-card">
            <h2 className="mb-2 text-[30px] leading-[36px] font-extrabold tracking-[-0.8px] text-foreground">
              Welcome back!
            </h2>
            <p className="text-lg leading-[30.6px] text-muted-foreground">
              You have successfully issued 1,247 verified documents on the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="rounded-lg bg-card p-6 shadow-card transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5 hover:shadow-button"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <Icon className={`h-6 w-6 ${stat.tone}`} aria-hidden />
                  </div>
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">{stat.label}</p>
                  <p className="text-4xl font-extrabold tabular-nums text-foreground">{stat.value}</p>
                </div>
              )
            })}
          </div>

          <div>
            <h3 className="mb-5 text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link href="/issuer/issue">
                <Button className="h-14 w-full gap-2 text-base">
                  <Plus className="h-5 w-5" aria-hidden />
                  Issue Single Document
                </Button>
              </Link>
              <Link href="/issuer/bulk-issue">
                <Button variant="outline" className="h-14 w-full gap-2 text-base">
                  <Upload className="h-5 w-5" aria-hidden />
                  Bulk Issue Documents
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[22px] leading-[28.6px] font-extrabold tracking-[-0.5px] text-foreground">
                Recent Issuances
              </h3>
              <Link
                href="/issuer/history"
                className="text-sm font-semibold text-accent transition-opacity hover:opacity-80"
              >
                View All
              </Link>
            </div>
            <div className="overflow-hidden rounded-lg bg-card shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/15">
                      <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">
                        Document Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Count</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Issued</th>
                      <th className="px-6 py-4 text-left text-sm font-extrabold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_DOCUMENTS.map((doc) => (
                      <tr
                        key={doc.id}
                        className="border-b border-border/15 transition-colors duration-150 ease-[var(--ease-premium)] last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{doc.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{doc.count}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{doc.issued}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-4 py-1.5 text-xs font-semibold text-success">
                            <CheckCircle className="h-3 w-3" aria-hidden />
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
