// app/(guest)/rentals/layout.tsx

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Car Rentals | ItWhip',
  description: 'Rent cars from local hosts and verified partners. Skip the rental counter, get the car you want.',
  keywords: 'car rental, peer to peer car sharing, rent a car, Phoenix car rental, airport car rental',
  alternates: {
    canonical: 'https://itwhip.com/rentals',
  },
  openGraph: {
    title: 'Car Rentals | ItWhip',
    description: 'Rent cars from local hosts and verified partners. Skip the rental counter, get the car you want.',
    url: 'https://itwhip.com/rentals',
    siteName: 'ItWhip',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RentalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}