import { CheckCircle, CloudOff } from 'lucide-react'

interface CidBadgeProps {
  cid: string | null | undefined
}

export function CidBadge({ cid }: CidBadgeProps) {
  if (!cid) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <CloudOff className="w-3 h-3" />
        Not pinned
      </span>
    )
  }

  return (
    <a
      href={`https://${cid}.ipfs.w3s.link`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
    >
      <CheckCircle className="w-3 h-3 text-accent" />
      {cid.slice(0, 12)}...
    </a>
  )
}
