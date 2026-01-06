// app/security/intelligence/page.tsx
import { Metadata } from 'next'
import ThreatIntelligenceClient from './ThreatIntelligenceClient'

export const metadata: Metadata = {
  title: 'Threat Intelligence Dashboard | Real-time Security Analytics | ItWhip',
  description: 'Live security threat analysis, attack vector reports, and vulnerability tracking. View real-time attack data from 67+ countries. Free monthly security reports available.',
  keywords: ['threat intelligence', 'security analytics', 'attack monitoring', 'vulnerability tracking', 'cybersecurity dashboard'],
  openGraph: {
    title: 'Threat Intelligence Dashboard | ItWhip Security',
    description: 'Real-time security threat monitoring and analytics dashboard. Track attacks, vulnerabilities, and threat actors.',
    url: 'https://itwhip.com/security/intelligence',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Threat Intelligence Dashboard | ItWhip',
    description: 'Real-time security threat monitoring and analytics.',
  },
  alternates: {
    canonical: 'https://itwhip.com/security/intelligence',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ThreatIntelligencePage() {
  return <ThreatIntelligenceClient />
}
