// app/components/claims/TripDocumentation.tsx
'use client'

import React from 'react'
import {
  IoCalendarOutline,
  IoSpeedometerOutline,
  IoWaterOutline,
  IoLocationOutline,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoPersonOutline,
  IoTimeOutline,
} from 'react-icons/io5'

interface TripDocumentationProps {
  tripDocumentation: {
    completion: {
      completedBy: string | null
      startedAt: string | null
      endedAt: string | null
      duration: string | null
      adminOverride: {
        adminId: string
        notes: string | null
        reason: string
      } | null
    }
    mileage: {
      start: number | null
      end: number | null
      driven: number | null
      allowance: number | null
      withinLimit: boolean | null
    }
    fuel: {
      start: string | null
      end: string | null
      percentUsed: number | null
    }
    location: {
      pickup: {
        lat: number | null
        lng: number | null
        address: string | null
      }
      return: {
        lat: number | null
        lng: number | null
        address: string | null
      }
    }
    photos: {
      preTrip: string[]
      postTrip: string[]
      preTripCount: number
      postTripCount: number
      detailed: Array<{
        id: string
        type: string
        category: string
        url: string
        uploadedAt: string
      }>
    }
    review: {
      id: string
      rating: number
      comment: string
      submittedAt: string
      breakdown: {
        cleanliness: number | null
        accuracy: number | null
        communication: number | null
        convenience: number | null
        value: number | null
      }
    } | null
    damage: {
      reported: boolean
      description: string | null
      photos: string[]
    }
  }
  showAdminControls?: boolean
}

export default function TripDocumentation({ 
  tripDocumentation, 
  showAdminControls = false 
}: TripDocumentationProps) {
  const { completion, mileage, fuel, location, review, damage } = tripDocumentation

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <IoStarOutline
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {rating}.0
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <IoCalendarOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Trip Documentation
      </h3>

      <div className="space-y-6">
        {/* Trip Completion Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            Trip Completion
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed By</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  completion.completedBy === 'GUEST'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
                }`}>
                  {completion.completedBy || 'N/A'}
                </span>
              </div>
              {completion.adminOverride && showAdminControls && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  Admin Override: {completion.adminOverride.reason}
                </p>
              )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Started</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(completion.startedAt)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ended</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(completion.endedAt)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Duration</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <IoTimeOutline className="w-4 h-4" />
                {completion.duration || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Mileage Tracking Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <IoSpeedometerOutline className="w-4 h-4" />
            Mileage Tracking
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Mileage</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {mileage.start?.toLocaleString() || 'N/A'} mi
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">End Mileage</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {mileage.end?.toLocaleString() || 'N/A'} mi
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Miles Driven</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {mileage.driven?.toLocaleString() || 'N/A'} mi
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Allowance</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {mileage.allowance?.toLocaleString() || 'N/A'} mi
              </p>
              {mileage.withinLimit !== null && (
                <div className="mt-2 flex items-center gap-1">
                  {mileage.withinLimit ? (
                    <>
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Within Limit
                      </span>
                    </>
                  ) : (
                    <>
                      <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Over Limit
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fuel Tracking Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <IoWaterOutline className="w-4 h-4" />
            Fuel Tracking
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Level</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {fuel.start || 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">End Level</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {fuel.end || 'N/A'}
              </p>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fuel Used</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                ~{fuel.percentUsed || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Location Tracking Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <IoLocationOutline className="w-4 h-4" />
            Location Tracking
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs font-semibold text-green-800 dark:text-green-400 mb-2 uppercase">
                Pickup Location
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {location.pickup.address || 'N/A'}
              </p>
              {location.pickup.lat && location.pickup.lng && (
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {location.pickup.lat.toFixed(4)}, {location.pickup.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 mb-2 uppercase">
                Return Location
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {location.return.address || 'N/A'}
              </p>
              {location.return.lat && location.return.lng && (
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {location.return.lat.toFixed(4)}, {location.return.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Guest Review Section */}
        {review && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoPersonOutline className="w-4 h-4" />
              Guest Review
            </h4>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                {renderStars(review.rating)}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {formatDate(review.submittedAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{review.comment}"
              </p>
            </div>
          </div>
        )}

        {/* Damage Reported Section */}
        {damage.reported && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
              Damage Reported By Guest
            </h4>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                {damage.description || 'No description provided'}
              </p>
              {damage.photos.length > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {damage.photos.length} damage photo{damage.photos.length !== 1 ? 's' : ''} attached to claim
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}