import { Metadata } from 'next'
import StatusContent from './StatusContent'

export const metadata: Metadata = {
  title: 'System Status | ItWhip',
  description: 'Real-time operational status for ItWhip\'s car rental platform. Check website, mobile app, payments, and booking system availability.',
  alternates: {
    canonical: 'https://itwhip.com/status',
  },
  openGraph: {
    title: 'System Status | ItWhip',
    description: 'Check ItWhip platform status and uptime.',
    url: 'https://itwhip.com/status',
    type: 'website',
  },
}

export default function StatusPage() {
  return <StatusContent />
}
