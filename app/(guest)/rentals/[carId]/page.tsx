// app/(guest)/rentals/[carId]/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Script from 'next/script'
import CarDetailsClient from './CarDetailsClient'
import { extractCarId, generateCarUrl, isOldUrlFormat } from '@/app/lib/utils/urls'

// Generate dynamic Open Graph metadata for link previews
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ carId: string }> 
}): Promise<Metadata> {
  const { carId: urlSlug } = await params
  
  // Extract the real car ID from the URL (handles both old and new formats)
  const carId = extractCarId(urlSlug)
  
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
        url: `https://itwhip.com${seoUrl}`,  // Use SEO-friendly URL
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
        canonical: `https://itwhip.com${seoUrl}`,  // Use SEO-friendly URL
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
      const redirectResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}/api/rentals/cars/${carId}`,
        { cache: 'no-store' }
      )

      if (redirectResponse.ok) {
        const car = await redirectResponse.json()
        const seoUrl = generateCarUrl({
          id: carId,
          make: car.make,
          model: car.model,
          year: car.year,
          city: car.city
        })
        // 308 permanent redirect to SEO-friendly URL
        redirect(seoUrl)
      }
    } catch (error) {
      console.error('Error during SEO redirect:', error)
      // Continue without redirect if fetch fails
    }
  }

  // Fetch car data for schema markup
  let schemaData = null
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}/api/rentals/cars/${carId}`,
      { cache: 'no-store' }
    )
    
    if (response.ok) {
      const car = await response.json()
      
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
        "image": car.photos?.map((photo: any) => photo.url || photo) || [],
        "description": `Rent this ${car.year} ${car.make} ${car.model} ${car.carType || ''} in ${car.city}, ${car.state}. ${car.seats || 5} seats, ${car.transmission || 'automatic'} transmission.`,
        "brand": {
          "@type": "Brand",
          "name": car.make
        },
        "model": car.model,
        "vehicleModelDate": car.year.toString(),
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
            "returnFees": "https://schema.org/FreeReturn",
            "refundType": "https://schema.org/FullRefund",
            "returnPolicyCountry": "US"
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
                "maxValue": 24,
                "unitCode": "HUR"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 2,
                "unitCode": "HUR"
              }
            }
          }
        },
        // Add aggregate rating if available
        ...(car.rating && car.totalTrips > 0 ? {
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
      <CarDetailsClient params={params} />
    </>
  )
}