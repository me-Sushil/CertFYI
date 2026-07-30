'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Shield, Zap, Users, Clock, FileCheck, Globe } from 'lucide-react'

interface Feature {
  icon: typeof Shield
  title: string
  description: string
  color: string
}

const FEATURES: Feature[] = [
  {
    icon: Shield,
    title: 'Public Verification',
    description: 'Upload any PDF to instantly verify its authenticity and issuer identity. No login required.',
    color: '--accent',
  },
  {
    icon: Zap,
    title: 'Single Document Issuance',
    description: 'Verified organizations can issue digital certificates with embedded blockchain proof.',
    color: '--color-accent-peach',
  },
  {
    icon: Users,
    title: 'Bulk Issuance',
    description: 'Issue hundreds of documents at once with gas-efficient Merkle tree batching.',
    color: '--success',
  },
  {
    icon: Clock,
    title: 'Immutable Timestamps',
    description: 'Every document is anchored with an on-chain timestamp, creating permanent proof of issuance.',
    color: '--accent',
  },
  {
    icon: FileCheck,
    title: 'Revocation Management',
    description: 'Issuers can revoke documents when needed, instantly visible to all verifiers.',
    color: '--color-accent-peach',
  },
  {
    icon: Globe,
    title: 'Multi-Chain Ready',
    description: 'Deploy on Ethereum or any EVM-compatible chain. Full decentralized governance.',
    color: '--success',
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { ref, visible } = useInView(0.1)

  const Icon = feature.icon

  return (
    <div
      ref={ref}
      className={`group relative rounded-lg bg-card p-[var(--spacing-lg-3)] shadow-card transition-all duration-700 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-button sm:p-8 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500 ease-[var(--ease-premium)] group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(${feature.color}) 12%, transparent), transparent)`,
        }}
      />

      <div className="relative z-10 mb-5 flex items-center justify-between">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(${feature.color}) 20%, transparent), color-mix(in srgb, var(${feature.color}) 5%, transparent))`,
            color: `var(${feature.color})`,
          }}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>

        <span
          className="text-sm font-bold tracking-wide transition-colors duration-300"
          style={{
            color: `color-mix(in srgb, var(${feature.color}) 30%, transparent)`,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <h3 className="relative z-10 mb-2.5 text-xl font-extrabold tracking-[-0.5px] text-foreground sm:text-[22px]">
        {feature.title}
      </h3>
      <p className="relative z-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {feature.description}
      </p>
    </div>
  )
}

export function Features() {
  const { ref, visible } = useInView(0.05)

  return (
    <section id="features" className="relative overflow-hidden px-6 py-24 sm:px-8 sm:py-32 lg:px-10">
      <div
        ref={ref}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -right-1/4 top-0 h-[600px] w-[600px] rounded-full transition-opacity duration-1000 ease-[var(--ease-premium)] ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%)',
          }}
        />
        <div
          className={`absolute -bottom-1/3 -left-1/4 h-[500px] w-[500px] rounded-full transition-opacity duration-1000 delay-300 ease-[var(--ease-premium)] ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent-peach) 8%, transparent) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div
            className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-soft transition-all duration-700 ease-[var(--ease-premium)] ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            <span className="text-[15px] font-semibold leading-[19.5px] text-muted-foreground">
              What you get
            </span>
          </div>

          <h2
            className={`mb-4 text-3xl leading-tight font-extrabold tracking-[-1px] text-foreground transition-all duration-700 delay-100 ease-[var(--ease-premium)] sm:text-4xl md:text-5xl lg:text-[60px] lg:leading-[1.12] ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            Powerful Features
          </h2>
          <p
            className={`mx-auto max-w-xl text-base leading-relaxed text-muted-foreground transition-all duration-700 delay-150 ease-[var(--ease-premium)] sm:text-lg ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            Everything you need to verify and issue blockchain-backed documents
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
