// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingDetails.tsx

import React, { useMemo, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Booking, Message } from '../types'
import { 
  Calendar, Clock, MapPin, Car, AlertCircle,
  InfoCircle, LocationPin, Key 
} from './Icons'
import { 
  getDaysUntilPickup, getHoursUntilPickup, 
  formatDate, getProgressiveInfoLevel
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
  const t = useTranslations('BookingDetail')
  const locale = useLocale()
  const daysUntilPickup = useMemo(() => getDaysUntilPickup(booking.startDate), [booking.startDate])
  const hoursUntilPickup = useMemo(() => getHoursUntilPickup(booking.startDate), [booking.startDate])
  const progressiveInfoLevel = useMemo(() => getProgressiveInfoLevel(booking), [booking])
  const [showAllDropoffLocations, setShowAllDropoffLocations] = useState(false)
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState<string | null>(null)

  // Helper to get pickup time display
  const getPickupTimeDisplay = () => {
    const pickupDate = new Date(booking.startDate)
    const now = new Date()
    const diffTime = pickupDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 1) {
      return t('daysUntilPickup', { count: diffDays })
    } else if (diffDays === 1) {
      return t('pickupTomorrow')
    } else if (diffDays === 0) {
      return t('pickupToday')
    } else {
      return t('tripInProgress')
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
              <p className="text-sm sm:text-base font-medium text-yellow-900">{t('docVerificationRequired')}</p>
              <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                {t('uploadLicensePrompt')}
              </p>
              <button
                onClick={onUploadClick}
                disabled={uploadingFile}
                className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-600 text-white text-xs sm:text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {uploadingFile ? t('uploading') : t('uploadLicense')}
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
                    {t('pickupLabel', { date: formatDate(booking.startDate), time: booking.startTime })}
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
                      {t('fullAddressAvailableLater')}
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
                  <p className="text-sm sm:text-base font-medium text-blue-900">{t('tripComingSoon')}</p>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    {t('hostPreparingVehicle', { name: booking.host.name })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Locations Card - Hidden until onboarding complete */}
          {(progressiveInfoLevel === 'full_details' || booking.tripStatus === 'ACTIVE' || booking.tripStartedAt) && booking.onboardingCompletedAt && (
            <>
              {/* Trip Locations - First Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoCarOutline className="w-5 h-5 text-white mr-2" />
                      <h3 className="text-sm font-semibold text-white">{t('vehicleLocations')}</h3>
                    </div>
                    <span className="text-xs text-gray-300">
                      {booking.tripStatus === 'ACTIVE' ? t('tripActive') : t('readyForPickup')}
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
                          <h4 className="text-sm font-semibold text-gray-900 ml-2">{t('pickupLocation')}</h4>
                        </div>
                        <p className="text-sm text-gray-700 ml-10">
                          {booking.exactAddress || booking.pickupLocation || 'Phoenix, AZ'}
                        </p>
                        {booking.pickupType === 'delivery' && booking.deliveryAddress && (
                          <p className="text-xs text-gray-500 ml-10 mt-1">
                            {t('deliveryTo', { address: booking.deliveryAddress })}
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
                        {t('navigate')}
                      </a>
                    </div>
                    {booking.parkingInstructions && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 ml-10">
                          <span className="font-medium">{t('instructions')}</span> {booking.parkingInstructions}
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
                          <h4 className="text-sm font-semibold text-gray-900 ml-2">{t('dropOffOptions')}</h4>
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
                                  <p className="text-xs text-gray-500">{t('hours')} {location.hours}</p>
                                </div>
                              ) : null
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 ml-10">
                            {booking.returnLocation || booking.pickupLocation || t('sameAsPickup')}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setShowAllDropoffLocations(!showAllDropoffLocations)}
                        className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {showAllDropoffLocations ? t('hide') : t('viewAll')}
                        <IoChevronDownOutline className={`w-3.5 h-3.5 ml-1 transition-transform ${showAllDropoffLocations ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Dropoff Locations */}
                    {showAllDropoffLocations && (
                      <div className="mt-3 ml-10 space-y-2">
                        <p className="text-xs font-medium text-gray-700 mb-2">{t('approvedDropOffLocations')}</p>
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
                                {t('map')}
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
                  <p className="text-sm sm:text-base font-medium text-green-900 mb-2">{t('readyForPickupExclaim')}</p>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs font-medium text-gray-600">{t('keyboxCode')}</p>
                    <p className="text-2xl font-mono font-bold">{booking.keyboxCode || t('willBeProvided')}</p>
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
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('tripDetails')}</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">{t('dates')}</p>
              <p className="text-xs text-gray-600">
                {formatDate(booking.startDate)}
              </p>
              <p className="text-xs text-gray-600">
                {t('to')} {formatDate(booking.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">{t('time')}</p>
              <p className="text-xs text-gray-600">{t('pickupTime', { time: booking.startTime })}</p>
              <p className="text-xs text-gray-600">{t('returnTime', { time: booking.endTime })}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">{t('location')}</p>
              {booking.onboardingCompletedAt ? (
                <>
                  <p className="text-xs text-gray-600">
                    {hoursUntilPickup <= TIME_THRESHOLDS.SHOW_FULL_DETAILS_HOURS
                      ? (booking.exactAddress || booking.pickupLocation || 'Phoenix, AZ')
                      : (booking.pickupLocation || 'Phoenix, AZ')}
                  </p>
                  {hoursUntilPickup > TIME_THRESHOLDS.SHOW_FULL_DETAILS_HOURS && (
                    <p className="text-xs text-gray-500 mt-0.5">{t('fullAddressBefore24h')}</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500 italic">{t('completeOnboardingForLocation')}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">{t('vehicle')}</p>
              <p className="text-xs text-gray-600">{booking.car.type || 'CONVERTIBLE'}</p>
              <p className="text-xs text-gray-600">
                {booking.car.transmission || 'AUTOMATIC'} • {t('seats', { count: booking.car.seats || 2 })}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}