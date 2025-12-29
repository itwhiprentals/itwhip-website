import { Metadata } from 'next'
import CoverageContent from './CoverageContent'

export const metadata: Metadata = {
  title: 'Service Areas & Coverage | ItWhip',
  description: 'ItWhip serves Phoenix, Scottsdale, Tempe, Mesa, Chandler, and Gilbert. Peer-to-peer car rentals across Arizona with airport delivery available at PHX.',
  keywords: [
    'car rental phoenix',
    'car rental scottsdale',
    'car rental tempe',
    'car rental mesa',
    'car rental chandler',
    'car rental gilbert',
    'phoenix airport car rental',
    'arizona car rental',
    'peer to peer car rental arizona'
  ],
  alternates: {
    canonical: 'https://itwhip.com/coverage',
  },
  openGraph: {
    title: 'Service Areas & Coverage | ItWhip',
    description: 'Rent cars from local hosts across Phoenix Metro. 6 cities, 161+ cars, airport delivery available.',
    url: 'https://itwhip.com/coverage',
    type: 'website',
  },
}

export default function CoveragePage() {
  return <CoverageContent />
}
