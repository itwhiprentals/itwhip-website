// app/rideshare/page.tsx
// Rideshare Landing Page - Cloned from Homepage Design

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'
import PartnerSection from './components/PartnerSection'
import VehicleCarousel from './components/VehicleCarousel'
import QuickActionsBar from '@/app/rentals-sections/QuickActionsBar'
import BrowseByTypeSection from '@/app/rentals-sections/BrowseByTypeSection'

export const metadata: Metadata = {
  title: 'Rideshare Vehicle Rentals - Uber & Lyft Cars | ItWhip Rides',
  description: 'Rent fuel-efficient vehicles perfect for Uber, Lyft, and DoorDash in Arizona. Commercial insurance included. Daily, weekly, and monthly rates available.',
  keywords: 'rideshare rentals, uber car rental, lyft vehicle rental, doordash car, phoenix rideshare, arizona rideshare vehicles',
  openGraph: {
    title: 'Rideshare Vehicle Rentals in Arizona',
    description: 'Perfect cars for Uber, Lyft & DoorDash drivers',
    images: ['/rideshare/hero-prius-highway.jpg'],
    type: 'website'
  }
}

// Rideshare-specific benefits
const rideshareBenefits = [
  {
    icon: IoCashOutline,
    title: 'Low Rates',
    description: 'Affordable daily, weekly, and monthly rates starting at $35/day',
    stat: 'Flexible terms'
  },
  {
    icon: IoFlashOutline,
    title: 'Instant Approval',
    description: 'Get approved in minutes, drive today',
    stat: 'Same-day pickup'
  },
  {
    icon: IoConstructOutline,
    title: 'Maintained Vehicles',
    description: 'All vehicles inspected and rideshare-ready',
    stat: 'Fleet quality'
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Insurance Included',
    description: 'Commercial rideshare insurance on all rentals',
    stat: 'Fully covered'
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
    name: 'Lyft',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/Lyft-Logo.png',
    bgColor: 'bg-white',
    logoHeight: 'h-8',
    extraClass: ''
  },
  {
    name: 'DoorDash',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/DoorDash-Logo.png',
    bgColor: 'bg-white',
    logoHeight: 'h-14',
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
            isActive: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
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
      .filter(p => p.cars.length > 0)
      .map(partner => ({
        id: partner.id,
        companyName: partner.partnerCompanyName || partner.displayName || 'Partner Fleet',
        slug: partner.partnerSlug,
        logo: partner.partnerLogo,
        bio: partner.partnerBio,
        fleetSize: partner.partnerFleetSize || partner.cars.length,
        avgRating: partner.averageRating || 0,
        totalReviews: partner.totalReviews || 0,
        location: partner.location,
        vehicles: partner.cars.map((car: any) => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          dailyRate: car.dailyRate,
          weeklyRate: car.weeklyRate || undefined,
          photo: car.photos?.[0] || null,
          photos: car.photos || [],
          location: car.city && car.state ? `${car.city}, ${car.state}` : '',
          instantBook: car.instantBook || false,
          transmission: car.transmission || 'Automatic',
          fuelType: car.fuelType || 'Gasoline',
          seats: car.seats || 5,
          rating: car.rating || 0,
          trips: car.totalTrips || 0
        })),
        discounts: partner.partnerDiscounts.map(d => ({
          id: d.id,
          code: d.code,
          title: d.title,
          description: d.description,
          percentage: d.percentage,
          expiresAt: d.expiresAt?.toISOString() || null
        })),
        hasActiveDiscount: partner.partnerDiscounts.length > 0
      }))
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
        host: {
          hostType: 'MANAGED',
          active: true,
          approvalStatus: 'APPROVED'
        }
      }
    })

    return {
      vehicles: vehicles.map((car: any) => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        dailyRate: car.dailyRate,
        weeklyRate: car.weeklyRate || undefined,
        photo: car.photos?.[0] || null,
        photos: car.photos || [],
        location: car.city && car.state ? `${car.city}, ${car.state}` : '',
        instantBook: car.instantBook || false,
        transmission: car.transmission || 'Automatic',
        fuelType: car.fuelType || 'Gasoline',
        seats: car.seats || 5,
        rating: car.rating || 0,
        trips: car.totalTrips || 0
      })),
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

        {/* Browse By Type Section */}
        <BrowseByTypeSection />

        {/* Section Separator */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* ItWhip Rideshare Vehicles - Our Company Fleet (Always Shown First) */}
        <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
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

            {platformData.vehicles.length > 0 ? (
              <VehicleCarousel vehicles={platformData.vehicles} />
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No vehicles available at the moment. Check back soon!
                </p>
              </div>
            )}

            {/* Mobile View All Button */}
            <div className="mt-6 text-center sm:hidden">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* Partner Fleets Section */}
        {partners.length > 0 && (
          <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  Verified Partners
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  Partner Fleet Rentals
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Approved fleet partners with rideshare-ready vehicles
                </p>
              </div>

              <div className="space-y-12">
                {partners.map((partner) => (
                  <PartnerSection key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section - 4 Cards */}
        <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                Why Choose ItWhip
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                Why Rideshare with ItWhip?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* Lifestyle Images Section */}
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* How It Works Section */}
        <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* Rideshare Partners Section */}
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              All our vehicles are approved for:
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* Ready to Start Driving CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Driving?
            </h2>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
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
