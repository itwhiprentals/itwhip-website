import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Host Insurance Guide | Earn 90% Revenue | ItWhip P2P Rentals',
  description: 'Keep 90% of your earnings with ItWhip host protection. $1M liability coverage, damage protection, 24/7 claims support. Start earning with your car today.',
  keywords: ['car sharing insurance', 'host protection plan', 'peer to peer car rental insurance', 'turo alternative insurance', 'vehicle rental coverage'],
  openGraph: {
    title: 'Host Insurance Guide | Earn 90% Revenue | ItWhip P2P Rentals',
    description: 'Keep 90% of your earnings with ItWhip host protection. $1M liability, damage protection, 24/7 support.',
    url: 'https://itwhip.com/host-insurance',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itwhip.com/host-insurance',
  },
}

export default function HostInsuranceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
