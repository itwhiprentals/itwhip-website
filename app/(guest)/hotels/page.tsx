// app/(guest)/hotels/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BookingCard from '@/app/components/BookingCard'
import HotelDetailsModal from '@/app/components/HotelDetailsModal'
import { 
  IoBusinessOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoStarOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoStarSharp,
  IoCalendarOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoBedOutline,
  IoPersonOutline,
  IoChevronDownOutline,
  IoWifiOutline,
  IoCafeOutline,
  IoCarSportOutline,
  IoTicketOutline
} from 'react-icons/io5'

// Import the date input fixes CSS
import '@/app/styles/date-input-fixes.css'

// Hotel tier system
const HOTEL_TIERS = {
  PREMIUM: 'premium',
  STANDARD: 'standard', 
  BASIC: 'basic',
  UNVERIFIED: 'unverified'
}

// Tier badge configurations
const tierBadges = {
  [HOTEL_TIERS.PREMIUM]: {
    label: 'PREMIUM PARTNER',
    icon: <IoStarSharp className="w-3 h-3" />,
    color: 'bg-gradient-to-r from-amber-400 to-amber-500',
    borderColor: 'border-amber-400',
    textColor: 'text-white',
    description: 'Instant rides available'
  },
  [HOTEL_TIERS.STANDARD]: {
    label: 'VERIFIED',
    icon: <IoCheckmarkCircle className="w-3 h-3" />,
    color: 'bg-gray-600',
    borderColor: 'border-gray-400',
    textColor: 'text-white',
    description: 'Scheduled rides only'
  },
  [HOTEL_TIERS.BASIC]: {
    label: 'BASIC',
    icon: '',
    color: 'bg-gray-400',
    borderColor: 'border-gray-300',
    textColor: 'text-white',
    description: 'Limited availability'
  },
  [HOTEL_TIERS.UNVERIFIED]: {
    label: '',
    icon: '',
    color: '',
    borderColor: '',
    textColor: '',
    description: 'Not integrated'
  }
}

interface RoomType {
  id: string
  name: string
  beds: string
  maxGuests: number
  price: number
  originalPrice?: number
  available: number
  amenities: string[]
  image?: string
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
  amenities: string[]
  tier: string
  instantRideStatus?: 'active' | 'inactive' | 'pending'
  monthlyRevenue?: string
  guestComplaints?: number
  competitorAdvantage?: string
  transportFeatures?: string[]
  roomTypes?: RoomType[]
  instantRideValue?: number
}

