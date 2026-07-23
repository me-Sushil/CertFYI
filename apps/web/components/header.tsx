'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-context'

function roleDestination(role: 'ADMIN' | 'ISSUER' | 'UNAPPROVED' | null) {
  if (role === 'ADMIN') return { href: '/admin', label: 'Admin Dashboard' }
  if (role === 'ISSUER') return { href: '/issuer', label: 'Issuer Dashboard' }
  return { href: '/request-access', label: 'Request Access' }
}

export function Header() {
  const router = useRouter()
  const { role } = useSession()
  const dashboard = roleDestination(role)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden gap-8 md:flex">
          <Link
            href="/verify"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Verify PDF
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(dashboard.href)}
            className="text-sm"
          >
            {dashboard.label}
          </Button>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/verify')}
              >
                Verify
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(dashboard.href)}
              >
                {role === 'ADMIN' ? 'Admin' : role === 'ISSUER' ? 'Issuer' : 'Access'}
              </Button>
            </div>
          </div>

          {/* Wallet Connect & Theme */}
          <ConnectButton />
          <ThemeToggleInline />
        </div>
      </div>
    </header>
  )
}
