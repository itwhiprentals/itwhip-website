// app/partner/dashboard/components/QuickActions.tsx
// Quick Actions Component - Common partner actions

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  IoAddCircleOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoSettingsOutline,
  IoPricetagOutline,
  IoAnalyticsOutline,
  IoIdCardOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

const actions = [
  {
    nameKey: 'qaAddVehicle',
    descKey: 'qaAddVehicleDesc',
    href: '/partner/fleet/add',
    icon: IoAddCircleOutline,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  },
  {
    nameKey: 'qaViewBookings',
    descKey: 'qaViewBookingsDesc',
    href: '/partner/bookings',
    icon: IoCalendarOutline,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  },
  {
    nameKey: 'qaIdVerification',
    descKey: 'qaIdVerificationDesc',
    href: '/partner/settings',
    icon: IoIdCardOutline,
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
  },
  {
    nameKey: 'qaCreateDiscount',
    descKey: 'qaCreateDiscountDesc',
    href: '/partner/discounts',
    icon: IoPricetagOutline,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  },
  {
    nameKey: 'qaViewAnalytics',
    descKey: 'qaViewAnalyticsDesc',
    href: '/partner/analytics',
    icon: IoAnalyticsOutline,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  },
  {
    nameKey: 'qaSettings',
    descKey: 'qaSettingsDesc',
    href: '/partner/settings',
    icon: IoSettingsOutline,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
]

export default function QuickActions() {
  const t = useTranslations('PartnerDashboard')
  const [isBusinessHost, setIsBusinessHost] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/partner/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsBusinessHost(data.settings.isBusinessHost || false)
        }
      })
      .catch(() => setIsBusinessHost(false))
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.nameKey}
            href={action.href}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              {t(action.nameKey)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t(action.descKey)}
            </span>
          </Link>
        )
      })}

      {/* Landing Page — gated on isBusinessHost */}
      {isBusinessHost ? (
        <Link
          href="/partner/landing"
          className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <IoDocumentTextOutline className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{t('qaEditLanding')}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('qaUpdatePage')}</span>
        </Link>
      ) : (
        <div
          className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg opacity-50 cursor-not-allowed relative"
          title={t('qaEditLandingLocked')}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 flex items-center justify-center mb-2">
            <IoLockClosedOutline className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500 text-center">{t('qaEditLanding')}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{t('qaBusinessOnly')}</span>
        </div>
      )}
    </div>
  )
}