export default function HotelsPage() {
  const router = useRouter()
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null)
  const [showPartnerInfo, setShowPartnerInfo] = useState(false)
  const [showPortalHint, setShowPortalHint] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filterTier, setFilterTier] = useState<string>('all')
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedHotelData, setSelectedHotelData] = useState<Hotel | null>(null)
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  const [bookingStep, setBookingStep] = useState<'rooms' | 'payment' | 'confirmed'>('rooms')
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'hotel'>('now')
  const [confirmationCode, setConfirmationCode] = useState('')
  
  // Platform metrics
  const [platformStats, setPlatformStats] = useState({
    totalProperties: 487,
    premiumProperties: 127,
    monthlyBookings: 48293,
    avgGuestSavings: 47,
    instantRidesActive: 89,
    scheduledRidesActive: 234,
    platformUptime: 99.97
  })
  
  // Dynamic viewer counts for each hotel
  const [viewerCounts, setViewerCounts] = useState<{[key: string]: number}>({})

  // Initialize and update viewer counts
  useEffect(() => {
    // Initialize counts
    const initialCounts: {[key: string]: number} = {}
    hotels.forEach(hotel => {
      if (hotel.tier === HOTEL_TIERS.PREMIUM) {
        initialCounts[hotel.id] = Math.floor(Math.random() * 15) + 12 // 12-27 viewers
      } else if (hotel.tier === HOTEL_TIERS.STANDARD) {
        initialCounts[hotel.id] = Math.floor(Math.random() * 10) + 5 // 5-15 viewers
      } else {
        initialCounts[hotel.id] = Math.floor(Math.random() * 8) + 2 // 2-10 viewers
      }
    })
    setViewerCounts(initialCounts)

    // Update counts randomly
    const interval = setInterval(() => {
      setViewerCounts(prev => {
        const updated = {...prev}
        // Randomly update 1-2 hotels
        const hotelIds = Object.keys(updated)
        const numToUpdate = Math.floor(Math.random() * 2) + 1
        
        for (let i = 0; i < numToUpdate; i++) {
          const randomId = hotelIds[Math.floor(Math.random() * hotelIds.length)]
          const hotel = hotels.find(h => h.id === randomId)
          if (hotel) {
            const change = Math.floor(Math.random() * 5) - 2 // -2 to +2
            if (hotel.tier === HOTEL_TIERS.PREMIUM) {
              updated[randomId] = Math.max(8, Math.min(30, updated[randomId] + change))
            } else if (hotel.tier === HOTEL_TIERS.STANDARD) {
              updated[randomId] = Math.max(3, Math.min(18, updated[randomId] + change))
            } else {
              updated[randomId] = Math.max(1, Math.min(12, updated[randomId] + change))
            }
          }
        }
        return updated
      })
    }, Math.floor(Math.random() * 4000) + 3000) // Update every 3-7 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  // Enhanced hotels data with tier system and room types
  const hotels: Hotel[] = [
    {
      id: '1',
      name: 'Four Seasons Resort Scottsdale',
      location: 'Scottsdale, AZ',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      rating: 4.9,
      reviews: 3847,
      price: 495,
      originalPrice: 550,
      amenities: ['Spa', 'Golf', 'Fine Dining', 'Concierge'],
      tier: HOTEL_TIERS.PREMIUM,
      instantRideStatus: 'active',
      monthlyRevenue: '$67,433',
      transportFeatures: ['Instant Tesla Fleet', 'VIP Airport Service', 'No Surge Guarantee', 'Flight Tracking'],
      instantRideValue: 89,
      roomTypes: [
        {
          id: 'fs-1',
          name: 'Desert Casita King',
          beds: '1 King Bed',
          maxGuests: 2,
          price: 495,
          originalPrice: 550,
          available: 3,
          amenities: ['Desert View', 'Private Patio', 'Soaking Tub']
        },
        {
          id: 'fs-2',
          name: 'Desert Casita Double',
          beds: '2 Queen Beds',
          maxGuests: 4,
          price: 545,
          originalPrice: 600,
          available: 5,
          amenities: ['Desert View', 'Private Patio', 'Family Space']
        },
        {
          id: 'fs-3',
          name: 'One-Bedroom Suite',
          beds: '1 King Bed + Sofa',
          maxGuests: 3,
          price: 795,
          originalPrice: 850,
          available: 1,
          amenities: ['Living Room', 'Mountain View', 'Premium Amenities']
        }
      ]
    },
    {
      id: '2',
      name: 'The Phoenician',
      location: 'Scottsdale, AZ',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
      rating: 4.9,
      reviews: 3462,
      price: 425,
      originalPrice: 475,
      amenities: ['Spa', 'Golf', 'Tennis', 'Pool'],
      tier: HOTEL_TIERS.PREMIUM,
      instantRideStatus: 'active',
      monthlyRevenue: '$54,892',
      transportFeatures: ['Premium Fleet', 'Express Pickup', 'Corporate Tracking'],
      instantRideValue: 78,
      roomTypes: [
        {
          id: 'ph-1',
          name: 'Classic Room King',
          beds: '1 King Bed',
          maxGuests: 2,
          price: 425,
          originalPrice: 475,
          available: 8,
          amenities: ['Valley View', 'Marble Bath', 'Work Desk']
        },
        {
          id: 'ph-2',
          name: 'Premier Room',
          beds: '2 Double Beds',
          maxGuests: 4,
          price: 475,
          originalPrice: 525,
          available: 4,
          amenities: ['Pool View', 'Balcony', 'Sitting Area']
        }
      ]
    },
    {
      id: '3',
      name: 'Omni Scottsdale Resort',
      location: 'Scottsdale, AZ',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      rating: 4.8,
      reviews: 2847,
      price: 289,
      amenities: ['Spa', 'Pool', 'Golf', 'Dining'],
      tier: HOTEL_TIERS.BASIC,
      instantRideStatus: 'inactive',
      guestComplaints: 234,
      competitorAdvantage: 'Competitors offer instant rides',
      instantRideValue: 0,
      roomTypes: [
        {
          id: 'om-1',
          name: 'Standard King',
          beds: '1 King Bed',
          maxGuests: 2,
          price: 289,
          available: 12,
          amenities: ['Garden View', 'Coffee Maker']
        },
        {
          id: 'om-2',
          name: 'Standard Double',
          beds: '2 Double Beds',
          maxGuests: 4,
          price: 309,
          available: 8,
          amenities: ['Garden View', 'Mini Fridge']
        }
      ]
    },
    {
      id: '4',
      name: 'W Scottsdale',
      location: 'Scottsdale, AZ',
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop',
      rating: 4.7,
      reviews: 2156,
      price: 335,
      amenities: ['Pool', 'Nightlife', 'Spa', 'Dining'],
      tier: HOTEL_TIERS.STANDARD,
      instantRideStatus: 'pending',
      transportFeatures: ['Scheduled Rides Only', 'Standard Vehicles'],
      instantRideValue: 29,
      roomTypes: [
        {
          id: 'w-1',
          name: 'Wonderful Room',
          beds: '1 King Bed',
          maxGuests: 2,
          price: 335,
          available: 6,
          amenities: ['City View', 'Rain Shower', 'W Signature Bed']
        }
      ]
    },
    {
      id: '5',
      name: 'Fairmont Scottsdale Princess',
      location: 'Scottsdale, AZ',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      rating: 4.8,
      reviews: 4821,
      price: 379,
      originalPrice: 420,
      amenities: ['Golf', 'Spa', 'Pool', 'Tennis'],
      tier: HOTEL_TIERS.PREMIUM,
      instantRideStatus: 'active',
      monthlyRevenue: '$48,920',
      transportFeatures: ['Luxury Fleet', 'Priority Service', 'Member Benefits'],
      instantRideValue: 65,
      roomTypes: [
        {
          id: 'fm-1',
          name: 'Fairmont Room',
          beds: '1 King or 2 Queens',
          maxGuests: 4,
          price: 379,
          originalPrice: 420,
          available: 10,
          amenities: ['Resort View', 'Private Balcony']
        },
        {
          id: 'fm-2',
          name: 'Deluxe Suite',
          beds: '1 King + Sofa Bed',
          maxGuests: 4,
          price: 579,
          originalPrice: 620,
          available: 2,
          amenities: ['Separate Living Area', 'Mountain Views', 'Club Access']
        }
      ]
    },
    {
      id: '6',
      name: 'The Boulders Resort',
      location: 'Carefree, AZ',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      rating: 4.7,
      reviews: 1654,
      price: 410,
      amenities: ['Golf', 'Spa', 'Hiking', 'Dining'],
      tier: HOTEL_TIERS.UNVERIFIED,
      instantRideStatus: 'inactive',
      instantRideValue: 0,
      roomTypes: [
        {
          id: 'bo-1',
          name: 'Casita Room',
          beds: '1 King Bed',
          maxGuests: 2,
          price: 410,
          available: 4,
          amenities: ['Desert Views', 'Fireplace', 'Private Patio']
        }
      ]
    }
  ]

  // Handle hotel card click
  const handleHotelClick = (hotel: Hotel) => {
    setSelectedHotel(hotel.id)
    setBookingHotel(hotel)
    setShowBookingModal(true)
    setBookingStep('rooms')
    setSelectedRoom(null)
  }

  // Handle room selection
  const handleRoomSelect = (room: RoomType) => {
    setSelectedRoom(room)
  }

  // Handle continue to payment
  const handleContinueToPayment = () => {
    if (selectedRoom) {
      setBookingStep('payment')
    }
  }

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!bookingHotel || !selectedRoom) return
    
    // Generate confirmation code based on hotel tier
    const tierCode = bookingHotel.tier === HOTEL_TIERS.PREMIUM ? 'P' : 
                    bookingHotel.tier === HOTEL_TIERS.STANDARD ? 'S' : 'B'
    const code = `PHX${tierCode}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    setConfirmationCode(code)
    
    // Store in localStorage for RiderView to access
    localStorage.setItem('memberBookingCode', code)
    localStorage.setItem('hotelBookingDetails', JSON.stringify({
      hotelName: bookingHotel.name,
      roomType: selectedRoom.name,
      instantRideValue: bookingHotel.instantRideValue || 0,
      tier: bookingHotel.tier
    }))
    
    setBookingStep('confirmed')
  }

  // Reset modal
  const closeModal = () => {
    setShowBookingModal(false)
    setBookingHotel(null)
    setSelectedRoom(null)
    setBookingStep('rooms')
    setPaymentMethod('now')
    setConfirmationCode('')
  }

  // Live booking stats
  const [liveStats, setLiveStats] = useState({
    bookingsToday: 847,
    instantRidesBooked: 423,
    guestsSaved: 24567,
    activeNow: 47
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        bookingsToday: prev.bookingsToday + Math.floor(Math.random() * 5) + 1,
        instantRidesBooked: prev.instantRidesBooked + Math.floor(Math.random() * 3),
        guestsSaved: prev.guestsSaved + Math.floor(Math.random() * 150) + 50,
        activeNow: Math.max(35, Math.min(65, prev.activeNow + Math.floor(Math.random() * 7) - 3))
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredHotels = filterTier === 'all' 
    ? hotels 
    : hotels.filter(h => h.tier === filterTier)

  return (
    <>
      {/* Hero Section with Clear Video Background */}
      <section className="relative min-h-[40vh] md:min-h-[50vh] overflow-hidden">
        {/* Video Background Layer - Full clarity */}
        <div className="absolute inset-0 w-full h-full">
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
            poster="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&h=1080&fit=crop"
          >
            <source src="/hotel-hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 md:pb-8">
          {/* Title and subtitle moved up with tighter spacing */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1 tracking-tight drop-shadow-2xl">
              Book Phoenix Hotels with Instant Rides
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl mx-auto drop-shadow-lg px-4">
              Premium properties with integrated luxury transportation
            </p>
          </div>
          
          {/* BookingCard Component - Mobile Optimized */}
          <BookingCard showPortalHint={showPortalHint} setShowPortalHint={setShowPortalHint} />

          {/* Platform Authority Bar */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 mt-4 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-medium whitespace-nowrap">{liveStats.bookingsToday.toLocaleString()} bookings today</span>
            </div>
            <div className="flex items-center space-x-1">
              <IoRocketOutline className="w-3 h-3 text-amber-500" />
              <span className="font-medium whitespace-nowrap">{platformStats.premiumProperties} premium partners</span>
            </div>
            <div className="flex items-center space-x-1">
              <IoTrendingUpOutline className="w-3 h-3 text-green-500" />
              <span className="font-medium whitespace-nowrap">${liveStats.guestsSaved.toLocaleString()} saved by members</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Filter Section */}
      <section className="py-3 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter by tier:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTier('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterTier === 'all' 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Properties
                </button>
                <button
                  onClick={() => setFilterTier(HOTEL_TIERS.PREMIUM)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterTier === HOTEL_TIERS.PREMIUM 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <IoStarSharp className="w-3 h-3" />
                  <span>Premium Only</span>
                </button>
                <button
                  onClick={() => setFilterTier(HOTEL_TIERS.STANDARD)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterTier === HOTEL_TIERS.STANDARD 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Verified
                </button>
              </div>
            </div>
            
            {/* Portal Hint */}
            {showPortalHint && (
              <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span>Hotels manage their tier status through our partner portal</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hotel Listings with Tier System - Reduced spacing */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {filterTier === 'all' ? 'All Properties' : 
                 filterTier === HOTEL_TIERS.PREMIUM ? 'Premium Partners' :
                 filterTier === HOTEL_TIERS.STANDARD ? 'Verified Properties' : 'Properties'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {platformStats.totalProperties} properties • {platformStats.premiumProperties} with instant rides
              </p>
            </div>
            
            <button 
              onClick={() => setShowPartnerInfo(!showPartnerInfo)}
              className="text-sm text-amber-600 hover:text-amber-700 font-bold transition-colors"
            >
              Why these tiers?
              <IoArrowForwardOutline className="inline ml-1 w-4 h-4" />
            </button>
          </div>

          {/* Tier Explanation Banner - Updated with portal discovery hint */}
          {showPartnerInfo && (
            <div className="mb-4 md:mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <IoStarSharp className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Premium Partners</h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Instant luxury rides, no surge pricing, VIP fleet access, flight tracking, priority support
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-gray-600" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Verified</h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Scheduled rides available, standard vehicles, advance booking required
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <IoWarningOutline className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Basic / Unverified</h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Limited or no transportation benefits. Properties can integrate via our SDK.
                  </p>
                </div>
              </div>
              {/* Very subtle portal hint */}
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                  Property managers can verify status using GDS/Amadeus codes • SDK documentation available
                </p>
              </div>
            </div>
          )}

          {/* Hotel Grid with tighter spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredHotels.map((hotel) => (
              <div 
                key={hotel.id}
                onClick={() => handleHotelClick(hotel)}
                className={`bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl 
                  transition-all duration-300 cursor-pointer border-2 transform hover:-translate-y-1 ${
                  selectedHotel === hotel.id ? 'border-amber-500 shadow-xl' : 'border-transparent'
                } ${hotel.tier === HOTEL_TIERS.PREMIUM ? 'ring-1 ring-amber-400' : ''}`}
              >
                {/* Hotel Image with fixed text visibility */}
                <div className="relative h-36 md:h-44 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img 
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Stronger gradient for text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Tier Badge */}
                  {hotel.tier !== HOTEL_TIERS.UNVERIFIED && (
                    <div className={`absolute top-2 left-2 px-2 py-1 ${tierBadges[hotel.tier].color} 
                      rounded-full shadow-lg flex items-center space-x-1`}>
                      {tierBadges[hotel.tier].icon}
                      <span className={`text-[10px] font-black ${tierBadges[hotel.tier].textColor}`}>
                        {tierBadges[hotel.tier].label}
                      </span>
                    </div>
                  )}
                  
                  {/* Transport Status Badge */}
                  {hotel.tier === HOTEL_TIERS.PREMIUM && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-[10px] 
                      font-black rounded-full shadow-lg flex items-center space-x-1">
                      <IoSparklesOutline className="w-3 h-3" />
                      <span>Instant Rides</span>
                    </div>
                  )}
                  
                  {hotel.tier === HOTEL_TIERS.BASIC && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gray-600 text-white text-[10px] 
                      font-medium rounded-full shadow-lg opacity-90">
                      Limited Service
                    </div>
                  )}
                  
                  {/* Hotel name with white text and stronger shadow for visibility */}
                  <div className="absolute bottom-2 md:bottom-3 left-3 md:left-3">
                    <h3 className="text-base md:text-lg font-black text-white drop-shadow-lg leading-tight">
                      {hotel.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-200 mt-0.5 drop-shadow">
                      {hotel.location}
                    </p>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      {/* Star Rating */}
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <IoStarSharp 
                            key={i}
                            className={`w-3 h-3 md:w-3.5 md:h-3.5 ${
                              i < Math.floor(hotel.rating) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300 dark:text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs md:text-sm font-black text-gray-900 dark:text-white ml-1">
                        {hotel.rating}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-500">
                        ({hotel.reviews.toLocaleString()})
                      </span>
                    </div>
                    <div className="text-right">
                      {hotel.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          ${hotel.originalPrice}
                        </p>
                      )}
                      <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white">
                        ${hotel.price}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500">per night</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {hotel.amenities.slice(0, 3).map((amenity) => (
                      <span 
                        key={amenity}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] md:text-xs text-gray-600 
                          dark:text-gray-400 rounded font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Transport Features for Premium - with Ghost Billing hint */}
                  {hotel.tier === HOTEL_TIERS.PREMIUM && hotel.transportFeatures && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] md:text-xs font-black text-green-600 dark:text-green-400">
                          Transportation Benefits:
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {hotel.transportFeatures.slice(0, 2).map((feature) => (
                          <div key={feature} className="flex items-center space-x-1">
                            <IoCheckmarkCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                      {/* Subtle ghost billing feature mention */}
                      <p className="text-[9px] text-gray-400 mt-1">Discrete corporate billing available</p>
                    </div>
                  )}

                  {/* Warning for Basic Hotels */}
                  {hotel.tier === HOTEL_TIERS.BASIC && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                        <IoWarningOutline className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="text-[10px] md:text-xs">
                          {hotel.guestComplaints 
                            ? `${hotel.guestComplaints} guests requested instant rides` 
                            : 'Limited transportation options'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dynamic viewer count for urgency - looks like real booking platform */}
                  {viewerCounts[hotel.id] && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-gray-500">
                          {viewerCounts[hotel.id]} {viewerCounts[hotel.id] === 1 ? 'person' : 'people'} viewed in the last hour
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The booking modal code continues here but truncated for length */}
    </>
  )
}