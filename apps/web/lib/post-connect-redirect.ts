import { create } from 'zustand'

interface PostConnectRedirectState {
  pendingRedirect: string | null
  setPendingRedirect: (path: string | null) => void
  consume: () => string | null
}

export const usePostConnectRedirect = create<PostConnectRedirectState>((set, get) => ({
  pendingRedirect: null,
  setPendingRedirect: (path) => set({ pendingRedirect: path }),
  consume: () => {
    const path = get().pendingRedirect
    set({ pendingRedirect: null })
    return path
  },
}))
