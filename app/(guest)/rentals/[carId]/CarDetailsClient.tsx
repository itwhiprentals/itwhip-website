// app/(guest)/rentals/[carId]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

// Server Component - Fetches data and passes to client
export default async function CarDetailsPage({ 
  params 
}: { 
  params: Promise<{ carId: string }> 
}) {
  const { carId } = await params
  
  // Fetch car data server-side
  let car = null
  let error = false
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/rentals/cars/${carId}`,
      { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
    
    if (response.ok) {
      car = await response.json()
    } else if (response.status === 404) {
      error = true
    }
  } catch (err) {
    console.error('Error fetching car:', err)
    error = true
  }
  
  if (error || !car) {
    notFound()
  }
  
  // Pass data to client component for interactivity
  return <CarDetailsClient initialCar={car} carId={carId} />
}