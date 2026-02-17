import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How Insurance Works on ItWhip | Host Earnings Tiers',
  description: 'Understand ItWhip insurance tiers for hosts. Your earnings (40%, 75%, or 90%) depend on what insurance you bring. Up to $1M combined coverage on every trip.',
  keywords: ['car sharing insurance', 'host protection plan', 'p2p insurance tiers', 'car rental host insurance', 'itwhip host earnings'],
  openGraph: {
    title: 'How Insurance Works on ItWhip | Host Tiers',
    description: 'Your earnings depend on what insurance you bring. 40%, 75%, or 90% host earnings based on your tier.',
    url: 'https://itwhip.com/host/insurance-options',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/insurance-options',
  },
}

export default function InsuranceOptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
