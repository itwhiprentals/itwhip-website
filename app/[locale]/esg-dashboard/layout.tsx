import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ESG Car Rental Arizona | Sustainable Car Sharing Phoenix, Scottsdale, Tempe | ItWhip',
  description: 'Arizona\'s first ESG-focused car rental platform. Track carbon savings, rent eco-friendly vehicles in Phoenix, Scottsdale, and Tempe. Electric vehicles, hybrid cars, sustainability badges, and CSRD-compliant reporting for corporate travel.',
  keywords: [
    'ESG car rental Arizona',
    'ESG car rental Arizona 2025',
    'sustainable car rental Phoenix',
    'eco-friendly car sharing Arizona',
    'green car rental Phoenix',
    'electric vehicle rental Arizona',
    'carbon neutral car rental',
    'sustainable transportation Phoenix',
    'hybrid car rental Scottsdale',
    'environmental car sharing',
    'green mobility Arizona'
  ],
  openGraph: {
    title: 'ESG Car Rental Arizona | Sustainable Car Sharing',
    description: 'Arizona\'s first ESG-focused P2P car rental. Track your carbon savings, rent EVs, earn sustainability badges.',
    url: 'https://itwhip.com/esg-dashboard',
    siteName: 'ItWhip',
    type: 'website',
    images: [{ url: 'https://itwhip.com/og/esg-dashboard.png', width: 1200, height: 630, alt: 'ItWhip ESG Car Rental Dashboard' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESG Car Rental Arizona | ItWhip',
    description: 'Track your environmental impact with every rental. Arizona\'s sustainable P2P car sharing platform.',
  },
  alternates: { canonical: 'https://itwhip.com/esg-dashboard' },
}

export default function ESGDashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
