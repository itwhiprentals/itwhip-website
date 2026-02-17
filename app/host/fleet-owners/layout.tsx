import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enterprise Fleet Management Platform | Fleet Owners | ItWhip',
  description: 'Enterprise-grade fleet management with Mileage Forensics™, ESG reporting, and insurance intelligence. Manage 5+ vehicles with dedicated support, bulk tools, and carrier-integrated compliance.',
  keywords: [
    'enterprise fleet management',
    'fleet owner car sharing',
    'commercial fleet rental',
    'mileage forensics',
    'ESG fleet reporting',
    'insurance intelligence platform',
    'phoenix fleet rental',
    'fleet compliance management',
    'P2P fleet platform'
  ],
  openGraph: {
    title: 'Enterprise Fleet Management Platform | ItWhip',
    description: 'The only platform where your fleet data becomes your competitive advantage. Mileage Forensics™, ESG reporting, and insurance intelligence built-in.',
    url: 'https://itwhip.com/host/fleet-owners',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/fleet-owners',
  },
}

export default function FleetOwnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
