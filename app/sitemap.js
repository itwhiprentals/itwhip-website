// app/sitemap.js
// Dynamic sitemap for ItWhip - P2P Car Sharing Platform
// Revalidates every hour (ISR)

export const revalidate = 3600 // 1 hour

export default async function sitemap() {
  const baseUrl = 'https://itwhip.com'
  
  // ============================================
  // STATIC PAGES - Core Site
  // ============================================
  const corePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // ============================================
  // STATIC PAGES - Legal & Compliance
  // ============================================
  const legalPages = [
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/coverage`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // ============================================
  // STATIC PAGES - Host Acquisition (HIGH PRIORITY)
  // ============================================
  const hostPages = [
    {
      url: `${baseUrl}/host/signup`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/host/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/list-your-car`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/host-benefits`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/host-earnings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/host-insurance`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/host-requirements`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/host-protection`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insurance-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/switch-from-turo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // ============================================
  // STATIC PAGES - Platform Features
  // ============================================
  const featurePages = [
    {
      url: `${baseUrl}/mileage-forensics`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/esg-dashboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // ============================================
  // STATIC PAGES - Guest Rental (HIGH PRIORITY)
  // ============================================
  const rentalPages = [
    {
      url: `${baseUrl}/rentals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rentals/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rentals/cities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // ============================================
  // BLOG PAGES (NEW)
  // ============================================
  const blogPages = [
    // Main blog listing
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Individual blog posts
    {
      url: `${baseUrl}/blog/turo-vs-itwhip-arizona-2025`,
      lastModified: new Date('2025-11-20'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/renting-out-car-worth-it`,
      lastModified: new Date('2025-11-18'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/p2p-insurance-tiers`,
      lastModified: new Date('2025-11-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/esg-car-sharing`,
      lastModified: new Date('2025-11-12'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/phoenix-airport-alternatives`,
      lastModified: new Date('2025-11-10'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // ============================================
  // STATIC PAGES - Other
  // ============================================
  const otherPages = [
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/phoenix`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // ============================================
  // DYNAMIC PAGES - City Hubs (from database)
  // ============================================
  let cityPages = []
  try {
    const carsResponse = await fetch(`${baseUrl}/api/rentals/search?limit=1000`, {
      next: { revalidate: 3600 }
    })
    
    if (carsResponse.ok) {
      const data = await carsResponse.json()
      const cars = data.results || data.cars || data || []
      
      const cities = [...new Set(cars
        .map(car => car.city)
        .filter(city => city && city.trim() !== '')
      )]
      
      cityPages = cities.map(city => {
        const citySlug = city.toLowerCase().replace(/\s+/g, '-')
        return {
          url: `${baseUrl}/rentals/cities/${citySlug}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        }
      })
    }
  } catch (error) {
    console.error('Error fetching cities for sitemap:', error)
    
    const fallbackCities = ['phoenix', 'scottsdale', 'tempe', 'mesa', 'chandler', 'glendale', 'gilbert']
    cityPages = fallbackCities.map(city => ({
      url: `${baseUrl}/rentals/cities/${city}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }))
  }

  // ============================================
  // DYNAMIC PAGES - Car Listings (from database)
  // ============================================
  let carPages = []
  try {
    const response = await fetch(`${baseUrl}/api/rentals/search?limit=1000`, {
      next: { revalidate: 3600 }
    })
    
    if (response.ok) {
      const data = await response.json()
      const cars = data.results || data.cars || data || []
      
      carPages = cars
        .filter(car => car.id && car.make && car.model && car.year)
        .map(car => {
          const slug = `${car.year}-${car.make}-${car.model}-${car.city || 'phoenix'}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
          
          return {
            url: `${baseUrl}/rentals/${slug}-${car.id}`,
            lastModified: car.updatedAt ? new Date(car.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          }
        })
    }
  } catch (error) {
    console.error('Error fetching cars for sitemap:', error)
  }

  // ============================================
  // COMBINE ALL PAGES
  // ============================================
  return [
    ...corePages,
    ...legalPages,
    ...hostPages,
    ...featurePages,
    ...rentalPages,
    ...blogPages,  // NEW: Blog pages added
    ...otherPages,
    ...cityPages,
    ...carPages,
  ]
}