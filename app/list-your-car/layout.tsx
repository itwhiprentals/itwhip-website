// app/list-your-car/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'List Your Car in Phoenix AZ | Earn Up to 90% on ItWhip',
  description: 'Turn your car into income on Arizona\'s peer-to-peer platform. Keep up to 90% with Mileage Forensics™, ESG tracking, and $1M coverage included. Phoenix, Scottsdale, Tempe, Mesa, Chandler.',
  keywords: 'list your car Phoenix, rent my car Arizona, peer to peer car sharing Phoenix, Turo alternative Arizona, car sharing host Phoenix, earn money with car Scottsdale, P2P car rental Tempe, list car for rent Mesa, passive income car Phoenix',
  openGraph: {
    title: 'List Your Car & Earn Up to 90% | ItWhip Arizona',
    description: 'Arizona\'s highest-paying P2P car sharing platform. Choose your insurance tier, set your price, get paid in 48 hours.',
    url: 'https://itwhip.com/list-your-car',
    siteName: 'ItWhip',
    images: [
      {
        url: 'https://itwhip.com/og-list-your-car.jpg',
        width: 1200,
        height: 630,
        alt: 'List Your Car on ItWhip - Earn Up to 90%',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Car in Phoenix | Earn Up to 90% on ItWhip',
    description: 'Arizona\'s highest-paying P2P car sharing. $1M coverage included. 48-hour payments.',
    images: ['https://itwhip.com/og-list-your-car.jpg'],
    creator: '@itwhip',
    site: '@itwhip',
  },
  alternates: {
    canonical: 'https://itwhip.com/list-your-car',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ListYourCarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}