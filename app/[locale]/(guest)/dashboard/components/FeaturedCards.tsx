'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Search, Calendar, Car } from './DashboardIcons'

interface BookingSummary {
  id: string
  status: string
  car: { year: number; make: string; model: string }
  startDate: string
  endDate: string
}

interface FeaturedCardsProps {
  statsLoaded: boolean
  isBanned: boolean
  bookings: BookingSummary[]
  onFindCar: () => void
  onBookingClick: (id: string) => void
  onBrowseCars: () => void
}

export default function FeaturedCards({
  statsLoaded, isBanned, bookings, onFindCar, onBookingClick, onBrowseCars
}: FeaturedCardsProps) {
  const t = useTranslations('GuestDashboard')
  const locale = useLocale()

  const upcomingBooking = bookings.find(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE')

  return (
    <div className={`-mx-2 sm:mx-0 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 transition-all duration-700 ${
      statsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {/* Find a Car - Primary CTA */}
      <button
        onClick={onFindCar}
        disabled={isBanned}
        className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-5 sm:p-6 rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{t('findACar')}</h3>
            <p className="text-green-100 text-sm">{t('browseAvailableVehicles')}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
            <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>
      </button>

      {/* Upcoming Trip or Browse Cars CTA */}
      {upcomingBooking ? (
        <div
          onClick={() => onBookingClick(upcomingBooking.id)}
          className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  upcomingBooking.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {upcomingBooking.status === 'ACTIVE' ? t('activeNow') : t('upcoming')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                {upcomingBooking.car.year} {upcomingBooking.car.make} {upcomingBooking.car.model}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(upcomingBooking.startDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - {new Date(upcomingBooking.endDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={onBrowseCars}
          className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg active:scale-[0.98] transition-all text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('noUpcomingTrips')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookFirstCarRentalToday')}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
              <Car className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </div>
          </div>
        </button>
      )}
    </div>
  )
}
