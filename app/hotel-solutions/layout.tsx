import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotel Car Delivery Phoenix | Free Drop-off Service | ItWhip',
  description: 'Partner with ItWhip for seamless hotel car delivery in Phoenix & Scottsdale. Free drop-off, 24/7 support, zero logistics headaches. Delight your guests today.',
  keywords: ['hotel car delivery phoenix', 'hotel car rental partnership', 'concierge car service', 'scottsdale hotel cars', 'guest transportation solutions'],
  openGraph: {
    title: 'Hotel Car Delivery Phoenix | Free Drop-off Service | ItWhip',
    description: 'Partner with ItWhip for seamless hotel car delivery. Free drop-off, 24/7 support, zero logistics headaches.',
    url: 'https://itwhip.com/hotel-solutions',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itwhip.com/hotel-solutions',
  },
}

export default function HotelSolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
