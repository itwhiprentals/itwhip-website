// app/phoenix/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import prisma from '@/app/lib/database/prisma'
import { 
  IoLocationOutline, 
  IoCarSportOutline,
  IoStarSharp,
  IoFlashOutline,
  IoLeafOutline,
  IoShieldCheckmarkOutline,
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoWalletOutline,
  IoSunnyOutline,
  IoThermometerOutline,
  IoAirplaneOutline,
  IoCalendarOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Luxury Car Rental in Phoenix, AZ | ItWhip – Hotel Delivery + ESG Verified',
  description: 'Rent ESG-verified luxury cars in Phoenix with free hotel delivery. Beat the heat with MaxAC™ EVs, save 35%, $1M insured.',
  keywords: 'luxury car rental phoenix, phoenix car rental, hotel delivery phoenix, ESG cars phoenix, electric cars phoenix',
  openGraph: {
    title: 'Luxury Car Rental in Phoenix, AZ | ItWhip',
    description: 'ESG-verified luxury cars delivered to Phoenix hotels. Beat the heat with MaxAC™.',
    images: ['/images/phoenix-hero.jpg'],
    type: 'website',
    locale: 'en_US',
    url: 'https://itwhip.com/phoenix'
  }
}

// Weather API fetch (server component)
async function getPhoenixWeather() {
  try {
    // Note: In production, add your OpenWeather API key to .env.local
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=33.4484&lon=-112.0740&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    
    if (!response.ok) {
      throw new Error('Weather API failed')
    }
    
    const data = await response.json()
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].main,
      feelsLike: Math.round(data.main.feels_like)
    }
  } catch (error) {
    console.error('Weather API error:', error)
    // Phoenix defaults
    return { temp: 95, description: 'Sunny', feelsLike: 102 }
  }
}

// Event pricing multipliers
function getEventMultiplier() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  
  // Spring Training (Feb 20 - March 31)
  if ((month === 2 && day >= 20) || month === 3) {
    return { multiplier: 1.3, event: 'Spring Training' }
  }
  
  // Waste Management Open (late Jan - early Feb)
  if ((month === 1 && day >= 25) || (month === 2 && day <= 10)) {
    return { multiplier: 1.5, event: 'Waste Management Open' }
  }
  
  // Summer discount (June-August)
  if (month >= 6 && month <= 8) {
    return { multiplier: 0.8, event: 'Summer Special' }
  }
  
  return { multiplier: 1.0, event: null }
}

