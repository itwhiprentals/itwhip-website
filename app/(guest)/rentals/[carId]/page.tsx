// app/(guest)/rentals/[carId]/page.tsx
import { Metadata } from 'next'
import CarDetailsClient from './CarDetailsClient'

// Generate dynamic Open Graph metadata for link previews
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ carId: string }> 
}): Promise<Metadata> {
  const { carId } = await params
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}/api/rentals/cars/${carId}`,
      { cache: 'no-store' }
    )
    
    if (!response.ok) {
      return {
        title: 'Car Not Found - ItWhip Rentals',
        description: 'This car is no longer available.',
      }
    }
    
    const car = await response.json()
    
    // Get the hero image
    const imageUrl = car.photos?.[0]?.url || 'https://itwhip.com/og-default-car.jpg'
    const title = `${car.year} ${car.make} ${car.model} - $${car.dailyRate}/day | ItWhip`
    const description = `Rent this ${car.year} ${car.make} ${car.model} in ${car.city}, ${car.state}. ${car.seats} seats, ${car.transmission || 'automatic'} transmission. ${car.instantBook ? 'Book instantly!' : 'Contact host to book.'}`
    
    return {
      title,
      description,
      
      // Open Graph - THIS MAKES LINK PREVIEWS WORK
      openGraph: {
        title,
        description,
        url: `https://itwhip.com/rentals/${carId}`,
        siteName: 'ItWhip Rentals',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${car.year} ${car.make} ${car.model}`,
          },
          // Add more photos if available
          ...(car.photos?.slice(1, 4).map((photo: any) => ({
            url: photo.url,
            width: 800,
            height: 600,
            alt: `${car.make} ${car.model} - Additional Photo`,
          })) || [])
        ],
        locale: 'en_US',
        type: 'website',
      },
      
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: `${car.year} ${car.make} ${car.model} - $${car.dailyRate}/day`,
        description,
        images: [imageUrl],
        site: '@itwhip',
        creator: '@itwhip',
      },
      
      // Additional SEO
      alternates: {
        canonical: `https://itwhip.com/rentals/${carId}`,
      },
      
      keywords: `${car.make}, ${car.model}, car rental ${car.city}, luxury car rental, ${car.carType || 'car'} rental Phoenix`,
      
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'ItWhip Car Rentals',
      description: 'Premium car rentals in Phoenix',
    }
  }
}

// Server Component - Pass params as CarDetailsClient expects
export default function CarDetailsPage({ 
  params 
}: { 
  params: Promise<{ carId: string }> 
}) {
  // CarDetailsClient expects params as a prop and will fetch its own data
  return <CarDetailsClient params={params} />
}