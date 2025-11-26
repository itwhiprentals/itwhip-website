// app/switch-from-turo/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Switch from Turo to ItWhip | Earn Up to 90% in Arizona P2P',
  description: 'Switching from Turo? Keep up to 90% of your earnings on ItWhip. $1M liability, Mileage Forensics™, 48-hour payments. Calculate your savings as a Phoenix host.',
  keywords: [
    'Turo alternative Phoenix',
    'switch from Turo Arizona',
    'better than Turo',
    'Turo competitor Phoenix',
    'car sharing Phoenix AZ',
    'P2P car rental Arizona',
    'higher earnings car sharing',
    'ItWhip vs Turo',
    'rent my car Phoenix',
    'car sharing platform Arizona'
  ],
  openGraph: {
    title: 'Switch from Turo to ItWhip | Earn Up to 90%',
    description: 'Switching from Turo? Keep up to 90% of your earnings. $1M liability, 48-hour payments. Calculate your savings.',
    url: 'https://itwhip.com/switch-from-turo',
    siteName: 'ItWhip',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://itwhip.com/og/switch-from-turo.png',
        width: 1200,
        height: 630,
        alt: 'Switch from Turo to ItWhip - Earn Up to 90%'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Switch from Turo to ItWhip | Earn Up to 90%',
    description: 'Switching from Turo? Keep up to 90% of your earnings on ItWhip in Arizona.',
    images: ['https://itwhip.com/og/switch-from-turo.png']
  },
  alternates: {
    canonical: 'https://itwhip.com/switch-from-turo'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function SwitchFromTuroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}