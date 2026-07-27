'use client'
import { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { IssuerRequestForm } from './IssuerRequestForm'

export function RequestAccessButton() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [showForm, setShowForm] = useState(false)
  const pendingConnect = useRef(false)

  function handleClick() {
    if (!isConnected) {
      pendingConnect.current = true
      openConnectModal?.()
      return
    }
    // Already connected → show the form immediately (SIWE happens on form submit)
    setShowForm(true)
  }

  // Auto-open form when user completes connection after clicking this button
  useEffect(() => {
    if (isConnected && pendingConnect.current) {
      pendingConnect.current = false
      setShowForm(true)
    }
  }, [isConnected])

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleClick} className="text-sm">
        Issue Certificate
      </Button>
      {showForm && <IssuerRequestForm onClose={() => setShowForm(false)} />}
    </>
  )
}

