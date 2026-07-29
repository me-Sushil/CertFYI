'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  onLoadingChange?: (loading: boolean) => void
  /**
   * Fixed gas limit, bypassing wallet auto-estimation. Some wallets have
   * returned wildly wrong estimates (e.g. 21,000,000 for a simple SSTORE)
   * that exceed the RPC provider's hard cap - pass this for any call where
   * that's been observed rather than trusting the wallet.
   */
  gas?: bigint
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
  onLoadingChange,
  gas,
}: OnChainButtonProps) {
  const { isCorrectChain, switchToCorrectChain } = useRequiredChain()
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })
  const [isHandling, setIsHandling] = useState(false)
  const handledTxRef = useRef<Hex | null>(null)

  const isLoading = isPending || isConfirming || isHandling

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  useEffect(() => {
    if (!isSuccess || !txHash) return
    if (handledTxRef.current === txHash) return

    handledTxRef.current = txHash as Hex
    setIsHandling(true)
    ;(async () => {
      try {
        await onConfirmed(txHash as Hex)
        toast.success(successMessage)
      } catch {
        toast.error(errorMessage)
      } finally {
        setIsHandling(false)
      }
    })()
  }, [isSuccess, txHash, onConfirmed, successMessage, errorMessage])

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
      ...(gas !== undefined ? { gas } : {}),
    })
  }

  return (
    <div>
      <Button
        size="sm"
        variant={variant}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={className}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
        {isConfirming ? 'Confirming...' : isHandling ? 'Recording...' : children}
      </Button>
      {error && !isLoading && (
        <p className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
