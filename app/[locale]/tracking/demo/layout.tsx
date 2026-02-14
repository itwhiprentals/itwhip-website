import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Fleet Demo | ItWhip+ Vehicle Tracking',
  description: 'Experience the ItWhip+ fleet tracking dashboard in action. Live GPS, remote commands, geofencing, speed alerts, and Mileage Forensics. No signup required.',
  openGraph: {
    title: 'Live Fleet Demo | ItWhip+ Vehicle Tracking',
    description: 'Experience the ItWhip+ fleet tracking dashboard. Live GPS, remote commands, and real-time alerts.',
    url: 'https://itwhip.com/tracking/demo',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itwhip.com/tracking/demo',
  },
}

export default function TrackingDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
