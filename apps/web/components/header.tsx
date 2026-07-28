'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { Button } from '@/components/ui/button'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-context'

function roleDestination(role: 'ADMIN' | 'ISSUER' | 'UNAPPROVED' | null) {
  if (role === 'ADMIN') return { href: '/admin', label: 'Admin Dashboard', short: 'Admin' }
  if (role === 'ISSUER') return { href: '/issuer', label: 'Issuer Dashboard', short: 'Issuer' }
  return { href: '/request-access', label: 'Request Access', short: 'Access' }
}

export function Header() {
  const router = useRouter()
  const { role } = useSession()
  const dashboard = roleDestination(role)

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 py-4 sm:px-[35px] sm:py-[22px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-card/90 px-4 py-2.5 shadow-button ring-1 ring-border/10 backdrop-blur-md sm:px-8 sm:py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 outline-none">
          <Logo />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/verify"
            className="text-base leading-[27.2px] text-muted-foreground transition-colors duration-150 ease-[var(--ease-premium)] hover:text-foreground"
          >
            Verify PDF
          </Link>
          <Button onClick={() => router.push(dashboard.href)} size="lg" className="h-auto py-3">
            {dashboard.label}
          </Button>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/verify"
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-[var(--ease-premium)] hover:text-foreground"
            >
              Verify
            </Link>
            <Button onClick={() => router.push(dashboard.href)} size="sm">
              {dashboard.short}
            </Button>
          </div>

          {/* Wallet Connect & Theme */}
          <ConnectButton />
          <ThemeToggleInline />
        </div>
      </div>
    </header>
  )
}
