import { Metadata } from 'next'
import InvestorsContent from './InvestorsContent'

export const metadata: Metadata = {
  title: 'Investor Relations | ItWhip',
  description: 'Investment opportunities in Arizona\'s leading peer-to-peer car rental platform. Learn about ItWhip\'s growth, market opportunity, and partnership options.',
  alternates: {
    canonical: 'https://itwhip.com/investors',
  },
  openGraph: {
    title: 'Investor Relations | ItWhip',
    description: 'Investment opportunities in Arizona\'s P2P car rental marketplace.',
    url: 'https://itwhip.com/investors',
    type: 'website',
  },
}

export default function InvestorsPage() {
  return <InvestorsContent />
}
