// app/(guest)/rentals/dashboard/bookings/[id]/components/trip/TripEndCard.tsx

'use client'

import { useState, useEffect } from 'react'
import { formatCharge } from '@/app/lib/trip/calculations'
import GuestReviewModal from '@/app/(guest)/rentals/components/review/GuestReviewModal'

interface TripEndCardProps {
  booking: any
  guestToken: string
}

export function TripEndCard({ booking, guestToken }: TripEndCardProps) {
  const [charges, setCharges] = useState<any>(null)
  const [disputeStatus, setDisputeStatus] = useState<string | null>(null)

  useEffect(() => {
    // Load any additional charges from booking
    if (booking.extras) {
      try {
        const extraCharges = JSON.parse(booking.extras)
        setCharges(extraCharges)
      } catch (e) {
        console.error('Failed to parse extra charges')
      }
    }

    // Check for any disputes
    if (booking.disputes && booking.disputes.length > 0) {
      const latestDispute = booking.disputes[0]
      setDisputeStatus(latestDispute.status)
    }
  }, [booking])

  const tripDuration = booking.tripStartedAt && booking.tripEndedAt
    ? (() => {
        const start = new Date(booking.tripStartedAt)
        const end = new Date(booking.tripEndedAt)
        const diff = end.getTime() - start.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (days > 0) {
          return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`
        }
        return `${hours} hour${hours > 1 ? 's' : ''}`
      })()
    : 'N/A'

  const totalMiles = booking.startMileage && booking.endMileage
    ? booking.endMileage - booking.startMileage
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Trip Completed</h3>
            <p className="text-gray-200 text-sm mt-1">
              Thank you for choosing ItWhip!
            </p>
          </div>
          <div className="bg-white/20 rounded-full p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Trip Summary */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Trip Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium text-gray-900">{tripDuration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Miles</span>
              <span className="font-medium text-gray-900">{totalMiles} miles</span>
            </div>
            {booking.fuelLevelStart && booking.fuelLevelEnd && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fuel Level</span>
                <span className="font-medium text-gray-900">
                  {booking.fuelLevelStart} → {booking.fuelLevelEnd}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Charges (if any) */}
        {charges && charges.total > 0 && (
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-900 mb-3">Additional Charges</h4>
            <div className="space-y-2">
              {charges.breakdown && charges.breakdown.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-amber-800">{item.label}</span>
                  <span className="font-medium text-amber-900">{formatCharge(item.amount)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-amber-200">
                <div className="flex justify-between">
                  <span className="font-medium text-amber-900">Total</span>
                  <span className="font-semibold text-amber-900">{formatCharge(charges.total)}</span>
                </div>
              </div>
            </div>

            {/* Dispute Status */}
            {disputeStatus && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-800">Dispute Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    disputeStatus === 'RESOLVED' 
                      ? 'bg-green-100 text-green-800'
                      : disputeStatus === 'OPEN'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {disputeStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Info about reviews with pending charges */}
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-xs text-amber-700">
                You can still leave a review even with pending charges. Your experience feedback is valuable regardless of payment status.
              </p>
            </div>
          </div>
        )}

        {/* No Additional Charges */}
        {(!charges || charges.total === 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-900">No Additional Charges</p>
                <p className="text-sm text-green-800 mt-1">
                  Your trip was completed without any extra fees.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guest Review Modal Component */}
        <GuestReviewModal
          booking={{
            id: booking.id,
            car: {
              make: booking.car.make,
              model: booking.car.model,
              year: booking.car.year
            },
            host: {
              name: booking.host?.name || 'Host'
            },
            tripStartedAt: booking.tripStartedAt,
            tripEndedAt: booking.tripEndedAt,
            tripStatus: booking.tripStatus,
            fraudulent: booking.fraudulent,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail
          }}
          guestToken={guestToken}
        />

        {/* Receipt */}
        <div className="text-center pt-2">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Download Receipt
          </button>
          <span className="mx-2 text-gray-400">•</span>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Email Receipt
          </button>
        </div>
      </div>
    </div>
  )
}