// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingDetails.tsx

import React, { useMemo, useState } from 'react'
import { Booking, Message, PrePickupChecklistItem } from '../types'
import { 
  Calendar, Clock, MapPin, Car, CheckCircle, AlertCircle, 
  InfoCircle, LocationPin, Key 
} from './Icons'
import { 
  getDaysUntilPickup, getHoursUntilPickup, 
  shouldShowPrePickupChecklist, formatDate, getProgressiveInfoLevel 
} from '../utils/helpers'
import { TIME_THRESHOLDS } from '../constants'
import { IoNavigateOutline, IoChevronDownOutline, IoMailOutline, IoBusinessOutline, IoTimeOutline, IoCheckmarkCircle, IoCarOutline } from 'react-icons/io5'

interface BookingDetailsProps {
  booking: Booking
  messages: Message[]
  onUploadClick: () => void
  uploadingFile: boolean
}

// Approved drop-off locations for ItWhip
const APPROVED_DROPOFF_LOCATIONS = [
  {
    id: 'phx-airport',
    name: 'Phoenix Sky Harbor Airport',
    address: '3400 E Sky Harbor Blvd, Phoenix, AZ 85034',
    hours: '24/7',
    instructions: 'Return to Terminal 4, Level 1 Rental Return',
    mapUrl: 'https://maps.google.com/?q=33.4352,112.0116'
  },
  {
    id: 'phx-downtown',
    name: 'Downtown Phoenix Hub',
    address: '100 N Central Ave, Phoenix, AZ 85004',
    hours: '7:00 AM - 9:00 PM',
    instructions: 'Park in designated ItWhip spots on Level 2',
    mapUrl: 'https://maps.google.com/?q=33.4484,112.0740'
  },
  {
    id: 'scottsdale',
    name: 'Scottsdale Quarter',
    address: '15279 N Scottsdale Rd, Scottsdale, AZ 85254',
    hours: '8:00 AM - 8:00 PM',
    instructions: 'Valet parking area, ask for ItWhip return',
    mapUrl: 'https://maps.google.com/?q=33.6224,111.9241'
  },
  {
    id: 'tempe',
    name: 'Tempe Marketplace',
    address: '2000 E Rio Salado Pkwy, Tempe, AZ 85281',
    hours: '8:00 AM - 9:00 PM',
    instructions: 'Park near main entrance, text us arrival',
    mapUrl: 'https://maps.google.com/?q=33.4307,111.8988'
  }
]

