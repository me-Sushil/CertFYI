import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from '@/app/providers'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  title: 'CertFyi - Verify PDF Documents on the Blockchain',
  description: 'Decentralized PDF verification platform. Verify document authenticity, issuer identity, and timestamp using blockchain technology. Issue and manage verified digital certificates.',
  keywords: ['blockchain', 'PDF verification', 'certificate', 'Web3', 'document verification', 'crypto'],
  generator: 'v0.app',
  openGraph: {
    title: 'CertFyi - Blockchain PDF Verification',
    description: 'Verify any PDF on the blockchain instantly',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f3f3' },
    { media: '(prefers-color-scheme: dark)', color: '#111213' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      // data-scroll-behavior tells Next's router not to fight the CSS smooth
      // scroll on route changes (see the framework warning it otherwise logs).
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} scroll-smooth`}
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <body className="antialiased font-sans" style={{ fontFamily: 'var(--font-plus-jakarta-sans), Plus Jakarta Sans, sans-serif' }}>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
