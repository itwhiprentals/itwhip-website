// app/admin/dashboard/components/tabs/VerificationsTab.tsx
'use client'

import Link from 'next/link'
import {
  IoCheckmarkCircle,
  IoEyeOutline,
  IoPersonOutline,
  IoTimeOutline
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
  createdAt: string
  documentsSubmittedAt?: string
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  selfiePhotoUrl?: string
}

interface VerificationsTabProps {
  pendingVerifications: Booking[]
  onQuickApprove: (bookingId: string) => Promise<void>
  formatTimeSince: (date: string) => string
}

export default function VerificationsTab({
  pendingVerifications,
  onQuickApprove,
  formatTimeSince
}: VerificationsTabProps) {
  if (pendingVerifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <IoCheckmarkCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
        <p className="text-gray-600 dark:text-gray-400">No pending verifications at the moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {pendingVerifications.map(verification => (
          <div key={verification.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-start">
                  {verification.car.photos[0] && (
                    <img
                      src={verification.car.photos[0].url}
                      alt={`${verification.car.make} ${verification.car.model}`}
                      className="w-24 h-20 rounded object-cover mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {verification.bookingCode}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {verification.car.year} {verification.car.make} {verification.car.model}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <IoPersonOutline className="w-4 h-4 mr-1" />
                      {verification.guestName} ({verification.guestEmail})
                    </p>
                    
                    <div className="mt-3 flex items-center space-x-4">
                      <span className={`text-xs ${verification.licensePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                        {verification.licensePhotoUrl ? '✓ License' : '✗ License'}
                      </span>
                      <span className={`text-xs ${verification.insurancePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                        {verification.insurancePhotoUrl ? '✓ Insurance' : '✗ Insurance'}
                      </span>
                      <span className={`text-xs ${verification.selfiePhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                        {verification.selfiePhotoUrl ? '✓ Selfie' : '✗ Selfie'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <IoTimeOutline className="w-3 h-3 mr-1" />
                      Documents submitted {formatTimeSince(verification.documentsSubmittedAt || verification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${verification.totalAmount?.toFixed(2) || '0.00'}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onQuickApprove(verification.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    <IoCheckmarkCircle className="w-4 h-4 mr-1" />
                    Quick Approve
                  </button>
                  <Link
                    href={`/admin/rentals/verifications/${verification.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <IoEyeOutline className="w-4 h-4 mr-1" />
                    Review Docs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}