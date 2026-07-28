'use client'

import { useState, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Hex, Abi } from 'viem'
import { toast } from 'sonner'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts/document-anchor'
import { useRequiredChain } from './use-required-chain'

export interface UseOnChainActionOptions {
  functionName: string
  args: readonly unknown[]
  onConfirmed?: (txHash: Hex) => void | Promise<void>
  successMessage?: string
  errorMessage?: string
}

export function useOnChainAction() {
  const [isConfirming, setIsConfirming] = useState(false)
  const { isCorrectChain, switchToCorrectChain } = useRequiredChain()

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

  const execute = useCallback(
    async ({ functionName, args, onConfirmed, successMessage, errorMessage }: UseOnChainActionOptions) => {
      if (!isCorrectChain) {
        switchToCorrectChain()
        toast.error('Please switch to the correct network')
        return
      }

      try {
        writeContract({
          address: CONTRACT_ADDRESS as Hex,
          abi: CONTRACT_ABI as unknown as Abi,
          functionName,
          args: args as readonly unknown[],
        })
      } catch {
        toast.error(errorMessage ?? 'Transaction failed')
        return
      }

      if (onConfirmed && txHash && isTxConfirmed) {
        setIsConfirming(true)
        try {
          await onConfirmed(txHash as Hex)
          toast.success(successMessage ?? 'Transaction confirmed')
        } catch {
          toast.error(errorMessage ?? 'Failed to record transaction')
        } finally {
          setIsConfirming(false)
        }
      }
    },
    [isCorrectChain, switchToCorrectChain, writeContract, txHash, isTxConfirmed],
  )

  return {
    execute,
    txHash: txHash as Hex | undefined,
    isWritePending,
    isTxConfirmed,
    isConfirming,
    isBusy: isWritePending || isConfirming,
    writeError: writeError?.message ?? null,
  }
}
