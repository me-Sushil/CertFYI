'use client'

import { useEffect, type ReactNode } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Hex, Abi } from 'viem'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts/document-anchor'
import { useRequiredChain } from '@/hooks/use-required-chain'

interface OnChainButtonProps {
  functionName: string
  args: readonly unknown[]
  onConfirmed: (txHash: Hex) => void | Promise<void>
  children: ReactNode
  successMessage?: string
  errorMessage?: string
  variant?: 'default' | 'outline' | 'destructive'
  disabled?: boolean
  className?: string
}

export function OnChainButton({
  functionName,
  args,
  onConfirmed,
  children,
  successMessage = 'Transaction confirmed',
  errorMessage = 'Transaction failed',
  variant = 'default',
  disabled,
  className,
}: OnChainButtonProps) {
  const { isCorrectChain, switchToCorrectChain } = useRequiredChain()
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (!isSuccess || !txHash) return
    let cancelled = false
    ;(async () => {
      try {
        await onConfirmed(txHash as Hex)
        if (!cancelled) toast.success(successMessage)
      } catch {
        if (!cancelled) toast.error(errorMessage)
      }
    })()
    return () => { cancelled = true }
  }, [isSuccess, txHash])

  const handleClick = () => {
    if (!isCorrectChain) {
      switchToCorrectChain()
      toast.error('Please switch to the correct network first')
      return
    }
    writeContract({
      address: CONTRACT_ADDRESS as Hex,
      abi: CONTRACT_ABI as unknown as Abi,
      functionName,
      args,
    })
  }

  return (
    <div>
      <Button
        size="sm"
        variant={variant}
        onClick={handleClick}
        disabled={disabled || isPending}
        className={className}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
