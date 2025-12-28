// app/(guest)/hotels/page.tsx
import { Metadata } from 'next'
import HotelsClient from './HotelsClient'

export const metadata: Metadata = {
  title: 'Phoenix Hotels with Instant Rides | Book Premium Properties | ItWhip',
  description: 'Book premium Phoenix & Scottsdale hotels with integrated luxury transportation. Instant rides, no surge pricing, VIP fleet access. 487+ properties available.',
  keywords: ['Phoenix hotels', 'Scottsdale hotels', 'hotel transportation', 'instant rides', 'luxury hotels Arizona'],
  openGraph: {
    title: 'Phoenix Hotels with Instant Rides | ItWhip',
    description: 'Premium hotels with integrated luxury transportation. Book now for instant rides and VIP service.',
    url: 'https://itwhip.com/hotels',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phoenix Hotels with Instant Rides | ItWhip',
    description: 'Premium hotels with integrated luxury transportation.',
  },
  alternates: {
    canonical: 'https://itwhip.com/hotels',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HotelsPage() {
  return <HotelsClient />
}
