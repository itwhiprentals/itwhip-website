// app/rideshare/page.tsx
// Rideshare Landing Page - Cloned from Homepage Design

import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/app/lib/database/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoSearchOutline,
  IoLocationOutline,
  IoCarOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoConstructOutline,
  IoArrowForwardOutline,
  IoLeafOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'
import PartnerSection from './components/PartnerSection'
import VehicleCarousel from './components/VehicleCarousel'
import QuickActionsBar from '@/app/rentals-sections/QuickActionsBar'
import BrowseByMakeSection from './components/BrowseByMakeSection'

export const metadata: Metadata = {
  title: 'Rideshare Rentals from $249/week | Uber & Lyft Cars Phoenix | ItWhip',
  description: 'Rent rideshare-approved vehicles in Phoenix from $249/week. Pre-approved for Uber, Lyft, DoorDash & Instacart. Toyota, Honda, Hyundai hybrids with 40-50 MPG. Maintenance included.',
  keywords: 'rideshare rentals, uber car rental, lyft vehicle rental, doordash car, phoenix rideshare, arizona rideshare vehicles, rideshare car phoenix, uber approved cars',
  alternates: {
    canonical: 'https://itwhip.com/rideshare',
  },
  openGraph: {
    title: 'Rideshare Rentals from $249/week | Uber & Lyft Cars Phoenix',
    description: 'Rent rideshare-approved vehicles in Phoenix. Pre-approved for Uber, Lyft, DoorDash. 40-50 MPG hybrids with maintenance included.',
    url: 'https://itwhip.com/rideshare',
    images: ['/rideshare/hero-prius-highway.jpg'],
    type: 'website',
    siteName: 'ItWhip',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rideshare Rentals from $249/week | Phoenix',
    description: 'Pre-approved for Uber, Lyft, DoorDash. 40-50 MPG hybrids with maintenance included.',
  }
}

// JSON-LD Structured Data for SEO
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
    { '@type': 'ListItem', position: 2, name: 'Rideshare Rentals', item: 'https://itwhip.com/rideshare' }
  ]
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the minimum rental period for rideshare vehicles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our rideshare rentals require a minimum 3-day booking. Weekly rentals start at $249/week with unlimited mileage included.'
      }
    },
    {
      '@type': 'Question',
      name: 'Are vehicles pre-approved for Uber, Lyft, and DoorDash?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, every vehicle in our rideshare fleet meets requirements for Uber, Lyft, DoorDash, Instacart, and Amazon Flex. No surprises when you activate your driver account.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is maintenance included with rideshare rentals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, all maintenance and repairs are covered with your rental. Oil changes, tire rotations, and mechanical issues are our responsibility so you can focus on driving and earning.'
      }
    },
    {
      '@type': 'Question',
      name: 'What fuel efficiency can I expect from rideshare vehicles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All vehicles in our rideshare fleet achieve 32-50+ MPG. Our hybrid options like Toyota Prius and Camry Hybrid can save you hundreds monthly on fuel costs.'
      }
    },
    {
      '@type': 'Question',
      name: 'How quickly can I get approved and start driving?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Same-day approval is available. Complete our quick verification process, pick up your vehicle the same day, and start earning immediately.'
      }
    }
  ]
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Rent a Rideshare Vehicle in Phoenix',
  description: 'Get on the road with a rideshare-approved vehicle in three simple steps.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Browse & Book',
      text: 'Find the perfect rideshare vehicle from our selection of fuel-efficient, app-approved cars. Filter by make, price, or location.'
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Get Approved',
      text: 'Complete our quick verification process designed specifically for rideshare drivers. Same-day approval available.'
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Start Earning',
      text: 'Pick up your vehicle and start driving for Uber, Lyft, DoorDash, or any delivery platform immediately.'
    }
  ]
}

