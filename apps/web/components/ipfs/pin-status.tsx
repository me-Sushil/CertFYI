'use client'

import { CheckCircle2, CircleSlash, CloudOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PinState } from '@/lib/ipfs'

interface PinStatusProps {
  state: PinState
  className?: string
  /** Failure reason from the API, shown on hover. */
  reason?: string
}

/**
 * Communicates IPFS storage state.
 *
 * Wording is deliberate: a failed pin is NOT a problem with the document. The
 * blockchain anchor is what proves authenticity, so a missing IPFS copy must
 * never read as "this certificate is invalid".
 */
const PRESENTATION: Record<
  PinState,
  { label: string; detail: string; icon: typeof CheckCircle2; className: string }
> = {
  pinned: {
    label: 'Stored on IPFS',
    detail: 'A copy is publicly retrievable from the IPFS gateway.',
    icon: CheckCircle2,
    className: 'text-accent',
  },
  'not-stored': {
    label: 'Not stored on IPFS',
    detail: 'No public copy was requested. Verification is unaffected.',
    icon: CircleSlash,
    className: 'text-muted-foreground',
  },
  failed: {
    label: 'IPFS copy unavailable',
    detail: 'Anchored on-chain, but the IPFS copy could not be stored. Verification is unaffected.',
    icon: CloudOff,
    className: 'text-muted-foreground',
  },
}

export function PinStatus({ state, className, reason }: PinStatusProps) {
  const { label, detail, icon: Icon, className: tone } = PRESENTATION[state]

  return (
    <span
      // Status is never conveyed by icon or colour alone - the label carries it.
      title={reason ? `${detail} (${reason})` : detail}
      className={cn('inline-flex items-center gap-1.5 text-xs', tone, className)}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  )
}
