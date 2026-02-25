'use client'

import { useTranslations, useLocale } from 'next-intl'

interface TripSummary {
  id: string
  status: string
  car: { year: number; make: string; model: string }
  startDate: string
}

interface RecentTripsProps {
  bookings: TripSummary[]
  onViewAll: () => void
  onBookingClick: (id: string) => void
}

export default function RecentTrips({ bookings, onViewAll, onBookingClick }: RecentTripsProps) {
  const t = useTranslations('GuestDashboard')
  const locale = useLocale()

  const statusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-emerald-500 text-white',
      COMPLETED: 'bg-slate-500 text-white',
      CANCELLED: 'bg-rose-500 text-white',
      CANCELED: 'bg-rose-500 text-white',
      PENDING: 'bg-amber-500 text-white',
      CONFIRMED: 'bg-sky-500 text-white',
    }
    return styles[status as keyof typeof styles] || 'bg-sky-500 text-white'
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return t('complete')
      case 'CANCELLED':
      case 'CANCELED': return t('canceled')
      case 'ACTIVE': return t('active')
      case 'PENDING': return t('pending')
      case 'CONFIRMED': return t('confirmed')
      default: return status
    }
  }

  return (
    <div className="-mx-2 sm:mx-0 w-[calc(100%+1rem)] sm:w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {t('recentTrips')}
        </h3>
        {bookings.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            {t('viewAll')}
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {bookings.slice(0, 3).map((booking) => (
          <div
            key={booking.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 py-3 transition-colors"
            onClick={() => onBookingClick(booking.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {booking.car.year} {booking.car.make}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                {booking.car.model}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date(booking.startDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${statusBadge(booking.status)}`}>
              {statusLabel(booking.status)}
            </span>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('noTripsYet')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
