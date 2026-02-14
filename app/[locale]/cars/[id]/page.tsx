// app/cars/[id]/page.tsx
// Redirect old /cars/[id] URLs to the correct /rentals/[id] path

import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CarRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/rentals/${id}`)
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return {
    title: 'Redirecting...',
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `/rentals/${id}`,
    },
  }
}
