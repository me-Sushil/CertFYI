'use client'

import dynamic from 'next/dynamic'

const VerifyContent = dynamic(() => import('@/components/verify/VerifyContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" />
    </div>
  ),
})

export default function VerifyPage() {
  return <VerifyContent />
}

