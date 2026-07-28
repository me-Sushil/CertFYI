'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggleInline } from '@/components/theme-toggle-inline'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { IssueCertificateButton } from '@/components/IssueCertificateButton'

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 py-4 sm:px-[35px] sm:py-[22px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-card/90 px-4 py-2.5 shadow-button ring-1 ring-border/10 backdrop-blur-md sm:px-8 sm:py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/certFYI-logo.png" alt="CertFyi" width={32} height={32} style={{ width: 'auto', height: '32px' }} priority />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">CertFyi</span>
            <span className="text-xs text-muted-foreground">Web3 Verified</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden gap-4 md:flex items-center">
          <Link
            href="/verify"
            className="text-base leading-[27.2px] text-muted-foreground transition-colors duration-150 ease-[var(--ease-premium)] hover:text-foreground"
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
