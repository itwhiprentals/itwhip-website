'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import {
  IoMapOutline,
  IoCarOutline,
  IoTimeOutline,
  IoNavigateOutline,
  IoSunnyOutline,
  IoSnowOutline,
  IoCameraOutline,
  IoRestaurantOutline,
  IoArrowForwardOutline,
  IoLocationOutline,
  IoSpeedometerOutline,
  IoCheckmarkCircle,
  IoLeafOutline,
  IoWaterOutline,
  IoTrailSignOutline
} from 'react-icons/io5'

interface Route {
  id: string
  name: string
  from: string
  to: string
  distance: string
  duration: string
  bestSeason: string
  description: string
  highlights: string[]
  recommendedVehicle: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  image: string
}

export default function TripPlannerPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  const routes: Route[] = [
    {
      id: 'grand-canyon',
      name: 'Phoenix to Grand Canyon',
      from: 'Phoenix',
      to: 'Grand Canyon South Rim',
      distance: '230 miles',
      duration: '4 hours',
      bestSeason: 'Spring & Fall',
      description: 'The classic Arizona road trip. Drive through high desert terrain to one of the world\'s most spectacular natural wonders.',
      highlights: ['Flagstaff stopover', 'Williams Route 66', 'Kaibab National Forest', 'Desert View Watchtower'],
      recommendedVehicle: 'SUV or Comfortable Sedan',
      difficulty: 'Easy',
      image: '/images/routes/grand-canyon.jpg'
    },
    {
      id: 'sedona',
      name: 'Phoenix to Sedona',
      from: 'Phoenix',
      to: 'Sedona',
      distance: '115 miles',
      duration: '2 hours',
      bestSeason: 'Year-round',
      description: 'A stunning drive through the Sonoran Desert up to the famous red rocks of Sedona. Perfect for a weekend getaway.',
      highlights: ['Oak Creek Canyon', 'Slide Rock State Park', 'Cathedral Rock', 'Tlaquepaque Arts Village'],
      recommendedVehicle: 'Any vehicle (SUV for off-road trails)',
      difficulty: 'Easy',
      image: '/images/routes/sedona.jpg'
    },
    {
      id: 'apache-trail',
      name: 'Apache Trail Scenic Drive',
      from: 'Apache Junction',
      to: 'Roosevelt Dam',
      distance: '40 miles',
      duration: '3 hours (with stops)',
      bestSeason: 'Oct - Apr',
      description: 'Historic route through the Superstition Mountains with dramatic canyon views, lakes, and Old West history.',
      highlights: ['Goldfield Ghost Town', 'Canyon Lake', 'Tortilla Flat', 'Theodore Roosevelt Dam'],
      recommendedVehicle: 'High-clearance SUV or Truck',
      difficulty: 'Challenging',
      image: '/images/routes/apache-trail.jpg'
    },
    {
      id: 'monument-valley',
      name: 'Phoenix to Monument Valley',
      from: 'Phoenix',
      to: 'Monument Valley',
      distance: '300 miles',
      duration: '5 hours',
      bestSeason: 'Spring & Fall',
      description: 'Journey to the iconic landscape of the Navajo Nation. Endless buttes and mesas made famous by countless Western films.',
      highlights: ['Navajo Nation', 'The Mittens', 'John Ford Point', 'Valley Drive'],
      recommendedVehicle: 'SUV recommended (Valley Drive requires high clearance)',
      difficulty: 'Moderate',
      image: '/images/routes/monument-valley.jpg'
    },
    {
      id: 'tucson',
      name: 'Phoenix to Tucson & Beyond',
      from: 'Phoenix',
      to: 'Tucson',
      distance: '115 miles',
      duration: '1.5 hours',
      bestSeason: 'Nov - Mar',
      description: 'Head south to Tucson, explore Saguaro National Park, and experience the Sonoran Desert at its finest.',
      highlights: ['Saguaro National Park', 'Arizona-Sonora Desert Museum', 'Mission San Xavier', 'Mount Lemmon'],
      recommendedVehicle: 'Any vehicle',
      difficulty: 'Easy',
      image: '/images/routes/tucson.jpg'
    },
    {
      id: 'route-66',
      name: 'Arizona Route 66',
      from: 'Flagstaff',
      to: 'Kingman',
      distance: '140 miles',
      duration: '3 hours',
      bestSeason: 'Year-round',
      description: 'Cruise the Mother Road through historic towns, quirky roadside attractions, and stunning high desert scenery.',
      highlights: ['Flagstaff Downtown', 'Williams', 'Seligman', 'Hackberry General Store'],
      recommendedVehicle: 'Convertible or Classic Car (for the vibe)',
      difficulty: 'Easy',
      image: '/images/routes/route-66.jpg'
    }
  ]

  const vehicleRecommendations = [
    {
      type: 'SUV',
      icon: IoCarOutline,
      routes: ['Grand Canyon', 'Monument Valley', 'Apache Trail'],
      why: 'High clearance for rough roads, space for gear, comfortable for long drives'
    },
    {
      type: 'Convertible',
      icon: IoSunnyOutline,
      routes: ['Sedona', 'Route 66', 'Tucson'],
      why: 'Open-air experience through scenic desert roads (best in cooler months)'
    },
    {
      type: 'Luxury Sedan',
      icon: IoLeafOutline,
      routes: ['Grand Canyon', 'Sedona', 'Tucson'],
      why: 'Comfort for long highway drives, premium sound system for the journey'
    },
    {
      type: 'Electric/Hybrid',
      icon: IoLeafOutline,
      routes: ['Sedona', 'Tucson'],
      why: 'Eco-friendly option for shorter trips with charging infrastructure'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <IoMapOutline className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Arizona Road Trips</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Trip Planner
            </h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto mb-8">
              Discover Arizona&apos;s most spectacular road trips. From the Grand Canyon to Monument Valley, we&apos;ll help you find the perfect route and vehicle.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <IoTrailSignOutline className="w-5 h-5 text-white" />
                <span className="text-white">6 Epic Routes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <IoSpeedometerOutline className="w-5 h-5 text-white" />
                <span className="text-white">500+ Vehicles</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <IoSunnyOutline className="w-5 h-5 text-white" />
                <span className="text-white">Year-Round Adventures</span>
              </div>
            </div>
          </div>
        </section>

        {/* Routes Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Popular Arizona Road Trips
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                >
                  {/* Route Image Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-500 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IoMapOutline className="w-16 h-16 text-white/30" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        route.difficulty === 'Easy' ? 'bg-emerald-500 text-white' :
                        route.difficulty === 'Moderate' ? 'bg-amber-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {route.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-black/50 rounded text-xs text-white">
                        {route.distance}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {route.name}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <IoTimeOutline className="w-4 h-4" />
                        {route.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <IoSunnyOutline className="w-4 h-4" />
                        {route.bestSeason}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {route.description}
                    </p>

                    {selectedRoute === route.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Highlights</h4>
                          <div className="flex flex-wrap gap-2">
                            {route.highlights.map((highlight, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Vehicle</h4>
                          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <IoCarOutline className="w-4 h-4" />
                            {route.recommendedVehicle}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Link
                        href={`/rentals/search?location=Phoenix`}
                        className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Find a car for this trip
                      </Link>
                      <IoArrowForwardOutline className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Recommendations */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Choose the Right Vehicle
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicleRecommendations.map((rec, index) => {
                const Icon = rec.icon
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{rec.type}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{rec.why}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Best for:</p>
                      {rec.routes.map((route, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                          {route}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Seasonal Tips */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Seasonal Driving Tips
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-orange-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <IoSunnyOutline className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Summer (May - Sep)</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    Head to higher elevations (Flagstaff, Sedona) to escape the heat
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    Start drives early morning to avoid peak temperatures
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    All ItWhip vehicles are MaxAC™ certified for desert heat
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    Carry extra water for any desert drives
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <IoSnowOutline className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Winter (Nov - Mar)</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Perfect weather for desert driving and hiking
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Check weather for northern routes (snow possible in Flagstaff)
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Book convertibles for comfortable open-air driving
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Peak season for Arizona tourism - book vehicles early
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready for Your Arizona Adventure?
              </h2>
              <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                Find the perfect vehicle for your road trip. From SUVs for the Grand Canyon to convertibles for Route 66.
              </p>
              <Link
                href="/rentals/search"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
              >
                <IoCarOutline className="w-5 h-5" />
                Browse Available Vehicles
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
