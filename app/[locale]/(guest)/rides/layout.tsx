// app/(guest)/rides/layout.tsx

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rides - ItWhip',
  description: 'Book instant luxury rides with no surge pricing. Skip the wait, travel in style.',
}

export default function RidesLayout({
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