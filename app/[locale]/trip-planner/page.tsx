'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Link } from '@/i18n/navigation'
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
  nameKey: string
  fromKey: string
  toKey: string
  distanceKey: string
  durationKey: string
  bestSeasonKey: string
  descriptionKey: string
  highlightKeys: string[]
  recommendedVehicleKey: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  image: string
}

export default function TripPlannerPage() {
  const t = useTranslations('TripPlanner')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  const routes: Route[] = [
    {
      id: 'grand-canyon',
      nameKey: 'routes.grandCanyon.name',
      fromKey: 'routes.grandCanyon.from',
      toKey: 'routes.grandCanyon.to',
      distanceKey: 'routes.grandCanyon.distance',
      durationKey: 'routes.grandCanyon.duration',
      bestSeasonKey: 'routes.grandCanyon.bestSeason',
      descriptionKey: 'routes.grandCanyon.description',
      highlightKeys: [
        'routes.grandCanyon.highlights.0',
        'routes.grandCanyon.highlights.1',
        'routes.grandCanyon.highlights.2',
        'routes.grandCanyon.highlights.3'
      ],
      recommendedVehicleKey: 'routes.grandCanyon.recommendedVehicle',
      difficulty: 'Easy',
      image: '/images/routes/grand-canyon.jpg'
    },
    {
      id: 'sedona',
      nameKey: 'routes.sedona.name',
      fromKey: 'routes.sedona.from',
      toKey: 'routes.sedona.to',
      distanceKey: 'routes.sedona.distance',
      durationKey: 'routes.sedona.duration',
      bestSeasonKey: 'routes.sedona.bestSeason',
      descriptionKey: 'routes.sedona.description',
      highlightKeys: [
        'routes.sedona.highlights.0',
        'routes.sedona.highlights.1',
        'routes.sedona.highlights.2',
        'routes.sedona.highlights.3'
      ],
      recommendedVehicleKey: 'routes.sedona.recommendedVehicle',
      difficulty: 'Easy',
      image: '/images/routes/sedona.jpg'
    },
    {
      id: 'apache-trail',
      nameKey: 'routes.apacheTrail.name',
      fromKey: 'routes.apacheTrail.from',
      toKey: 'routes.apacheTrail.to',
      distanceKey: 'routes.apacheTrail.distance',
      durationKey: 'routes.apacheTrail.duration',
      bestSeasonKey: 'routes.apacheTrail.bestSeason',
      descriptionKey: 'routes.apacheTrail.description',
      highlightKeys: [
        'routes.apacheTrail.highlights.0',
        'routes.apacheTrail.highlights.1',
        'routes.apacheTrail.highlights.2',
        'routes.apacheTrail.highlights.3'
      ],
      recommendedVehicleKey: 'routes.apacheTrail.recommendedVehicle',
      difficulty: 'Challenging',
      image: '/images/routes/apache-trail.jpg'
    },
    {
      id: 'monument-valley',
      nameKey: 'routes.monumentValley.name',
      fromKey: 'routes.monumentValley.from',
      toKey: 'routes.monumentValley.to',
      distanceKey: 'routes.monumentValley.distance',
      durationKey: 'routes.monumentValley.duration',
      bestSeasonKey: 'routes.monumentValley.bestSeason',
      descriptionKey: 'routes.monumentValley.description',
      highlightKeys: [
        'routes.monumentValley.highlights.0',
        'routes.monumentValley.highlights.1',
        'routes.monumentValley.highlights.2',
        'routes.monumentValley.highlights.3'
      ],
      recommendedVehicleKey: 'routes.monumentValley.recommendedVehicle',
      difficulty: 'Moderate',
      image: '/images/routes/monument-valley.jpg'
    },
    {
      id: 'tucson',
      nameKey: 'routes.tucson.name',
      fromKey: 'routes.tucson.from',
      toKey: 'routes.tucson.to',
      distanceKey: 'routes.tucson.distance',
      durationKey: 'routes.tucson.duration',
      bestSeasonKey: 'routes.tucson.bestSeason',
      descriptionKey: 'routes.tucson.description',
      highlightKeys: [
        'routes.tucson.highlights.0',
        'routes.tucson.highlights.1',
        'routes.tucson.highlights.2',
        'routes.tucson.highlights.3'
      ],
      recommendedVehicleKey: 'routes.tucson.recommendedVehicle',
      difficulty: 'Easy',
      image: '/images/routes/tucson.jpg'
    },
    {
      id: 'route-66',
      nameKey: 'routes.route66.name',
      fromKey: 'routes.route66.from',
      toKey: 'routes.route66.to',
      distanceKey: 'routes.route66.distance',
      durationKey: 'routes.route66.duration',
      bestSeasonKey: 'routes.route66.bestSeason',
      descriptionKey: 'routes.route66.description',
      highlightKeys: [
        'routes.route66.highlights.0',
        'routes.route66.highlights.1',
        'routes.route66.highlights.2',
        'routes.route66.highlights.3'
      ],
      recommendedVehicleKey: 'routes.route66.recommendedVehicle',
      difficulty: 'Easy',
      image: '/images/routes/route-66.jpg'
    }
  ]

  const vehicleRecommendations = [
    {
      typeKey: 'vehicles.suv.type',
      icon: IoCarOutline,
      routeKeys: ['vehicles.suv.routes.0', 'vehicles.suv.routes.1', 'vehicles.suv.routes.2'],
      whyKey: 'vehicles.suv.why'
    },
    {
      typeKey: 'vehicles.convertible.type',
      icon: IoSunnyOutline,
      routeKeys: ['vehicles.convertible.routes.0', 'vehicles.convertible.routes.1', 'vehicles.convertible.routes.2'],
      whyKey: 'vehicles.convertible.why'
    },
    {
      typeKey: 'vehicles.luxurySedan.type',
      icon: IoLeafOutline,
      routeKeys: ['vehicles.luxurySedan.routes.0', 'vehicles.luxurySedan.routes.1', 'vehicles.luxurySedan.routes.2'],
      whyKey: 'vehicles.luxurySedan.why'
    },
    {
      typeKey: 'vehicles.electricHybrid.type',
      icon: IoLeafOutline,
      routeKeys: ['vehicles.electricHybrid.routes.0', 'vehicles.electricHybrid.routes.1'],
      whyKey: 'vehicles.electricHybrid.why'
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
              <span className="text-sm font-medium text-white">{t('hero.badge')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <IoTrailSignOutline className="w-5 h-5 text-white" />
                <span className="text-white">{t('hero.stats.routes')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <IoSpeedometerOutline className="w-5 h-5 text-white" />
                <span className="text-white">{t('hero.stats.vehicles')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <IoSunnyOutline className="w-5 h-5 text-white" />
                <span className="text-white">{t('hero.stats.adventures')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Routes Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {t('routesSection.title')}
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
                        {t(`difficulty.${route.difficulty.toLowerCase()}`)}
                      </span>
                      <span className="px-2 py-1 bg-black/50 rounded text-xs text-white">
                        {t(route.distanceKey)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {t(route.nameKey)}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <IoTimeOutline className="w-4 h-4" />
                        {t(route.durationKey)}
                      </div>
                      <div className="flex items-center gap-1">
                        <IoSunnyOutline className="w-4 h-4" />
                        {t(route.bestSeasonKey)}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {t(route.descriptionKey)}
                    </p>

                    {selectedRoute === route.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('routeCard.highlights')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {route.highlightKeys.map((highlightKey, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                                {t(highlightKey)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('routeCard.recommendedVehicle')}</h4>
                          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <IoCarOutline className="w-4 h-4" />
                            {t(route.recommendedVehicleKey)}
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
                        {t('routeCard.findCar')}
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
              {t('vehicleSection.title')}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicleRecommendations.map((rec, index) => {
                const Icon = rec.icon
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t(rec.typeKey)}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t(rec.whyKey)}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('vehicleSection.bestFor')}</p>
                      {rec.routeKeys.map((routeKey, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                          {t(routeKey)}
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
              {t('seasonalSection.title')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-orange-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <IoSunnyOutline className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{t('seasonalSection.summer.title')}</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.summer.tip1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.summer.tip2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.summer.tip3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.summer.tip4')}
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <IoSnowOutline className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{t('seasonalSection.winter.title')}</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.winter.tip1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.winter.tip2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.winter.tip3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {t('seasonalSection.winter.tip4')}
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
                {t('cta.title')}
              </h2>
              <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <Link
                href="/rentals/search"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
              >
                <IoCarOutline className="w-5 h-5" />
                {t('cta.button')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
