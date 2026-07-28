'use client'

import { useRequiredChain } from '@/hooks/use-required-chain'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export function ChainBanner() {
  const { isCorrectChain, requiredChainId, switchToCorrectChain } = useRequiredChain()

  if (isCorrectChain || typeof window === 'undefined') return null

  const chainNames: Record<number, string> = {
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    42161: 'Arbitrum',
    8453: 'Base',
    10: 'Optimism',
    11155111: 'Sepolia',
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-[20px] border border-accent/20 bg-accent/5 p-4 shadow-card ring-1 ring-accent/5 animate-fade-in-up">
      <AlertTriangle className="h-5 w-5 shrink-0 text-accent" aria-hidden />
      <p className="flex-1 text-sm text-foreground">
        Wrong network. Please switch to{' '}
        <strong>{chainNames[requiredChainId] ?? `Chain ID ${requiredChainId}`}</strong>.
      </p>
      <Button size="sm" variant="outline" onClick={switchToCorrectChain}>
        Switch Network
      </Button>
    </div>
  )
}
