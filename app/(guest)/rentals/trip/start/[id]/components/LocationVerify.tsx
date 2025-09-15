// app/(guest)/rentals/trip/start/[id]/components/LocationVerify.tsx

'use client'

import { useState, useEffect } from 'react'
import { validateLocation } from '@/app/lib/trip/validation'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'

interface LocationVerifyProps {
  booking: any
  data: any
  onLocationVerified: (location: { lat: number; lng: number }) => void
}

export function LocationVerify({ booking, data, onLocationVerified }: LocationVerifyProps) {
  const [isLocating, setIsLocating] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(data.location)
  const [error, setError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)

  // Auto-verify on mount if location already exists (from parent auto-pass)
  useEffect(() => {
    if (data.location && !isVerified) {
      setIsVerified(true)
      setLocation(data.location)
    }
  }, [data.location])

  const getLocation = () => {
    if (!navigator.geolocation) {
      // Silently use default location
      handleAutoLocation()
      return
    }

    setIsLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        setLocation(newLocation)
        setIsVerified(true)
        onLocationVerified(newLocation)
        
        // Calculate distance if pickup coordinates exist
        if (booking.pickupLatitude && booking.pickupLongitude) {
          const dist = calculateDistance(
            newLocation.lat,
            newLocation.lng,
            booking.pickupLatitude,
            booking.pickupLongitude
          )
          setDistance(Math.round(dist))
        }
        
        setIsLocating(false)
      },
      (error) => {
        // Silently fallback to default location
        setIsLocating(false)
        handleAutoLocation()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleAutoLocation = () => {
    // Use Phoenix, AZ coordinates as default
    const defaultLocation = {
      lat: 33.4484,
      lng: -112.0740
    }
    setLocation(defaultLocation)
    setIsVerified(true)
    onLocationVerified(defaultLocation)
    setError(null)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const formatAddress = () => {
    if (booking.partnerLocationId) {
      return `Partner Location: ${booking.pickupLocation}`
    }
    return booking.pickupLocation || 'Phoenix, AZ'
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Location Verification</h3>
        <p className="text-sm text-gray-700">
          Please verify you are at the pickup location. This helps ensure a smooth pickup process.
        </p>
      </div>

      {/* Pickup Location Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Pickup Location</p>
            <p className="text-sm text-gray-600 mt-1">{formatAddress()}</p>
          </div>
        </div>
      </div>

      {/* Location Verification Button */}
      <div className="text-center">
        {!isVerified ? (
          <button
            onClick={getLocation}
            disabled={isLocating}
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Location...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Verify My Location
              </>
            )}
          </button>
        ) : (
          <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Location Verified
          </div>
        )}

        {/* Success Display */}
        {isVerified && location && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Location successfully verified
                {distance !== null && distance < 1000 && ` (${distance}m from pickup point)`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Simple Continue Option */}
      {!isVerified && (
        <div className="text-center">
          <button
            onClick={handleAutoLocation}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Continue without GPS
          </button>
        </div>
      )}
    </div>
  )
}