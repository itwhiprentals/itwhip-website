// app/(guest)/rentals/cities/[city]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
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
  IoCarSportOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoMapOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoHelpCircleOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCashOutline,
  IoSearchOutline
} from 'react-icons/io5'

// Add ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// CITY SEO DATA - Landmarks, Airports, Content
// ============================================
const CITY_SEO_DATA: Record<string, {
  state: string
  airport?: string
  airportCode?: string
  landmarks: string[]
  neighborhoods: string[]
  description: string
  whyRent: string
  popularRoutes: string[]
  coordinates: { lat: number; lng: number }
}> = {
  'Phoenix': {
    state: 'Arizona',
    airport: 'Phoenix Sky Harbor International Airport',
    airportCode: 'PHX',
    landmarks: ['Phoenix Sky Harbor Airport', 'Chase Field', 'Footprint Center', 'Desert Botanical Garden', 'Camelback Mountain', 'South Mountain Park'],
    neighborhoods: ['Downtown Phoenix', 'Arcadia', 'Biltmore', 'Paradise Valley', 'Ahwatukee', 'North Phoenix'],
    description: 'Phoenix is Arizona\'s capital and largest city, known for its year-round sun, world-class golf courses, and vibrant downtown scene. As the fifth-largest city in the US, Phoenix offers endless attractions from desert hiking to professional sports.',
    whyRent: 'With sprawling desert landscapes and attractions spread across the Valley, having your own car in Phoenix is essential. Skip the rental counter lines at Sky Harbor and get a car delivered directly to you.',
    popularRoutes: ['Phoenix to Sedona (2 hours)', 'Phoenix to Grand Canyon (3.5 hours)', 'Phoenix to Tucson (1.5 hours)', 'Phoenix to Flagstaff (2.5 hours)'],
    coordinates: { lat: 33.4484, lng: -112.0740 }
  },
  'Scottsdale': {
    state: 'Arizona',
    airport: 'Scottsdale Airport',
    airportCode: 'SDL',
    landmarks: ['Old Town Scottsdale', 'Scottsdale Fashion Square', 'TPC Scottsdale', 'Taliesin West', 'McDowell Sonoran Preserve', 'Butterfly Wonderland'],
    neighborhoods: ['Old Town', 'North Scottsdale', 'McCormick Ranch', 'Gainey Ranch', 'DC Ranch', 'Kierland'],
    description: 'Scottsdale is renowned for its upscale resorts, world-class spas, championship golf courses, and vibrant arts district. This desert oasis combines luxury living with outdoor adventure.',
    whyRent: 'Scottsdale\'s luxury resorts, golf courses, and dining destinations are spread throughout the city. A rental car lets you explore everything from Old Town galleries to North Scottsdale\'s hiking trails.',
    popularRoutes: ['Scottsdale to Phoenix Airport (25 min)', 'Scottsdale to Sedona (2 hours)', 'Scottsdale to Cave Creek (30 min)', 'Scottsdale to Mesa (20 min)'],
    coordinates: { lat: 33.4942, lng: -111.9261 }
  },
  'Tempe': {
    state: 'Arizona',
    airport: 'Phoenix Sky Harbor International Airport',
    airportCode: 'PHX',
    landmarks: ['Arizona State University', 'Tempe Town Lake', 'Mill Avenue District', 'Tempe Marketplace', 'Papago Park', 'Sun Devil Stadium'],
    neighborhoods: ['Downtown Tempe', 'Mill Avenue', 'South Tempe', 'North Tempe', 'Alameda', 'University District'],
    description: 'Tempe is a vibrant college town home to Arizona State University. With Tempe Town Lake, bustling Mill Avenue, and proximity to Phoenix Sky Harbor, it\'s a hub for young professionals and visitors.',
    whyRent: 'Located just minutes from Phoenix Sky Harbor Airport, Tempe is perfectly positioned for exploring the entire Valley. Rent a car and easily access ASU, Mill Avenue nightlife, and nearby attractions.',
    popularRoutes: ['Tempe to Phoenix Airport (10 min)', 'Tempe to Scottsdale (15 min)', 'Tempe to Mesa (10 min)', 'Tempe to Downtown Phoenix (15 min)'],
    coordinates: { lat: 33.4255, lng: -111.9400 }
  },
  'Mesa': {
    state: 'Arizona',
    airport: 'Phoenix-Mesa Gateway Airport',
    airportCode: 'AZA',
    landmarks: ['Mesa Arts Center', 'Sloan Park (Cubs Spring Training)', 'Usery Mountain Regional Park', 'Arizona Museum of Natural History', 'Superstition Mountains', 'Salt River'],
    neighborhoods: ['Downtown Mesa', 'East Mesa', 'Superstition Springs', 'Red Mountain', 'Las Sendas', 'Dana Park'],
    description: 'Mesa is Arizona\'s third-largest city, known for spring training baseball, outdoor recreation, and family-friendly attractions. The Superstition Mountains provide a stunning backdrop for adventure.',
    whyRent: 'Mesa\'s gateway to the Superstition Mountains and Apache Trail makes it ideal for road trip adventures. With Phoenix-Mesa Gateway Airport nearby, grab a rental and explore the desert wilderness.',
    popularRoutes: ['Mesa to Apache Junction (20 min)', 'Mesa to Phoenix (25 min)', 'Mesa to Globe (1.5 hours)', 'Mesa to Roosevelt Lake (1.5 hours)'],
    coordinates: { lat: 33.4152, lng: -111.8315 }
  },
  'Chandler': {
    state: 'Arizona',
    airport: 'Phoenix Sky Harbor International Airport',
    airportCode: 'PHX',
    landmarks: ['Downtown Chandler', 'Intel Campus', 'Chandler Fashion Center', 'Tumbleweed Park', 'Veterans Oasis Park', 'San Marcos Hotel'],
    neighborhoods: ['Downtown Chandler', 'Ocotillo', 'Sun Lakes', 'Chandler Heights', 'Gilbert Border', 'West Chandler'],
    description: 'Chandler has transformed from agricultural roots into a high-tech hub, home to Intel and other tech giants. Its charming downtown, excellent schools, and family amenities make it a sought-after destination.',
    whyRent: 'Chandler\'s tech corridor and proximity to Phoenix make a rental car essential for business travelers and families alike. Explore downtown dining, nearby golf courses, and easy freeway access to the entire Valley.',
    popularRoutes: ['Chandler to Phoenix Airport (20 min)', 'Chandler to Tempe (15 min)', 'Chandler to Gilbert (10 min)', 'Chandler to Casa Grande (30 min)'],
    coordinates: { lat: 33.3062, lng: -111.8413 }
  },
  'Gilbert': {
    state: 'Arizona',
    airport: 'Phoenix Sky Harbor International Airport',
    airportCode: 'PHX',
    landmarks: ['Gilbert Heritage District', 'Riparian Preserve', 'San Tan Village', 'Cosmo Dog Park', 'Freestone Park', 'Gilbert Town Square'],
    neighborhoods: ['Heritage District', 'Val Vista Lakes', 'Power Ranch', 'Agritopia', 'Seville', 'Finley Farms'],
    description: 'Gilbert has grown from a small farming community to one of the safest and most desirable cities in America. Its Heritage District offers charming shops and restaurants in a walkable downtown setting.',
    whyRent: 'Gilbert\'s family-friendly attractions and growing dining scene are best explored by car. Easy access to Loop 202 connects you to the entire Phoenix metro area.',
    popularRoutes: ['Gilbert to Phoenix Airport (25 min)', 'Gilbert to Mesa (10 min)', 'Gilbert to Chandler (10 min)', 'Gilbert to Queen Creek (15 min)'],
    coordinates: { lat: 33.3528, lng: -111.7890 }
  },
  'Glendale': {
    state: 'Arizona',
    airport: 'Phoenix Sky Harbor International Airport',
    airportCode: 'PHX',
    landmarks: ['State Farm Stadium', 'Westgate Entertainment District', 'Glendale Glitters', 'Cerreta Candy Company', 'Sahuaro Ranch Park', 'Historic Downtown Glendale'],
    neighborhoods: ['Downtown Glendale', 'Arrowhead', 'Westgate', 'Peoria Border', 'North Glendale', 'Catlin Court'],
    description: 'Glendale is home to the Arizona Cardinals and hosts major events including Super Bowls and Final Fours at State Farm Stadium. Its antique district and Westgate entertainment make it a unique Valley destination.',
    whyRent: 'Whether you\'re catching a Cardinals game, attending a concert at State Farm Stadium, or exploring the antique shops, a rental car makes Glendale accessible from anywhere in the Valley.',
    popularRoutes: ['Glendale to Phoenix Airport (25 min)', 'Glendale to Downtown Phoenix (20 min)', 'Glendale to Peoria (10 min)', 'Glendale to Scottsdale (30 min)'],
    coordinates: { lat: 33.5387, lng: -112.1859 }
  },
  'Peoria': {
    state: 'Arizona',
    airport: 'Phoenix Sky Harbor International Airport',
    airportCode: 'PHX',
    landmarks: ['Peoria Sports Complex', 'Lake Pleasant', 'Theater Works', 'Pioneer Community Park', 'Challenger Space Center', 'Old Town Peoria'],
    neighborhoods: ['Old Town Peoria', 'Vistancia', 'Westwing', 'Fletcher Heights', 'Sunrise Mountain', 'Pleasant Harbor'],
    description: 'Peoria offers the perfect blend of suburban living and outdoor recreation. Lake Pleasant provides water sports year-round, while the Peoria Sports Complex hosts MLB spring training.',
    whyRent: 'Lake Pleasant and the surrounding desert trails are best accessed by car. Peoria\'s spring training facilities and growing entertainment options make a rental essential for visitors.',
    popularRoutes: ['Peoria to Phoenix Airport (30 min)', 'Peoria to Lake Pleasant (20 min)', 'Peoria to Glendale (10 min)', 'Peoria to Surprise (15 min)'],
    coordinates: { lat: 33.5806, lng: -112.2374 }
  }
}

