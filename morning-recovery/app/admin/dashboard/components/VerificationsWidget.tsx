// app/admin/dashboard/components/VerificationsWidget.tsx
'use client'

import Link from 'next/link'
import {
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoEyeOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  guestName: string
  guestEmail: string
  car: {
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
  }
  totalAmount: number
  documentsSubmittedAt?: string
  createdAt: string
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  selfiePhotoUrl?: string
}

interface VerificationsWidgetProps {
  pendingVerifications: Booking[]
  totalPending: number
  onQuickApprove?: (bookingId: string) => Promise<void>
  formatTimeSince: (date: string) => string
  className?: string
}

export default function VerificationsWidget({
  pendingVerifications,
  totalPending,
  onQuickApprove,
  formatTimeSince,
  className = ''
}: VerificationsWidgetProps) {
  if (pendingVerifications.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center ${className}`}>
        <IoCheckmarkCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
        <p className="text-gray-600 dark:text-gray-400">No pending verifications at the moment</p>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <IoShieldCheckmarkOutline className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-yellow-500" />
            <span className="hidden sm:inline">Pending P2P Verifications</span>
            <span className="sm:hidden">P2P Verifications</span>
          </h2>
          <Link 
            href="/admin/rentals/verifications"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All ({totalPending})
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {pendingVerifications.slice(0, 3).map(verification => (
          <Link
            key={verification.id}
            href={`/admin/rentals/verifications/${verification.id}`}
            className="block p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                {verification.car.photos?.[0] && (
                  <img 
                    src={verification.car.photos[0].url}
                    alt={`${verification.car.make} ${verification.car.model}`}
                    className="w-16 sm:w-20 h-12 sm:h-16 object-cover rounded flex-shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {verification.bookingCode}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending Review
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {verification.car.year} {verification.car.make} {verification.car.model}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                    <div className="flex items-center truncate">
                      <IoPersonOutline className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{verification.guestName || verification.guestEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <IoTimeOutline className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Submitted {formatTimeSince(verification.documentsSubmittedAt || verification.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className={`text-xs font-medium ${verification.licensePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                      {verification.licensePhotoUrl ? '✓' : '✗'} License
                    </span>
                    <span className={`text-xs font-medium ${verification.insurancePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                      {verification.insurancePhotoUrl ? '✓' : '✗'} Insurance
                    </span>
                    <span className={`text-xs font-medium ${verification.selfiePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                      {verification.selfiePhotoUrl ? '✓' : '✗'} Selfie
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  ${verification.totalAmount?.toFixed(2) || '0.00'}
                </p>
                <span className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  <IoEyeOutline className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                  Review
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}