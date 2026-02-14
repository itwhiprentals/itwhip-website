// app/tracking/layout.tsx
// Layout with metadata for public tracking page

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fleet Tracking | ItWhip+ Vehicle Management',
  description: 'Track your rental fleet in real-time with ItWhip+. GPS tracking, speed alerts, geofencing, remote lock/unlock, and exclusive Mileage Forensics. Compare Bouncie, Smartcar, Zubie, and more.',
  openGraph: {
    title: 'Fleet Tracking | ItWhip+ Vehicle Management',
    description: 'Track your rental fleet in real-time with ItWhip+. GPS tracking, remote lock/unlock, geofencing, speed alerts, and more.',
    url: 'https://itwhip.com/tracking',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/tracking',
  },
}

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
