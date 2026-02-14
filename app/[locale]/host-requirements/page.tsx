import { Metadata } from 'next'
import HostRequirementsContent from './HostRequirementsContent'

export const metadata: Metadata = {
  title: 'Host Requirements | ItWhip',
  description: 'Requirements to list your car on ItWhip. Vehicle eligibility, insurance requirements, background checks, and documentation needed to become a host.',
  alternates: {
    canonical: 'https://itwhip.com/host-requirements',
  },
  openGraph: {
    title: 'Host Requirements | ItWhip',
    description: 'What you need to list your car on ItWhip.',
    url: 'https://itwhip.com/host-requirements',
    type: 'website',
  },
}

export default function HostRequirementsPage() {
  return <HostRequirementsContent />
}
