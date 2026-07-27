# Auth Implementation — ALL TASKS COMPLETE

## ✅ Round 3: Header Cleanup + /issue-certificate Unified Route

### 1. Build Fix: `/verify` DOMMatrix Error
- **Root cause**: `app/verify/page.tsx` was a `'use client'` component that directly imported `pdfjs-dist` which references the browser-only `DOMMatrix` API — crashes during SSR/prerendering.
- **Fix**: Extracted all upload/verification UI into a new `components/verify/VerifyContent.tsx` (Client Component). The `page.tsx` now loads it via `next/dynamic(..., { ssr: false })`, which keeps the PDF library out of any server execution path.

### 2. Logo
- Added `Image` component to `components/header.tsx`: `<Image src="/certFYI-logo.png" ...>` with "CertFyi / Web3 Verified" text
- ✅ Logo asset already exists at `apps/web/public/certFYI-logo.png`

### 3. Header Redesign
| Removed | Kept |
|---------|------|
| ❌ `WalletStatus` (Pending badge) | ✅ Logo with Image + tagline |
| ❌ Sign In / Sign Out buttons | ✅ `IssueCertificateButton` (always "Issue Certificate") |
| ❌ `useSiweSignIn`, `useSession` imports | ✅ RainbowKit's `ConnectButton` (network + account chip with built-in disconnect) |
| ❌ `localRole` / `signingIn` state | ✅ `ThemeToggleInline` |

**Final header layout:**
```
[CertFyi Logo]  Verify PDF   [Issue Certificate]        [Network▾] [0xA271…bd4C▾]  [☀/🌙]
```

### 4. Unified `/issue-certificate` Page (4 Views)

| View | Condition | Content |
|------|-----------|---------|
| **A** | Wallet **not connected** | "Connect Your Wallet" prompt with connect button |
| **B** | Wallet connected, no pending request | Request form (wallet, name, org, email) with lazy SIWE on submit |
| **C** | Pending request | "Awaiting for approval" screen, polls every 30s |
| **C-variant** | Rejected request | Same form as B + rejection notice banner |
| **D** | Role = ISSUER or ADMIN | `router.replace('/issuer')` or `/admin` immediately |

### 5. Session Sync (replaces Sign Out button)
- Added `<SessionSync />` component in `providers.tsx`
- When wallet is disconnected via RainbowKit's account modal:
  - `authApi.logout()` clears the httpOnly session cookie
  - `clearToken()` + localStorage cleanup
  - `invalidateQueries(['session'])`
- This means **disconnecting the wallet = signing out**, no separate button needed.

### 6. File-by-file Changes

| File | Change |
|------|--------|
| `app/verify/page.tsx` | Rewritten: `dynamic(() => import(...), { ssr: false })` — fixes DOMMatrix crash |
| `components/verify/VerifyContent.tsx` | **New** — all verify UI moved here (no PDF lib imports at module scope in verify/page) |
| `components/header.tsx` | Complete rewrite — `Image` logo, only `IssueCertificateButton` + `ConnectButton` + theme toggle. No badges, no sign-out |
| `components/IssueCertificateButton.tsx` | **New** — opens connect modal if disconnected, otherwise routes to `/issue-certificate`. Auto-navigates on connect |
| `app/issue-certificate/page.tsx` | **New** — 4-view decision table. Replaces old `/request-access` page |
| `app/request-access/page.tsx` | Redirect to `/issue-certificate` |
| `app/providers.tsx` | Added `<SessionSync />` — wallet disconnect = backend logout |
| `components/WalletStatus.tsx` | Still exists but no longer imported by header (saved for future use) |
| `components/RequestAccessButton.tsx` | Still exists but no longer imported by header (saved for future use) |
| `components/IssuerRequestForm.tsx` | Still exists but no longer used directly (the new `/issue-certificate` page has its own inline form) |
| `hooks/useSiweSignIn.ts` | Unchanged, still used by the inline form in `/issue-certificate` |
| `lib/authClient.ts` | Unchanged, still used by SessionSync |
| `lib/auth-context.tsx` | Unchanged, still used by `/issue-certificate` |
| `public/certFYI-logo.png` | ✅ Asset exists |

### 7. Test Checklist
- [ ] `pnpm run build` completes — no `DOMMatrix` error
- [ ] Header shows: Logo + "Verify PDF" + "Issue Certificate" + [Network] [Account▾] [☀/🌙] — no badge, no sign-out
- [ ] Click "Issue Certificate" with **no wallet connected** → RainbowKit connect modal opens → connect → auto-navigates to `/issue-certificate` → form appears with wallet pre-filled
- [ ] Submit form → SIWE prompt if not signed in → "Awaiting for approval" appears
- [ ] Refresh while pending → still shows "Awaiting for approval" (polls every 30s)
- [ ] Admin approves → page auto-navigates to `/issuer` dashboard on next poll
- [ ] Disconnect wallet via RainbowKit's account modal → session cookie cleared (verified via network tab)
- [ ] `/verify` fully works with no wallet connected

