import { Metadata } from 'next'
import HostDashboardContent from './HostDashboardContent'

export const metadata: Metadata = {
  title: 'Host Dashboard | ItWhip',
  description: 'Manage your ItWhip car listings, bookings, earnings, and guest communications. Host control center for Arizona car sharing.',
  alternates: {
    canonical: 'https://itwhip.com/host-dashboard',
  },
  openGraph: {
    title: 'Host Dashboard | ItWhip',
    description: 'Manage your car listings and bookings on ItWhip.',
    url: 'https://itwhip.com/host-dashboard',
    type: 'website',
  },
}

export default function HostDashboardPage() {
  return <HostDashboardContent />
}
