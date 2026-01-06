// app/admin/dashboard/components/tabs/DisputesTab.tsx
'use client'

import Link from 'next/link'
import { IoCheckmarkCircle } from 'react-icons/io5'

interface Dispute {
  id: string
  bookingId: string
  bookingCode: string
  type: string
  status: string
  description: string
  createdAt: string
  booking?: {
    guestName: string
    guestEmail: string
    totalAmount: number
  }
}

interface DisputesTabProps {
  disputes: Dispute[]
}

export default function DisputesTab({ disputes }: DisputesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Guest Disputes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Refund requests and payment disputes from guests
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {disputes.length > 0 ? (
            disputes.map(dispute => (
              <div key={dispute.id} className="p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{dispute.bookingCode}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Type: <span className="font-medium">{dispute.type}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: <span className={`font-medium ${
                        dispute.status === 'OPEN' ? 'text-red-600' : 'text-gray-600'
                      }`}>{dispute.status}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{dispute.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Opened {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${dispute.booking?.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                    <Link
                      href={`/admin/rentals/disputes/${dispute.id}`}
                      className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <IoCheckmarkCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No open disputes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}