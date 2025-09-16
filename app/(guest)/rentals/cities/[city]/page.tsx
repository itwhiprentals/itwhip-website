// app/(guest)/rentals/cities/[city]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import CitySearchWrapper from '@/app/(guest)/rentals/cities/[city]/CitySearchWrapper'
import { 
  IoLocationOutline, 
  IoArrowBackOutline,
  IoFlashOutline,
  IoStarSharp,
  IoCarOutline,
  IoStarOutline,
  IoCarSportOutline
} from 'react-icons/io5'

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ city: string }> 
}): Promise<Metadata> {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')
  
  // Get car count for this city
  const carCount = await prisma.rentalCar.count({
    where: { 
      city: {
        equals: cityName,
        mode: 'insensitive'
      },
      isActive: true 
    }
  })

  return {
    title: `${cityName} Car Rentals | ${carCount} Cars Available | ItWhip`,
    description: `Rent cars in ${cityName}, Arizona from $45/day. ${carCount} vehicles available including luxury, economy, and SUVs. Instant booking and free delivery available.`,
    openGraph: {
      title: `${cityName} Car Rentals - ${carCount} Available | ItWhip`,
      description: `Browse ${carCount} rental cars in ${cityName}. From luxury to economy, find your perfect ride with instant booking.`,
      url: `https://itwhip.com/rentals/cities/${city}`,
      images: [`/og-${city}.jpg`],
    },
    alternates: {
      canonical: `https://itwhip.com/rentals/cities/${city}`,
    },
  }
}

// Generate static paths for known cities
export async function generateStaticParams() {
  const cities = await prisma.rentalCar.findMany({
    where: { isActive: true },
    select: { city: true },
    distinct: ['city'],
  })

  return cities.map((item) => ({
    city: (item.city || 'phoenix').toLowerCase().replace(/\s+/g, '-'),
  }))
}

