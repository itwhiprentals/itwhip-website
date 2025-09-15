// app/(guest)/rentals/cities/[city]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { 
  IoLocationOutline, 
  IoArrowBackOutline,
  IoFlashOutline,
  IoStarSharp,
  IoCarOutline,
  IoFilterOutline,
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

export default async function CityPage({ 
  params 
}: { 
  params: Promise<{ city: string }> 
}) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')

  // Fetch all cars for this city
  const cars = await prisma.rentalCar.findMany({
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
      latitude: true,
      longitude: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      airportPickup: true,
      hotelDelivery: true,
      photos: {
        select: {
          url: true,
          caption: true,
          isHero: true
        },
        orderBy: { order: 'asc' },
        take: 3
      },
      host: {
        select: {
          name: true,
          profilePhoto: true,
          isVerified: true,
          responseTime: true,
          responseRate: true
        }
      },
      _count: {
        select: {
          reviews: {
            where: { isVisible: true }
          }
        }
      }
    },
    orderBy: [
      { rating: 'desc' },
      { totalTrips: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  // If no cars found, show 404
  if (cars.length === 0) {
    notFound()
  }

  // Calculate price range for the city
  const prices = cars.map(car => car.dailyRate)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)

  // Parse features for display
  const carsWithParsedFeatures = cars.map(car => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="pt-16">
        {/* City Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6">
              <Link 
                href="/rentals/cities" 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                <IoArrowBackOutline className="w-4 h-4" />
                All Cities
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white font-medium">{cityName}</span>
            </nav>

            {/* City Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {cityName} Car Rentals
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {cars.length} {cars.length === 1 ? 'car' : 'cars'} available • ${minPrice}-${maxPrice}/day
                </p>
              </div>
              
              {/* Sort/Filter Options */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <IoFilterOutline className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
                <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Trips</option>
                  <option>Best Rated</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Cars Grid */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carsWithParsedFeatures.map((car) => {
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
                    key={car.id}
                    href={carUrl}
                    className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative h-56 sm:h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {showLocalHostBadge && (
                          <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                            <IoStarSharp className="w-3 h-3" />
                            LOCAL HOST
                          </span>
                        )}
                        {car.instantBook && (
                          <span className="px-3 py-1 bg-emerald-500 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                            <IoFlashOutline className="w-3 h-3" />
                            INSTANT BOOK
                          </span>
                        )}
                      </div>
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3">
                        <div className="px-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                              ${car.dailyRate}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">/day</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {car.year} {car.make} {car.model}
                      </h3>
                      
                      {/* Car Type & Specs */}
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="capitalize">{car.carType?.toLowerCase() || 'sedan'}</span>
                        <span>•</span>
                        <span>{car.seats} seats</span>
                        <span>•</span>
                        <span className="capitalize">{car.transmission?.toLowerCase() || 'automatic'}</span>
                      </div>
                      
                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-3 mb-3">
                        {car.rating && (
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <IoStarOutline
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.floor(car.rating)
                                      ? 'text-amber-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {car.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <IoCarSportOutline className="w-3.5 h-3.5" />
                          {car.totalTrips || 0} trips
                        </span>
                        {car._count.reviews > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {car._count.reviews} reviews
                          </span>
                        )}
                      </div>
                      
                      {/* Features */}
                      {car.features.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {car.features.slice(0, 3).map((feature: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Location & Host */}
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IoLocationOutline className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {car.address || cityName}
                            </span>
                          </div>
                          {car.host && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              by {car.host.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-12 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Explore {cityName} with ItWhip
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Discover the best of {cityName}, Arizona with our diverse selection of rental cars. 
              Whether you're visiting for business or pleasure, we have the perfect vehicle to match your needs and budget. 
              With prices ranging from ${minPrice} to ${maxPrice} per day, you'll find everything from economical compact cars 
              to luxurious premium vehicles.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Many of our {cityName} rentals offer instant booking for immediate availability, while others are provided 
              by local hosts who take pride in maintaining their vehicles to the highest standards. 
              Average daily rate in {cityName} is ${avgPrice}, making it an affordable option for both short and long-term rentals.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{cars.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available Cars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${avgPrice}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Daily Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cars.filter(c => c.instantBook).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Instant Book</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cars.filter(c => c.rating && c.rating >= 4.5).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Top Rated</div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}