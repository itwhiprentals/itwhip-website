import { Metadata } from 'next'
import HostUniversityContent from './HostUniversityContent'

export const metadata: Metadata = {
  title: 'Host University | ItWhip',
  description: 'Learn car sharing best practices for ItWhip hosts. Pricing strategies, photography tips, guest management, and how to maximize your earnings.',
  alternates: {
    canonical: 'https://itwhip.com/host-university',
  },
  openGraph: {
    title: 'Host University | ItWhip',
    description: 'Car sharing best practices and training for ItWhip hosts.',
    url: 'https://itwhip.com/host-university',
    type: 'website',
  },
}

export default function HostUniversityPage() {
  return <HostUniversityContent />
}
