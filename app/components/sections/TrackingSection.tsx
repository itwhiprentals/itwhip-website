// app/components/sections/TrackingSection.tsx
// Compact tracking features display for home page - matches ArizonaEventsSection style
'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  IoLocationOutline,
  IoLockClosedOutline,
  IoCarSportOutline,
  IoSnowOutline,
  IoNavigateOutline,
  IoSpeedometerOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

export default function TrackingSection() {
  const t = useTranslations('Home')

  const trackingFeatures = [
    {
      icon: IoLocationOutline,
      title: t('trackingLiveGps'),
      description: t('trackingLiveGpsDesc'),
      highlights: [t('trackingLiveGpsH1'), t('trackingLiveGpsH2')]
    },
    {
      icon: IoLockClosedOutline,
      title: t('trackingRemoteLock'),
      description: t('trackingRemoteLockDesc'),
      highlights: [t('trackingRemoteLockH1'), t('trackingRemoteLockH2')]
    },
    {
      icon: IoCarSportOutline,
      title: t('trackingRemoteStart'),
      description: t('trackingRemoteStartDesc'),
      highlights: [t('trackingRemoteStartH1'), t('trackingRemoteStartH2')]
    },
    {
      icon: IoSnowOutline,
      title: t('trackingPreCool'),
      description: t('trackingPreCoolDesc'),
      highlights: [t('trackingPreCoolH1'), t('trackingPreCoolH2')]
    },
    {
      icon: IoNavigateOutline,
      title: t('trackingGeofencing'),
      description: t('trackingGeofencingDesc'),
      highlights: [t('trackingGeofencingH1'), t('trackingGeofencingH2')]
    },
    {
      icon: IoSpeedometerOutline,
      title: t('trackingMileage'),
      description: t('trackingMileageDesc'),
      highlights: [t('trackingMileageH1'), t('trackingMileageH2')]
    }
  ]

  return (
    <section className="py-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            {t('trackingLabel')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {t('trackingHeading')}
          </h2>
        </div>

        {/* Compact horizontal layout - 6 cards */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-3 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          {trackingFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="snap-center flex-shrink-0 w-[160px] sm:w-[180px] md:w-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{feature.description}</p>
                <div className="space-y-1">
                  {feature.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-1">
                      <IoCheckmarkCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="text-[10px] text-gray-600 dark:text-gray-400">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Compact CTA */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('trackingCta')}{' '}
            <Link
              href="/tracking"
              className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium hover:underline"
            >
              {t('trackingLearnMore')}
              <IoArrowForwardOutline className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
