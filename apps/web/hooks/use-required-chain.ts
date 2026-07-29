'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { CHAIN_CONFIG, CONTRACT_CHAIN_ID } from '@/lib/contracts/document-anchor'

export function useRequiredChain() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isCorrectChain = chainId === CONTRACT_CHAIN_ID
  const requiredChainName =
    (CHAIN_CONFIG as Record<number, { name: string }>)[CONTRACT_CHAIN_ID]?.name ??
    `Chain ID ${CONTRACT_CHAIN_ID}`

  const switchToCorrectChain = () => {
    switchChain({ chainId: CONTRACT_CHAIN_ID })
  }

  return { isCorrectChain, requiredChainId: CONTRACT_CHAIN_ID, requiredChainName, switchToCorrectChain }
}
