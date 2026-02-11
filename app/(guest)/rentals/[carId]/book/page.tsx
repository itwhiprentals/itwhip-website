// app/(guest)/rentals/[carId]/book/page.tsx
import { Metadata } from 'next'
import BookingPageClient from './BookingPageClient'
import { extractCarId, generateCarUrl } from '@/app/lib/utils/urls'
import { getCarForSSR } from '@/app/lib/server/fetchCarDetails'

// Generate dynamic Open Graph metadata showing the car
export async function generateMetadata({
  params
}: {
  params: Promise<{ carId: string }>
}): Promise<Metadata> {
  const { carId: urlSlug } = await params

  // Extract the real car ID from the URL (handles both old and new formats)
  const carId = extractCarId(urlSlug)

  try {
    const car = await getCarForSSR(carId)

    if (!car) {
      return {
        title: 'Book Your Rental - ItWhip',
        description: 'Complete your car rental booking.',
      }
    }

    // Get the hero image
    const imageUrl = car.photos?.[0]?.url || 'https://itwhip.com/og-default-car.jpg'

    // Build rating/trips info for title
    const ratingText = car.rating ? `★${car.rating.toFixed(1)}` : ''
    const tripsText = car.totalTrips ? `${car.totalTrips} trips` : ''
    const statsText = [ratingText, tripsText].filter(Boolean).join(' · ')

    const title = statsText
      ? `Rent ${car.year} ${car.make} ${car.model} · ${statsText} · $${car.dailyRate}/day | ItWhip`
      : `Rent ${car.year} ${car.make} ${car.model} - $${car.dailyRate}/day | ItWhip`
    const description = `Book this ${car.year} ${car.make} ${car.model} on ItWhip. ${car.seats} seats, ${car.carType || 'vehicle'}. Secure checkout with identity verification.`

    // Generate the SEO-friendly URL for OpenGraph
    const seoUrl = generateCarUrl({
      id: carId,
      make: car.make,
      model: car.model,
      year: car.year,
      city: car.city
    })

    return {
      title,
      description,

      // Open Graph - Shows car image in link previews
      openGraph: {
        title,
        description,
        url: `https://itwhip.com${seoUrl}/book`,
        siteName: 'ItWhip Rentals',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${car.year} ${car.make} ${car.model}`,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: `Book ${car.year} ${car.make} ${car.model} - $${car.dailyRate}/day`,
        description,
        images: [imageUrl],
        site: '@itwhip',
        creator: '@itwhip',
      },
    }
  } catch (error) {
    console.error('Error fetching car for metadata:', error)
    return {
      title: 'Book Your Rental - ItWhip',
      description: 'Complete your car rental booking.',
    }
  }
}

export default async function BookingPage({
  params
}: {
  params: Promise<{ carId: string }>
}) {
  const { carId: urlSlug } = await params
  const carId = extractCarId(urlSlug)

  return <BookingPageClient carId={carId} />
}
