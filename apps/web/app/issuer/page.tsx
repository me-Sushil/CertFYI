'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Upload, History, Settings, LogOut, BarChart3, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth/use-session'

export default function IssuerDashboard() {
  const router = useRouter()
  const { role, isLoading: sessionLoading } = useSession()
  const [activeTab, setActiveTab] = useState<'overview' | 'issue' | 'history'>('overview')

  useEffect(() => {
    if (!sessionLoading && role !== 'ISSUER') {
      router.replace('/request-access')
    }
  }, [sessionLoading, role, router])

  if (sessionLoading || role !== 'ISSUER') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const stats = [
    { label: 'Total Issued', value: '1,247', icon: FileText, color: 'text-primary' },
    { label: 'Active Documents', value: '1,198', icon: CheckCircle, color: 'text-accent' },
    { label: 'Revoked', value: '49', icon: Settings, color: 'text-destructive' },
  ]

  const recentDocuments = [
    { id: 1, name: 'Stanford Certificate 2026', issued: '2 hours ago', count: 142, status: 'Completed' },
    { id: 2, name: 'MIT Diploma June 2026', issued: '1 day ago', count: 87, status: 'Completed' },
    { id: 3, name: 'Yale Certificate Batch', issued: '3 days ago', count: 256, status: 'Completed' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Issuer Dashboard</h1>
          <Button variant="outline" size="sm" className="gap-2">
            <LogOut className="w-4 h-4" />
            Disconnect
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-muted-foreground">You have successfully issued 1,247 verified documents on the blockchain.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div key={idx} className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/issuer/issue">
                  <Button className="w-full gap-2 h-12">
                    <Plus className="w-5 h-5" />
                    Issue Single Document
                  </Button>
                </Link>
                <Link href="/issuer/bulk-issue">
                  <Button variant="outline" className="w-full gap-2 h-12">
                    <Upload className="w-5 h-5" />
                    Bulk Issue Documents
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Issuances</h3>
                <Link href="/issuer/history" className="text-primary hover:underline text-sm">
                  View All
                </Link>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-6 py-3 text-left text-sm font-semibold">Document Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Count</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Issued</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDocuments.map((doc) => (
                        <tr key={doc.id} className="border-b border-border hover:bg-muted/30 transition">
                          <td className="px-6 py-4 text-sm font-medium">{doc.name}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{doc.count}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{doc.issued}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
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
        )}
      </main>
    </div>
  )
}
