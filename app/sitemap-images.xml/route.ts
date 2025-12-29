// app/sitemap-images.xml/route.ts
// Image Sitemap for ItWhip - Helps search engines discover car images
// Google Image Sitemap format: https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps

import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1 hour

interface CarImage {
  loc: string
  title: string
  caption?: string
  geoLocation?: string
  license?: string
}

interface PageWithImages {
  pageUrl: string
  images: CarImage[]
}

export async function GET() {
  const baseUrl = 'https://itwhip.com'
  const cloudinaryBase = 'https://res.cloudinary.com/itwhip/image/upload'

  const pagesWithImages: PageWithImages[] = []

  // ============================================
  // STATIC PAGES WITH IMAGES
  // ============================================

  // Homepage hero images
  pagesWithImages.push({
    pageUrl: baseUrl,
    images: [
      {
        loc: `${cloudinaryBase}/v1/hero/phoenix-car-rental-hero.jpg`,
        title: 'Car Rental in Phoenix Arizona - ItWhip P2P Car Sharing',
        caption: 'Rent cars directly from local owners in Phoenix, Scottsdale, and across Arizona',
        geoLocation: 'Phoenix, Arizona, USA'
      },
      {
        loc: `${cloudinaryBase}/v1/hero/luxury-car-scottsdale.jpg`,
        title: 'Luxury Car Rental Scottsdale - Tesla, BMW, Mercedes',
        caption: 'Premium vehicle rentals from verified hosts in Scottsdale',
        geoLocation: 'Scottsdale, Arizona, USA'
      }
    ]
  })

  // Rentals page
  pagesWithImages.push({
    pageUrl: `${baseUrl}/rentals`,
    images: [
      {
        loc: `${cloudinaryBase}/v1/rentals/browse-cars-phoenix.jpg`,
        title: 'Browse Car Rentals Phoenix - All Vehicle Types Available',
        caption: 'Find the perfect car for your trip in the Phoenix metro area',
        geoLocation: 'Phoenix, Arizona, USA'
      }
    ]
  })

  // ============================================
  // VEHICLE TYPE PAGES
  // ============================================
  const vehicleTypes = [
    { slug: 'sedan', title: 'Sedan Rentals Phoenix', caption: 'Comfortable sedans for city driving' },
    { slug: 'suv', title: 'SUV Rentals Arizona', caption: 'Spacious SUVs perfect for family trips' },
    { slug: 'luxury', title: 'Luxury Car Rentals Scottsdale', caption: 'Premium vehicles from top brands' },
    { slug: 'sports', title: 'Sports Car Rentals Phoenix', caption: 'High-performance sports cars' },
    { slug: 'electric', title: 'Electric Car Rentals - Tesla and More', caption: 'Eco-friendly electric vehicles' },
    { slug: 'convertible', title: 'Convertible Rentals Arizona', caption: 'Open-top driving in perfect weather' },
    { slug: 'truck', title: 'Truck Rentals Phoenix', caption: 'Pickup trucks for work or adventure' },
    { slug: 'exotic', title: 'Exotic Car Rentals Scottsdale', caption: 'Lamborghini, Ferrari, and more' },
  ]

  vehicleTypes.forEach(type => {
    pagesWithImages.push({
      pageUrl: `${baseUrl}/rentals/types/${type.slug}`,
      images: [
        {
          loc: `${cloudinaryBase}/v1/types/${type.slug}-rental-arizona.jpg`,
          title: type.title,
          caption: type.caption,
          geoLocation: 'Arizona, USA'
        }
      ]
    })
  })

  // ============================================
  // CAR MAKE PAGES
  // ============================================
  const carMakes = [
    { slug: 'tesla', title: 'Tesla Rentals Phoenix - Model 3, Model Y, Model S' },
    { slug: 'bmw', title: 'BMW Rentals Scottsdale - X5, M3, and More' },
    { slug: 'mercedes', title: 'Mercedes-Benz Rentals Arizona' },
    { slug: 'porsche', title: 'Porsche Rentals Phoenix - Cayenne, 911, Panamera' },
    { slug: 'lamborghini', title: 'Lamborghini Rentals Scottsdale - Huracan, Urus' },
    { slug: 'audi', title: 'Audi Rentals Phoenix - Q7, A4, RS Models' },
    { slug: 'lexus', title: 'Lexus Rentals Arizona - RX, ES, LC' },
    { slug: 'dodge', title: 'Dodge Rentals Phoenix - Challenger, Charger, Hellcat' },
    { slug: 'jeep', title: 'Jeep Rentals Arizona - Wrangler, Grand Cherokee' },
    { slug: 'ford', title: 'Ford Rentals Phoenix - Mustang, F-150, Bronco' },
  ]

  carMakes.forEach(make => {
    pagesWithImages.push({
      pageUrl: `${baseUrl}/rentals/makes/${make.slug}`,
      images: [
        {
          loc: `${cloudinaryBase}/v1/makes/${make.slug}-rental-phoenix.jpg`,
          title: make.title,
          caption: `Rent a ${make.slug.charAt(0).toUpperCase() + make.slug.slice(1)} from local owners in Arizona`,
          geoLocation: 'Phoenix, Arizona, USA'
        }
      ]
    })
  })

  // ============================================
  // CITY PAGES
  // ============================================
  const cities = [
    { slug: 'phoenix', name: 'Phoenix' },
    { slug: 'scottsdale', name: 'Scottsdale' },
    { slug: 'tempe', name: 'Tempe' },
    { slug: 'mesa', name: 'Mesa' },
    { slug: 'chandler', name: 'Chandler' },
    { slug: 'gilbert', name: 'Gilbert' },
    { slug: 'sedona', name: 'Sedona' },
    { slug: 'tucson', name: 'Tucson' },
  ]

  cities.forEach(city => {
    pagesWithImages.push({
      pageUrl: `${baseUrl}/rentals/cities/${city.slug}`,
      images: [
        {
          loc: `${cloudinaryBase}/v1/cities/${city.slug}-car-rental.jpg`,
          title: `Car Rental ${city.name} Arizona - ItWhip`,
          caption: `Find cars for rent in ${city.name} from local hosts`,
          geoLocation: `${city.name}, Arizona, USA`
        }
      ]
    })
  })

  // ============================================
  // AIRPORT PAGES
  // ============================================
  pagesWithImages.push({
    pageUrl: `${baseUrl}/rentals/airports/phoenix-sky-harbor`,
    images: [
      {
        loc: `${cloudinaryBase}/v1/airports/sky-harbor-car-rental.jpg`,
        title: 'Phoenix Sky Harbor Airport Car Rental - PHX',
        caption: 'Skip the rental counter with ItWhip airport delivery',
        geoLocation: 'Phoenix Sky Harbor International Airport, Arizona, USA'
      }
    ]
  })

  pagesWithImages.push({
    pageUrl: `${baseUrl}/rentals/airports/mesa-gateway`,
    images: [
      {
        loc: `${cloudinaryBase}/v1/airports/mesa-gateway-car-rental.jpg`,
        title: 'Mesa Gateway Airport Car Rental - AZA',
        caption: 'Convenient car pickup at Phoenix-Mesa Gateway Airport',
        geoLocation: 'Phoenix-Mesa Gateway Airport, Arizona, USA'
      }
    ]
  })

  // ============================================
  // FETCH DYNAMIC CAR LISTINGS
  // ============================================
  try {
    const response = await fetch(`${baseUrl}/api/rentals/search?limit=500`, {
      next: { revalidate: 3600 }
    })

    if (response.ok) {
      const data = await response.json()
      const cars = data.results || data.cars || data || []

      cars.forEach((car: any) => {
        if (car.id && car.make && car.model && car.year && car.images?.length > 0) {
          const slug = `${car.year}-${car.make}-${car.model}-${car.city || 'phoenix'}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

          const carImages: CarImage[] = car.images.slice(0, 5).map((img: string, idx: number) => ({
            loc: img,
            title: idx === 0
              ? `${car.year} ${car.make} ${car.model} for Rent in ${car.city || 'Phoenix'}`
              : `${car.year} ${car.make} ${car.model} - Photo ${idx + 1}`,
            caption: `${car.year} ${car.make} ${car.model} available for rent from $${car.dailyPrice || car.price}/day`,
            geoLocation: `${car.city || 'Phoenix'}, Arizona, USA`
          }))

          pagesWithImages.push({
            pageUrl: `${baseUrl}/rentals/${slug}-${car.id}`,
            images: carImages
          })
        }
      })
    }
  } catch (error) {
    console.error('Error fetching cars for image sitemap:', error)
  }

  // ============================================
  // GENERATE XML
  // ============================================
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pagesWithImages.map(page => `  <url>
    <loc>${page.pageUrl}</loc>
${page.images.map(img => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
${img.caption ? `      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
${img.geoLocation ? `      <image:geo_location>${escapeXml(img.geoLocation)}</image:geo_location>` : ''}
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
