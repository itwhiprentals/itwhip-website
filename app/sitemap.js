// app/sitemap.js
// Dynamic sitemap for ITWhip - P2P Car Sharing Platform
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
    // Fetch unique cities from cars
    const carsResponse = await fetch(`${baseUrl}/api/rentals/search?limit=1000`, {
      next: { revalidate: 3600 }
    })
    
    if (carsResponse.ok) {
      const data = await carsResponse.json()
      const cars = data.results || data.cars || data || []
      
      // Extract unique cities
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
    
    // Fallback: Known Arizona cities
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
          // Generate SEO-friendly slug matching generateCarUrl()
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
    // Continue without car pages if fetch fails
  }

  // ============================================
  // COMBINE ALL PAGES
  // ============================================
  return [
    ...corePages,
    ...legalPages,
    ...hostPages,
    ...rentalPages,
    ...otherPages,
    ...cityPages,
    ...carPages,
  ]
}