import { Metadata } from 'next'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'About ItWhip | Arizona P2P Car Rental',
  description: 'ItWhip is Arizona\'s peer-to-peer car rental marketplace. Built for the desert, serving Phoenix metro hosts and guests with $1M insurance coverage.',
  alternates: {
    canonical: 'https://itwhip.com/about',
  },
  openGraph: {
    title: 'About ItWhip | Arizona P2P Car Rental',
    description: 'Arizona\'s peer-to-peer car rental marketplace serving Phoenix metro.',
    url: 'https://itwhip.com/about',
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
