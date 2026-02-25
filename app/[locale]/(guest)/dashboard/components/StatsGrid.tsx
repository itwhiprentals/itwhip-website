'use client'

import { useTranslations } from 'next-intl'
import { IoLockClosedOutline } from 'react-icons/io5'
import { Award, Shield, Car, Calendar, MessageSquare, AlertCircle } from './DashboardIcons'

interface StatsData {
  creditsAndBonus: number
  depositWalletBalance: number
  activeRentals: number
  completedTrips: number
  unreadMessages: number
  activeClaims: number
}

interface StatsGridProps {
  statsLoaded: boolean
  stats: StatsData
  isVerified: boolean
  onStatClick: (path: string) => void
}

export default function StatsGrid({ statsLoaded, stats, isVerified, onStatClick }: StatsGridProps) {
  const t = useTranslations('GuestDashboard')

  const statsConfig = [
    {
      label: t('creditsAndBonus'),
      value: stats.creditsAndBonus,
      icon: Award,
      iconColor: 'text-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      format: (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      path: '/payments/credits',
      lockWhenUnverified: true,
    },
    {
      label: t('deposit'),
      value: stats.depositWalletBalance,
      icon: Shield,
      iconColor: 'text-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      format: (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      path: '/payments/deposit',
    },
    {
      label: t('activeRentals'),
      value: stats.activeRentals,
      icon: Car,
      iconColor: 'text-blue-500',
      textColor: 'text-gray-900 dark:text-white',
      path: '/rentals/dashboard/bookings?filter=active',
    },
    {
      label: t('totalTrips'),
      value: stats.completedTrips,
      icon: Calendar,
      iconColor: 'text-gray-500',
      textColor: 'text-gray-900 dark:text-white',
      path: '/rentals/dashboard/bookings?filter=completed',
    },
    {
      label: t('messages'),
      value: stats.unreadMessages,
      icon: MessageSquare,
      iconColor: 'text-orange-500',
      textColor: 'text-gray-900 dark:text-white',
      path: '/messages',
    },
    {
      label: t('claims'),
      value: stats.activeClaims,
      icon: AlertCircle,
      iconColor: 'text-red-500',
      textColor: 'text-gray-900 dark:text-white',
      path: '/claims',
    },
  ]

  return (
    <div
      className={`-mx-2 sm:mx-0 mt-3 transition-all duration-700 ${
        statsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {statsConfig.map((stat, index) => {
          const displayValue = stat.format ? stat.format(stat.value) : stat.value
          const StatIcon = stat.icon
          const showLock = stat.lockWhenUnverified && !isVerified && stat.value > 0

          return (
            <div
              key={stat.label}
              onClick={() => onStatClick(stat.path)}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: statsLoaded ? 'fadeInUp 0.4s ease-out forwards' : 'none'
              }}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.98] transition-all ${
                showLock ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <StatIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor} mb-1`} aria-hidden="true" />
                <p className={`text-base sm:text-lg font-bold ${showLock ? 'text-gray-400 dark:text-gray-500' : stat.textColor}`}>
                  {displayValue}
                  {showLock && <IoLockClosedOutline className="inline w-3 h-3 text-yellow-500 ml-1" />}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate w-full">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
