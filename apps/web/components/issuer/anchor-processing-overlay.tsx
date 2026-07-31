// components/issuer/anchor-processing-overlay.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  Fingerprint,
  Wallet,
  Link2,
  Database,
  Check,
} from 'lucide-react'

type BusyPhase = 'uploading' | 'awaiting-signature' | 'confirming' | 'recording'

interface AnchorProcessingOverlayProps {
  /** Pass your existing `isBusy` boolean straight through. Overlay renders nothing when false. */
  open: boolean
  /** Pass your existing `phase` state straight through. */
  phase: BusyPhase | 'idle' | 'error' | 'reverted'
  /** Optional: the file name, shown as a small caption under the animation. */
  fileName?: string
}

const STEPS: {
  key: BusyPhase
  label: string
  caption: string
  icon: typeof FileText
}[] = [
  { key: 'uploading', label: 'Hashing & pinning', caption: 'Fingerprinting the PDF and pinning it to IPFS', icon: Fingerprint },
  { key: 'awaiting-signature', label: 'Wallet signature', caption: 'Waiting for you to approve the transaction', icon: Wallet },
  { key: 'confirming', label: 'Confirming on-chain', caption: 'Broadcasting to the network', icon: Link2 },
  { key: 'recording', label: 'Recording', caption: 'Saving the confirmed record', icon: Database },
]

