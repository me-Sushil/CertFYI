'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ipfsGatewayUrl, isValidCid, truncateCid } from '@/lib/ipfs'

interface CidBadgeProps {
  cid: string | null | undefined
  className?: string
  /** Hides the copy control where space is tight, e.g. inside a table row. */
  compact?: boolean
}

/**
 * Displays an IPFS CID as a gateway link with copy-to-clipboard.
 *
 * The URL comes from `lib/ipfs`, never a literal, so changing provider or
 * gateway updates every link in the app at once.
 */
export function CidBadge({ cid, className, compact = false }: CidBadgeProps) {
  const [copied, setCopied] = useState(false)

  if (!isValidCid(cid)) return null

  const url = ipfsGatewayUrl(cid)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cid)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard is unavailable over plain HTTP on some browsers; the CID is
      // still selectable in the link text, so this is not worth surfacing.
    }
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={cid}
        className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
      >
        {truncateCid(cid)}
        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
      </a>

      {!compact && (
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'CID copied' : 'Copy CID'}
          className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3 w-3 text-accent" aria-hidden />
          ) : (
            <Copy className="h-3 w-3" aria-hidden />
          )}
        </button>
      )}
    </span>
  )
}