export const BookingDetails: React.FC<BookingDetailsProps> = ({ 
  booking, 
  messages, 
  onUploadClick,
  uploadingFile 
}) => {
  const daysUntilPickup = useMemo(() => getDaysUntilPickup(booking.startDate), [booking.startDate])
  const hoursUntilPickup = useMemo(() => getHoursUntilPickup(booking.startDate), [booking.startDate])
  const progressiveInfoLevel = useMemo(() => getProgressiveInfoLevel(booking), [booking])
  const [showAllDropoffLocations, setShowAllDropoffLocations] = useState(false)
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState<string | null>(null)

  const prePickupChecklist: PrePickupChecklistItem[] = useMemo(() => {
    if (!shouldShowPrePickupChecklist(booking)) return []
    return [
      { id: 'license', label: 'Valid driver\'s license', completed: booking.licenseVerified || false },
      { id: 'insurance', label: 'Insurance verified', completed: !!booking.insurancePhotoUrl },
      { id: 'payment', label: 'Payment processed', completed: booking.paymentStatus === 'PAID' || booking.paymentStatus === 'paid' || booking.paymentStatus === 'CAPTURED' || booking.paymentStatus === 'captured' },
      { id: 'deposit', label: 'Security deposit held', completed: booking.depositAmount > 0 },
      { id: 'contact', label: 'Host contacted', completed: messages.length > 0 }
    ]
  }, [booking, messages])

  // Helper to get pickup time display
  const getPickupTimeDisplay = () => {
    const pickupDate = new Date(booking.startDate)
    const now = new Date()
    const diffTime = pickupDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 1) {
      return `${diffDays} days until pickup`
    } else if (diffDays === 1) {
      return 'Pickup tomorrow'
    } else if (diffDays === 0) {
      return 'Pickup today'
    } else {
      return 'Trip in progress'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status Alerts */}
      {booking.verificationStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm sm:text-base font-medium text-yellow-900">Document Verification Required</p>
              <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                Upload your driver's license to confirm your booking.
              </p>
              <button
                onClick={onUploadClick}
                disabled={uploadingFile}
                className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-600 text-white text-xs sm:text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {uploadingFile ? 'Uploading...' : 'Upload License'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progressive Information Alerts */}
      {booking.status === 'CONFIRMED' && (
        <>
          {/* Pickup Time Display */}
          {daysUntilPickup > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-blue-900">
                    Pickup: {formatDate(booking.startDate)} at {booking.startTime}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    <span className="inline-flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getPickupTimeDisplay()}
                    </span>
                    <span className="mx-1">•</span>
                    <span className="inline-flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {booking.pickupLocation || 'Phoenix, AZ'}
                    </span>
                  </p>
                  {hoursUntilPickup > TIME_THRESHOLDS.SHOW_FULL_DETAILS_HOURS && (
                    <p className="text-xs text-blue-600 mt-2">
                      Full address and instructions will be provided 24 hours before pickup.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Host Introduction */}
          {progressiveInfoLevel === 'host_intro' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <InfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-blue-900">Trip Coming Soon</p>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    Your host {booking.host.name} is preparing your vehicle. Message them with any questions!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Locations Card - Separate card with black/gray styling */}
          {(progressiveInfoLevel === 'full_details' || booking.tripStatus === 'ACTIVE' || booking.tripStartedAt) && (
            <>
              {/* Trip Locations - First Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoCarOutline className="w-5 h-5 text-white mr-2" />
                      <h3 className="text-sm font-semibold text-white">Vehicle Locations</h3>
                    </div>
                    <span className="text-xs text-gray-300">
                      {booking.tripStatus === 'ACTIVE' ? 'Trip Active' : 'Ready for Pickup'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Pickup Location */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">P</span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 ml-2">Pickup Location</h4>
                        </div>
                        <p className="text-sm text-gray-700 ml-10">
                          {booking.exactAddress || booking.pickupLocation || 'Phoenix, AZ'}
                        </p>
                        {booking.pickupType === 'delivery' && booking.deliveryAddress && (
                          <p className="text-xs text-gray-500 ml-10 mt-1">
                            Delivery to: {booking.deliveryAddress}
                          </p>
                        )}
                      </div>
                      
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(booking.exactAddress || booking.pickupLocation || 'Phoenix, AZ')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs hover:bg-gray-800 transition-colors"
                      >
                        <IoNavigateOutline className="w-3.5 h-3.5 mr-1" />
                        Navigate
                      </a>
                    </div>
                    {booking.parkingInstructions && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 ml-10">
                          <span className="font-medium">Instructions:</span> {booking.parkingInstructions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dropoff Location */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">D</span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 ml-2">Drop-off Options</h4>
                        </div>
                        
                        {/* Selected or Default Dropoff */}
                        {selectedDropoffLocation ? (
                          <div className="ml-10">
                            {(() => {
                              const location = APPROVED_DROPOFF_LOCATIONS.find(loc => loc.id === selectedDropoffLocation)
                              return location ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-gray-900">{location.name}</p>
                                  <p className="text-xs text-gray-600">{location.address}</p>
                                  <p className="text-xs text-gray-500">Hours: {location.hours}</p>
                                </div>
                              ) : null
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 ml-10">
                            {booking.returnLocation || booking.pickupLocation || 'Same as pickup'}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setShowAllDropoffLocations(!showAllDropoffLocations)}
                        className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {showAllDropoffLocations ? 'Hide' : 'View All'}
                        <IoChevronDownOutline className={`w-3.5 h-3.5 ml-1 transition-transform ${showAllDropoffLocations ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Dropoff Locations */}
                    {showAllDropoffLocations && (
                      <div className="mt-3 ml-10 space-y-2">
                        <p className="text-xs font-medium text-gray-700 mb-2">Approved Drop-off Locations:</p>
                        {APPROVED_DROPOFF_LOCATIONS.map((location) => (
                          <div
                            key={location.id}
                            className={`p-2 rounded-lg border cursor-pointer transition-all ${
                              selectedDropoffLocation === location.id
                                ? 'border-gray-900 bg-gray-100'
                                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDropoffLocation(location.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center">
                                  {selectedDropoffLocation === location.id && (
                                    <IoCheckmarkCircle className="w-4 h-4 text-gray-900 mr-1.5" />
                                  )}
                                  <p className="text-xs font-medium text-gray-900">{location.name}</p>
                                </div>
                                <p className="text-xs text-gray-600">{location.address}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <IoTimeOutline className="w-3 h-3 mr-0.5" />
                                    {location.hours}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 italic">{location.instructions}</p>
                              </div>
                              
                              <a
                                href={location.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-2 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-800"
                              >
                                Map
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Access Codes */}
          {progressiveInfoLevel === 'access_codes' && booking.hasKeybox && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-green-900 mb-2">Ready for Pickup!</p>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs font-medium text-gray-600">Keybox Code:</p>
                    <p className="text-2xl font-mono font-bold">{booking.keyboxCode || 'Will be provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Car Photos */}
      {booking.car.photos && booking.car.photos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={booking.car.photos[0].url}
            alt={`${booking.car.make} ${booking.car.model}`}
            className="w-full h-48 sm:h-64 object-cover"
          />
        </div>
      )}

      {/* Trip Details Card */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Trip Details</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Dates</p>
              <p className="text-xs text-gray-600">
                {formatDate(booking.startDate)}
              </p>
              <p className="text-xs text-gray-600">
                to {formatDate(booking.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Time</p>
              <p className="text-xs text-gray-600">Pickup: {booking.startTime}</p>
              <p className="text-xs text-gray-600">Return: {booking.endTime}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Location</p>
              <p className="text-xs text-gray-600">
                {hoursUntilPickup <= TIME_THRESHOLDS.SHOW_FULL_DETAILS_HOURS
                  ? (booking.exactAddress || booking.pickupLocation || 'Phoenix, AZ')
                  : (booking.pickupLocation || 'Phoenix, AZ')}
              </p>
              {hoursUntilPickup > TIME_THRESHOLDS.SHOW_FULL_DETAILS_HOURS && (
                <p className="text-xs text-gray-500 mt-0.5">Full address available 24hrs before</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Vehicle</p>
              <p className="text-xs text-gray-600">{booking.car.type || 'CONVERTIBLE'}</p>
              <p className="text-xs text-gray-600">
                {booking.car.transmission || 'AUTOMATIC'} • {booking.car.seats || 2} seats
              </p>
            </div>
          </div>
        </div>

        {/* Pre-trip Checklist - WITH GREEN CHECKMARKS */}
        {prePickupChecklist.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Pre-Trip Checklist</h3>
            <div className="space-y-2">
              {prePickupChecklist.map(item => (
                <div key={item.id} className="flex items-center">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
                  )}
                  <span className={`text-sm ${item.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}