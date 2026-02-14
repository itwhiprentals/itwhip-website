import { Metadata } from 'next'
import IntegrationsContent from './IntegrationsContent'

export const metadata: Metadata = {
  title: 'Technology Integrations | ItWhip',
  description: 'Connect ItWhip with Stripe for payments, GPS tracking for vehicles, and fleet management tools. API documentation and developer resources for car rental integrations.',
  alternates: {
    canonical: 'https://itwhip.com/integrations',
  },
  openGraph: {
    title: 'Technology Integrations | ItWhip',
    description: 'ItWhip integrations for payments, GPS tracking, and fleet management. Developer-friendly APIs.',
    url: 'https://itwhip.com/integrations',
    type: 'website',
  },
}

export default function IntegrationsPage() {
  return <IntegrationsContent />
}
