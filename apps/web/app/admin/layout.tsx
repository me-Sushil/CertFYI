'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Loader2, ShieldAlert } from 'lucide-react'
import { useSession } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/issuers', label: 'Issuers', icon: Users },
  { href: '/admin/audit-log', label: 'Audit Log', icon: FileText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, isLoading } = useSession()

  useEffect(() => {
    if (!isLoading && role !== 'ADMIN') {
      const timeout = setTimeout(() => router.replace('/'), 1500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, role, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" aria-hidden />
      </div>
    )
  }

  if (role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">Admin access required</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You don&apos;t have permission to view this page. Redirecting you home&hellip;
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-border/15 bg-card/95 backdrop-blur-md lg:block">
          <div className="border-b border-border/15 p-8">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-foreground">
              CertFyi
            </Link>
            <p className="mt-1.5 text-xs font-semibold text-muted-foreground">Admin Panel</p>
          </div>
          <nav className="space-y-1.5 p-5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)]',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-button'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border/15 bg-card/95 backdrop-blur-sm lg:hidden">
            <div className="flex items-center gap-3 px-5 py-4">
              <Link href="/" className="text-sm font-extrabold text-foreground">
                CertFyi
              </Link>
              <span className="text-xs font-semibold text-muted-foreground">/ Admin</span>
            </div>
            <nav className="flex gap-1.5 overflow-x-auto px-5 pb-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-[var(--ease-premium)]',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-button'
                        : 'text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </header>
          <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