// Car Card Component - More rectangular/horizontal
function CarCard({ car, cityName }: { car: any, cityName: string }) {
  const imageUrl = car.photos?.[0]?.url || 
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop'
  
  const showLocalHostBadge = car.host && !car.instantBook
  const carUrl = generateCarUrl({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    city: car.city || cityName
  })

  return (
    <Link
      href={carUrl}
      className="flex-shrink-0 w-64 sm:w-72 group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image Container - Wide rectangular */}
      <div className="relative h-24 sm:h-28 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Badges - Smaller */}
        <div className="absolute top-2 left-2 flex gap-1">
          {showLocalHostBadge && (
            <span className="px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center gap-1">
              <IoStarSharp className="w-2.5 h-2.5" />
              HOST
            </span>
          )}
          {car.instantBook && (
            <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center gap-1">
              <IoFlashOutline className="w-2.5 h-2.5" />
              INSTANT
            </span>
          )}
        </div>
        
        {/* Price Badge - Smaller */}
        <div className="absolute bottom-2 right-2">
          <div className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-md shadow-lg">
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ${car.dailyRate}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">/day</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content - Compact */}
      <div className="p-3">
        {/* Title - Make and Model on separate lines */}
        <div className="mb-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {car.year} {car.make}
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
            {car.model}
          </div>
        </div>
        
        {/* Car Type, Specs, Rating & Trips - All in one row */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
          <span className="capitalize">{car.carType?.toLowerCase() || 'sedan'}</span>
          <span>•</span>
          <span>{car.seats} seats</span>
          {car.rating && (
            <>
              <span>•</span>
              <div className="flex items-center gap-0.5">
                <IoStarOutline className="w-2.5 h-2.5 text-amber-400 fill-current" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {car.rating.toFixed(1)}
                </span>
              </div>
            </>
          )}
          <span>•</span>
          <span>{car.totalTrips} trips</span>
        </div>
      </div>
    </Link>
  )
}

export default async function CityPage({ 
  params 
}: { 
  params: Promise<{ city: string }> 
}) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')

  // Fetch all cars for this city with more details
  const allCars = await prisma.rentalCar.findMany({
    where: { 
      city: {
        equals: cityName,
        mode: 'insensitive'
      },
      isActive: true 
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      transmission: true,
      seats: true,
      dailyRate: true,
      weeklyRate: true,
      monthlyRate: true,
      features: true,
      city: true,
      address: true,
      fuelType: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      createdAt: true,
      photos: {
        select: {
          url: true,
          caption: true,
          isHero: true
        },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: {
          name: true,
          profilePhoto: true,
          isVerified: true
        }
      }
    }
  })

  // If no cars found, show 404
  if (allCars.length === 0) {
    notFound()
  }

  // Parse features for all cars
  const carsWithParsedFeatures = allCars.map(car => {
    let parsedFeatures = []
    try {
      if (typeof car.features === 'string') {
        parsedFeatures = JSON.parse(car.features)
      } else if (Array.isArray(car.features)) {
        parsedFeatures = car.features
      }
    } catch (e) {
      parsedFeatures = []
    }
    return { ...car, features: parsedFeatures }
  })

  // Categorize cars
  const newListings = carsWithParsedFeatures
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const topRated = carsWithParsedFeatures
    .filter(car => car.rating && car.rating >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))

  const luxuryCars = carsWithParsedFeatures
    .filter(car => 
      car.carType === 'luxury' || 
      car.carType === 'convertible' ||
      car.dailyRate >= 200 ||
      car.make.toLowerCase().includes('mercedes') ||
      car.make.toLowerCase().includes('bmw') ||
      car.make.toLowerCase().includes('audi') ||
      car.make.toLowerCase().includes('tesla') ||
      car.make.toLowerCase().includes('porsche') ||
      car.make.toLowerCase().includes('lamborghini') ||
      car.make.toLowerCase().includes('ferrari')
    )
    .sort((a, b) => b.dailyRate - a.dailyRate)

  const electricCars = carsWithParsedFeatures
    .filter(car => 
      car.fuelType === 'electric' || 
      car.fuelType === 'hybrid' ||
      car.make.toLowerCase().includes('tesla') ||
      car.model.toLowerCase().includes('electric') ||
      car.model.toLowerCase().includes('ev')
    )

  const affordableCars = carsWithParsedFeatures
    .filter(car => car.dailyRate <= 100)
    .sort((a, b) => a.dailyRate - b.dailyRate)

  // Prepare searchable content for the wrapper
  const searchableContent = [
    {
      sectionId: 'new-listings',
      searchTerms: newListings.flatMap(car => [
        car.make,
        car.model,
        car.carType || '',
        car.year.toString(),
        ...car.features,
        'new',
        'recent',
        'latest'
      ])
    },
    {
      sectionId: 'top-rated',
      searchTerms: topRated.flatMap(car => [
        car.make,
        car.model,
        car.carType || '',
        car.year.toString(),
        ...car.features,
        'top',
        'rated',
        'best',
        '5 star'
      ])
    },
    {
      sectionId: 'luxury',
      searchTerms: luxuryCars.flatMap(car => [
        car.make,
        car.model,
        car.carType || '',
        car.year.toString(),
        ...car.features,
        'luxury',
        'premium',
        'high-end'
      ])
    },
    {
      sectionId: 'electric',
      searchTerms: electricCars.flatMap(car => [
        car.make,
        car.model,
        car.carType || '',
        car.year.toString(),
        ...car.features,
        'electric',
        'ev',
        'hybrid',
        'eco'
      ])
    },
    {
      sectionId: 'affordable',
      searchTerms: affordableCars.flatMap(car => [
        car.make,
        car.model,
        car.carType || '',
        car.year.toString(),
        ...car.features,
        'budget',
        'cheap',
        'affordable',
        'under 100'
      ])
    }
  ].filter(section => section.searchTerms.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div>
        <CitySearchWrapper
          cityName={cityName}
          totalCars={allCars.length}
          searchableContent={searchableContent}
        >
          {/* New Listings Section */}
          {newListings.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section id="new-listings" className="py-3 sm:py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          New Listings
                        </h2>
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                          {newListings.length} cars
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Recently added cars in {cityName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {newListings.map((car) => (
                      <CarCard key={car.id} car={car} cityName={cityName} />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Top Rated Section */}
          {topRated.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section id="top-rated" className="py-3 sm:py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          Top Rated
                        </h2>
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">
                          4.5+ stars
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Highest-rated cars by our customers
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {topRated.map((car) => (
                      <CarCard key={car.id} car={car} cityName={cityName} />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Luxury Cars Section */}
          {luxuryCars.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section id="luxury" className="py-3 sm:py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          Luxury & Premium
                        </h2>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                          {luxuryCars.length} cars
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Premium vehicles for special occasions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {luxuryCars.map((car) => (
                      <CarCard key={car.id} car={car} cityName={cityName} />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Electric Cars Section */}
          {electricCars.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section id="electric" className="py-3 sm:py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          Electric & Eco-Friendly
                        </h2>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                          Zero emissions
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sustainable and efficient vehicles
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {electricCars.map((car) => (
                      <CarCard key={car.id} car={car} cityName={cityName} />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Affordable Cars Section */}
          {affordableCars.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <section id="affordable" className="py-3 sm:py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          Budget-Friendly
                        </h2>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                          Under $100/day
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Affordable options for every budget
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {affordableCars.map((car) => (
                      <CarCard key={car.id} car={car} cityName={cityName} />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </CitySearchWrapper>
      </div>
      
      <Footer />
    </div>
  )
}