// Default data for cities not in the list
const DEFAULT_CITY_DATA = {
  state: 'Arizona',
  landmarks: ['Local attractions', 'Shopping centers', 'Parks and recreation'],
  neighborhoods: ['Downtown', 'Residential areas', 'Business district'],
  description: 'Explore this Arizona community with its unique local charm and easy access to Phoenix metro attractions.',
  whyRent: 'Having your own car gives you the freedom to explore at your pace. Skip the rental counters and get a car delivered to you.',
  popularRoutes: ['To Phoenix (varies)', 'To Scottsdale (varies)', 'To local attractions'],
  coordinates: { lat: 33.4484, lng: -112.0740 }
}

// City-specific FAQs
const CITY_FAQS = (cityName: string, carCount: number, minPrice: number) => [
  {
    question: `How do I rent a car in ${cityName}?`,
    answer: `Renting a car in ${cityName} with ItWhip is simple. Browse our ${carCount}+ available vehicles, select your dates, and book instantly. Choose delivery to your location or pick up from the host. All rentals include $1M liability coverage. <a href="/rentals?location=${encodeURIComponent(cityName)}" class="text-amber-600 hover:underline">Browse ${cityName} cars →</a>`
  },
  {
    question: `What's the cheapest car rental in ${cityName}?`,
    answer: `Car rentals in ${cityName} start from ${minPrice}/day on ItWhip. We offer a range of vehicles from budget-friendly sedans to luxury SUVs. Book directly from local owners and save up to 35% compared to traditional rental companies. <a href="/rentals?location=${encodeURIComponent(cityName)}&sort=price" class="text-amber-600 hover:underline">View cheapest options →</a>`
  },
  {
    question: `Can I get a rental car delivered in ${cityName}?`,
    answer: `Yes! Many hosts in ${cityName} offer free delivery to airports, hotels, and homes. Look for the delivery icon when browsing vehicles. Delivery options and fees vary by host.`
  },
  {
    question: `Is insurance included with ${cityName} car rentals?`,
    answer: `Yes, all ItWhip rentals include $1M liability coverage. You can also add additional protection plans for comprehensive coverage. Guests can bring their own insurance for a 50% deposit discount. <a href="/insurance-guide" class="text-amber-600 hover:underline">Read our full insurance guide →</a>`
  },
  {
    question: `What do I need to rent a car in ${cityName}?`,
    answer: `To rent a car in ${cityName}, you need: a valid driver's license, to be 21+ years old (25+ for some vehicles), a clean driving record, and a valid payment method. Verification takes just minutes.`
  },
  {
    question: `Does ItWhip track environmental impact?`,
    answer: `Yes! ItWhip provides ESG (Environmental, Social, Governance) tracking for every rental. See your CO2 savings, support eco-friendly hosts, and get sustainability reports for corporate travel compliance. <a href="/esg-dashboard" class="text-amber-600 hover:underline">Learn about ESG tracking →</a>`
  }
]

