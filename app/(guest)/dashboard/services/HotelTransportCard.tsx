// app/(guest)/dashboard/services/HotelTransportCard.tsx
// Hotel Transport Card Component - Airport transfers, tours, and scheduled transportation
// Generates commission revenue for hotels on all transport bookings

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCarOutline,
  IoAirplaneOutline,
  IoMapOutline,
  IoBusOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoAddOutline,
  IoRemoveOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCashOutline,
  IoBedOutline,
  IoInformationCircleOutline,
  IoStarOutline,
  IoTrendingUp,
  IoShieldCheckmarkOutline,
  IoTicketOutline,
  IoSwapHorizontalOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoWalletOutline,
  IoGlobeOutline,
  IoCameraOutline,
  IoRestaurantOutline,
  IoWineOutline,
  IoBoatOutline,
  IoBicycleOutline,
  IoWalkOutline,
  IoTrainOutline,
  IoSparklesOutline,
  IoTrophyOutline,
  IoFlashOutline,
  IoRocketOutline,
  IoPricetagOutline
} from 'react-icons/io5'

// Types
interface HotelTransportCardProps {
  hotelId?: string
  hotelName?: string
  roomNumber?: string
  onBookingComplete?: (booking: TransportBooking) => void
  showRoomCharge?: boolean
  showCommission?: boolean
}

interface TransportService {
  id: string
  type: 'airport' | 'tour' | 'shuttle' | 'private'
  name: string
  description: string
  icon: any
  duration: string
  price: number
  originalPrice?: number
  commission: number // percentage for hotel
  rating: number
  reviews: number
  capacity: number
  features: string[]
  popular: boolean
  premium: boolean
  availability: 'immediate' | 'scheduled' | 'request'
  vehicleType?: string
  guide?: boolean
  meals?: boolean
  pickup?: string
  dropoff?: string
  departureTimes?: string[]
  images?: string[]
  cancellation: string
}

interface TransportBooking {
  id: string
  serviceId: string
  service: TransportService
  date: string
  time: string
  passengers: number
  pickupLocation: string
  dropoffLocation?: string
  specialRequests?: string
  totalPrice: number
  hotelCommission: number
  paymentMethod: 'roomCharge' | 'card'
  status: 'pending' | 'confirmed' | 'completed'
}

interface ServiceCategory {
  id: string
  name: string
  icon: any
  description: string
  commissionRate: number
  color: string
}