export function AnchorProcessingOverlay({ open, phase, fileName }: AnchorProcessingOverlayProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(open), [open])

  const activeIndex = useMemo(() => {
    const idx = STEPS.findIndex((s) => s.key === phase)
    return idx === -1 ? 0 : idx
  }, [phase])

  if (!mounted) return null

  const ActiveIcon = STEPS[activeIndex].icon

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md anchorviz-fade-in"
      role="alertdialog"
      aria-busy="true"
      aria-live="polite"
      aria-label={`Issuing document: ${STEPS[activeIndex].label}`}
    >
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-large ring-1 ring-border/10 sm:p-8 anchorviz-rise">
        <div className="mb-1 text-center">
          <p className="text-[13px] font-bold tracking-wide text-muted-foreground uppercase">
            Issuing document
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
            {STEPS[activeIndex].label}
          </h2>
          {fileName && (
            <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">{fileName}</p>
          )}
        </div>

        {/* --- Signature animation: PDF -> hash trail -> forge -> chain --- */}
        <div className="relative my-8 flex h-[132px] items-center justify-between px-1 sm:px-3">
          {/* Document node */}
          <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-background shadow-card ring-1 ring-border/10">
            <FileText
              className={`h-7 w-7 text-muted-foreground transition-opacity duration-500 ${
                activeIndex === 0 ? 'anchorviz-doc-dissolve text-accent' : 'opacity-40'
              }`}
              aria-hidden
            />
          </div>

          {/* Connector 1: document -> forge, with traveling hash particles */}
          <svg className="mx-1 h-4 flex-1" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden>
            <line
              x1="0" y1="2" x2="100" y2="2"
              className="stroke-border/25"
              strokeWidth="2"
            />
            <line
              x1="0" y1="2" x2="100" y2="2"
              className={activeIndex <= 1 ? 'stroke-accent anchorviz-dash' : 'stroke-success'}
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          </svg>

          {/* Forge node: rotating ring, icon morphs with phase */}
          <div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center">
            <div className="anchorviz-spin absolute inset-0 rounded-full border-2 border-dashed border-accent/40" />
            <div className="absolute inset-[6px] rounded-full bg-accent/10 anchorviz-pulse-ring" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-button">
              <ActiveIcon key={phase} className="h-5 w-5 anchorviz-icon-pop" aria-hidden />
            </div>
          </div>

          {/* Connector 2: forge -> chain */}
          <svg className="mx-1 h-4 flex-1" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden>
            <line x1="0" y1="2" x2="100" y2="2" className="stroke-border/25" strokeWidth="2" />
            <line
              x1="0" y1="2" x2="100" y2="2"
              className={activeIndex >= 2 ? 'stroke-accent anchorviz-dash' : 'stroke-border/25'}
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          </svg>

          {/* Chain of blocks */}
          <div className="relative z-10 flex shrink-0 items-center">
            {[0, 1, 2].map((i) => {
              const isNew = i === 2
              const isLit = isNew ? activeIndex >= 2 : true
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div
                      className={`h-0.5 w-3 rounded-full transition-colors duration-500 ${
                        isLit ? 'bg-accent' : 'bg-border/25'
                      }`}
                    />
                  )}
                  <div
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-lg text-[10px] font-mono font-bold transition-all duration-500',
                      isNew
                        ? activeIndex >= 3
                          ? 'scale-100 bg-success text-success-foreground shadow-button'
                          : activeIndex === 2
                            ? 'scale-105 bg-accent text-accent-foreground shadow-button anchorviz-block-glow'
                            : 'scale-90 bg-background text-muted-foreground/40 ring-1 ring-dashed ring-border/30'
                        : 'bg-foreground/85 text-background',
                    ].join(' ')}
                  >
                    {isNew && activeIndex >= 3 ? (
                      <Check className="h-5 w-5" aria-hidden />
                    ) : (
                      <span className="opacity-70">#{isNew ? '' : ''}0x{(i + 1) * 7}a</span>
                    )}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* --- Step list --- */}
        <ol className="space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const done = i < activeIndex
            const active = i === activeIndex
            return (
              <li key={step.key} className="flex items-center gap-3">
                <div
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                    done
                      ? 'bg-success text-success-foreground'
                      : active
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted/50 text-muted-foreground/50',
                  ].join(' ')}
                >
                  {done ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Icon className={`h-4 w-4 ${active ? 'anchorviz-icon-pop' : ''}`} aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-bold ${
                      done || active ? 'text-foreground' : 'text-muted-foreground/60'
                    }`}
                  >
                    {step.label}
                  </p>
                  {active && (
                    <p className="text-xs font-medium text-muted-foreground anchorviz-fade-in">
                      {step.caption}
                    </p>
                  )}
                </div>
                {active && (
                  <div className="flex shrink-0 gap-1" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent anchorviz-dot" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent anchorviz-dot" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent anchorviz-dot" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        <p className="mt-6 text-center text-[11px] font-semibold text-muted-foreground/70">
          This usually takes a few moments. Please don&apos;t close this window.
        </p>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .anchorviz-fade-in, .anchorviz-rise, .anchorviz-spin, .anchorviz-pulse-ring,
          .anchorviz-icon-pop, .anchorviz-dash, .anchorviz-block-glow, .anchorviz-dot,
          .anchorviz-doc-dissolve {
            animation: none !important;
          }
        }

        .anchorviz-fade-in { animation: anchorviz-fade 0.25s ease-out; }
        @keyframes anchorviz-fade { from { opacity: 0; } to { opacity: 1; } }

        .anchorviz-rise { animation: anchorviz-rise 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes anchorviz-rise {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .anchorviz-spin { animation: anchorviz-spin 6s linear infinite; }
        @keyframes anchorviz-spin { to { transform: rotate(360deg); } }

        .anchorviz-pulse-ring { animation: anchorviz-pulse-ring 2s ease-in-out infinite; }
        @keyframes anchorviz-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 1; }
        }

        .anchorviz-icon-pop { animation: anchorviz-icon-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes anchorviz-icon-pop {
          from { opacity: 0; transform: scale(0.5) rotate(-20deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .anchorviz-dash { stroke-dashoffset: 0; animation: anchorviz-dash 1s linear infinite; }
        @keyframes anchorviz-dash { to { stroke-dashoffset: -24; } }

        .anchorviz-block-glow { animation: anchorviz-block-glow 1.1s ease-in-out infinite; }
        @keyframes anchorviz-block-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); filter: brightness(1); }
          50% { box-shadow: 0 0 18px 3px currentColor; filter: brightness(1.08); }
        }

        .anchorviz-dot { animation: anchorviz-dot 1s ease-in-out infinite; }
        @keyframes anchorviz-dot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .anchorviz-doc-dissolve { animation: anchorviz-doc-dissolve 1.6s ease-in-out infinite; }
        @keyframes anchorviz-doc-dissolve {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.92); }
        }
      `}</style>
    </div>
  )
}