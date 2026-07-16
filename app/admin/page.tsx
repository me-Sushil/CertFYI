'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Issuers', value: '42', icon: Users, color: 'text-primary' },
    { label: 'Pending Approvals', value: '7', icon: AlertCircle, color: 'text-destructive' },
    { label: 'Documents Anchored', value: '52,481', icon: FileText, color: 'text-accent' },
    { label: 'Active Users', value: '1,283', icon: CheckCircle, color: 'text-secondary' },
  ]

  const pendingApplications = [
    {
      id: 1,
      organization: 'Harvard University',
      contact: 'admin@harvard.edu',
      applied: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      organization: 'Yale University',
      contact: 'contact@yale.edu',
      applied: '1 day ago',
      status: 'pending'
    },
    {
      id: 3,
      organization: 'Princeton University',
      contact: 'support@princeton.edu',
      applied: '2 days ago',
      status: 'pending'
    },
  ]

  const recentActivity = [
    { action: 'Document Issued', actor: 'Stanford', target: 'Certificate Batch', time: '5 min ago' },
    { action: 'Issuer Approved', actor: 'Admin', target: 'MIT', time: '1 hour ago' },
    { action: 'Document Revoked', actor: 'Harvard', target: 'Diploma #4521', time: '2 hours ago' },
    { action: 'Issuer Suspended', actor: 'Admin', target: 'TestOrg Inc', time: '1 day ago' },
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
          <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Pending Applications */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Pending Issuer Applications</h2>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-destructive/10 text-destructive">
              {pendingApplications.length} pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingApplications.map((app) => (
              <div key={app.id} className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold text-lg mb-1">{app.organization}</h3>
                <p className="text-sm text-muted-foreground mb-4">{app.contact}</p>
                <p className="text-xs text-muted-foreground mb-4">Applied {app.applied}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">Approve</Button>
                  <Button size="sm" variant="outline" className="flex-1">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/admin/issuers">
            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-lg transition cursor-pointer">
              <Users className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">Issuer Management</h3>
              <p className="text-sm text-muted-foreground">View, approve, and manage all registered issuers</p>
            </div>
          </Link>
          <Link href="/admin/audit-log">
            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-lg transition cursor-pointer">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">Audit Log</h3>
              <p className="text-sm text-muted-foreground">View platform-wide activity and transactions</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Platform Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.actor} • {activity.target}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
