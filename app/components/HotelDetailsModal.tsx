// app/components/HotelDetailsModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCloseOutline,
  IoLocationOutline,
  IoStarSharp,
  IoCheckmarkCircle,
  IoCarSportOutline,
  IoWifiOutline,
  IoCafeOutline,
  IoFitnessOutline,
  IoRestaurantOutline,
  IoBusinessOutline,
  IoBedOutline,
  IoPersonOutline,
  IoWarningOutline,
  IoSparklesOutline,
  IoTicketOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCarOutline,
  IoAirplaneOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoExpandOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface RoomType {
  id: string
  name: string
  beds: string
  maxGuests: number
  price: number
  originalPrice?: number
  available: number
  amenities: string[]
  sqft?: number
  image?: string
}

interface Hotel {
  id: string
  name: string
  location: string
  image: string
  images?: string[]
  rating: number
  reviews: number
  price: number
  originalPrice?: number
  amenities: string[]
  tier: string
  instantRideStatus?: 'active' | 'inactive' | 'pending'
  monthlyRevenue?: string
  guestComplaints?: number
  competitorAdvantage?: string
  transportFeatures?: string[]
  roomTypes?: RoomType[]
  instantRideValue?: number
  description?: string
  checkIn?: string
  checkOut?: string
  policies?: string[]
}

interface HotelDetailsModalProps {
  hotel: Hotel
  onClose: () => void
}

const HOTEL_TIERS = {
  PREMIUM: 'premium',
  STANDARD: 'standard',
  BASIC: 'basic',
  UNVERIFIED: 'unverified'
}

