'use client'

import { IoCheckmarkCircle, IoCarSport, IoCalendar, IoCard } from 'react-icons/io5'
import type { BookingConfirmation } from '@/app/lib/ai-booking/types'

interface ConfirmationCardProps {
  confirmation: BookingConfirmation
  onViewBooking?: () => void
  onNewSearch?: () => void
}

export default function ConfirmationCard({ confirmation, onViewBooking, onNewSearch }: ConfirmationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
      {/* Success header */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 text-center border-b border-green-100 dark:border-green-800">
        <IoCheckmarkCircle size={32} className="text-green-500 mx-auto mb-1" />
        <h4 className="text-sm font-bold text-green-700 dark:text-green-400">
          Booking Confirmed!
        </h4>
        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
          Reference: {confirmation.referenceCode}
        </p>
      </div>

      <div className="p-3 space-y-3">
        {/* Vehicle */}
        <div className="flex items-center gap-3">
          {confirmation.vehicle.photo ? (
            <img
              src={confirmation.vehicle.photo}
              alt={`${confirmation.vehicle.year} ${confirmation.vehicle.make} ${confirmation.vehicle.model}`}
              className="w-16 h-12 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <IoCarSport size={20} className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {confirmation.vehicle.year} {confirmation.vehicle.make} {confirmation.vehicle.model}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <IoCalendar size={12} className="text-gray-400" />
          <span>
            {confirmation.dates.start} — {confirmation.dates.end} ({confirmation.dates.days} days)
          </span>
        </div>

        {/* Payment */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <IoCard size={12} className="text-gray-400" />
            <span className="capitalize">{confirmation.paymentBrand} ····{confirmation.paymentLast4}</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            ${confirmation.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        {onViewBooking && (
          <button
            onClick={onViewBooking}
            className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            View Booking
          </button>
        )}
        {onNewSearch && (
          <button
            onClick={onNewSearch}
            className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            New Search
          </button>
        )}
      </div>
    </div>
  )
}
