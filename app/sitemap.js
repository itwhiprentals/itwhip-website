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
    {
      url: `${baseUrl}/cancellation-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
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
    {
      url: `${baseUrl}/sdk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/integrations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/developers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
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
  // VEHICLE TYPE PAGES (HIGH PRIORITY FOR SEO)
  // ============================================
  const vehicleTypes = ['sedan', 'suv', 'luxury', 'sports', 'electric', 'convertible', 'truck', 'coupe', 'exotic']

  const typePages = vehicleTypes.map(type => ({
    url: `${baseUrl}/rentals/types/${type}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // ============================================
  // CAR MAKE PAGES (HIGH PRIORITY FOR SEO)
  // ============================================
  const carMakes = [
    'tesla', 'bmw', 'mercedes', 'porsche', 'lamborghini', 'audi', 'lexus', 'dodge',
    'bentley', 'cadillac', 'ferrari', 'chevrolet', 'land-rover', 'toyota', 'honda', 'ford'
  ]

  const makePages = carMakes.map(make => ({
    url: `${baseUrl}/rentals/makes/${make}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // ============================================
  // AIRPORT PAGES (HIGH PRIORITY FOR SEO)
  // ============================================
  const airportSlugs = ['phoenix-sky-harbor', 'mesa-gateway', 'scottsdale-airport']

  const airportPages = airportSlugs.map(airport => ({
    url: `${baseUrl}/rentals/airports/${airport}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // ============================================
  // NEAR ME & USE CASE PAGES (HIGH PRIORITY FOR SEO)
  // ============================================
  const nearMePages = [
    {
      url: `${baseUrl}/rentals/near-me`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rentals/luxury-near-me`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rentals/suv-near-me`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rentals/exotic-near-me`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const useCasePages = [
    {
      url: `${baseUrl}/rentals/long-term`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rentals/weekend`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rentals/airport-delivery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rentals/road-trip`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rentals/business`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rentals/snowbird`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rentals/spring-training`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // ============================================
  // SUPPORT PAGES
  // ============================================
  const supportPages = [
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support/damage-process`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support/deposits`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support/insurance`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support/cleaning-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // ============================================
  // MAKE/MODEL PAGES (HIGH PRIORITY FOR SEO)
  // ============================================
  const makeModelPages = [
    'tesla/model-y',
    'tesla/model-3',
    'bmw/x5',
    'porsche/cayenne',
    'mercedes/s-class',
    'dodge/hellcat',
    'lamborghini/huracan',
    'bentley/bentayga',
    'ferrari/488',
    'ford/mustang-gt',
    'jeep/wrangler',
    'chevrolet/corvette',
  ].map(path => ({
    url: `${baseUrl}/rentals/makes/${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // ============================================
  // CITY PAGES - Static List (HIGH PRIORITY FOR LOCAL SEO)
  // All 30 locations from CITY_SEO_DATA
  // ============================================

  // Major Arizona Cities (18)
  const arizonaCities = [
    'phoenix',
    'scottsdale',
    'tempe',
    'mesa',
    'chandler',
    'gilbert',
    'glendale',
    'peoria',
    'goodyear',
    'surprise',
    'tucson',
    'sedona',
    'flagstaff',
    'queen-creek',
    'paradise-valley',
    'ahwatukee',
    'avondale',
    'fountain-hills',
  ]

  // Phoenix Metro Neighborhoods (9)
  const phoenixNeighborhoods = [
    'sky-harbor-airport',
    'mesa-gateway-airport',
    'scottsdale-airport',
    'camelback',
    'old-town-scottsdale',
    'biltmore',
    'downtown-phoenix',
    'arcadia',
    'papago-park',
  ]

  // Additional Popular Areas (4)
  const popularAreas = [
    'lake-pleasant',
    'sedona-village',
    'westgate',
    'talking-stick',
  ]

  // Combine all locations for city pages
  const allLocations = [...arizonaCities, ...phoenixNeighborhoods, ...popularAreas]

  const cityPages = allLocations.map(location => ({
    url: `${baseUrl}/rentals/cities/${location}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9, // High priority for local SEO
  }))

  // ============================================
  // BLOG PAGES
  // ============================================
  const blogPages = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
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
    {
      url: `${baseUrl}/blog/best-cars-sedona-road-trip-2025`,
      lastModified: new Date('2025-12-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-phoenix-hosts-earn-2000-month`,
      lastModified: new Date('2025-11-28'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/tesla-rental-phoenix-scottsdale-guide`,
      lastModified: new Date('2025-11-25'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/skip-phoenix-airport-rental-counter`,
      lastModified: new Date('2025-11-22'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/luxury-car-rental-scottsdale-guide`,
      lastModified: new Date('2025-11-20'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/sky-harbor-vs-mesa-gateway-car-rental-2025`,
      lastModified: new Date('2025-12-05'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/cheapest-car-rental-phoenix-budget-guide-2025`,
      lastModified: new Date('2025-12-05'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/car-rental-near-asu-tempe-student-guide-2025`,
      lastModified: new Date('2025-12-05'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/phoenix-to-grand-canyon-road-trip-guide-2025`,
      lastModified: new Date('2025-12-05'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/spring-training-car-rental-phoenix-2025`,
      lastModified: new Date('2025-12-05'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/convertible-rental-arizona-desert-drives-2025`,
      lastModified: new Date('2025-12-05'),
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
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // ============================================
  // STATIC PAGES - Business / B2B
  // ============================================
  const businessPages = [
    {
      url: `${baseUrl}/corporate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // ============================================
  // STATIC PAGES - Driver/Guest Acquisition
  // ============================================
  const driverPages = [
    {
      url: `${baseUrl}/earnings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/private-club`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

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
    ...typePages,      // Vehicle type pages
    ...makePages,      // Car make pages
    ...airportPages,   // Airport pickup pages
    ...nearMePages,    // Near me pages
    ...useCasePages,   // Use case pages (long-term, weekend, etc.)
    ...makeModelPages, // Make/model pages (tesla/model-y, etc.)
    ...supportPages,   // Support/help pages
    ...cityPages,      // Static city pages - always included
    ...blogPages,
    ...otherPages,
    ...businessPages,  // Business / B2B pages
    ...driverPages,    // Driver/Guest acquisition pages
    ...carPages,
  ]
}