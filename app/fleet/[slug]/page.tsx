// app/fleet/[slug]/page.tsx
// Public fleet page - Shows fleet manager profile and their managed vehicles

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoCarOutline,
  IoStarOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoMailOutline
} from 'react-icons/io5'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getFleetData(slug: string) {
  try {
    // Find the fleet manager by slug
    const manager = await prisma.rentalHost.findFirst({
      where: {
        hostManagerSlug: slug,
        isHostManager: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        hostManagerName: true,
        hostManagerBio: true,
        hostManagerLogo: true,
        isHostManager: true,
        managesOwnCars: true,
        managesOthersCars: true,
        createdAt: true,
        // Get own vehicles if they manage their own cars
        vehicles: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            weeklyRate: true,
            monthlyRate: true,
            rating: true,
            totalTrips: true,
            city: true,
            state: true,
            instantBook: true,
            seats: true,
            transmission: true,
            fuelType: true,
            photos: {
              where: { isHero: true },
              select: { url: true },
              take: 1
            }
          }
        },
        // Get managed vehicles
        managedVehicles: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                dailyRate: true,
                weeklyRate: true,
                monthlyRate: true,
                rating: true,
                totalTrips: true,
                city: true,
                state: true,
                instantBook: true,
                isActive: true,
                seats: true,
                transmission: true,
                fuelType: true,
                photos: {
                  where: { isHero: true },
                  select: { url: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    })

    if (!manager) {
      return null
    }

    // Combine own vehicles and managed vehicles
    const ownVehicles = manager.managesOwnCars ? manager.vehicles : []
    const managedVehicles = manager.managedVehicles
      .filter(mv => mv.vehicle.isActive)
      .map(mv => mv.vehicle)

    // Deduplicate vehicles (in case same vehicle appears in both)
    const vehicleMap = new Map()
    for (const v of [...ownVehicles, ...managedVehicles]) {
      if (!vehicleMap.has(v.id)) {
        vehicleMap.set(v.id, v)
      }
    }
    const allVehicles = Array.from(vehicleMap.values())

    // Calculate stats
    const totalTrips = allVehicles.reduce((sum, v) => sum + v.totalTrips, 0)
    const avgRating = allVehicles.length > 0
      ? allVehicles.reduce((sum, v) => sum + (v.rating || 0), 0) / allVehicles.filter(v => v.rating > 0).length
      : 0

    return {
      manager: {
        id: manager.id,
        name: manager.hostManagerName || manager.name,
        bio: manager.hostManagerBio,
        logo: manager.hostManagerLogo,
        profilePhoto: manager.profilePhoto,
        memberSince: manager.createdAt
      },
      vehicles: allVehicles,
      stats: {
        totalVehicles: allVehicles.length,
        totalTrips,
        avgRating: isNaN(avgRating) ? 0 : avgRating
      }
    }
  } catch (error) {
    console.error('Error fetching fleet data:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const data = await getFleetData(slug)

  if (!data) {
    return {
      title: 'Fleet Not Found | ItWhip',
      description: 'This fleet page could not be found.'
    }
  }

  return {
    title: `${data.manager.name}'s Fleet | ItWhip`,
    description: data.manager.bio || `Browse ${data.stats.totalVehicles} vehicles from ${data.manager.name}'s fleet on ItWhip.`
  }
}

export default async function FleetPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getFleetData(slug)

  if (!data) {
    notFound()
  }

  const { manager, vehicles, stats } = data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Fleet Logo/Photo */}
            <div className="relative">
              {manager.logo || manager.profilePhoto ? (
                <Image
                  src={manager.logo || manager.profilePhoto!}
                  alt={manager.name}
                  width={160}
                  height={160}
                  className="rounded-full border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <IoPeopleOutline className="w-20 h-20 text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-2 border-white">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Fleet Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                  Fleet Manager
                </span>
                <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm flex items-center gap-1">
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  Verified
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {manager.name}
              </h1>
              {manager.bio && (
                <p className="text-white/90 max-w-2xl text-lg mb-4">
                  {manager.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5" />
                  <span>{stats.totalVehicles} Vehicles</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoStarOutline className="w-5 h-5 text-yellow-300" />
                  <span>{stats.avgRating.toFixed(1)} Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                  <span>{stats.totalTrips} Trips Completed</span>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="hidden md:block">
              <Link
                href={`mailto:contact@itwhip.com?subject=Inquiry about ${manager.name}'s Fleet`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <IoMailOutline className="w-5 h-5" />
                Contact Fleet
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Available Vehicles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse and book from {manager.name}'s curated fleet
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-green-500" />
            All vehicles professionally managed
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No vehicles available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This fleet doesn't have any vehicles available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/cars/${vehicle.id}`}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                {/* Vehicle Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {vehicle.photos[0] ? (
                    <Image
                      src={vehicle.photos[0].url}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IoCarOutline className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {vehicle.instantBook && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 text-xs font-medium rounded-lg flex items-center gap-1">
                        <IoFlashOutline className="w-3 h-3" />
                        Instant
                      </span>
                    )}
                  </div>

                  {/* Rating Badge */}
                  {vehicle.rating > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-sm font-medium rounded-lg flex items-center gap-1 backdrop-blur-sm">
                      <IoStarOutline className="w-3 h-3 text-yellow-400" />
                      {vehicle.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <IoLocationOutline className="w-4 h-4 mr-1" />
                    {vehicle.city}, {vehicle.state}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>{vehicle.seats} seats</span>
                    <span>•</span>
                    <span>{vehicle.transmission}</span>
                    <span>•</span>
                    <span>{vehicle.fuelType}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${vehicle.dailyRate}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/day</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {vehicle.totalTrips} trips
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Want to list your vehicle with {manager.name}?
          </h2>
          <p className="text-white/80 mb-6">
            Join the fleet and earn passive income while an experienced manager handles everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/host/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <IoCarOutline className="w-5 h-5" />
              List Your Vehicle
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/30"
            >
              <IoMailOutline className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
