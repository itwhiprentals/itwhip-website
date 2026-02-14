// app/(guest)/rentals/[carId]/page.tsx
import { Metadata, Viewport } from 'next'
import { redirect, notFound } from 'next/navigation'
import Script from 'next/script'

// Helper to detect Next.js redirect errors (works across Next.js versions)
function isNextRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'digest' in error &&
    typeof (error as any).digest === 'string' &&
    (error as any).digest.startsWith('NEXT_REDIRECT')
  )
}
import CarDetailsClient from './CarDetailsClient'
import { extractCarId, generateCarUrl, isOldUrlFormat } from '@/app/lib/utils/urls'
import { getRelatedCars } from '@/app/lib/server/fetchSimilarCars'
import { getCarForSSR } from '@/app/lib/server/fetchCarDetails'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'

// Black theme color for car detail page - makes status bar blend with photo on mobile
export const viewport: Viewport = {
  themeColor: '#000000',
}

// Generate dynamic Open Graph metadata for link previews
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; carId: string }>
}): Promise<Metadata> {
  const { locale, carId: urlSlug } = await params
  
  // Extract the real car ID from the URL (handles both old and new formats)
  const carId = extractCarId(urlSlug)
  
  try {
    const car = await getCarForSSR(carId)

    if (!car) {
      return {
        title: 'Car Not Found - ItWhip Rentals',
        description: 'This car is no longer available.',
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
    const description = `Rent this ${car.year} ${car.make} ${car.model} in ${car.city}, ${car.state}. ${car.seats} seats, ${car.transmission || 'automatic'} transmission. ${car.instantBook ? 'Book instantly!' : 'Contact host to book.'}`
    
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
      
      // Open Graph - THIS MAKES LINK PREVIEWS WORK
      openGraph: {
        title,
        description,
        url: getCanonicalUrl(seoUrl, locale),
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
        locale: getOgLocale(locale),
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
        canonical: getCanonicalUrl(seoUrl, locale),
        languages: getAlternateLanguages(seoUrl),
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
export default async function CarDetailsPage({
  params
}: {
  params: Promise<{ carId: string }>
}) {
  const { carId: urlSlug } = await params
  const carId = extractCarId(urlSlug)

  // If using old URL format (raw ID), redirect to SEO-friendly URL
  if (isOldUrlFormat(urlSlug)) {
    try {
      const redirectCar = await getCarForSSR(carId)

      if (redirectCar) {
        const seoUrl = generateCarUrl({
          id: carId,
          make: redirectCar.make,
          model: redirectCar.model,
          year: redirectCar.year,
          city: redirectCar.city
        })
        // 308 permanent redirect to SEO-friendly URL
        redirect(seoUrl)
      }
    } catch (error) {
      // Re-throw redirect errors - they're not real errors, just Next.js redirect mechanism
      if (isNextRedirectError(error)) {
        throw error
      }
      console.error('Error during SEO redirect:', error)
      // Continue without redirect if fetch fails
    }
  }

  // Fetch car data for schema markup and 404 check
  let schemaData = null
  let car = null
  let relatedCars: { similarCars: any[]; hostCars: any[] } = { similarCars: [], hostCars: [] }

  try {
    car = await getCarForSSR(carId)

    // Return proper 404 for missing cars (fixes soft 404 SEO issue)
    if (!car) {
      notFound()
    }

    if (car) {
      // Fetch related cars (similar cars + host cars) for SSR
      relatedCars = await getRelatedCars(
        carId,
        car.hostId || car.host?.id,
        car.carType,
        car.city
      ) as any

      // Generate SEO URL
      const seoUrl = generateCarUrl({
        id: carId,
        make: car.make,
        model: car.model,
        year: car.year,
        city: car.city
      })
      
      // Build schema.org JSON-LD
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${car.year} ${car.make} ${car.model}`,
        "image": car.photos?.length > 0
          ? car.photos.map((photo: any) => photo.url || photo)
          : ["https://itwhip.com/placeholder-car.jpg"],
        "description": `Rent this ${car.year} ${car.make} ${car.model} ${car.carType || ''} in ${car.city}, ${car.state}. ${car.seats || 5} seats, ${car.transmission || 'automatic'} transmission.`,
        "brand": {
          "@type": "Brand",
          "name": car.make
        },
        "model": car.model,
        "vehicleModelDate": car.year?.toString() || "",
        "vehicleConfiguration": car.carType || "sedan",
        "vehicleTransmission": car.transmission || "automatic",
        "vehicleSeatingCapacity": car.seats || 5,
        "fuelType": car.fuelType || "gasoline",
        "offers": {
          "@type": "Offer",
          "url": `https://itwhip.com${seoUrl}`,
          "priceCurrency": "USD",
          "price": car.dailyRate,
          "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          "availability": "https://schema.org/InStock",
          "validFrom": new Date().toISOString(),
          "seller": {
            "@type": "Organization",
            "name": car.host?.name || "ItWhip",
            "image": car.host?.profilePhoto || "https://itwhip.com/logo.png"
          },
          // Merchant Return Policy (Cancellation Policy for rentals)
          // 72+ hours before pickup = full refund per ItWhip Terms of Service
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "US",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 3,
            "returnMethod": "https://schema.org/ReturnAtKiosk",
            "returnFees": "https://schema.org/FreeReturn",
            "refundType": "https://schema.org/FullRefund"
          },
          // Shipping Details (Delivery for car rentals)
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": car.deliveryFee || 0,
              "currency": "USD"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "US",
              "addressRegion": "AZ"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 1,
                "unitCode": "d"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 1,
                "unitCode": "d"
              }
            }
          }
        },
        // Add aggregate rating only if car has real trips (avoids 5.0 default)
        ...(car.rating > 0 && car.totalTrips > 0 ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": car.rating,
            "reviewCount": car.totalTrips,
            "bestRating": "5",
            "worstRating": "1"
          }
        } : {}),
        // Add reviews if available
        ...(car.reviews && car.reviews.length > 0 ? {
          "review": car.reviews.slice(0, 5).map((review: any) => ({
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": review.reviewerName || review.reviewerProfile?.name || "Anonymous"
            },
            "datePublished": review.createdAt,
            "reviewBody": review.comment,
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": review.rating,
              "bestRating": "5",
              "worstRating": "1"
            }
          }))
        } : {}),
        // Location information
        "availableAtOrFrom": {
          "@type": "Place",
          "name": `${car.city}, ${car.state}`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": car.city,
            "addressRegion": car.state,
            "postalCode": car.zipCode,
            "addressCountry": "US"
          },
          ...(car.location?.lat && car.location?.lng ? {
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": car.location.lat,
              "longitude": car.location.lng
            }
          } : {})
        }
      }
    }
  } catch (error) {
    console.error('Error generating schema:', error)
    // Also return 404 on fetch errors (network issues, etc)
    notFound()
  }
  
  return (
    <>
      {/* Add JSON-LD structured data */}
      {schemaData && (
        <Script
          id="car-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaData)
          }}
        />
      )}
      
      {/* CarDetailsClient expects params as a prop and will fetch its own data */}
      {/* Pass SSR-fetched related cars for SEO (Google can see these links) */}
      <CarDetailsClient
        params={params}
        initialSimilarCars={relatedCars.similarCars}
        initialHostCars={relatedCars.hostCars}
      />
    </>
  )
}