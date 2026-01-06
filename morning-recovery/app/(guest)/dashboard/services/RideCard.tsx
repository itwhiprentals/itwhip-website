// app/(guest)/dashboard/services/RideCard.tsx
// Ride Card Component - Book instant rides with transparent pricing
// Shows available vehicles, estimated prices, and driver ETA

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCarOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoStarOutline,
  IoNavigateOutline,
  IoSwapHorizontalOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoCarSportOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTrendingUp,
  IoSparklesOutline
} from 'react-icons/io5'

// Types
interface RideCardProps {
  pickup?: string
  dropoff?: string
  onBookRide?: (ride: RideOption) => void
  showEstimates?: boolean
  hotelCommission?: boolean
  isAtHotel?: boolean
}

interface RideOption {
  id: string
  type: 'economy' | 'standard' | 'premium' | 'luxury'
  name: string
  description: string
  icon: any
  eta: number // minutes
  price: number
  originalPrice?: number
  surge?: boolean
  seats: number
  luggage: number
  features: string[]
  driver?: {
    name: string
    rating: number
    trips: number
    vehicle: string
    plateNumber: string
  }
  commission?: {
    hotel: number
    driver: number
    platform: number
  }
}

interface Location {
  address: string
  lat: number
  lng: number
}

export default function RideCard({
  pickup = '',
  dropoff = '',
  onBookRide,
  showEstimates = true,
  hotelCommission = false,
  isAtHotel = false
}: RideCardProps) {
  // State management
  const [pickupLocation, setPickupLocation] = useState(pickup)
  const [dropoffLocation, setDropoffLocation] = useState(dropoff)
  const [rideOptions, setRideOptions] = useState<RideOption[]>([])
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [estimateLoading, setEstimateLoading] = useState(false)
  const [showCommissionBreakdown, setShowCommissionBreakdown] = useState(false)
  const [bookingStage, setBookingStage] = useState<'select' | 'confirm' | 'booked'>('select')
  const [distance, setDistance] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)

  // Load ride options when locations change
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      loadRideEstimates()
    }
  }, [pickupLocation, dropoffLocation])

  // Set default pickup if at hotel
  useEffect(() => {
    if (isAtHotel && !pickupLocation) {
      setPickupLocation('Current Hotel Location')
    }
  }, [isAtHotel])

  // Load ride estimates
  const loadRideEstimates = async () => {
    setEstimateLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockOptions: RideOption[] = [
        {
          id: 'eco-1',
          type: 'economy',
          name: 'ItWhip Go',
          description: 'Affordable rides for everyone',
          icon: IoCarOutline,
          eta: 3,
          price: 12.50,
          originalPrice: 18.75,
          surge: false,
          seats: 4,
          luggage: 2,
          features: ['Basic comfort', 'AC', 'Phone charger'],
          driver: {
            name: 'Michael Chen',
            rating: 4.92,
            trips: 3847,
            vehicle: 'Toyota Prius',
            plateNumber: 'ABC-1234'
          },
          commission: hotelCommission ? {
            hotel: 1.88,
            driver: 8.38,
            platform: 2.24
          } : undefined
        },
        {
          id: 'std-1',
          type: 'standard',
          name: 'ItWhip Comfort',
          description: 'Extra space and comfort',
          icon: IoCarOutline,
          eta: 4,
          price: 18.75,
          originalPrice: 24.50,
          surge: false,
          seats: 4,
          luggage: 3,
          features: ['Premium comfort', 'AC', 'Phone charger', 'Water bottles'],
          driver: {
            name: 'Sarah Johnson',
            rating: 4.95,
            trips: 2156,
            vehicle: 'Honda Accord',
            plateNumber: 'XYZ-5678'
          },
          commission: hotelCommission ? {
            hotel: 2.81,
            driver: 12.56,
            platform: 3.38
          } : undefined
        },
        {
          id: 'prem-1',
          type: 'premium',
          name: 'ItWhip Black',
          description: 'Premium vehicles for business',
          icon: IoCarSportOutline,
          eta: 6,
          price: 32.50,
          originalPrice: 45.00,
          surge: false,
          seats: 4,
          luggage: 3,
          features: ['Luxury comfort', 'AC', 'Chargers', 'Water', 'WiFi', 'Newspapers'],
          driver: {
            name: 'David Martinez',
            rating: 4.98,
            trips: 1523,
            vehicle: 'BMW 5 Series',
            plateNumber: 'LUX-9012'
          },
          commission: hotelCommission ? {
            hotel: 4.88,
            driver: 21.78,
            platform: 5.84
          } : undefined
        },
        {
          id: 'lux-1',
          type: 'luxury',
          name: 'ItWhip Elite',
          description: 'Ultimate luxury experience',
          icon: IoBusinessOutline,
          eta: 8,
          price: 68.00,
          originalPrice: 95.00,
          surge: false,
          seats: 6,
          luggage: 5,
          features: ['Ultimate luxury', 'AC', 'All amenities', 'Champagne', 'Concierge'],
          driver: {
            name: 'James Wilson',
            rating: 5.00,
            trips: 892,
            vehicle: 'Mercedes S-Class',
            plateNumber: 'VIP-3456'
          },
          commission: hotelCommission ? {
            hotel: 10.20,
            driver: 45.56,
            platform: 12.24
          } : undefined
        }
      ]

      setRideOptions(mockOptions)
      setDistance(4.7) // Mock distance in miles
      setDuration(12) // Mock duration in minutes
    } catch (error) {
      console.error('Failed to load ride estimates:', error)
    } finally {
      setEstimateLoading(false)
    }
  }

  // Swap pickup and dropoff
  const swapLocations = () => {
    const temp = pickupLocation
    setPickupLocation(dropoffLocation)
    setDropoffLocation(temp)
  }

  // Book the ride
  const handleBookRide = async (ride: RideOption) => {
    setSelectedRide(ride)
    setBookingStage('confirm')
  }

  // Confirm booking
  const confirmBooking = async () => {
    if (!selectedRide) return
    
    setIsLoading(true)
    try {
      // This would normally call the booking API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBookingStage('booked')
      
      if (onBookRide) {
        onBookRide(selectedRide)
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cancel booking
  const cancelBooking = () => {
    setSelectedRide(null)
    setBookingStage('select')
  }

  // Get type color
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'economy': return 'from-gray-500 to-gray-600'
      case 'standard': return 'from-blue-500 to-blue-600'
      case 'premium': return 'from-purple-500 to-purple-600'
      case 'luxury': return 'from-amber-500 to-amber-600'
      default: return 'from-green-500 to-green-600'
    }
  }

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'economy': return 'bg-gray-100 text-gray-700'
      case 'standard': return 'bg-blue-100 text-blue-700'
      case 'premium': return 'bg-purple-100 text-purple-700'
      case 'luxury': return 'bg-amber-100 text-amber-700'
      default: return 'bg-green-100 text-green-700'
    }
  }

  // Booking confirmed view
  if (bookingStage === 'booked' && selectedRide) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ride Booked!</h3>
          <p className="text-gray-600 mb-6">
            Your {selectedRide.name} is on the way
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={`https://ui-avatars.com/api/?name=${selectedRide.driver?.name}&background=059669&color=fff`}
                  alt={selectedRide.driver?.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{selectedRide.driver?.name}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
                    <span>{selectedRide.driver?.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{selectedRide.driver?.trips} trips</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">{selectedRide.driver?.vehicle}</p>
                <p className="font-mono text-lg font-bold text-gray-900">
                  {selectedRide.driver?.plateNumber}
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedRide.eta}</p>
                  <p className="text-xs text-gray-500">min away</p>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${selectedRide.price}</p>
                  <p className="text-xs text-gray-500">total fare</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setBookingStage('select')}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
          >
            Book Another Ride
          </button>
        </div>
      </div>
    )
  }

  // Confirmation view
  if (bookingStage === 'confirm' && selectedRide) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Your Ride</h3>
          <button
            onClick={cancelBooking}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Ride Details */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getTypeColor(selectedRide.type)} flex items-center justify-center`}>
                <selectedRide.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedRide.name}</h4>
                <p className="text-sm text-gray-500">{selectedRide.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${selectedRide.price}</p>
              {selectedRide.originalPrice && (
                <p className="text-sm text-gray-500 line-through">
                  ${selectedRide.originalPrice}
                </p>
              )}
            </div>
          </div>

          {/* Driver Info */}
          {selectedRide.driver && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${selectedRide.driver.name}&background=059669&color=fff`}
                    alt={selectedRide.driver.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedRide.driver.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <IoStarOutline className="w-3.5 h-3.5 text-amber-500 fill-current mr-1" />
                      <span>{selectedRide.driver.rating} • {selectedRide.driver.trips} trips</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{selectedRide.driver.vehicle}</p>
                  <p className="text-xs text-gray-500">{selectedRide.driver.plateNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">PICKUP</p>
              <p className="text-sm font-medium text-gray-900">{pickupLocation}</p>
            </div>
          </div>
          
          <div className="ml-2.5 border-l-2 border-dashed border-gray-300 h-6"></div>
          
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">DROPOFF</p>
              <p className="text-sm font-medium text-gray-900">{dropoffLocation}</p>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Distance</p>
            <p className="text-lg font-semibold text-gray-900">{distance} mi</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-lg font-semibold text-gray-900">{duration} min</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">ETA</p>
            <p className="text-lg font-semibold text-gray-900">{selectedRide.eta} min</p>
          </div>
        </div>

        {/* Commission Breakdown for Hotels */}
        {hotelCommission && selectedRide.commission && (
          <div className="mb-6">
            <button
              onClick={() => setShowCommissionBreakdown(!showCommissionBreakdown)}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              <IoInformationCircleOutline className="mr-1" />
              {showCommissionBreakdown ? 'Hide' : 'Show'} Commission Breakdown
            </button>
            
            {showCommissionBreakdown && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-900 font-medium mb-2">REVENUE SPLIT</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Hotel Commission (15%)</span>
                    <span className="font-semibold text-green-900">
                      ${selectedRide.commission.hotel.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Driver Earnings (67%)</span>
                    <span className="font-medium text-gray-900">
                      ${selectedRide.commission.driver.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (18%)</span>
                    <span className="font-medium text-gray-900">
                      ${selectedRide.commission.platform.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={cancelBooking}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmBooking}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Booking...' : 'Confirm Ride'}
          </button>
        </div>
      </div>
    )
  }

  // Main selection view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Book a Ride</h3>
        {isAtHotel && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <IoLocationOutline className="mr-1" />
            Hotel Pickup
          </span>
        )}
      </div>

      {/* Location Inputs */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <IoLocationOutline className="absolute left-3 top-3 w-5 h-5 text-green-600" />
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="Pickup location"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={swapLocations}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Swap locations"
          >
            <IoSwapHorizontalOutline className="w-5 h-5 text-gray-500 rotate-90" />
          </button>
        </div>
        
        <div className="relative">
          <IoNavigateOutline className="absolute left-3 top-3 w-5 h-5 text-red-600" />
          <input
            type="text"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            placeholder="Where to?"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {estimateLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding available rides...</p>
        </div>
      )}

      {/* Ride Options */}
      {!estimateLoading && rideOptions.length > 0 && (
        <div className="space-y-3">
          {/* Trip Summary */}
          {showEstimates && distance > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <IoNavigateOutline className="w-4 h-4 mr-1" />
                    <span>{distance} miles</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <IoTimeOutline className="w-4 h-4 mr-1" />
                    <span>{duration} min</span>
                  </div>
                </div>
                <div className="flex items-center text-green-600 font-medium">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  <span>Save up to 40%</span>
                </div>
              </div>
            </div>
          )}

          {/* Ride Cards */}
          {rideOptions.map((ride) => {
            const RideIcon = ride.icon
            
            return (
              <div
                key={ride.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleBookRide(ride)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${getTypeColor(ride.type)} flex items-center justify-center`}>
                      <RideIcon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{ride.name}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(ride.type)}`}>
                          {ride.seats} seats
                        </span>
                        {ride.eta <= 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <IoFlashOutline className="mr-0.5" />
                            Nearby
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{ride.description}</p>
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <IoTimeOutline className="w-3.5 h-3.5 mr-1" />
                          <span>{ride.eta} min away</span>
                        </div>
                        {ride.driver && (
                          <div className="flex items-center text-xs text-gray-500">
                            <IoStarOutline className="w-3.5 h-3.5 text-amber-500 fill-current mr-1" />
                            <span>{ride.driver.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${ride.price}
                    </div>
                    {ride.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        ${ride.originalPrice}
                      </div>
                    )}
                    {hotelCommission && ride.commission && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        +${ride.commission.hotel.toFixed(2)} earned
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No rides available */}
      {!estimateLoading && rideOptions.length === 0 && pickupLocation && dropoffLocation && (
        <div className="text-center py-8">
          <IoCarOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No rides available for this route</p>
          <button
            onClick={loadRideEstimates}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Safety Features */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <IoShieldCheckmarkOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>Verified drivers</span>
            </div>
            <div className="flex items-center">
              <IoWalletOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>Transparent pricing</span>
            </div>
            <div className="flex items-center">
              <IoSparklesOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>No surge pricing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}