'use client'

import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StorageConsentProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

/**
 * Opt-in control for pinning a document to IPFS.
 *
 * Defaults to off, and states the consequence in the open rather than hiding it
 * behind a tooltip. Pinning publishes the file to a permanent, public,
 * content-addressed handle: anyone with the CID can retrieve it forever, and
 * unpinning does not retract copies that have already propagated. Since issued
 * PDFs carry recipient names, that is a decision the issuer must make knowingly
 * (SRS §5 Compliance).
 */
export function StorageConsent({
  checked,
  onChange,
  disabled = false,
  className,
}: StorageConsentProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border border-border bg-card p-4 transition',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/40',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.currentTarget.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      />
      <span className="space-y-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
          Store a copy on IPFS
        </span>
        <span className="block text-xs text-muted-foreground">
          Anyone with the link can retrieve this file, permanently. It cannot be deleted once
          published. Verification works either way &mdash; the blockchain anchor is what proves
          authenticity, not the stored copy.
        </span>
      </span>
    </label>
  )
}