// ============================================
// METADATA GENERATION
// ============================================
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ city: string }> 
}): Promise<Metadata> {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')
  const cityData = CITY_SEO_DATA[cityName] || DEFAULT_CITY_DATA
  
  const carCount = await prisma.rentalCar.count({
    where: { 
      city: { equals: cityName, mode: 'insensitive' },
      isActive: true 
    }
  })

  const topCars = await prisma.rentalCar.findMany({
    where: {
      city: { equals: cityName, mode: 'insensitive' },
      isActive: true,
      photos: { some: {} }
    },
    select: {
      make: true,
      model: true,
      year: true
    },
    orderBy: [{ rating: 'desc' }, { totalTrips: 'desc' }],
    take: 3
  })

  // Use Arizona OG image for all city pages
  const ogImage = 'https://itwhip.com/og/cities/arizona.png'

  const carTypes = topCars.length > 0 
    ? `including ${topCars[0].year} ${topCars[0].make} ${topCars[0].model}`
    : 'from economy to luxury'

  return {
    title: `${cityName} Car Rentals | ${carCount} Cars from Local Owners | ItWhip`,
    description: `Rent cars in ${cityName}, ${cityData.state} from $45/day. ${carCount} peer-to-peer rental cars available ${carTypes}. Book from local owners with free airport delivery. $1M insurance included. Best Turo alternative in Arizona.`,
    keywords: [
      `${cityName} car rental`,
      `rent a car ${cityName}`,
      `${cityName} ${cityData.state} car rental`,
      `cheap car rental ${cityName}`,
      `${cityData.airport || 'airport'} car rental`,
      'peer to peer car rental',
      'turo alternative',
      `${cityName} rental cars`
    ],
    openGraph: {
      title: `${cityName} Car Rentals - ${carCount} Available | ItWhip`,
      description: `Browse ${carCount} rental cars in ${cityName}. From luxury to economy, find your perfect ride with instant booking and free delivery.`,
      url: `https://itwhip.com/rentals/cities/${city}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Car rentals in ${cityName}, Arizona` }],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cityName} Car Rentals - ${carCount} Available`,
      description: `Browse ${carCount} rental cars in ${cityName}. Instant booking available.`,
      images: [ogImage]
    },
    alternates: {
      canonical: `https://itwhip.com/rentals/cities/${city}`,
    },
  }
}

