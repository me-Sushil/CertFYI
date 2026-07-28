'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { LayoutDashboard, Users, FileText, Loader2, ShieldAlert, Wallet, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { useSession } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/issuers', label: 'Issuers', icon: Users },
  { href: '/admin/audit-log', label: 'Audit Log', icon: FileText },
]

function Sidebar({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <aside className="flex h-full flex-col bg-card">
      <div className="border-b border-border/10 p-6 sm:p-8">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl" onClick={onNavigate}>
          CertFyi
        </Link>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 sm:p-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-[var(--ease-premium)]',
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
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { address, role, isLoading } = useSession()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && role !== 'ADMIN') {
      const timeout = setTimeout(() => router.replace('/'), 1500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, role, router])

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
          <Wallet className="h-7 w-7 text-accent" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">Connect your wallet</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You need to connect your admin wallet to access this panel.
        </p>
        <Button onClick={openConnectModal} className="mt-2">
          Connect Wallet
        </Button>
      </div>
    )
  }

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
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h1 className="text-xl font-extrabold text-foreground">Admin access required</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {address
            ? `Wallet ${address.slice(0, 6)}...${address.slice(-4)} is not an admin. Redirecting you home\u2026`
            : 'You don\'t have permission to view this page. Redirecting you home\u2026'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border/10">
          <Sidebar pathname={pathname} onNavigate={() => {}} />
        </div>
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/10 bg-card/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground hover:bg-muted/50"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-sm font-extrabold text-foreground">CertFyi</span>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                {pathname === '/admin' ? (
                  <LayoutDashboard className="h-4 w-4 text-accent" aria-hidden />
                ) : pathname === '/admin/issuers' ? (
                  <Users className="h-4 w-4 text-accent" aria-hidden />
                ) : (
                  <FileText className="h-4 w-4 text-accent" aria-hidden />
                )}
              </div>
              <h1 className="text-base font-extrabold text-foreground">
                {pathname === '/admin' ? 'Dashboard' : pathname === '/admin/issuers' ? 'Issuer Management' : 'Audit Log'}
              </h1>
            </div>
            <div className="flex-1 lg:hidden" />
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggleInline />
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-72 max-w-[80vw] animate-fade-in shadow-large">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground shadow-button hover:bg-muted/50"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
