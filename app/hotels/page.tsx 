// app/hotels/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoSearchOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoBedOutline,
  IoStarSharp,
  IoCheckmarkCircle,
  IoCarSportOutline,
  IoAirplaneOutline,
  IoSparklesOutline,
  IoTrendingUpOutline,
  IoTimeOutline,
  IoWarningOutline,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoInformationCircleOutline,
  IoTicketOutline
} from 'react-icons/io5'

// Hotel tier system matching HotelView
const HOTEL_TIERS = {
  PREMIUM: 'premium',
  STANDARD: 'standard', 
  BASIC: 'basic',
  UNVERIFIED: 'unverified'
}

interface Hotel {
  id: string
  name: string
  location: string
  image: string
  rating: number
  reviews: number
  price: number
  originalPrice?: number
  tier: string
  instantRideValue?: number
  transportFeatures?: string[]
  availableRooms: number
  popularityScore?: number
}

export default function HotelsPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Search states
  const [destination, setDestination] = useState('Phoenix, AZ')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [rooms, setRooms] = useState('1')
  const [searchActive, setSearchActive] = useState(false)
  
  // Filter states
  const [filterTier, setFilterTier] = useState<string>('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [showOnlyInstantRides, setShowOnlyInstantRides] = useState(false)
  
  // UI states
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null)
  
  // Live stats that update
  const [liveViewers, setLiveViewers] = useState<{[key: string]: number}>({})
  const [recentBookings, setRecentBookings] = useState(127)
  const [savedAmount, setSavedAmount] = useState(48923)

  // Hotels data with instant ride benefits clearly shown
  const hotels: Hotel[] = [
    {
      id: '1',
      name: 'Four Seasons Resort Scottsdale',
      location: 'Scottsdale, AZ • 8.2 mi from PHX',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      rating: 4.9,
      reviews: 3847,
      price: 495,
      originalPrice: 550,
      tier: HOTEL_TIERS.PREMIUM,
      instantRideValue: 89,
      transportFeatures: ['FREE Airport Transfer ($89 value)', 'Tesla Fleet Access', 'No Surge Guarantee', 'VIP Priority Pickup'],
      availableRooms: 3,
      popularityScore: 98
    },
    {
      id: '2',
      name: 'The Phoenician',
      location: 'Scottsdale, AZ • 7.5 mi from PHX',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
      rating: 4.9,
      reviews: 3462,
      price: 425,
      originalPrice: 475,
      tier: HOTEL_TIERS.PREMIUM,
      instantRideValue: 78,
      transportFeatures: ['FREE Airport Transfer ($78 value)', 'Premium BMW Service', 'Express Pickup Lane', 'Flight Tracking'],
      availableRooms: 5,
      popularityScore: 95
    },
    {
      id: '3',
      name: 'Fairmont Scottsdale Princess',
      location: 'Scottsdale, AZ • 9.1 mi from PHX',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      rating: 4.8,
      reviews: 4821,
      price: 379,
      originalPrice: 420,
      tier: HOTEL_TIERS.PREMIUM,
      instantRideValue: 65,
      transportFeatures: ['FREE Airport Transfer ($65 value)', 'Luxury Fleet', 'Member Priority', '24/7 Concierge'],
      availableRooms: 8,
      popularityScore: 92
    },
    {
      id: '4',
      name: 'W Scottsdale',
      location: 'Scottsdale, AZ • 6.8 mi from PHX',
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop',
      rating: 4.7,
      reviews: 2156,
      price: 335,
      tier: HOTEL_TIERS.STANDARD,
      instantRideValue: 29,
      transportFeatures: ['Scheduled Rides Only', 'Standard Vehicles', 'Advance Booking Required'],
      availableRooms: 12,
      popularityScore: 78
    },
    {
      id: '5',
      name: 'Omni Scottsdale Resort',
      location: 'Scottsdale, AZ • 10.2 mi from PHX',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      rating: 4.8,
      reviews: 2847,
      price: 289,
      tier: HOTEL_TIERS.BASIC,
      instantRideValue: 0,
      transportFeatures: [],
      availableRooms: 15,
      popularityScore: 65
    },
    {
      id: '6',
      name: 'The Boulders Resort',
      location: 'Carefree, AZ • 18.5 mi from PHX',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      rating: 4.7,
      reviews: 1654,
      price: 410,
      tier: HOTEL_TIERS.UNVERIFIED,
      instantRideValue: 0,
      transportFeatures: [],
      availableRooms: 7,
      popularityScore: 58
    }
  ]

  // Initialize live viewers for each hotel
  useEffect(() => {
    const viewers: {[key: string]: number} = {}
    hotels.forEach(hotel => {
      viewers[hotel.id] = Math.floor(Math.random() * 20) + 5
    })
    setLiveViewers(viewers)

    // Update viewers periodically
    const interval = setInterval(() => {
      setLiveViewers(prev => {
        const updated = {...prev}
        Object.keys(updated).forEach(id => {
          const change = Math.floor(Math.random() * 5) - 2
          updated[id] = Math.max(2, Math.min(30, updated[id] + change))
        })
        return updated
      })
      
      setRecentBookings(prev => prev + Math.floor(Math.random() * 3))
      setSavedAmount(prev => prev + Math.floor(Math.random() * 200) + 50)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Set default dates (today and tomorrow)
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setCheckIn(today.toISOString().split('T')[0])
    setCheckOut(tomorrow.toISOString().split('T')[0])
  }, [])

  const handleSearch = () => {
    setSearchActive(true)
    // In real app, this would filter hotels
  }

  const handleBookHotel = (hotel: Hotel) => {
    setBookingHotel(hotel)
    setShowBookingModal(true)
  }

  const confirmBooking = () => {
    if (!bookingHotel) return
    
    // Generate confirmation code
    const confirmationCode = `PHX${bookingHotel.tier.toUpperCase().substring(0, 1)}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // Store in localStorage for RiderView to access
    localStorage.setItem('hotelBookingCode', confirmationCode)
    localStorage.setItem('hotelBookingDetails', JSON.stringify({
      hotelName: bookingHotel.name,
      checkIn,
      checkOut,
      instantRideValue: bookingHotel.instantRideValue || 0,
      tier: bookingHotel.tier
    }))
    
    // Redirect to confirmation or rider view
    router.push(`/booking-confirmation?code=${confirmationCode}`)
  }

  // Filter hotels based on criteria
  const filteredHotels = hotels.filter(hotel => {
    if (filterTier !== 'all' && hotel.tier !== filterTier) return false
    if (showOnlyInstantRides && hotel.tier !== HOTEL_TIERS.PREMIUM) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'instant-rides') return (b.instantRideValue || 0) - (a.instantRideValue || 0)
    return (b.popularityScore || 0) - (a.popularityScore || 0) // recommended
  })

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        userType="rider"
        onUserTypeChange={() => router.push('/')}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Hero Search Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-black pt-20 pb-16">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
              Book Phoenix Hotels with Instant Rides
            </h1>
            <p className="text-lg text-blue-100">
              Premium properties include FREE luxury airport transfers
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-4 text-sm text-blue-100">
              <div className="flex items-center space-x-1">
                <IoCheckmarkCircle className="w-4 h-4 text-green-400" />
                <span>{recentBookings} bookings today</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoCarSportOutline className="w-4 h-4 text-amber-400" />
                <span>Instant ride confirmation</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoTrendingUpOutline className="w-4 h-4 text-green-400" />
                <span>${savedAmount.toLocaleString()} saved by guests</span>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {/* Destination */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <IoLocationOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 
                      focus:ring-blue-500"
                    placeholder="City or airport"
                  />
                </div>
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check-in
                </label>
                <div className="relative">
                  <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 
                      focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check-out
                </label>
                <div className="relative">
                  <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 
                      focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Guests & Rooms */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Guests
                </label>
                <div className="relative">
                  <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 
                      focus:ring-blue-500 appearance-none"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg 
                    font-bold hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-[1.02] 
                    shadow-lg flex items-center justify-center space-x-2"
                >
                  <IoSearchOutline className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick filters:</span>
              <button
                onClick={() => setShowOnlyInstantRides(!showOnlyInstantRides)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  showOnlyInstantRides 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <IoCarSportOutline className="inline w-3 h-3 mr-1" />
                Free Airport Transfers Only
              </button>
              <button
                onClick={() => setFilterTier(filterTier === HOTEL_TIERS.PREMIUM ? 'all' : HOTEL_TIERS.PREMIUM)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterTier === HOTEL_TIERS.PREMIUM 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <IoStarSharp className="inline w-3 h-3 mr-1" />
                Premium Partners
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 
                  dark:text-gray-300 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recommended">Recommended</option>
                <option value="instant-rides">Best Transport Value</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Guest Rating</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredHotels.length} Properties Available
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredHotels.filter(h => h.tier === HOTEL_TIERS.PREMIUM).length} include instant luxury rides
              </p>
            </div>
            
            {/* Instant Rides Value Alert */}
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 
              rounded-lg border border-green-200 dark:border-green-800">
              <IoSparklesOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Save up to $89 on airport transfers
              </span>
            </div>
          </div>

          {/* Hotel Listings */}
          <div className="space-y-4">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => setSelectedHotel(hotel.id)}
                className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border-2 
                  transition-all hover:shadow-xl cursor-pointer transform hover:-translate-y-1 ${
                  hotel.tier === HOTEL_TIERS.PREMIUM 
                    ? 'border-amber-400' 
                    : 'border-transparent'
                } ${selectedHotel === hotel.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="md:flex">
                  {/* Hotel Image */}
                  <div className="md:w-80 h-48 md:h-auto relative">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Tier Badge */}
                    {hotel.tier === HOTEL_TIERS.PREMIUM && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 
                        rounded-full shadow-lg flex items-center space-x-1">
                        <IoStarSharp className="w-3 h-3 text-white" />
                        <span className="text-xs font-black text-white">PREMIUM PARTNER</span>
                      </div>
                    )}
                    {/* Live viewers */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 backdrop-blur rounded-full">
                      <span className="text-xs text-white">
                        {liveViewers[hotel.id]} viewing now
                      </span>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {hotel.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {hotel.location}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <IoStarSharp
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(hotel.rating) 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300 dark:text-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {hotel.rating}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({hotel.reviews.toLocaleString()} reviews)
                          </span>
                          {hotel.popularityScore && hotel.popularityScore > 90 && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 
                              dark:text-red-400 text-xs font-bold rounded">
                              HIGH DEMAND
                            </span>
                          )}
                        </div>

                        {/* Transport Benefits for Premium Hotels */}
                        {hotel.tier === HOTEL_TIERS.PREMIUM && hotel.transportFeatures && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 
                            dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 
                            dark:border-amber-800">
                            <div className="flex items-center space-x-2 mb-2">
                              <IoCarSportOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                                Instant Ride Benefits (${hotel.instantRideValue} value)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {hotel.transportFeatures.map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-1">
                                  <IoCheckmarkCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                              Booking code unlocks member ride rates
                            </p>
                          </div>
                        )}

                        {/* Warning for Basic Hotels */}
                        {hotel.tier === HOTEL_TIERS.BASIC && (
                          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg 
                            border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center space-x-2">
                              <IoWarningOutline className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                              <span className="text-xs text-amber-700 dark:text-amber-400">
                                No instant ride benefits • Standard shuttle service only
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Room availability */}
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                            <IoBedOutline className="w-4 h-4" />
                            <span>
                              {hotel.availableRooms <= 5 ? (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  Only {hotel.availableRooms} rooms left
                                </span>
                              ) : (
                                `${hotel.availableRooms} rooms available`
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price and Booking */}
                      <div className="text-right ml-4">
                        {hotel.originalPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            ${hotel.originalPrice}
                          </p>
                        )}
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                          ${hotel.price}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">per night</p>
                        
                        {hotel.instantRideValue && hotel.instantRideValue > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400 font-bold mb-2">
                            + ${hotel.instantRideValue} ride value
                          </p>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookHotel(hotel)
                          }}
                          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all transform 
                            hover:scale-[1.02] ${
                            hotel.tier === HOTEL_TIERS.PREMIUM
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {hotel.tier === HOTEL_TIERS.PREMIUM ? 'Book + Free Ride' : 'Book Room'}
                        </button>
                        
                        {hotel.tier === HOTEL_TIERS.PREMIUM && (
                          <p className="text-xs text-gray-500 mt-2">
                            <IoTicketOutline className="inline w-3 h-3 mr-1" />
                            Includes booking code
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && bookingHotel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Your Booking
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{bookingHotel.name}</p>
                <p className="text-xs text-gray-500">{checkIn} to {checkOut}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  ${bookingHotel.price} per night
                </p>
              </div>
              
              {bookingHotel.tier === HOTEL_TIERS.PREMIUM && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 
                  dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-bold text-green-700 dark:text-green-300">
                      Instant Ride Benefits Included
                    </p>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Your booking code will unlock ${bookingHotel.instantRideValue} in ride benefits
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmBooking}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg 
                  font-bold hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-[1.02]"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                  rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer userType="rider" />
    </main>
  )
}