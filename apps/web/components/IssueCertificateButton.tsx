'use client'
import { useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function IssueCertificateButton() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const router = useRouter()
  const wasConnectedRef = useRef(isConnected)

  const handleClick = () => {
    if (!isConnected) {
      openConnectModal?.()
      return
    }
    router.push('/issue-certificate')
  }

  // Auto-navigate once a previously-disconnected wallet becomes connected
  useEffect(() => {
    if (!wasConnectedRef.current && isConnected) {
      router.push('/issue-certificate')
    }
    wasConnectedRef.current = isConnected
  }, [isConnected, router])

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className="text-sm">
      Issue Certificate
    </Button>
  )
}