// ============================================
// STATIC PARAMS FOR PRE-RENDERING
// ============================================
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

// ============================================
// COMPONENTS
// ============================================

// Hero Section Component
function HeroSection({ cityName, cityData, minPrice }: { 
  cityName: string
  cityData: typeof DEFAULT_CITY_DATA
  minPrice: number
}) {
  return (
    <section className="relative h-[280px] sm:h-[320px] lg:h-[360px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero/arizona-hero.jpg)' }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium mb-3">
            <IoLocationOutline className="w-3.5 h-3.5" />
            {cityName}, {cityData.state}
          </div>
          
          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            Rent Cars from Local Owners in {cityName}
          </h1>
          
          {/* Subheading */}
          <p className="text-sm sm:text-base text-white/80 mb-4 max-w-xl">
            Rent directly from local owners starting at ${minPrice}/day with $1M insurance included.
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <IoCashOutline className="w-4 h-4 text-emerald-400" />
              <span>From <strong>${minPrice}</strong>/day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-400" />
              <span><strong>$1M</strong> insurance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IoFlashOutline className="w-4 h-4 text-purple-400" />
              <span>Instant booking</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-5">
            <a 
              href="#new-listings" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              <IoSearchOutline className="w-4 h-4" />
              Browse {cityName} Cars
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Breadcrumb Component
function Breadcrumbs({ cityName }: { cityName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1">
            <IoHomeOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="flex items-center gap-1.5">
          <Link href="/rentals/cities" className="hover:text-amber-600 dark:hover:text-amber-400">
            Cities
          </Link>
          <IoChevronForwardOutline className="w-2.5 h-2.5" />
        </li>
        <li className="text-gray-800 dark:text-gray-200 font-medium">
          {cityName}
        </li>
      </ol>
    </nav>
  )
}

// Car Card Component
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
      <div className="relative h-24 sm:h-28 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.year} ${car.make} ${car.model} for rent in ${cityName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
        <div className="absolute bottom-2 right-2">
          <div className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-md shadow-lg">
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-gray-900 dark:text-white">${car.dailyRate}</span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">/day</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {car.year} {car.make}
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
            {car.model}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
          <span className="capitalize">{car.carType?.toLowerCase() || 'sedan'}</span>
          <span>•</span>
          <span>{car.seats} seats</span>
          {car.rating && (
            <>
              <span>•</span>
              <div className="flex items-center gap-0.5">
                <IoStarOutline className="w-2.5 h-2.5 text-amber-400 fill-current" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{car.rating.toFixed(1)}</span>
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

// SEO Content Section
function CityInfoSection({ cityName, cityData, carCount }: { 
  cityName: string
  cityData: typeof DEFAULT_CITY_DATA
  carCount: number 
}) {
  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              About {cityName} Car Rentals
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed">
              {cityData.description}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {cityData.whyRent}
            </p>
          </div>
          
          {/* Quick Facts */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {'airport' in cityData && cityData.airport && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                  <IoAirplaneOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-semibold text-[10px] sm:text-xs">Nearest Airport</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  {cityData.airport} {'airportCode' in cityData && `(${cityData.airportCode})`}
                </p>
              </div>
            )}
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoCarOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">Available Cars</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                {carCount}+ vehicles ready
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoShieldCheckmarkOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">Insurance</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                $1M liability included
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <IoTimeOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold text-[10px] sm:text-xs">Booking</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                Instant confirmation
              </p>
            </div>
          </div>
        </div>
        
        {/* Landmarks & Neighborhoods */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-5 sm:mt-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <IoBusinessOutline className="w-4 h-4 text-amber-600" />
              Popular Landmarks
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cityData.landmarks.map((landmark, i) => (
                <span key={i} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs rounded-full">
                  {landmark}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <IoMapOutline className="w-4 h-4 text-amber-600" />
              Neighborhoods We Serve
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cityData.neighborhoods.map((neighborhood, i) => (
                <span key={i} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs rounded-full">
                  {neighborhood}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Popular Routes */}
        <div className="mt-5 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <IoCarSportOutline className="w-4 h-4 text-amber-600" />
            Popular Road Trips from {cityName}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cityData.popularRoutes.map((route, i) => (
              <div 
                key={i} 
                className="px-2.5 py-2 sm:px-3 sm:py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] sm:text-xs text-amber-800 dark:text-amber-300 leading-snug"
              >
                {route}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// FAQ Section
function FAQSection({ cityName, carCount, minPrice }: { 
  cityName: string
  carCount: number
  minPrice: number 
}) {
  const faqs = CITY_FAQS(cityName, carCount, minPrice)
  
  return (
    <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoHelpCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {faq.question}
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Related Cities Section
function RelatedCities({ currentCity }: { currentCity: string }) {
  const allCities = Object.keys(CITY_SEO_DATA)
  const otherCities = allCities.filter(c => c !== currentCity).slice(0, 6)
  
  return (
    <section className="py-5 sm:py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
          Rent Cars in Other Arizona Cities
        </h2>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3">
          Explore peer-to-peer car rentals across the Phoenix metro area
        </p>
        <div className="flex flex-wrap gap-2">
          {otherCities.map((city) => {
            const cityData = CITY_SEO_DATA[city]
            return (
              <Link
                key={city}
                href={`/rentals/cities/${city.toLowerCase().replace(/\s+/g, '-')}`}
                className="group px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium">{city}</span>
                {cityData?.airportCode && (
                  <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-amber-500">
                    ({cityData.airportCode})
                  </span>
                )}
                <span className="ml-1 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link 
            href="/rentals/cities" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View all Arizona cities
            <IoChevronForwardOutline className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default async function CityPage({ 
  params 
}: { 
  params: Promise<{ city: string }> 
}) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')
  const cityData = CITY_SEO_DATA[cityName] || DEFAULT_CITY_DATA

  // Fetch all cars for this city
  const allCars = await prisma.rentalCar.findMany({
    where: { 
      city: { equals: cityName, mode: 'insensitive' },
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
        select: { url: true, caption: true, isHero: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true, isVerified: true }
      }
    }
  })

  if (allCars.length === 0) {
    notFound()
  }

  // Get price stats
  const minPrice = Math.min(...allCars.map(c => c.dailyRate))
  const maxPrice = Math.max(...allCars.map(c => c.dailyRate))

  // Parse features
  const carsWithParsedFeatures = allCars.map(car => {
    let parsedFeatures: string[] = []
    try {
      if (typeof car.features === 'string') {
        parsedFeatures = JSON.parse(car.features)
      } else if (Array.isArray(car.features)) {
        parsedFeatures = car.features as string[]
      }
    } catch { parsedFeatures = [] }
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
      car.carType === 'luxury' || car.carType === 'convertible' || car.dailyRate >= 200 ||
      ['mercedes', 'bmw', 'audi', 'tesla', 'porsche', 'lamborghini', 'ferrari']
        .some(brand => car.make.toLowerCase().includes(brand))
    )
    .sort((a, b) => b.dailyRate - a.dailyRate)

  const electricCars = carsWithParsedFeatures
    .filter(car => 
      car.fuelType === 'electric' || car.fuelType === 'hybrid' ||
      car.make.toLowerCase().includes('tesla') ||
      car.model.toLowerCase().includes('electric') || car.model.toLowerCase().includes('ev')
    )

  const affordableCars = carsWithParsedFeatures
    .filter(car => car.dailyRate <= 100)
    .sort((a, b) => a.dailyRate - b.dailyRate)

  // Searchable content for wrapper
  const searchableContent = [
    { sectionId: 'new-listings', searchTerms: newListings.flatMap(car => [car.make, car.model, car.carType || '', car.year.toString(), ...car.features, 'new', 'recent']) },
    { sectionId: 'top-rated', searchTerms: topRated.flatMap(car => [car.make, car.model, car.carType || '', 'top', 'rated', 'best']) },
    { sectionId: 'luxury', searchTerms: luxuryCars.flatMap(car => [car.make, car.model, 'luxury', 'premium']) },
    { sectionId: 'electric', searchTerms: electricCars.flatMap(car => [car.make, car.model, 'electric', 'ev', 'hybrid', 'eco']) },
    { sectionId: 'affordable', searchTerms: affordableCars.flatMap(car => [car.make, car.model, 'budget', 'cheap', 'affordable']) }
  ].filter(section => section.searchTerms.length > 0)

  // Calculate priceValidUntil once for all offers (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Generate JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // LocalBusiness
      {
        '@type': 'LocalBusiness',
        '@id': `https://itwhip.com/rentals/cities/${city}#business`,
        name: `ItWhip Car Rentals - ${cityName}`,
        description: `Rent cars from local owners in ${cityName}, ${cityData.state}. ${allCars.length} vehicles available.`,
        url: `https://itwhip.com/rentals/cities/${city}`,
        telephone: '+1-480-555-0100',
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityName,
          addressRegion: cityData.state,
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: cityData.coordinates.lat,
          longitude: cityData.coordinates.lng
        },
        priceRange: `$${minPrice}-$${maxPrice}/day`,
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59'
        }
      },
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': `https://itwhip.com/rentals/cities/${city}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
          { '@type': 'ListItem', position: 2, name: 'Cities', item: 'https://itwhip.com/rentals/cities' },
          { '@type': 'ListItem', position: 3, name: `${cityName} Car Rentals`, item: `https://itwhip.com/rentals/cities/${city}` }
        ]
      },
      // ItemList (Car Listings)
      {
        '@type': 'ItemList',
        '@id': `https://itwhip.com/rentals/cities/${city}#carlist`,
        name: `Car Rentals in ${cityName}`,
        numberOfItems: allCars.length,
        itemListElement: allCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${car.make} ${car.model}`,
            description: `Rent this ${car.year} ${car.make} ${car.model} in ${cityName}`,
            image: car.photos?.[0]?.url,
            offers: {
              '@type': 'Offer',
              price: car.dailyRate,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceValidUntil,
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'US',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 3,
                returnFees: 'https://schema.org/FreeReturn',
                refundType: 'https://schema.org/FullRefund',
                returnPolicyCountry: 'US'
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: 0,
                  currency: 'USD'
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'US',
                  addressRegion: 'AZ'
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 24,
                    unitCode: 'HUR'
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 2,
                    unitCode: 'HUR'
                  }
                }
              }
            },
            aggregateRating: car.rating ? {
              '@type': 'AggregateRating',
              ratingValue: car.rating,
              reviewCount: car.totalTrips || 1
            } : undefined
          }
        }))
      },
      // FAQPage
      {
        '@type': 'FAQPage',
        '@id': `https://itwhip.com/rentals/cities/${city}#faq`,
        mainEntity: CITY_FAQS(cityName, allCars.length, minPrice).map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    ]
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        {/* Hero Section */}
        <HeroSection 
          cityName={cityName} 
          cityData={cityData} 
          minPrice={minPrice} 
        />
        
        <div>
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <Breadcrumbs cityName={cityName} />
          </div>

          <CitySearchWrapper
            cityName={cityName}
            totalCars={allCars.length}
            searchableContent={searchableContent}
          >
            {/* New Listings */}
            {newListings.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="new-listings" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">New Listings</h2>
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">{newListings.length} cars</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recently added cars in {cityName}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {newListings.map((car) => <CarCard key={car.id} car={car} cityName={cityName} />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Top Rated */}
            {topRated.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="top-rated" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Top Rated</h2>
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">4.5+ stars</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Highest-rated cars by our customers</p>
                      </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {topRated.map((car) => <CarCard key={car.id} car={car} cityName={cityName} />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Luxury */}
            {luxuryCars.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="luxury" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Luxury & Premium</h2>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">{luxuryCars.length} cars</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Premium vehicles for special occasions</p>
                      </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {luxuryCars.map((car) => <CarCard key={car.id} car={car} cityName={cityName} />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Electric */}
            {electricCars.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="electric" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Electric & Eco-Friendly</h2>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">Zero emissions</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sustainable and efficient vehicles</p>
                      </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {electricCars.map((car) => <CarCard key={car.id} car={car} cityName={cityName} />)}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Affordable */}
            {affordableCars.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <section id="affordable" className="py-3 sm:py-4">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Budget-Friendly</h2>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">Under $100/day</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Affordable options for every budget</p>
                      </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {affordableCars.map((car) => <CarCard key={car.id} car={car} cityName={cityName} />)}
                    </div>
                  </div>
                </section>
              </>
            )}
          </CitySearchWrapper>
          
          {/* SEO Content Sections */}
          <CityInfoSection cityName={cityName} cityData={cityData} carCount={allCars.length} />
          <FAQSection cityName={cityName} carCount={allCars.length} minPrice={minPrice} />
          <RelatedCities currentCity={cityName} />
        </div>
        
        <Footer />
      </div>
    </>
  )
}