const autoRentalSchema = {
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  '@id': 'https://itwhip.com/rideshare#autorental',
  name: 'ItWhip Rideshare Vehicle Rentals',
  description: 'Rideshare-approved vehicle rentals in Phoenix from $249/week. Pre-approved for Uber, Lyft, DoorDash with maintenance included.',
  url: 'https://itwhip.com/rideshare',
  telephone: '+1-305-399-9069',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1 N 1st St',
    addressLocality: 'Phoenix',
    addressRegion: 'AZ',
    postalCode: '85004',
    addressCountry: 'US'
  },
  image: 'https://itwhip.com/og-image.jpg',
  priceRange: '$249-$399/week',
  areaServed: {
    '@type': 'State',
    name: 'Arizona',
    containsPlace: [
      { '@type': 'City', name: 'Phoenix' },
      { '@type': 'City', name: 'Scottsdale' },
      { '@type': 'City', name: 'Tempe' },
      { '@type': 'City', name: 'Mesa' }
    ]
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '182',
    reviewCount: '182',
    bestRating: '5',
    worstRating: '1'
  }
}

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Rideshare Vehicle Makes Available',
  description: 'Browse rideshare-approved vehicles by make',
  numberOfItems: 6,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Toyota', url: 'https://itwhip.com/rideshare/makes/toyota' },
    { '@type': 'ListItem', position: 2, name: 'Honda', url: 'https://itwhip.com/rideshare/makes/honda' },
    { '@type': 'ListItem', position: 3, name: 'Nissan', url: 'https://itwhip.com/rideshare/makes/nissan' },
    { '@type': 'ListItem', position: 4, name: 'Hyundai', url: 'https://itwhip.com/rideshare/makes/hyundai' },
    { '@type': 'ListItem', position: 5, name: 'Kia', url: 'https://itwhip.com/rideshare/makes/kia' },
    { '@type': 'ListItem', position: 6, name: 'Chevrolet', url: 'https://itwhip.com/rideshare/makes/chevrolet' }
  ]
}

// Rideshare-specific benefits - Including "Why These 6 Makes" content
const rideshareBenefits = [
  {
    icon: IoLeafOutline,
    title: 'Maximum Fuel Efficiency',
    description: 'All vehicles achieve 32-50+ MPG. More miles = more earnings. Our hybrids save you hundreds monthly.',
    stat: '40-50+ MPG'
  },
  {
    icon: IoSpeedometerOutline,
    title: 'Proven Reliability',
    description: 'Our 6 makes have the lowest breakdown rates in rideshare. Less downtime = more earning hours.',
    stat: '99% Uptime'
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Pre-Approved for All Apps',
    description: 'Every vehicle meets Uber, Lyft, DoorDash, Instacart & Amazon Flex requirements. No surprises.',
    stat: '6 Trusted Brands'
  },
  {
    icon: IoConstructOutline,
    title: 'Maintenance Included',
    description: 'All maintenance and repairs covered. Just focus on driving and earning.',
    stat: 'Zero Hassle'
  },
  {
    icon: IoCashOutline,
    title: 'Affordable Weekly Rates',
    description: 'Competitive pricing starting at $249/week with unlimited mileage included.',
    stat: 'from $249/week'
  },
  {
    icon: IoFlashOutline,
    title: 'Same-Day Approval',
    description: 'Get approved in minutes, pick up your vehicle today, and start earning immediately.',
    stat: 'Drive Today'
  }
]

// How it works steps
const howItWorksSteps = [
  {
    step: 1,
    title: 'Browse & Book',
    description: 'Find the perfect rideshare vehicle in minutes'
  },
  {
    step: 2,
    title: 'Get Approved',
    description: 'Quick verification process for rideshare drivers'
  },
  {
    step: 3,
    title: 'Start Earning',
    description: 'Pick up your vehicle and hit the road'
  }
]

// Lifestyle images with overlay text
const lifestyleImages = [
  {
    src: '/rideshare/lifestyle-sunset.jpg',
    alt: 'Driver at sunset',
    title: 'Drive with Confidence',
    subtitle: 'Reliable vehicles for every shift'
  },
  {
    src: '/rideshare/lifestyle-navigation.jpg',
    alt: 'Rideshare navigation',
    title: 'Maximize Your Earnings',
    subtitle: 'Fuel-efficient cars that save you money'
  },
  {
    src: '/rideshare/lifestyle-fleet.jpg',
    alt: 'Fleet lineup',
    title: 'Professional Fleet Management',
    subtitle: 'Maintained by certified technicians'
  }
]

