// app/admin/dashboard/components/ActiveTripsWidget.tsx
'use client'

import Link from 'next/link'
import {
  IoNavigateOutline,
  IoEyeOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

interface TripData {
  id: string
  bookingCode: string
  guestName: string
  car: {
    make: string
    model: string
    year: number
  }
  tripStartedAt: string
  endDate: string
  isOverdue: boolean
  hoursOverdue: number
  currentDuration: string
}

interface ActiveTripsWidgetProps {
  activeTrips: TripData[]
  totalActiveTrips: number
  className?: string
}

export default function ActiveTripsWidget({
  activeTrips,
  totalActiveTrips,
  className = ''
}: ActiveTripsWidgetProps) {
  if (activeTrips.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center ${className}`}>
        <IoNavigateOutline className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400">No active trips at the moment</p>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <IoNavigateOutline className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-500" />
            Active Trips
          </h2>
          <Link 
            href="/admin/rentals/trips/active"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All ({totalActiveTrips})
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activeTrips.slice(0, 3).map(trip => (
          <Link
            key={trip.id}
            href={`/admin/rentals/trips/inspections/${trip.id}`}
            className="block p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {trip.bookingCode}
                  </h3>
                  {trip.isOverdue && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Overdue {trip.hoursOverdue}h
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {trip.car.year} {trip.car.make} {trip.car.model}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Guest: {trip.guestName} • Duration: {trip.currentDuration}
                </p>
              </div>
              <IoEyeOutline className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}