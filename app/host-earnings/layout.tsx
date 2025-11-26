// app/host-earnings/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Host Earnings Calculator | Earn Up to 90% on ITWhip – Arizona P2P',
  description: 'Calculate your car sharing earnings in Phoenix. Keep 40-90% based on your insurance tier. $1M liability, Mileage Forensics™, ESG dashboard, 48-hour payments included.',
  keywords: [
    'car sharing earnings Phoenix',
    'P2P car rental income Arizona',
    'Turo alternative Phoenix',
    'car sharing calculator',
    'host earnings Arizona',
    'peer to peer car rental Phoenix',
    'rent my car Phoenix',
    'passive income car sharing',
    'ITWhip host earnings',
    'car sharing revenue calculator'
  ],
  openGraph: {
    title: 'Host Earnings Calculator | Earn Up to 90% on ITWhip',
    description: 'Calculate your car sharing earnings in Phoenix. Keep 40-90% based on your insurance tier. $1M liability included.',
    url: 'https://itwhip.com/host-earnings',
    siteName: 'ITWhip',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://itwhip.com/og/host-earnings.png',
        width: 1200,
        height: 630,
        alt: 'ITWhip Host Earnings Calculator - Earn Up to 90%'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Host Earnings Calculator | Earn Up to 90% on ITWhip',
    description: 'Calculate your car sharing earnings in Phoenix. Keep 40-90% based on your insurance tier.',
    images: ['https://itwhip.com/og/host-earnings.png']
  },
  alternates: {
    canonical: 'https://itwhip.com/host-earnings'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function HostEarningsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}