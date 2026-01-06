// app/(guest)/dashboard/services/HotelCard.tsx
// Hotel Card Component - Search and book hotels with zero commission
// Shows available rooms, amenities, and bundle options

'use client'

import { useState, useEffect } from 'react'
import { 
  IoBedOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoStarOutline,
  IoWifiOutline,
  IoCarOutline,
  IoRestaurantOutline,
  IoFitnessOutline,
  IoBusinessOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoSearchOutline,
  IoFilterOutline,
  IoSparklesOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoTrendingUp,
  IoSwapHorizontalOutline,
  IoInformationCircleOutline,
  IoWaterOutline,
  IoCafeOutline,
  IoTvOutline,
  IoSnowOutline
} from 'react-icons/io5'

// Types
interface HotelCardProps {
  destination?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  onBookHotel?: (hotel: HotelOption, room: RoomOption) => void
  showBundles?: boolean
  isPartnerHotel?: boolean
}

interface HotelOption {
  id: string
  name: string
  type: 'budget' | 'standard' | 'premium' | 'luxury'
  rating: number
  reviews: number
  distance: number // miles from city center
  images: string[]
  address: string
  description: string
  amenities: string[]
  certifications: {
    itwhip: boolean
    level?: 'TU-1' | 'TU-2' | 'TU-3'
    rideCommission?: number
  }
  lowestPrice: number
  originalPrice?: number
  availableRooms: number
  popularWith?: string[]
  specialOffer?: string
}

interface RoomOption {
  id: string
  hotelId: string
  type: string
  name: string
  description: string
  beds: string
  maxGuests: number
  size: number // sq ft
  view?: string
  price: number
  originalPrice?: number
  amenities: string[]
  cancellation: 'free' | 'partial' | 'none'
  cancellationDeadline?: string
  includesBreakfast: boolean
  includesParking: boolean
  includesRides?: boolean
  rideCredit?: number
}

interface SearchFilters {
  priceRange: [number, number]
  rating: number
  amenities: string[]
  hotelType: string[]
  certifiedOnly: boolean
}