export default function HotelTransportCard({
  hotelId = 'grand-hotel',
  hotelName = 'Grand Hotel Phoenix',
  roomNumber = '412',
  onBookingComplete,
  showRoomCharge = true,
  showCommission = true
}: HotelTransportCardProps) {
  // State management
  const [services, setServices] = useState<TransportService[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<TransportService | null>(null)
  const [bookingStage, setBookingStage] = useState<'browse' | 'details' | 'booking' | 'payment' | 'confirmed'>('browse')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  
  // Booking details
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [selectedTour, setSelectedTour] = useState<string>('')
  
  // Categories
  const categories: ServiceCategory[] = [
    {
      id: 'airport',
      name: 'Airport Transfers',
      icon: IoAirplaneOutline,
      description: 'To/from Phoenix Sky Harbor',
      commissionRate: 15,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'tour',
      name: 'Tours & Experiences',
      icon: IoCameraOutline,
      description: 'Explore Phoenix attractions',
      commissionRate: 20,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'shuttle',
      name: 'Hotel Shuttles',
      icon: IoBusOutline,
      description: 'Scheduled local transport',
      commissionRate: 10,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'private',
      name: 'Private Cars',
      icon: IoCarOutline,
      description: 'Luxury vehicle service',
      commissionRate: 25,
      color: 'from-orange-500 to-red-500'
    }
  ]

  // Load services
  useEffect(() => {
    loadTransportServices()
  }, [hotelId])

  // Set minimum booking date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setBookingDate(today)
  }, [])

  // Load transport services
  const loadTransportServices = async () => {
    setIsLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockServices: TransportService[] = [
        // Airport Transfers
        {
          id: 'airport-1',
          type: 'airport',
          name: 'Airport Express - Shared',
          description: 'Comfortable shared shuttle to Phoenix Sky Harbor Airport',
          icon: IoBusOutline,
          duration: '30-45 min',
          price: 25,
          originalPrice: 35,
          commission: 15,
          rating: 4.5,
          reviews: 324,
          capacity: 8,
          features: ['WiFi', 'AC', 'Luggage space', 'Multiple stops'],
          popular: true,
          premium: false,
          availability: 'scheduled',
          vehicleType: 'Shuttle Van',
          pickup: hotelName,
          dropoff: 'PHX Airport - All Terminals',
          departureTimes: ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'],
          cancellation: 'Free cancellation up to 24 hours'
        },
        {
          id: 'airport-2',
          type: 'airport',
          name: 'Airport Direct - Private',
          description: 'Private sedan service direct to Phoenix Sky Harbor',
          icon: IoCarOutline,
          duration: '25 min',
          price: 65,
          originalPrice: 85,
          commission: 15,
          rating: 4.8,
          reviews: 189,
          capacity: 3,
          features: ['Private ride', 'WiFi', 'Water bottles', 'Direct route', 'Meet & greet'],
          popular: true,
          premium: true,
          availability: 'immediate',
          vehicleType: 'Premium Sedan',
          pickup: hotelName,
          dropoff: 'PHX Airport - Terminal of choice',
          cancellation: 'Free cancellation up to 2 hours'
        },
        {
          id: 'airport-3',
          type: 'airport',
          name: 'Airport Luxury - SUV',
          description: 'Luxury SUV with professional chauffeur',
          icon: IoCarOutline,
          duration: '25 min',
          price: 95,
          originalPrice: 125,
          commission: 15,
          rating: 4.9,
          reviews: 92,
          capacity: 6,
          features: ['Luxury SUV', 'Chauffeur', 'Refreshments', 'WiFi', 'Flight tracking'],
          popular: false,
          premium: true,
          availability: 'request',
          vehicleType: 'Luxury SUV',
          pickup: hotelName,
          dropoff: 'PHX Airport - VIP Service',
          cancellation: 'Free cancellation up to 4 hours'
        },

        // Tours
        {
          id: 'tour-1',
          type: 'tour',
          name: 'Grand Canyon Day Tour',
          description: 'Full day tour to Grand Canyon South Rim with lunch',
          icon: IoCameraOutline,
          duration: '13 hours',
          price: 149,
          originalPrice: 189,
          commission: 20,
          rating: 4.9,
          reviews: 567,
          capacity: 15,
          features: ['Professional guide', 'Lunch included', 'Park fees', 'Hotel pickup', 'Photo stops'],
          popular: true,
          premium: false,
          availability: 'scheduled',
          vehicleType: 'Tour Bus',
          guide: true,
          meals: true,
          pickup: hotelName,
          dropoff: hotelName,
          departureTimes: ['6:30 AM'],
          cancellation: 'Free cancellation up to 48 hours'
        },
        {
          id: 'tour-2',
          type: 'tour',
          name: 'Sedona Red Rocks Tour',
          description: 'Half day tour to Sedona\'s famous red rock formations',
          icon: IoMapOutline,
          duration: '6 hours',
          price: 89,
          originalPrice: 110,
          commission: 20,
          rating: 4.7,
          reviews: 423,
          capacity: 12,
          features: ['Guide', 'Water', 'Snacks', 'Hotel pickup', 'Instagram spots'],
          popular: true,
          premium: false,
          availability: 'scheduled',
          vehicleType: 'Mini Coach',
          guide: true,
          meals: false,
          pickup: hotelName,
          dropoff: hotelName,
          departureTimes: ['8:00 AM', '1:00 PM'],
          cancellation: 'Free cancellation up to 24 hours'
        },
        {
          id: 'tour-3',
          type: 'tour',
          name: 'Phoenix Food & Wine Tour',
          description: 'Evening tour of Phoenix\'s best restaurants and wine bars',
          icon: IoWineOutline,
          duration: '4 hours',
          price: 125,
          originalPrice: 150,
          commission: 20,
          rating: 4.8,
          reviews: 234,
          capacity: 8,
          features: ['4 venues', '8 tastings', 'Wine pairings', 'Local guide', 'Walking tour'],
          popular: false,
          premium: true,
          availability: 'scheduled',
          vehicleType: 'Walking + Transport',
          guide: true,
          meals: true,
          pickup: hotelName,
          dropoff: hotelName,
          departureTimes: ['5:30 PM'],
          cancellation: 'Free cancellation up to 24 hours'
        },
        {
          id: 'tour-4',
          type: 'tour',
          name: 'Desert Sunset Jeep Tour',
          description: 'Off-road adventure in the Sonoran Desert at sunset',
          icon: IoCarOutline,
          duration: '3 hours',
          price: 75,
          commission: 20,
          rating: 4.9,
          reviews: 189,
          capacity: 4,
          features: ['4x4 Jeep', 'Expert guide', 'Sunset views', 'Wildlife spotting', 'Water'],
          popular: true,
          premium: false,
          availability: 'scheduled',
          vehicleType: 'Jeep Wrangler',
          guide: true,
          meals: false,
          pickup: hotelName,
          dropoff: hotelName,
          departureTimes: ['4:30 PM', '5:00 PM', '5:30 PM'],
          cancellation: 'Free cancellation up to 12 hours'
        },

        // Shuttles
        {
          id: 'shuttle-1',
          type: 'shuttle',
          name: 'Downtown Phoenix Shuttle',
          description: 'Regular shuttle service to downtown Phoenix',
          icon: IoBusOutline,
          duration: '20 min',
          price: 12,
          commission: 10,
          rating: 4.3,
          reviews: 156,
          capacity: 20,
          features: ['Every 30 min', 'AC', 'Multiple stops', 'Return ticket available'],
          popular: false,
          premium: false,
          availability: 'scheduled',
          vehicleType: 'Shuttle Bus',
          pickup: hotelName,
          dropoff: 'Downtown Phoenix (5 stops)',
          departureTimes: ['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
          cancellation: 'No cancellation needed'
        },
        {
          id: 'shuttle-2',
          type: 'shuttle',
          name: 'Shopping Mall Express',
          description: 'Direct shuttle to Scottsdale Fashion Square',
          icon: IoBusOutline,
          duration: '15 min',
          price: 8,
          commission: 10,
          rating: 4.4,
          reviews: 234,
          capacity: 25,
          features: ['Hourly service', 'Shopping bags space', 'AC', 'Return service'],
          popular: true,
          premium: false,
          availability: 'scheduled',
          vehicleType: 'Shuttle Van',
          pickup: hotelName,
          dropoff: 'Scottsdale Fashion Square',
          departureTimes: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'],
          cancellation: 'No reservation required'
        },
        {
          id: 'shuttle-3',
          type: 'shuttle',
          name: 'Golf Course Shuttle',
          description: 'Morning shuttle to TPC Scottsdale',
          icon: IoBusOutline,
          duration: '25 min',
          price: 15,
          commission: 10,
          rating: 4.6,
          reviews: 89,
          capacity: 12,
          features: ['Golf bag storage', 'Morning service', 'Return pickup', 'Water'],
          popular: false,
          premium: false,
          availability: 'scheduled',
          vehicleType: 'Shuttle Van',
          pickup: hotelName,
          dropoff: 'TPC Scottsdale',
          departureTimes: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM'],
          cancellation: 'Free cancellation up to 12 hours'
        },

        // Private Cars
        {
          id: 'private-1',
          type: 'private',
          name: 'Hourly Chauffeur Service',
          description: 'Private car with driver for flexible city travel',
          icon: IoCarOutline,
          duration: 'Minimum 2 hours',
          price: 85,
          originalPrice: 110,
          commission: 25,
          rating: 4.9,
          reviews: 145,
          capacity: 3,
          features: ['Professional driver', 'Luxury sedan', 'Flexible itinerary', 'Water', 'WiFi'],
          popular: true,
          premium: true,
          availability: 'immediate',
          vehicleType: 'Mercedes S-Class',
          pickup: hotelName,
          cancellation: 'Free cancellation up to 4 hours'
        },
        {
          id: 'private-2',
          type: 'private',
          name: 'Night Out Service',
          description: 'Safe luxury transport for dinner and entertainment',
          icon: IoSparklesOutline,
          duration: '4 hours',
          price: 250,
          originalPrice: 320,
          commission: 25,
          rating: 4.8,
          reviews: 78,
          capacity: 6,
          features: ['Luxury SUV', 'Champagne', 'Multiple stops', 'Wait time included', 'Chauffeur'],
          popular: false,
          premium: true,
          availability: 'request',
          vehicleType: 'Cadillac Escalade',
          pickup: hotelName,
          cancellation: 'Free cancellation up to 6 hours'
        },
        {
          id: 'private-3',
          type: 'private',
          name: 'Business Meeting Transport',
          description: 'Executive car service for business professionals',
          icon: IoCarOutline,
          duration: 'Half day (4 hours)',
          price: 320,
          commission: 25,
          rating: 5.0,
          reviews: 56,
          capacity: 3,
          features: ['Executive sedan', 'Professional driver', 'Privacy glass', 'WiFi', 'Charging ports'],
          popular: false,
          premium: true,
          availability: 'request',
          vehicleType: 'BMW 7 Series',
          pickup: hotelName,
          cancellation: 'Free cancellation up to 12 hours'
        }
      ]

      setServices(mockServices)
    } catch (error) {
      console.error('Failed to load transport services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter services
  const getFilteredServices = () => {
    let filtered = [...services]
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.type === selectedCategory)
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    return filtered
  }

  // Toggle service expansion
  const toggleServiceExpansion = (serviceId: string) => {
    const newExpanded = new Set(expandedServices)
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId)
    } else {
      newExpanded.add(serviceId)
    }
    setExpandedServices(newExpanded)
  }

  // Calculate total price with commission
  const calculateTotal = (service: TransportService) => {
    const basePrice = service.price * passengerCount
    const hotelCommission = (basePrice * service.commission) / 100
    return { basePrice, hotelCommission, total: basePrice }
  }

  // Book service
  const bookService = async () => {
    if (!selectedService) return
    
    setIsLoading(true)
    try {
      const { basePrice, hotelCommission } = calculateTotal(selectedService)
      
      const booking: TransportBooking = {
        id: Date.now().toString(),
        serviceId: selectedService.id,
        service: selectedService,
        date: bookingDate,
        time: bookingTime,
        passengers: passengerCount,
        pickupLocation: pickupLocation || selectedService.pickup || hotelName,
        dropoffLocation: dropoffLocation || selectedService.dropoff,
        specialRequests,
        totalPrice: basePrice,
        hotelCommission,
        paymentMethod: 'roomCharge',
        status: 'confirmed'
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBookingStage('confirmed')
      
      if (onBookingComplete) {
        onBookingComplete(booking)
      }
      
      // Reset after confirmation
      setTimeout(() => {
        setBookingStage('browse')
        setSelectedService(null)
        setPassengerCount(1)
        setSpecialRequests('')
      }, 5000)
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format price with commission
  const formatPriceWithCommission = (service: TransportService) => {
    const commission = (service.price * service.commission) / 100
    return { price: service.price, commission }
  }

  // Confirmation view
  if (bookingStage === 'confirmed') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600 mb-6">
            Your transport has been booked successfully
          </p>
          
          {selectedService && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-3">{selectedService.name}</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">{bookingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-medium text-gray-900">{passengerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup</span>
                  <span className="font-medium text-gray-900">{pickupLocation || selectedService.pickup}</span>
                </div>
                {selectedService.dropoff && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dropoff</span>
                    <span className="font-medium text-gray-900">{dropoffLocation || selectedService.dropoff}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total Charged</span>
                  <span className="text-lg font-bold text-green-600">
                    ${calculateTotal(selectedService).total.toFixed(2)}
                  </span>
                </div>
                {showRoomCharge && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <div className="flex items-center text-blue-700 text-sm">
                      <IoBedOutline className="w-4 h-4 mr-2" />
                      <span>Charged to Room {roomNumber}</span>
                    </div>
                  </div>
                )}
                {showCommission && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <div className="flex items-center text-green-700 text-sm">
                      <IoCashOutline className="w-4 h-4 mr-2" />
                      <span>Hotel earns ${calculateTotal(selectedService).hotelCommission.toFixed(2)} commission</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              setBookingStage('browse')
              setSelectedService(null)
            }}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
          >
            Book Another Service
          </button>
        </div>
      </div>
    )
  }

  // Payment view
  if (bookingStage === 'payment' && selectedService) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Confirm & Pay</h3>
          <button
            onClick={() => setBookingStage('booking')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <selectedService.icon className="w-6 h-6 text-gray-600 mt-1" />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">{selectedService.name}</h5>
                <p className="text-sm text-gray-600">{selectedService.description}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium text-gray-900">{bookingDate} at {bookingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium text-gray-900">{selectedService.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passengers</span>
                <span className="font-medium text-gray-900">{passengerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium text-gray-900">{selectedService.vehicleType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {specialRequests && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {specialRequests}
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Price Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {selectedService.name} × {passengerCount} passenger{passengerCount > 1 ? 's' : ''}
              </span>
              <span className="font-medium text-gray-900">
                ${(selectedService.price * passengerCount).toFixed(2)}
              </span>
            </div>
            {selectedService.originalPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">
                  -${((selectedService.originalPrice - selectedService.price) * passengerCount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  ${calculateTotal(selectedService).total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Display */}
        {showCommission && (
          <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IoTrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">
                  Hotel Commission ({selectedService.commission}%)
                </span>
              </div>
              <span className="text-lg font-bold text-green-600">
                +${calculateTotal(selectedService).hotelCommission.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              {hotelName} earns this commission on your booking
            </p>
          </div>
        )}

        {/* Room Charge Notice */}
        {showRoomCharge && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-700">
              <IoBedOutline className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                This will be charged to Room {roomNumber}
              </span>
            </div>
          </div>
        )}

        {/* Cancellation Policy */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <IoInformationCircleOutline className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700">Cancellation Policy</p>
              <p>{selectedService.cancellation}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBookingStage('booking')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={bookService}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    )
  }

  // Booking view
  if (bookingStage === 'booking' && selectedService) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Book {selectedService.name}</h3>
          <button
            onClick={() => {
              setBookingStage('details')
              setPassengerCount(1)
              setSpecialRequests('')
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Service Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <selectedService.icon className="w-6 h-6 text-gray-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">{selectedService.name}</h4>
              <p className="text-sm text-gray-600">{selectedService.description}</p>
              <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <IoTimeOutline className="w-4 h-4 mr-1" />
                  {selectedService.duration}
                </span>
                <span className="flex items-center">
                  <IoPeopleOutline className="w-4 h-4 mr-1" />
                  Up to {selectedService.capacity}
                </span>
                {selectedService.vehicleType && (
                  <span className="flex items-center">
                    <IoCarOutline className="w-4 h-4 mr-1" />
                    {selectedService.vehicleType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Select Date & Time</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time</label>
              {selectedService.departureTimes ? (
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  {selectedService.departureTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        </div>

        {/* Passenger Count */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Number of Passengers</h4>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
            >
              <IoRemoveOutline className="w-5 h-5" />
            </button>
            <span className="text-xl font-semibold text-gray-900 w-12 text-center">
              {passengerCount}
            </span>
            <button
              onClick={() => setPassengerCount(Math.min(selectedService.capacity, passengerCount + 1))}
              disabled={passengerCount >= selectedService.capacity}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors disabled:opacity-50"
            >
              <IoAddOutline className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">
              (Max: {selectedService.capacity})
            </span>
          </div>
        </div>

        {/* Pickup/Dropoff Locations */}
        {selectedService.type === 'private' && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Locations</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder={selectedService.pickup || 'Enter pickup location'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {selectedService.type === 'private' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Dropoff Location (Optional)</label>
                  <input
                    type="text"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="Enter dropoff location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flight Number for Airport Transfers */}
        {selectedService.type === 'airport' && (
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Flight Number (Optional)</label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="e.g., AA1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll track your flight for delays
            </p>
          </div>
        )}

        {/* Special Requests */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requirements or requests?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Price Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {passengerCount} passenger{passengerCount > 1 ? 's' : ''} × ${selectedService.price}
              </p>
              {selectedService.originalPrice && (
                <p className="text-xs text-green-600">
                  Save ${((selectedService.originalPrice - selectedService.price) * passengerCount).toFixed(2)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${calculateTotal(selectedService).total.toFixed(2)}
              </p>
              {showCommission && (
                <p className="text-xs text-green-600">
                  +${calculateTotal(selectedService).hotelCommission.toFixed(2)} hotel commission
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBookingStage('details')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setBookingStage('payment')}
            disabled={!bookingDate || !bookingTime}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    )
  }

  // Details view
  if (bookingStage === 'details' && selectedService) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
          <button
            onClick={() => {
              setBookingStage('browse')
              setSelectedService(null)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Service Header */}
        <div className="mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <selectedService.icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900">{selectedService.name}</h4>
              <p className="text-gray-600 mt-1">{selectedService.description}</p>
              
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center">
                  <IoStarOutline className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="ml-1 font-medium text-gray-900">{selectedService.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">({selectedService.reviews} reviews)</span>
                </div>
                {selectedService.popular && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    Popular Choice
                  </span>
                )}
                {selectedService.premium && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-600 mb-1">
              <IoTimeOutline className="w-4 h-4 mr-2" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="font-semibold text-gray-900">{selectedService.duration}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-600 mb-1">
              <IoPeopleOutline className="w-4 h-4 mr-2" />
              <span className="text-sm">Capacity</span>
            </div>
            <p className="font-semibold text-gray-900">Up to {selectedService.capacity} passengers</p>
          </div>
          
          {selectedService.vehicleType && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center text-gray-600 mb-1">
                <IoCarOutline className="w-4 h-4 mr-2" />
                <span className="text-sm">Vehicle</span>
              </div>
              <p className="font-semibold text-gray-900">{selectedService.vehicleType}</p>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-600 mb-1">
              <IoShieldCheckmarkOutline className="w-4 h-4 mr-2" />
              <span className="text-sm">Availability</span>
            </div>
            <p className="font-semibold text-gray-900 capitalize">{selectedService.availability}</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h5 className="font-medium text-gray-900 mb-3">What's Included</h5>
          <div className="grid grid-cols-2 gap-2">
            {selectedService.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route Information */}
        {(selectedService.pickup || selectedService.dropoff) && (
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3">Route Information</h5>
            <div className="space-y-2">
              {selectedService.pickup && (
                <div className="flex items-start">
                  <IoLocationOutline className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pickup</p>
                    <p className="text-sm text-gray-600">{selectedService.pickup}</p>
                  </div>
                </div>
              )}
              {selectedService.dropoff && (
                <div className="flex items-start">
                  <IoLocationOutline className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dropoff</p>
                    <p className="text-sm text-gray-600">{selectedService.dropoff}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Times */}
        {selectedService.departureTimes && (
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3">Available Times</h5>
            <div className="flex flex-wrap gap-2">
              {selectedService.departureTimes.map(time => (
                <span key={time} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${selectedService.price}
                {selectedService.originalPrice && (
                  <span className="ml-2 text-base text-gray-500 line-through">
                    ${selectedService.originalPrice}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600">per person</p>
            </div>
            {showCommission && (
              <div className="text-right">
                <p className="text-sm font-medium text-green-700">
                  Hotel earns {selectedService.commission}%
                </p>
                <p className="text-lg font-bold text-green-600">
                  +${formatPriceWithCommission(selectedService).commission.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <IoInformationCircleOutline className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700">Cancellation Policy</p>
              <p>{selectedService.cancellation}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setBookingStage('browse')
              setSelectedService(null)
            }}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Services
          </button>
          <button
            onClick={() => setBookingStage('booking')}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    )
  }

  // Main browse view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transportation Services</h3>
        {showCommission && (
          <div className="flex items-center text-sm text-green-600">
            <IoTrendingUp className="w-4 h-4 mr-1" />
            <span>Earn 10-25% commission</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <IoSearchOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transport services..."
          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Services
        </button>
        {categories.map(category => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r text-white ' + category.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{category.name}</span>
              {showCommission && (
                <span className="ml-2 text-xs opacity-75">
                  ({category.commissionRate}%)
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transport services...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {getFilteredServices().map(service => {
            const isExpanded = expandedServices.has(service.id)
            const { commission } = formatPriceWithCommission(service)
            
            return (
              <div
                key={service.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          {service.popular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Popular
                            </span>
                          )}
                          {service.premium && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              Premium
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <IoTimeOutline className="w-4 h-4 mr-1" />
                            <span>{service.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <IoPeopleOutline className="w-4 h-4 mr-1" />
                            <span>Up to {service.capacity}</span>
                          </div>
                          {service.vehicleType && (
                            <div className="flex items-center">
                              <IoCarOutline className="w-4 h-4 mr-1" />
                              <span>{service.vehicleType}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center">
                            <IoStarOutline className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900">{service.rating}</span>
                            <span className="ml-1 text-xs text-gray-500">({service.reviews})</span>
                          </div>
                          {service.guide && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              Professional Guide
                            </span>
                          )}
                          {service.meals && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              Meals Included
                            </span>
                          )}
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                              <div className="flex flex-wrap gap-2">
                                {service.features.map((feature, index) => (
                                  <span key={index} className="inline-flex items-center text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                                    <IoCheckmarkCircle className="w-3 h-3 text-green-500 mr-1" />
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {service.departureTimes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Departure Times:</p>
                                <div className="flex flex-wrap gap-1">
                                  {service.departureTimes.slice(0, 6).map(time => (
                                    <span key={time} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                      {time}
                                    </span>
                                  ))}
                                  {service.departureTimes.length > 6 && (
                                    <span className="text-xs text-gray-500">
                                      +{service.departureTimes.length - 6} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <IoInformationCircleOutline className="w-4 h-4 mr-1" />
                              <span>{service.cancellation}</span>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => toggleServiceExpansion(service.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium mt-3"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${service.price}
                        </p>
                        {service.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${service.originalPrice}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">per person</p>
                      </div>
                      
                      {showCommission && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <p className="text-xs text-green-700">Hotel earns</p>
                          <p className="text-sm font-bold text-green-600">
                            +${commission.toFixed(2)}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedService(service)
                          setBookingStage('details')
                        }}
                        className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && getFilteredServices().length === 0 && (
        <div className="text-center py-8">
          <IoCarOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No transport services found</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Commission Summary */}
      {showCommission && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900">Revenue Opportunity</h4>
              <p className="text-sm text-green-700 mt-1">
                Your hotel earns commission on every transport booking
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-700">Average monthly revenue</p>
              <p className="text-2xl font-bold text-green-600">$42,500</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mt-4">
            {categories.map(category => (
              <div key={category.id} className="text-center">
                <p className="text-xs text-gray-600">{category.name}</p>
                <p className="text-sm font-bold text-green-600">{category.commissionRate}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}