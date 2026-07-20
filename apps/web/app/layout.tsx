import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/app/providers'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

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
    { media: '(prefers-color-scheme: light)', color: '#6172d0' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0f1d' },
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
    <html lang="en" className="bg-background scroll-smooth">
      <body className="antialiased bg-background text-foreground">
        <Providers>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