// Car Card Component
function CarCard({ car, eventMultiplier }: { car: any, eventMultiplier: number }) {
  const impactScore = car.esgScore || 75
  const scoreColor = impactScore >= 90 ? 'text-green-600' : 
                    impactScore >= 75 ? 'text-amber-600' : 'text-orange-600'
  const scoreBg = impactScore >= 90 ? 'bg-green-50 dark:bg-green-900/20' : 
                  impactScore >= 75 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
  
  const imageUrl = car.photos?.[0]?.url || 
    `https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop`

  const adjustedPrice = Math.round(car.dailyRate * eventMultiplier)

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${car.year} ${car.make} ${car.model} - Phoenix luxury car rental`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* ESG Impact Score Badge */}
        <div className="absolute top-3 left-3">
          <div className={`${scoreBg} backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5`}>
            <IoLeafOutline className={`w-3.5 h-3.5 ${scoreColor}`} />
            <span className={`font-semibold text-xs ${scoreColor}`}>
              {impactScore}/100
            </span>
          </div>
        </div>

        {/* MaxAC Badge for summer */}
        {car.hasAlarm && (
          <div className="absolute top-3 right-3">
            <div className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <IoThermometerOutline className="w-3 h-3" />
              MaxAC™
            </div>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${adjustedPrice}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">/day</span>
            </div>
            {eventMultiplier !== 1.0 && (
              <span className="text-xs text-orange-600">Event pricing</span>
            )}
          </div>
        </div>

        {/* Hotel Delivery Badge */}
        {car.hotelDelivery && (
          <div className="absolute top-12 left-3">
            <div className="bg-purple-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <IoBusinessOutline className="w-3 h-3" />
              Hotel Free
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          {car.year} {car.make} {car.model}
        </h3>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {car.fuelType === 'Electric' ? '⚡ Zero emissions' : `${car.mpgCity || 25} MPG city`}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <IoStarSharp className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {car.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-xs text-gray-500">({car.totalTrips || 0})</span>
          </div>
          
          {car.host?.responseTime && (
            <span className="text-xs text-green-600 dark:text-green-400">
              Responds in {car.host.responseTime}h
            </span>
          )}
        </div>

        <Link 
          href={`/rentals/${car.id}`}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg font-medium text-sm text-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
        >
          View Details
          <IoArrowForwardOutline className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

// Main Phoenix Page Component (Server Component)
export default async function PhoenixPage() {
  // Fetch all data server-side
  const [featuredCars, stats, hostCount, weather] = await Promise.all([
    // Featured cars
    prisma.rentalCar.findMany({
      where: {
        city: 'Phoenix',
        isActive: true,
        OR: [
          { esgScore: { gte: 75 } },
          { esgScore: null }
        ]
      },
      include: {
        photos: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          take: 1
        },
        host: {
          select: {
            name: true,
            rating: true,
            responseTime: true
          }
        }
      },
      orderBy: [
        { esgScore: 'desc' },
        { rating: 'desc' },
        { totalTrips: 'desc' }
      ],
      take: 5
    }),
    
    // Stats
    prisma.rentalCar.aggregate({
      where: { city: 'Phoenix', isActive: true },
      _count: { _all: true },
      _avg: { dailyRate: true, esgScore: true }
    }),
    
    // Host count
    prisma.rentalHost.count({
      where: { city: 'Phoenix', active: true }
    }),
    
    // Weather
    getPhoenixWeather()
  ])

  // Static Phoenix hotels data
  const phoenixHotels = [
    { name: 'Fairmont Scottsdale Princess', area: 'Scottsdale', delivery: 'Free' },
    { name: 'Arizona Biltmore', area: 'Phoenix', delivery: 'Free' },
    { name: 'Four Seasons Resort Scottsdale', area: 'Scottsdale', delivery: 'Free' },
    { name: 'The Phoenician', area: 'Scottsdale', delivery: 'Free' },
    { name: 'Sanctuary Camelback Mountain', area: 'Paradise Valley', delivery: 'Free' },
  ]

  // Get event pricing
  const eventPricing = getEventMultiplier()

  // Weather message
  const weatherMessage = weather.temp >= 100 
    ? `${weather.temp}°F - Beat the heat with MaxAC™` 
    : weather.temp >= 70 
    ? `Perfect ${weather.temp}°F convertible weather`
    : `Beautiful ${weather.temp}°F driving weather`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Schema Markup for Local SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CarRental',
            name: 'ItWhip Phoenix',
            areaServed: {
              '@type': 'City',
              name: 'Phoenix',
              '@id': 'https://www.wikidata.org/wiki/Q16917'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 33.4484,
              longitude: -112.0740
            },
            priceRange: '$65-$450',
            amenityFeature: ['MaxAC', 'Hotel Delivery', 'ESG Verified', 'Insurance Included']
          })
        }}
      />
      
      <main className="pt-16">
        {/* Hero Section with Arizona Background */}
        <section className="relative h-[450px] md:h-[500px]">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1558618047-f70e3b7b7182?w=2000&h=1000&fit=crop"
              alt="Phoenix Arizona luxury car rentals"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          </div>
          
          {/* Weather Badge */}
          <div className="absolute top-20 right-4 md:right-8 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <IoSunnyOutline className="w-5 h-5 text-orange-500" />
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{weatherMessage}</div>
                <div className="text-xs text-gray-600">Phoenix right now</div>
              </div>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Luxury Car Rental in Phoenix, AZ
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                Discover verified, green luxury rides for Arizona sunshine—delivered to your hotel.
              </p>
              
              {eventPricing.event && (
                <div className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full mb-6">
                  <IoCalendarOutline className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {eventPricing.event} pricing active ({Math.round((eventPricing.multiplier - 1) * 100)}% 
                    {eventPricing.multiplier > 1 ? ' surge' : ' discount'})
                  </span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/host/signup"
                  className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Join Waitlist
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
                <Link 
                  href="/impact-calculator"
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-orange-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Calculate Earnings
                  <IoWalletOutline className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-3xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
                  <div className="text-xl font-bold text-white">{hostCount}+</div>
                  <div className="text-xs text-white/80">Phoenix Hosts</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
                  <div className="text-xl font-bold text-white">${Math.round(stats._avg.dailyRate || 125)}</div>
                  <div className="text-xs text-white/80">Avg Daily</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
                  <div className="text-xl font-bold text-white">{Math.round(stats._avg.esgScore || 75)}/100</div>
                  <div className="text-xs text-white/80">Avg ESG</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
                  <div className="text-xl font-bold text-white">$1M</div>
                  <div className="text-xs text-white/80">Insured</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of the sections remain the same but I'll include them for completeness */}
        
        {/* Beat the Heat Section */}
        <section className="py-8 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Beat the Heat: Phoenix Favorites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCars.slice(0, 3).map((car) => (
                <CarCard key={car.id} car={car} eventMultiplier={eventPricing.multiplier} />
              ))}
            </div>
          </div>
        </section>

        {/* Top ESG-Verified Cars */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Top ESG-Verified Cars in Phoenix
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
              Higher Impact Scores = Better for the environment + Higher host earnings
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCars.length > 0 ? (
                featuredCars.map((car) => (
                  <CarCard key={car.id} car={car} eventMultiplier={eventPricing.multiplier} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <IoCarSportOutline className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    New verified cars being added daily. Join the waitlist!
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hotel Delivery Options */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Hotel Delivery Options
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hotel List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  50+ Partner Hotels (Free Delivery)
                </h3>
                <ul className="space-y-2">
                  {phoenixHotels.map((hotel, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{hotel.name}</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </li>
                  ))}
                  <li className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                    + 45 more hotels in Phoenix/Scottsdale
                  </li>
                </ul>
              </div>

              {/* Airport vs Hotel Comparison */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Airport vs Hotel Delivery
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <IoAirplaneOutline className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Sky Harbor Airport</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">$45 delivery fee</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Terminal 3 & 4 only</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IoBusinessOutline className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Hotel Delivery</div>
                      <div className="text-sm text-green-600 font-semibold">FREE delivery</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Concierge handoff</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Phoenix Hosts Earn 90% with High Impact Scores
            </h2>
            <p className="text-lg mb-6 text-white/90">
              Join {hostCount}+ hosts already earning in Phoenix
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/host/signup"
                className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors"
              >
                Join Waitlist
              </Link>
              <Link 
                href="/impact-calculator"
                className="bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-orange-800 transition-colors"
              >
                Calculate Your Earnings
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Sticky Mobile Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 md:hidden z-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{stats._count._all} cars near you</div>
            <div className="text-xs text-gray-300">Free hotel delivery</div>
          </div>
          <Link 
            href="/host/signup"
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </div>
  )
}