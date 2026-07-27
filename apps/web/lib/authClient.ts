'use client'

const TOKEN_KEY = 'certfyi_token'

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) clearToken() // expired/invalid — force re-sign-in
  return res
}

export interface DecodedToken {
  walletAddress: string
  role: 'ADMIN' | 'ISSUER' | 'UNAPPROVED'
  exp: number
}

export function decodeToken(): DecodedToken | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      clearToken()
      return null
    }
    return {
      walletAddress: payload.address ?? payload.walletAddress,
      role: payload.role,
      exp: payload.exp,
    }
  } catch {
    return null
  }
}

