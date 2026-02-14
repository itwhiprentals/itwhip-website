import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corporate Car Rental Phoenix | ESG Fleet Solutions | ItWhip',
  description: 'Reduce fleet costs 40% with ItWhip corporate car rentals in Arizona. ESG-friendly, flexible terms, dedicated account manager. Request a demo today.',
  keywords: ['corporate car rental phoenix', 'business fleet rental', 'ESG fleet solutions', 'corporate vehicle program', 'arizona business rentals'],
  openGraph: {
    title: 'Corporate Car Rental Phoenix | ESG Fleet Solutions | ItWhip',
    description: 'Reduce fleet costs 40% with ItWhip corporate car rentals. ESG-friendly, flexible terms, dedicated support.',
    url: 'https://itwhip.com/corporate',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itwhip.com/corporate',
  },
}

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
