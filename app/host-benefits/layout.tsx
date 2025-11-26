// app/host-benefits/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '30+ Host Benefits | Earn Up to 90% on ItWhip – Arizona P2P Car Sharing',
  description: 'Turn your car into income on Arizona\'s peer-to-peer platform. Keep up to 90% with Mileage Forensics™, ESG tracking, and $1M coverage included. 48-hour payments, tax savings, and more.',
  keywords: 'car sharing host benefits, P2P car rental earnings, Turo alternative benefits, list car Phoenix benefits, car sharing insurance Arizona, host earnings Phoenix, passive income car sharing, car rental host perks',
  openGraph: {
    title: 'All 30+ Host Benefits | ItWhip Arizona P2P Car Sharing',
    description: 'You bring the insurance. We give you up to 90% + full protection. $1M coverage, 48-hour payments, Mileage Forensics™, ESG tracking.',
    url: 'https://itwhip.com/host-benefits',
    siteName: 'ItWhip',
    images: [
      {
        url: 'https://itwhip.com/og-host-benefits.jpg',
        width: 1200,
        height: 630,
        alt: 'ItWhip Host Benefits - Earn Up to 90%',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '30+ Host Benefits | Earn Up to 90% on ItWhip',
    description: 'Arizona\'s highest-paying P2P platform. $1M coverage, 48-hour payments, tax savings, and more.',
    images: ['https://itwhip.com/og-host-benefits.jpg'],
    creator: '@itwhip',
    site: '@itwhip',
  },
  alternates: {
    canonical: 'https://itwhip.com/host-benefits',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HostBenefitsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}