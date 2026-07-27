'use client'
import { useAccount, useEnsName } from 'wagmi'

export function WalletStatus() {
  const { address, isConnected, connector } = useAccount()
  const { data: ensName } = useEnsName({ address })

  if (!isConnected || !address) return null

  // Read role from localStorage (set after SIWE sign-in)
  let role: string | null = null
  try {
    role = localStorage.getItem('certfyi_role')
  } catch {
    // localStorage unavailable
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {connector?.icon && (
        <img
          src={connector.icon}
          alt={connector.name ?? 'wallet'}
          width={18}
          height={18}
          className="rounded-full"
        />
      )}
      <span className="font-medium text-foreground">
        {ensName ?? `${address.slice(0, 6)}…${address.slice(-4)}`}
      </span>
      {role && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {role === 'ADMIN' ? 'Admin' : role === 'ISSUER' ? 'Issuer' : 'Pending'}
        </span>
      )}
    </div>
  )
}

