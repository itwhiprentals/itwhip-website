// app/(guest)/rides/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoCarSportOutline, 
  IoCheckmarkCircle, 
  IoLocationOutline,
  IoAirplaneOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoTrendingUpOutline,
  IoSparklesOutline,
  IoTicketOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoCalendarOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoKeyOutline,
  IoWalletOutline
} from 'react-icons/io5'

// Import the date input fixes CSS
import '@/app/styles/date-input-fixes.css'

export default function RidesPage() {
  const router = useRouter()
  const [bookingCode, setBookingCode] = useState('')
  const [isValidated, setIsValidated] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [showSurgeInfo, setShowSurgeInfo] = useState(false)
  
  // Scroll refs for horizontal sections
  const hotelScrollRef = useRef<HTMLDivElement>(null)
  const rentalScrollRef = useRef<HTMLDivElement>(null)
  
  // Live pricing comparison
  const [liveComparison, setLiveComparison] = useState({
    surge: '2.8x',
    uberPrice: '$78',
    lyftPrice: '$82',
    ourPrice: '$29'
  })

  // Check for stored validation
  useEffect(() => {
    const storedCode = localStorage.getItem('memberBookingCode')
    if (storedCode) {
      setBookingCode(storedCode)
      setIsValidated(true)
    }
  }, [])

  // Update prices periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const surgeMultiplier = (2.0 + Math.random() * 1.5).toFixed(1)
      const basePrice = 29
      const surgePrice = Math.round(basePrice * parseFloat(surgeMultiplier))
      
      setLiveComparison({
        surge: `${surgeMultiplier}x`,
        uberPrice: `$${surgePrice}`,
        lyftPrice: `$${surgePrice + Math.floor(Math.random() * 10)}`,
        ourPrice: '$29'
      })
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  // Validate booking code
  const validateBookingCode = () => {
    if (bookingCode.length < 6) return
    
    setIsValidating(true)
    
    // Simulate validation
    setTimeout(() => {
      setIsValidated(true)
      setIsValidating(false)
      localStorage.setItem('memberBookingCode', bookingCode)
    }, 1000)
  }

  // Handle code input
  const handleCodeInput = (value: string) => {
    setBookingCode(value.toUpperCase())
    
    // Auto-validate when code is complete
    if (value.length >= 6 && !isValidated) {
      validateBookingCode()
    }
  }

  // Scroll functions for horizontal sections
  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Hero Section - Clear video with floating search box */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Video Background - Full clarity */}
        <video 
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
        </video>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-16 pb-8">
          {/* Title and subtitle moved up with tighter spacing */}
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-1 drop-shadow-2xl">
              Instant Luxury Rides
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-200 drop-shadow-lg">
              Skip the surge. Fixed prices, always.
            </p>
          </div>

          {/* Enhanced Search Box - More visible floating card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl p-6 shadow-2xl">
              {/* Booking Code Section - More subtle */}
              <div className="mb-4 pb-4 border-b border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white flex items-center space-x-2">
                    <IoTicketOutline className="w-4 h-4" />
                    <span>Booking Reference</span>
                  </label>
                  {isValidated && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <IoCheckmarkCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={bookingCode}
                    onChange={(e) => handleCodeInput(e.target.value)}
                    placeholder="Enter hotel or event confirmation"
                    className={`w-full px-4 py-2.5 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all uppercase tracking-wider text-sm ${
                      isValidated 
                        ? 'border-green-500/50 bg-green-500/10 focus:ring-green-500' 
                        : 'border-white/30 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    disabled={isValidated}
                  />
                  <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isValidated ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    {isValidating ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : isValidated ? (
                      <IoLockOpenOutline className="w-5 h-5" />
                    ) : (
                      <IoLockClosedOutline className="w-5 h-5" />
                    )}
                  </div>
                </div>
                {!isValidated && (
                  <p className="text-xs text-gray-300 mt-2">
                    Required for member rates • Hotel booking, event ticket, or reservation code
                  </p>
                )}
              </div>

              {/* Date and Time Selection - Using proper mobile fixes */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1 block">
                    Date
                  </label>
                  <div className="relative flex">
                    <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none z-10" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={!isValidated}
                      className={`flex-1 w-full pl-10 pr-2 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none
                        [&::-webkit-date-and-time-value]:text-left
                        [&::-webkit-calendar-picker-indicator]:absolute
                        [&::-webkit-calendar-picker-indicator]:right-2
                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                        [&::-webkit-calendar-picker-indicator]:filter
                        [&::-webkit-calendar-picker-indicator]:invert ${
                        !isValidated ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{
                        minHeight: '42px',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1 block">
                    Time
                  </label>
                  <div className="relative flex">
                    <IoTimeOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none z-10" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!isValidated}
                      className={`flex-1 w-full pl-10 pr-2 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none ${
                        !isValidated ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{
                        minHeight: '42px',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Pickup */}
                <div className="relative">
                  <IoLocationOutline className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isValidated ? 'text-gray-300' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder={isValidated ? "Pickup location" : "Unlock with booking code"}
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    disabled={!isValidated}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      !isValidated ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Dropoff */}
                <div className="relative">
                  <IoAirplaneOutline className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isValidated ? 'text-gray-300' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder={isValidated ? "Where to?" : "Unlock with booking code"}
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    disabled={!isValidated}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      !isValidated ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Search Button */}
                <button 
                  disabled={!isValidated || !selectedDate || !selectedTime}
                  className={`w-full py-3 rounded-lg font-bold text-base transition-all transform ${
                    isValidated && selectedDate && selectedTime
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                      : 'bg-white/10 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isValidated ? 'Book Instant Ride' : 'Enter Booking Code First'}
                </button>
              </div>

              {/* Quick Options - Only show when validated */}
              {isValidated && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button 
                    onClick={() => {
                      setPickupLocation('Sky Harbor Airport')
                      setDropoffLocation('Your Hotel')
                    }}
                    className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-sm text-white hover:bg-white/20 transition"
                  >
                    Airport → Hotel
                  </button>
                  <button 
                    onClick={() => {
                      setPickupLocation('Your Hotel')
                      setDropoffLocation('Sky Harbor Airport')
                    }}
                    className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-sm text-white hover:bg-white/20 transition"
                  >
                    Hotel → Airport
                  </button>
                </div>
              )}

              {/* Member Benefits */}
              {isValidated && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-300">
                    <div className="flex items-center space-x-1">
                      <IoCheckmarkCircle className="w-3 h-3 text-green-400" />
                      <span>Member rate applied</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <IoShieldCheckmarkOutline className="w-3 h-3 text-blue-400" />
                      <span>Price locked</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <IoSparklesOutline className="w-3 h-3 text-amber-400" />
                      <span>Luxury guaranteed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-6 text-sm text-white">
            <div className="flex items-center space-x-2">
              <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
              <span>No surge pricing</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
              <span>Luxury vehicles only</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
              <span>Flight tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels with Instant Rides Section */}
      <section className="py-12 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                Book Hotels with Instant Rides
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get your booking code & unlock member rates
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => scrollLeft(hotelScrollRef)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <IoChevronBackOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => scrollRight(hotelScrollRef)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <IoChevronForwardOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div 
            ref={hotelScrollRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {/* Hotel Cards */}
            {[
              {
                name: 'Four Seasons Resort',
                location: 'Scottsdale, AZ',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
                price: 495,
                originalPrice: 550,
                rating: 4.9,
                savings: 47,
                benefit: 'FREE AIRPORT RIDE'
              },
              {
                name: 'The Phoenician',
                location: 'Scottsdale, AZ',
                image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
                price: 425,
                originalPrice: 475,
                rating: 4.9,
                savings: 52,
                benefit: '$29 FIXED RIDES'
              },
              {
                name: 'Fairmont Princess',
                location: 'Scottsdale, AZ',
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
                price: 379,
                originalPrice: 420,
                rating: 4.8,
                savings: 41,
                benefit: 'MEMBER BENEFITS'
              }
            ].map((hotel, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-amber-400"
                onClick={() => router.push('/hotels')}
              >
                <div className="relative h-48 md:h-56">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg flex items-center space-x-1">
                    <IoStarOutline className="w-3 h-3 text-white" />
                    <span className="text-xs font-black text-white">PREMIUM PARTNER</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-black rounded-full shadow-lg">
                    {hotel.benefit}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">{hotel.name}</h3>
                    <p className="text-sm text-gray-200 drop-shadow">{hotel.location}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 line-through">${hotel.originalPrice}</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">${hotel.price}<span className="text-sm font-normal">/night</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-600 dark:text-green-400 font-bold">Save ${hotel.savings} on rides</p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <IoStarOutline key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-xs text-gray-500">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="w-full mt-3 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition"
                  >
                    Book & Get Free Ride
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Cars Cross-Sell Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                Need a Car for Your Trip?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Skip the rental counter • Free delivery to your hotel
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => scrollLeft(rentalScrollRef)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <IoChevronBackOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => scrollRight(rentalScrollRef)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <IoChevronForwardOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div 
            ref={rentalScrollRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {/* Rental Car Cards */}
            {[
              {
                name: '2023 Tesla Model 3',
                type: 'Luxury Electric',
                image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
                price: 125,
                originalPrice: 165,
                feature: 'Autopilot',
                savings: 40
              },
              {
                name: '2023 BMW X5',
                type: 'Luxury SUV',
                image: 'https://images.unsplash.com/photo-1555215858-9dc85b097840?w=800&h=600&fit=crop',
                price: 145,
                originalPrice: 195,
                feature: '7 Seats',
                savings: 50
              },
              {
                name: '2023 Mazda CX-5',
                type: 'Premium SUV',
                image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
                price: 65,
                originalPrice: 85,
                feature: 'AWD',
                savings: 20
              }
            ].map((car, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                onClick={() => router.push('/rentals')}
              >
                <div className="relative h-48 md:h-56">
                  <img 
                    src={car.image} 
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-purple-500 text-white rounded-full shadow-lg flex items-center space-x-1">
                    <IoKeyOutline className="w-3 h-3" />
                    <span className="text-xs font-black">INSTANT BOOK</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-black rounded-full shadow-lg">
                    SAVE ${car.savings}/DAY
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">{car.name}</h3>
                    <p className="text-sm text-gray-200 drop-shadow">{car.type}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 line-through">${car.originalPrice}</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">${car.price}<span className="text-sm font-normal">/day</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">{car.feature}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Free delivery</p>
                    </div>
                  </div>
                  <button 
                    className="w-full mt-3 py-2 bg-purple-500 text-white rounded-lg font-bold text-sm hover:bg-purple-600 transition"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Price Comparison */}
      <section className="py-12 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Real-Time Price Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sky Harbor to Scottsdale (Live Pricing)
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Uber */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Uber</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {liveComparison.uberPrice}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Surge: {liveComparison.surge}
                </div>
                <div className="mt-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                    Surge pricing active
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                    Random driver
                  </div>
                </div>
              </div>
            </div>

            {/* Lyft */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Lyft</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {liveComparison.lyftPrice}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Prime time: {liveComparison.surge}
                </div>
                <div className="mt-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                    Dynamic pricing
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                    Standard vehicle
                  </div>
                </div>
              </div>
            </div>

            {/* ItWhip */}
            <div className="bg-amber-500 rounded-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                MEMBER RATE
              </div>
              <div className="text-center relative z-10">
                <div className="text-amber-100 mb-2 text-sm">ItWhip</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {liveComparison.ourPrice}
                </div>
                <div className="text-sm text-amber-100 font-medium">
                  Fixed price always
                </div>
                <div className="mt-4 space-y-1 text-xs">
                  <div className="flex items-center justify-center">
                    <IoCheckmarkCircle className="w-4 h-4 text-white mr-2" />
                    No surge ever
                  </div>
                  <div className="flex items-center justify-center">
                    <IoCheckmarkCircle className="w-4 h-4 text-white mr-2" />
                    Luxury vehicle
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add CSS for animations */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}