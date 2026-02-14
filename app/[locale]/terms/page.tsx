import { Metadata } from 'next'
import TermsContent from './TermsContent'

export const metadata: Metadata = {
  title: 'Terms of Service | ItWhip',
  description: 'Read ItWhip\'s terms of service for peer-to-peer car rentals in Arizona. Understand your rights and responsibilities as a host or guest on our platform.',
  alternates: {
    canonical: 'https://itwhip.com/terms',
  },
  openGraph: {
    title: 'Terms of Service | ItWhip',
    description: 'Read ItWhip\'s terms of service for peer-to-peer car rentals in Arizona.',
    url: 'https://itwhip.com/terms',
    type: 'website',
  },
}

export default function TermsPage() {
  return <TermsContent />
}