// Rideshare platform partners with official logos
const ridesharePartners = [
  {
    name: 'Uber',
    logo: 'https://logos-world.net/wp-content/uploads/2020/05/Uber-Logo.png',
    bgColor: 'bg-white',
    logoHeight: 'h-8',
    extraClass: 'grayscale'
  },
  {
    name: 'DoorDash',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/DoorDash-Logo.png',
    bgColor: 'bg-white',
    logoHeight: 'h-14',
    extraClass: ''
  },
  {
    name: 'Lyft',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/Lyft-Logo.png',
    bgColor: 'bg-white',
    logoHeight: 'h-8',
    extraClass: ''
  },
  {
    name: 'Instacart',
    logo: 'https://logos-world.net/wp-content/uploads/2022/01/Instacart-Logo.png',
    bgColor: 'bg-white',
    logoHeight: 'h-14',
    extraClass: ''
  },
  {
    name: 'Amazon Flex',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png',
    bgColor: 'bg-white',
    logoHeight: 'h-12',
    extraClass: ''
  }
]

async function getPartners() {
  try {
    const partners = await prisma.rentalHost.findMany({
      where: {
        hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
        approvalStatus: 'APPROVED',
        active: true
      },
      include: {
        cars: {
          where: {
            isActive: true,
            vehicleType: 'RIDESHARE'  // Only show rideshare vehicles
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            trim: true,
            dailyRate: true,
            weeklyRate: true,
            photos: true,
            city: true,
            state: true,
            instantBook: true,
            transmission: true,
            fuelType: true,
            seats: true,
            rating: true,
            totalTrips: true
          }
        },
        partnerDiscounts: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          },
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            percentage: true,
            expiresAt: true
          }
        }
      },
      orderBy: { partnerFleetSize: 'desc' }
    })

    return partners
      .filter((p: any) => p.cars.length > 0)
      .map((partner: any) => {
        // Calculate avg rating - only count cars with actual trips (ignores DB default of 5.0)
        const carsWithTrips = partner.cars.filter((c: any) => c.totalTrips > 0 && c.rating > 0)
        const calculatedRating = carsWithTrips.length > 0
          ? carsWithTrips.reduce((sum: number, c: any) => sum + c.rating, 0) / carsWithTrips.length
          : 0

        return {
          id: partner.id,
          companyName: partner.partnerCompanyName || partner.name || 'Partner Fleet',
          slug: partner.partnerSlug,
          logo: partner.partnerLogo,
          bio: partner.partnerBio,
          fleetSize: partner.partnerFleetSize || partner.cars.length,
          avgRating: partner.partnerAvgRating || calculatedRating,
          totalReviews: partner.totalReviews || 0,
          location: partner.location,
          vehicles: partner.cars.map((car: any) => {
            // Extract photo URL from photo objects (photos are [{url, id, ...}])
            const firstPhoto = car.photos?.[0]
            const photoUrl = typeof firstPhoto === 'string' ? firstPhoto : firstPhoto?.url || null

            return {
              id: car.id,
              make: car.make,
              model: car.model,
              year: car.year,
              trim: car.trim || null,
              dailyRate: car.dailyRate,
              weeklyRate: car.weeklyRate || undefined,
              photo: photoUrl,
              photos: car.photos?.map((p: any) => typeof p === 'string' ? p : p?.url).filter(Boolean) || [],
              location: car.city && car.state ? `${car.city}, ${car.state}` : '',
              instantBook: car.instantBook || false,
              transmission: car.transmission || 'Automatic',
              fuelType: car.fuelType || 'Gasoline',
              seats: car.seats || 5,
              // Only use rating if car has real trips, otherwise 0 (ignores DB default of 5.0)
              rating: car.totalTrips > 0 ? (car.rating || 0) : 0,
              trips: car.totalTrips || 0
            }
          }),
        discounts: partner.partnerDiscounts.map((d: any) => ({
          id: d.id,
          code: d.code,
          title: d.title,
          description: d.description,
          percentage: d.percentage,
          expiresAt: d.expiresAt?.toISOString() || null
        })),
        hasActiveDiscount: partner.partnerDiscounts.length > 0,
        // Stripe verification: verified if payouts enabled AND details submitted
        isStripeVerified: Boolean(partner.stripePayoutsEnabled && partner.stripeDetailsSubmitted)
        }
      })
  } catch (error) {
    console.error('[Rideshare] Error fetching partners:', error)
    return []
  }
}