export default function HotelDetailsModal({ hotel, onClose }: HotelDetailsModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmed'>('details')
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'hotel'>('now')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [guestsCount, setGuestsCount] = useState(2)
  const [nightsCount, setNightsCount] = useState(1)

  // Default images if none provided
  const hotelImages = hotel.images || [
    hotel.image,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
  ]

  // Default room types if none provided
  const roomTypes = hotel.roomTypes || [
    {
      id: 'default-1',
      name: 'Deluxe King Room',
      beds: '1 King Bed',
      maxGuests: 2,
      price: hotel.price,
      originalPrice: hotel.originalPrice,
      available: 5,
      amenities: ['City View', 'Work Desk', 'Mini Bar'],
      sqft: 450
    },
    {
      id: 'default-2',
      name: 'Deluxe Double Room',
      beds: '2 Queen Beds',
      maxGuests: 4,
      price: hotel.price + 50,
      originalPrice: hotel.originalPrice ? hotel.originalPrice + 50 : undefined,
      available: 3,
      amenities: ['City View', 'Sitting Area', 'Mini Bar'],
      sqft: 520
    }
  ]

  // Hotel description
  const description = hotel.description || 
    `Experience luxury and comfort at ${hotel.name}. Our property offers world-class amenities and exceptional service in the heart of ${hotel.location}. Whether you're here for business or leisure, enjoy our carefully designed spaces and premium facilities.`

  // Amenity icons mapping
  const amenityIcons: { [key: string]: JSX.Element } = {
    'Spa': <IoSparklesOutline className="w-4 h-4" />,
    'Pool': <IoWifiOutline className="w-4 h-4" />,
    'Gym': <IoFitnessOutline className="w-4 h-4" />,
    'Fitness': <IoFitnessOutline className="w-4 h-4" />,
    'Restaurant': <IoRestaurantOutline className="w-4 h-4" />,
    'Dining': <IoRestaurantOutline className="w-4 h-4" />,
    'Fine Dining': <IoRestaurantOutline className="w-4 h-4" />,
    'Wifi': <IoWifiOutline className="w-4 h-4" />,
    'Business': <IoBusinessOutline className="w-4 h-4" />,
    'Concierge': <IoBusinessOutline className="w-4 h-4" />,
    'Cafe': <IoCafeOutline className="w-4 h-4" />
  }

  const handleRoomSelect = (room: RoomType) => {
    setSelectedRoom(room)
  }

  const handleBookNow = () => {
    if (selectedRoom) {
      setBookingStep('payment')
    }
  }

  const handleConfirmBooking = () => {
    if (!selectedRoom) return
    
    // Generate confirmation code
    const tierCode = hotel.tier === HOTEL_TIERS.PREMIUM ? 'P' : 
                    hotel.tier === HOTEL_TIERS.STANDARD ? 'S' : 'B'
    const code = `PHX${tierCode}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    setConfirmationCode(code)
    
    // Store in localStorage
    localStorage.setItem('memberBookingCode', code)
    localStorage.setItem('hotelBookingDetails', JSON.stringify({
      hotelName: hotel.name,
      roomType: selectedRoom.name,
      instantRideValue: hotel.instantRideValue || 0,
      tier: hotel.tier,
      nights: nightsCount,
      guests: guestsCount
    }))
    
    setBookingStep('confirmed')
  }

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % hotelImages.length)
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 md:pt-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-5xl shadow-2xl">
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {bookingStep === 'details' && hotel.name}
                  {bookingStep === 'payment' && 'Complete Your Booking'}
                  {bookingStep === 'confirmed' && 'Booking Confirmed!'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hotel.location}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <IoCloseOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            {/* Hotel Details View */}
            {bookingStep === 'details' && (
              <>
                {/* Image Gallery */}
                <div className="mb-6">
                  <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={hotelImages[activeImageIndex]}
                      alt={`${hotel.name} - Image ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur 
                        rounded-full text-white hover:bg-black/70 transition"
                    >
                      <IoChevronBackOutline className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur 
                        rounded-full text-white hover:bg-black/70 transition"
                    >
                      <IoChevronForwardOutline className="w-5 h-5" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {hotelImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeImageIndex 
                              ? 'bg-white w-8' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Tier Badge */}
                    {hotel.tier === HOTEL_TIERS.PREMIUM && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-400 
                        to-amber-500 rounded-full shadow-lg flex items-center space-x-1">
                        <IoStarSharp className="w-4 h-4 text-white" />
                        <span className="text-xs font-black text-white">PREMIUM PARTNER</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {hotelImages.slice(0, 5).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative h-16 md:h-20 rounded overflow-hidden border-2 transition-all ${
                          index === activeImageIndex 
                            ? 'border-blue-500' 
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hotel Info Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {/* Left Column - Description & Amenities */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Rating and Reviews */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <IoStarSharp
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(hotel.rating) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300 dark:text-gray-700'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                          {hotel.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({hotel.reviews.toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        About This Property
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Amenities
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {hotel.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            {amenityIcons[amenity] || <IoCheckmarkCircle className="w-4 h-4" />}
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Check-in/Check-out Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-in</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {hotel.checkIn || 'After 3:00 PM'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-out</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {hotel.checkOut || 'Before 11:00 AM'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Transport Benefits */}
                  <div className="space-y-6">
                    {/* Instant Ride Benefits for Premium */}
                    {hotel.tier === HOTEL_TIERS.PREMIUM && hotel.instantRideValue && (
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 
                        dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center space-x-2 mb-3">
                          <IoCarSportOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <h4 className="font-bold text-amber-700 dark:text-amber-300">
                            Instant Ride Benefits
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-amber-600 dark:text-amber-400">Value:</span>
                            <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                              ${hotel.instantRideValue}
                            </span>
                          </div>
                          {hotel.transportFeatures?.map((feature, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Your booking code unlocks luxury rides at member rates
                        </p>
                      </div>
                    )}

                    {/* Warning for Basic Hotels */}
                    {hotel.tier === HOTEL_TIERS.BASIC && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border 
                        border-amber-200 dark:border-amber-800">
                        <div className="flex items-start space-x-2">
                          <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                              Limited Transportation
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              {hotel.guestComplaints 
                                ? `${hotel.guestComplaints} guests requested instant rides` 
                                : 'Standard shuttle service only'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stay Options */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3">Your Stay</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Nights</label>
                          <select
                            value={nightsCount}
                            onChange={(e) => setNightsCount(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 
                              rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                              focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {[1,2,3,4,5,6,7].map(n => (
                              <option key={n} value={n}>{n} {n === 1 ? 'Night' : 'Nights'}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Guests</label>
                          <select
                            value={guestsCount}
                            onChange={(e) => setGuestsCount(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 
                              rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                              focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {[1,2,3,4].map(n => (
                              <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Select Your Room
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {roomTypes.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => handleRoomSelect(room)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRoom?.id === room.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {room.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {room.beds}
                            </p>
                          </div>
                          <div className="text-right">
                            {room.originalPrice && (
                              <p className="text-sm text-gray-400 line-through">
                                ${room.originalPrice}
                              </p>
                            )}
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              ${room.price}
                            </p>
                            <p className="text-xs text-gray-500">per night</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <IoPersonOutline className="w-4 h-4" />
                            <span>Up to {room.maxGuests} guests</span>
                            {room.sqft && (
                              <>
                                <span>•</span>
                                <span>{room.sqft} sq ft</span>
                              </>
                            )}
                          </div>
                          
                          {room.amenities && (
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.map((amenity) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs 
                                    text-gray-600 dark:text-gray-400 rounded"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {room.available <= 3 && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                              Only {room.available} left at this price!
                            </p>
                          )}
                        </div>
                        
                        {selectedRoom?.id === room.id && (
                          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <IoCheckmarkCircle className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                  Selected
                                </span>
                              </div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                Total: ${room.price * nightsCount}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Book Now Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleBookNow}
                      disabled={!selectedRoom}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                        selectedRoom
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.01]'
                          : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      }`}
                    >
                      {selectedRoom ? `Book Now - $${selectedRoom.price * nightsCount} Total` : 'Select a Room'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Payment Step */}
            {bookingStep === 'payment' && selectedRoom && (
              <div className="space-y-6">
                {/* Booking Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Hotel:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{hotel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Room:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Nights:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{nightsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Guests:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{guestsCount}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-gray-900 dark:text-white">${selectedRoom.price * nightsCount}</span>
                      </div>
                    </div>
                    {hotel.instantRideValue && hotel.instantRideValue > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Instant Ride Benefits:</span>
                        <span className="font-bold">+${hotel.instantRideValue} value</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Options */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Method</h3>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'now'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="now"
                        checked={paymentMethod === 'now'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'now' | 'hotel')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Pay Now</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Secure payment, instant confirmation
                        </p>
                      </div>
                    </label>
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'hotel'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="hotel"
                        checked={paymentMethod === 'hotel'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'now' | 'hotel')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Pay at Hotel</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pay when you arrive, free cancellation
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setBookingStep('details')}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 
                      dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white 
                      rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all 
                      transform hover:scale-[1.01]"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {bookingStep === 'confirmed' && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center 
                    justify-center mx-auto mb-4">
                    <IoCheckmarkCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Booking Confirmed!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your reservation at {hotel.name} is confirmed
                  </p>
                </div>

                {/* Confirmation Code */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Your Confirmation Code
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-wider">
                    {confirmationCode}
                  </p>
                  {hotel.tier === HOTEL_TIERS.PREMIUM && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <IoTicketOutline className="inline w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                      <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                        This code unlocks ${hotel.instantRideValue} in luxury ride benefits!
                      </span>
                    </div>
                  )}
                </div>

                {/* Next Steps */}
                {hotel.tier === HOTEL_TIERS.PREMIUM && (
                  <div className="text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Next Steps:</h4>
                    <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>1. Check your email for booking details</li>
                      <li>2. Use code <span className="font-mono font-bold">{confirmationCode}</span> to book luxury rides</li>
                      <li>3. Enjoy instant pickup with no surge pricing</li>
                    </ol>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                      rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      onClose()
                      // Redirect to RiderView
                      window.location.href = '/?view=rider'
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 
                      transition-all transform hover:scale-[1.01]"
                  >
                    Book a Ride Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}