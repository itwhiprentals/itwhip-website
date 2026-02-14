import { Metadata } from 'next'
import DevelopersContent from './DevelopersContent'

export const metadata: Metadata = {
  title: 'Developer API Documentation | ItWhip',
  description: 'ItWhip API documentation for car rental integrations. RESTful API, SDKs for JavaScript, Python, PHP, Ruby, and Java. Build P2P car rental features into your application.',
  alternates: {
    canonical: 'https://itwhip.com/developers',
  },
  openGraph: {
    title: 'Developer API Documentation | ItWhip',
    description: 'Build P2P car rental features into your application with the ItWhip API.',
    url: 'https://itwhip.com/developers',
    type: 'website',
  },
}

export default function DevelopersPage() {
  return <DevelopersContent />
}
