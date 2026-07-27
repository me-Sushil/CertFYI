'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { IssueCertificateButton } from '@/components/IssueCertificateButton'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/certFYI-logo.png" alt="CertFyi" width={32} height={32} priority />
          {/* <div className="flex flex-col leading-tight">
            <span className="font-semibold">CertFyi</span>
            <span className="text-xs text-muted-foreground">Web3 Verified</span>
          </div> */}
        </Link>

        {/* Navigation Links */}
        <nav className="hidden gap-4 md:flex items-center">
          <Link
            href="/verify"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Verify PDF
          </Link>
          <IssueCertificateButton />
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile nav */}
          <div className="md:hidden">
            <div className="flex gap-2">
              <Link
                href="/verify"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Verify
              </Link>
              <IssueCertificateButton />
            </div>
          </div>

          {/* Wallet Connect & Theme */}
          <ConnectButton showBalance={false} />
          <ThemeToggleInline />
        </div>
      </div>
    </header>
  )
}

