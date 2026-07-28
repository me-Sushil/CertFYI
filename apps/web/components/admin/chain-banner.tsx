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
    <div className="flex items-center gap-3 p-3 mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
      <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
        Wrong network. Please switch to{' '}
        <strong>{chainNames[requiredChainId] ?? `Chain ID ${requiredChainId}`}</strong>.
      </p>
      <Button size="sm" variant="outline" onClick={switchToCorrectChain}>
        Switch Network
      </Button>
    </div>
  )
}
