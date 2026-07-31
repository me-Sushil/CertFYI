'use client'

import { Header } from '@/components/header'

/**
 * Previously this gated `Header` behind a mount flag and rendered an in-flow
 * spacer meanwhile. Both halves of that caused layout shift: `Header` is
 * `position: fixed` so the spacer's height collapsed to zero on mount, and the
 * nav itself popped in from nothing.
 *
 * The gate is not needed - the wagmi config sets `ssr: true`, so the wallet
 * hooks report a disconnected state on the server and on the first client
 * render alike, which is what keeps hydration consistent. Rendering `Header`
 * straight through means the nav is in the very first paint.
 */
export function HeaderWrapper() {
  return <Header />
}
