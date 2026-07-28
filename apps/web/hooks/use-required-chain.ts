'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { CONTRACT_CHAIN_ID } from '@/lib/contracts/document-anchor'

export function useRequiredChain() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isCorrectChain = chainId === CONTRACT_CHAIN_ID

  const switchToCorrectChain = () => {
    switchChain({ chainId: CONTRACT_CHAIN_ID })
  }

  return { isCorrectChain, requiredChainId: CONTRACT_CHAIN_ID, switchToCorrectChain }
}