async function getPlatformVehicles() {
  try {
    const vehicles = await prisma.rentalCar.findMany({
      where: {
        isActive: true,
        vehicleType: 'RIDESHARE',  // Only show rideshare vehicles
        host: {
          hostType: 'MANAGED',
          active: true,
          approvalStatus: 'APPROVED'
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        trim: true,
        dailyRate: true,
        weeklyRate: true,
        photos: true,
        city: true,
        state: true,
        instantBook: true,
        transmission: true,
        fuelType: true,
        seats: true,
        rating: true,
        totalTrips: true
      }
    })

    const totalCount = await prisma.rentalCar.count({
      where: {
        isActive: true,
        vehicleType: 'RIDESHARE',  // Only count rideshare vehicles
        host: {
          hostType: 'MANAGED',
          active: true,
          approvalStatus: 'APPROVED'
        }
      }
    })

    return {
      vehicles: vehicles.map((car: any) => {
        // Extract photo URL from photo objects (photos are [{url, id, ...}])
        const firstPhoto = car.photos?.[0]
        const photoUrl = typeof firstPhoto === 'string' ? firstPhoto : firstPhoto?.url || null

        return {
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          trim: car.trim || null,
          dailyRate: car.dailyRate,
          weeklyRate: car.weeklyRate || undefined,
          photo: photoUrl,
          photos: car.photos?.map((p: any) => typeof p === 'string' ? p : p?.url).filter(Boolean) || [],
          location: car.city && car.state ? `${car.city}, ${car.state}` : '',
          instantBook: car.instantBook || false,
          transmission: car.transmission || 'Automatic',
          fuelType: car.fuelType || 'Gasoline',
          seats: car.seats || 5,
          // Only use rating if car has real trips, otherwise 0 (ignores DB default of 5.0)
          rating: car.totalTrips > 0 ? (car.rating || 0) : 0,
          trips: car.totalTrips || 0
        }
      }),
      totalCount
    }
  } catch (error) {
    console.error('[Rideshare] Error fetching platform vehicles:', error)
    return { vehicles: [], totalCount: 0 }
  }
}

export default async function RidesharePage() {
  const [partners, platformData] = await Promise.all([
    getPartners(),
    getPlatformVehicles()
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(autoRentalSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <Header />

      <div className="pt-16">
        {/* Hero Section - Matching Homepage Style */}
        <section className="relative w-full min-h-[45vh] md:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/rideshare/hero-rideshare-driver.jpg"
              alt="Rideshare driver in vehicle"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 md:-mt-12">
            <div className="text-center mb-4 sm:mb-5">
              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-1 sm:mb-1.5 leading-tight">
                Rideshare Vehicle Rentals <span className="text-orange-400">in Arizona</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                • Perfect for Uber, Lyft & DoorDash • Insurance included •
              </p>
            </div>

            {/* Search Bar - Compact Width */}
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto mb-4">
              <div className="flex-1 relative">
                <IoLocationOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your city..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
                />
              </div>
              <button className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg text-sm">
                <IoSearchOutline className="w-4 h-4" />
                Browse
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-green-400" />
                Min 3 Day Booking
              </span>
              <span className="flex items-center gap-1.5">
                <IoFlashOutline className="w-4 h-4 text-yellow-400" />
                Instant Booking
              </span>
              <span className="flex items-center gap-1.5">
                <IoCarOutline className="w-4 h-4 text-blue-400" />
                Rideshare Approved
              </span>
            </div>
          </div>
        </section>

        {/* Quick Actions Bar - Sticky Navigation */}
        <QuickActionsBar variant="rideshare" />

        {/* TODO: Add dynamic car listings section here when rideshare inventory grows
            - Query rideshare vehicles from database (vehicleType: 'RIDESHARE')
            - Display grid of available vehicles with filters
            - Include pricing, availability, and instant book badges
            - Link to individual car detail pages (/rentals/[carId])
        */}

        {/* Browse By Make Section - 6 Dedicated Rideshare Brands */}
        <BrowseByMakeSection />

        {/* Section Separator after Browse By Make */}
        <div className="flex justify-center py-2">
          <div className="w-16 h-1 bg-orange-400 rounded-full" />
        </div>

        {/* ItWhip Rideshare Vehicles - Our Company Fleet (Only shown if vehicles exist) */}
        {platformData.totalCount > 0 && (
          <>
            <section className="py-5 bg-white dark:bg-gray-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <img
                        src="/logo.png"
                        alt="ItWhip Logo"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider">
                        Featured Fleet
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        ItWhip Rideshare Vehicles
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {platformData.totalCount} rideshare-ready vehicles • Managed by ItWhip
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/rideshare/itwhip"
                    className="hidden sm:flex items-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    View Fleet <IoArrowForwardOutline className="w-4 h-4" />
                  </Link>
                </div>

                <VehicleCarousel vehicles={platformData.vehicles} />

                {/* Mobile View All Button */}
                <div className="mt-4 text-center sm:hidden">
                  <Link
                    href="/rideshare/itwhip"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    View All ItWhip Vehicles <IoArrowForwardOutline className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Section Separator */}
            <div className="flex justify-center py-2">
              <div className="w-16 h-1 bg-orange-400 rounded-full" />
            </div>
          </>
        )}

        {/* Partner Fleets Section */}
        {partners.length > 0 && (
          <section className="py-5 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-5">
                <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  Verified Partners
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  Partner Fleet Rentals
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  Approved fleet partners with rideshare-ready vehicles
                </p>
              </div>

              <div className="space-y-6">
                {partners.map((partner: any) => (
                  <PartnerSection key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section - 4 Cards */}
        <section className="py-5 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-5">
              <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                Why Choose ItWhip
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                Why Rideshare with ItWhip?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {rideshareBenefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={benefit.title}
                    className="group bg-white dark:bg-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {benefit.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {benefit.description}
                        </p>
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                          {benefit.stat}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="flex justify-center py-2">
          <div className="w-16 h-1 bg-orange-400 rounded-full" />
        </div>

        {/* Lifestyle Images Section */}
        <section className="py-5 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {lifestyleImages.map((image) => (
                <div
                  key={image.title}
                  className="relative h-64 sm:h-80 rounded-xl overflow-hidden group"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gray-200">
                      {image.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="flex justify-center py-2">
          <div className="w-16 h-1 bg-orange-400 rounded-full" />
        </div>

        {/* How It Works Section */}
        <section className="py-5 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-5">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                How It Works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto">
                Get on the road in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {howItWorksSteps.map((item, index) => (
                <div key={item.step} className="relative text-center">
                  {/* Connecting line (hidden on mobile, hidden after last item) */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-orange-200 dark:bg-orange-800" />
                  )}

                  {/* Step number */}
                  <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="flex justify-center py-2">
          <div className="w-16 h-1 bg-orange-400 rounded-full" />
        </div>

        {/* Rideshare Partners Section */}
        <section className="py-5 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              All our vehicles are approved for:
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5">
              Drive for any major rideshare or delivery platform
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {ridesharePartners.map((partner) => (
                <div
                  key={partner.name}
                  className={`${partner.bgColor} px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center min-w-[100px] h-16`}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className={`${partner.logoHeight} w-auto object-contain ${partner.extraClass}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="flex justify-center py-2">
          <div className="w-16 h-1 bg-orange-400 rounded-full" />
        </div>

        {/* Ready to Start Driving CTA Section */}
        <section className="py-6 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Ready to Start Driving?
            </h2>
            <p className="text-lg text-orange-100 mb-5 max-w-2xl mx-auto">
              Join hundreds of rideshare drivers earning with ItWhip Rides.
              Find your perfect vehicle today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/cars"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
              >
                Browse Available Vehicles
                <IoArrowForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/partners/apply"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