export default function HotelCard({
  destination = '',
  checkIn = '',
  checkOut = '',
  guests = 2,
  onBookHotel,
  showBundles = true,
  isPartnerHotel = false
}: HotelCardProps) {
  // State management
  const [searchDestination, setSearchDestination] = useState(destination)
  const [checkInDate, setCheckInDate] = useState(checkIn)
  const [checkOutDate, setCheckOutDate] = useState(checkOut)
  const [guestCount, setGuestCount] = useState(guests)
  const [hotels, setHotels] = useState<HotelOption[]>([])
  const [selectedHotel, setSelectedHotel] = useState<HotelOption | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null)
  const [rooms, setRooms] = useState<RoomOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [bookingStage, setBookingStage] = useState<'search' | 'rooms' | 'confirm' | 'booked'>('search')
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 500],
    rating: 0,
    amenities: [],
    hotelType: [],
    certifiedOnly: false
  })

  // Calculate nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  // Search hotels
  const searchHotels = async () => {
    if (!searchDestination || !checkInDate || !checkOutDate) return
    
    setSearchLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockHotels: HotelOption[] = [
        {
          id: 'htl-1',
          name: 'The Phoenician Resort',
          type: 'luxury',
          rating: 4.8,
          reviews: 2847,
          distance: 8.2,
          images: ['hotel1.jpg'],
          address: '6000 E Camelback Rd, Scottsdale, AZ',
          description: 'Luxury resort with world-class spa and golf',
          amenities: ['pool', 'spa', 'golf', 'fitness', 'restaurant', 'bar', 'wifi', 'parking'],
          certifications: {
            itwhip: true,
            level: 'TU-1',
            rideCommission: 15
          },
          lowestPrice: 389,
          originalPrice: 589,
          availableRooms: 3,
          popularWith: ['Business Travelers', 'Couples'],
          specialOffer: 'Free spa credit + ride bundle'
        },
        {
          id: 'htl-2',
          name: 'Hyatt Regency Phoenix',
          type: 'premium',
          rating: 4.5,
          reviews: 1523,
          distance: 0.5,
          images: ['hotel2.jpg'],
          address: '122 N 2nd St, Phoenix, AZ',
          description: 'Downtown hotel with rooftop pool',
          amenities: ['pool', 'fitness', 'restaurant', 'bar', 'wifi', 'parking', 'business'],
          certifications: {
            itwhip: true,
            level: 'TU-2',
            rideCommission: 15
          },
          lowestPrice: 189,
          originalPrice: 249,
          availableRooms: 8,
          popularWith: ['Business Travelers'],
          specialOffer: '$20 ride credit included'
        },
        {
          id: 'htl-3',
          name: 'Fairmont Scottsdale Princess',
          type: 'luxury',
          rating: 4.9,
          reviews: 3156,
          distance: 12.5,
          images: ['hotel3.jpg'],
          address: '7575 E Princess Dr, Scottsdale, AZ',
          description: 'AAA Five Diamond resort with 4 pools',
          amenities: ['pool', 'spa', 'golf', 'fitness', 'restaurant', 'bar', 'wifi', 'parking', 'tennis'],
          certifications: {
            itwhip: true,
            level: 'TU-1',
            rideCommission: 15
          },
          lowestPrice: 445,
          originalPrice: 695,
          availableRooms: 5,
          popularWith: ['Families', 'Golf Enthusiasts'],
          specialOffer: 'Kids stay free + airport transfers'
        },
        {
          id: 'htl-4',
          name: 'Hampton Inn Phoenix Downtown',
          type: 'standard',
          rating: 4.2,
          reviews: 892,
          distance: 1.2,
          images: ['hotel4.jpg'],
          address: '511 N Central Ave, Phoenix, AZ',
          description: 'Modern hotel with free breakfast',
          amenities: ['pool', 'fitness', 'wifi', 'parking', 'breakfast'],
          certifications: {
            itwhip: false
          },
          lowestPrice: 129,
          originalPrice: 159,
          availableRooms: 12,
          popularWith: ['Budget Travelers']
        },
        {
          id: 'htl-5',
          name: 'Four Seasons Resort Scottsdale',
          type: 'luxury',
          rating: 4.9,
          reviews: 1847,
          distance: 15.3,
          images: ['hotel5.jpg'],
          address: '10600 E Crescent Moon Dr, Scottsdale, AZ',
          description: 'Desert oasis with championship golf',
          amenities: ['pool', 'spa', 'golf', 'fitness', 'restaurant', 'bar', 'wifi', 'parking', 'kids-club'],
          certifications: {
            itwhip: true,
            level: 'TU-1',
            rideCommission: 15
          },
          lowestPrice: 525,
          originalPrice: 825,
          availableRooms: 2,
          popularWith: ['Luxury Seekers', 'Couples'],
          specialOffer: 'Complimentary round of golf'
        }
      ]

      // Apply filters
      let filtered = mockHotels
      if (filters.certifiedOnly) {
        filtered = filtered.filter(h => h.certifications.itwhip)
      }
      if (filters.rating > 0) {
        filtered = filtered.filter(h => h.rating >= filters.rating)
      }
      
      setHotels(filtered)
    } catch (error) {
      console.error('Failed to search hotels:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Load room options
  const loadRooms = async (hotel: HotelOption) => {
    setIsLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const nights = calculateNights()
      const mockRooms: RoomOption[] = [
        {
          id: 'room-1',
          hotelId: hotel.id,
          type: 'standard',
          name: 'Deluxe King Room',
          description: 'Spacious room with king bed and city views',
          beds: '1 King',
          maxGuests: 2,
          size: 400,
          view: 'City',
          price: hotel.lowestPrice,
          originalPrice: hotel.originalPrice,
          amenities: ['wifi', 'tv', 'minibar', 'safe', 'coffee'],
          cancellation: 'free',
          cancellationDeadline: checkInDate,
          includesBreakfast: false,
          includesParking: false,
          includesRides: false
        },
        {
          id: 'room-2',
          hotelId: hotel.id,
          type: 'premium',
          name: 'Premium Suite',
          description: 'Suite with separate living area and premium amenities',
          beds: '1 King',
          maxGuests: 3,
          size: 650,
          view: 'Pool',
          price: hotel.lowestPrice + 100,
          originalPrice: hotel.originalPrice ? hotel.originalPrice + 150 : undefined,
          amenities: ['wifi', 'tv', 'minibar', 'safe', 'coffee', 'bathrobe', 'balcony'],
          cancellation: 'partial',
          cancellationDeadline: checkInDate,
          includesBreakfast: true,
          includesParking: true,
          includesRides: false
        },
        {
          id: 'room-3',
          hotelId: hotel.id,
          type: 'bundle',
          name: 'Travel Bundle Suite',
          description: 'Suite with ride credits and premium perks',
          beds: '2 Queens',
          maxGuests: 4,
          size: 550,
          view: 'Garden',
          price: hotel.lowestPrice + 50,
          originalPrice: hotel.originalPrice ? hotel.originalPrice + 200 : undefined,
          amenities: ['wifi', 'tv', 'minibar', 'safe', 'coffee', 'bathrobe'],
          cancellation: 'free',
          cancellationDeadline: checkInDate,
          includesBreakfast: true,
          includesParking: true,
          includesRides: true,
          rideCredit: 50 * nights
        }
      ]

      setRooms(mockRooms)
      setSelectedHotel(hotel)
      setBookingStage('rooms')
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Select room
  const selectRoom = (room: RoomOption) => {
    setSelectedRoom(room)
    setBookingStage('confirm')
  }

  // Confirm booking
  const confirmBooking = async () => {
    if (!selectedHotel || !selectedRoom) return
    
    setIsLoading(true)
    try {
      // This would normally call the booking API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBookingStage('booked')
      
      if (onBookHotel) {
        onBookHotel(selectedHotel, selectedRoom)
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get type color
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'budget': return 'from-gray-500 to-gray-600'
      case 'standard': return 'from-blue-500 to-blue-600'
      case 'premium': return 'from-purple-500 to-purple-600'
      case 'luxury': return 'from-amber-500 to-amber-600'
      default: return 'from-green-500 to-green-600'
    }
  }

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    switch(amenity) {
      case 'wifi': return IoWifiOutline
      case 'pool': return IoWaterOutline
      case 'spa': return IoSparklesOutline
      case 'fitness': return IoFitnessOutline
      case 'restaurant': return IoRestaurantOutline
      case 'bar': return IoCafeOutline
      case 'parking': return IoCarOutline
      case 'tv': return IoTvOutline
      case 'ac': return IoSnowOutline
      default: return IoCheckmarkCircle
    }
  }

  const nights = calculateNights()

  // Booking confirmed view
  if (bookingStage === 'booked' && selectedHotel && selectedRoom) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600 mb-6">
            Your stay at {selectedHotel.name} is confirmed
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hotel</span>
                <span className="font-medium text-gray-900">{selectedHotel.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Room</span>
                <span className="font-medium text-gray-900">{selectedRoom.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Check-in</span>
                <span className="font-medium text-gray-900">{checkInDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Check-out</span>
                <span className="font-medium text-gray-900">{checkOutDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Guests</span>
                <span className="font-medium text-gray-900">{guestCount}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total ({nights} nights)</span>
                  <span className="text-xl font-bold text-green-600">
                    ${selectedRoom.price * nights}
                  </span>
                </div>
              </div>
            </div>
            
            {selectedRoom.includesRides && selectedRoom.rideCredit && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-700">
                  <IoCarOutline className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">
                    ${selectedRoom.rideCredit} ride credit included!
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              setBookingStage('search')
              setSelectedHotel(null)
              setSelectedRoom(null)
            }}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
          >
            Book Another Hotel
          </button>
        </div>
      </div>
    )
  }

  // Confirmation view
  if (bookingStage === 'confirm' && selectedHotel && selectedRoom) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Your Booking</h3>
          <button
            onClick={() => setBookingStage('rooms')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Hotel & Room Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-1">{selectedHotel.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center">
                <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
                <span>{selectedHotel.rating}</span>
              </div>
              <span>•</span>
              <span>{selectedHotel.address}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{selectedRoom.name}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedRoom.beds} • Up to {selectedRoom.maxGuests} guests</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRoom.includesBreakfast && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Breakfast included
                    </span>
                  )}
                  {selectedRoom.includesParking && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Free parking
                    </span>
                  )}
                  {selectedRoom.includesRides && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      ${selectedRoom.rideCredit} rides
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${selectedRoom.price * nights}
                </p>
                <p className="text-sm text-gray-500">{nights} nights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">CHECK-IN</p>
              <p className="font-medium text-gray-900">{checkInDate}</p>
              <p className="text-sm text-gray-600">After 3:00 PM</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">CHECK-OUT</p>
              <p className="font-medium text-gray-900">{checkOutDate}</p>
              <p className="text-sm text-gray-600">Before 11:00 AM</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">GUESTS</p>
            <p className="font-medium text-gray-900">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">CANCELLATION POLICY</p>
            <p className="font-medium text-gray-900">
              {selectedRoom.cancellation === 'free' ? 'Free cancellation' : 
               selectedRoom.cancellation === 'partial' ? 'Partial refund' : 
               'Non-refundable'}
            </p>
            {selectedRoom.cancellationDeadline && (
              <p className="text-sm text-gray-600">Until {selectedRoom.cancellationDeadline}</p>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Room rate ({nights} nights)</span>
              <span className="text-gray-900">${selectedRoom.price * nights}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes & fees</span>
              <span className="text-gray-900">${Math.round(selectedRoom.price * nights * 0.13)}</span>
            </div>
            {selectedRoom.originalPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Discount</span>
                <span className="text-green-600">
                  -${(selectedRoom.originalPrice - selectedRoom.price) * nights}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  ${Math.round(selectedRoom.price * nights * 1.13)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Certification Badge */}
        {selectedHotel.certifications.itwhip && (
          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    ItWhip Certified Hotel
                  </p>
                  <p className="text-xs text-green-700">
                    Earn {selectedHotel.certifications.rideCommission}% on all ride bookings
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                {selectedHotel.certifications.level}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBookingStage('rooms')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={confirmBooking}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    )
  }

  // Room selection view
  if (bookingStage === 'rooms' && selectedHotel) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        {/* Hotel Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setBookingStage('search')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to hotels
            </button>
            {selectedHotel.certifications.itwhip && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <IoShieldCheckmarkOutline className="mr-1" />
                ItWhip Certified
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedHotel.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
              <span>{selectedHotel.rating} ({selectedHotel.reviews} reviews)</span>
            </div>
            <div className="flex items-center">
              <IoLocationOutline className="w-4 h-4 mr-1" />
              <span>{selectedHotel.distance} mi from center</span>
            </div>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Available Rooms for {nights} {nights === 1 ? 'night' : 'nights'}
          </h4>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available rooms...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">{room.name}</h5>
                        {room.includesRides && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <IoCarOutline className="mr-0.5" />
                            Rides included
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="text-sm">
                          <span className="text-gray-500">Beds:</span>
                          <p className="font-medium text-gray-900">{room.beds}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Guests:</span>
                          <p className="font-medium text-gray-900">Up to {room.maxGuests}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Size:</span>
                          <p className="font-medium text-gray-900">{room.size} sq ft</p>
                        </div>
                        {room.view && (
                          <div className="text-sm">
                            <span className="text-gray-500">View:</span>
                            <p className="font-medium text-gray-900">{room.view}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {room.includesBreakfast && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs text-green-700 bg-green-50">
                            <IoRestaurantOutline className="mr-1" />
                            Breakfast included
                          </span>
                        )}
                        {room.includesParking && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs text-blue-700 bg-blue-50">
                            <IoCarOutline className="mr-1" />
                            Free parking
                          </span>
                        )}
                        {room.cancellation === 'free' && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs text-gray-700 bg-gray-50">
                            <IoCheckmarkCircle className="mr-1" />
                            Free cancellation
                          </span>
                        )}
                      </div>
                      
                      {room.includesRides && room.rideCredit && (
                        <div className="mt-3 p-2 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-900">
                            <strong>${room.rideCredit} ride credit included</strong> - Use for airport transfers and city rides
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="mb-3">
                        <p className="text-2xl font-bold text-gray-900">
                          ${room.price * nights}
                        </p>
                        {room.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${room.originalPrice * nights}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{nights} nights total</p>
                      </div>
                      
                      <button
                        onClick={() => selectRoom(room)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Select Room
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main search view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Find Hotels</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
        >
          <IoFilterOutline className="mr-1" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Search Form */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchDestination}
            onChange={(e) => setSearchDestination(e.target.value)}
            placeholder="Where are you going?"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="relative">
          <IoPersonOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={searchHotels}
          disabled={!searchDestination || !checkInDate || !checkOutDate}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
        >
          Search Hotels
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.certifiedOnly}
                onChange={(e) => setFilters({...filters, certifiedOnly: e.target.checked})}
                className="text-green-600"
              />
              <span className="text-sm text-gray-700">ItWhip Certified Only</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.amenities.includes('pool')}
                onChange={(e) => {
                  const amenities = e.target.checked 
                    ? [...filters.amenities, 'pool']
                    : filters.amenities.filter(a => a !== 'pool')
                  setFilters({...filters, amenities})
                }}
                className="text-green-600"
              />
              <span className="text-sm text-gray-700">Pool</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.amenities.includes('spa')}
                onChange={(e) => {
                  const amenities = e.target.checked 
                    ? [...filters.amenities, 'spa']
                    : filters.amenities.filter(a => a !== 'spa')
                  setFilters({...filters, amenities})
                }}
                className="text-green-600"
              />
              <span className="text-sm text-gray-700">Spa</span>
            </label>
          </div>
        </div>
      )}

      {/* Loading State */}
      {searchLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching hotels in {searchDestination}...</p>
        </div>
      )}

      {/* Hotel Results */}
      {!searchLoading && hotels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Found {hotels.length} hotels
            </p>
            {showBundles && (
              <span className="text-sm text-green-600 font-medium">
                Save up to 40% with bundles
              </span>
            )}
          </div>
          
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => loadRooms(hotel)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                      {hotel.certifications.itwhip && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <IoShieldCheckmarkOutline className="mr-0.5" />
                          Certified
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        hotel.type === 'luxury' ? 'bg-amber-100 text-amber-700' :
                        hotel.type === 'premium' ? 'bg-purple-100 text-purple-700' :
                        hotel.type === 'standard' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {hotel.type.charAt(0).toUpperCase() + hotel.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
                        <span>{hotel.rating} ({hotel.reviews})</span>
                      </div>
                      <div className="flex items-center">
                        <IoLocationOutline className="w-4 h-4 mr-1" />
                        <span>{hotel.distance} mi from center</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{hotel.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {hotel.amenities.slice(0, 5).map(amenity => {
                        const Icon = getAmenityIcon(amenity)
                        return (
                          <span key={amenity} className="inline-flex items-center px-2 py-1 rounded text-xs text-gray-600 bg-gray-100">
                            <Icon className="w-3 h-3 mr-1" />
                            {amenity}
                          </span>
                        )
                      })}
                      {hotel.amenities.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{hotel.amenities.length - 5} more
                        </span>
                      )}
                    </div>
                    
                    {hotel.specialOffer && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <IoSparklesOutline className="mr-1" />
                        {hotel.specialOffer}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${hotel.lowestPrice}
                    </p>
                    {hotel.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ${hotel.originalPrice}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">per night</p>
                    
                    {hotel.certifications.itwhip && hotel.certifications.rideCommission && (
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        +{hotel.certifications.rideCommission}% rides
                      </div>
                    )}
                    
                    <p className="text-xs text-orange-600 mt-2">
                      {hotel.availableRooms} rooms left
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!searchLoading && hotels.length === 0 && searchDestination && (
        <div className="text-center py-8">
          <IoBedOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hotels found in {searchDestination}</p>
          <button
            onClick={searchHotels}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Try different dates
          </button>
        </div>
      )}

      {/* Benefits */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <IoShieldCheckmarkOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>Zero commission</span>
            </div>
            <div className="flex items-center">
              <IoTrendingUp className="w-4 h-4 mr-1 text-green-600" />
              <span>Best price guarantee</span>
            </div>
            <div className="flex items-center">
              <IoFlashOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>Instant booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}