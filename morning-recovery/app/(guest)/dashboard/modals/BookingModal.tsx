// app/(guest)/dashboard/modals/BookingModal.tsx
// Universal Booking Modal - Handles all service types with dynamic forms
// Using native React instead of Headless UI for better compatibility

'use client'

import { useState, useEffect } from 'react'
import { 
  IoClose,
  IoCarOutline,
  IoBedOutline,
  IoRestaurantOutline,
  IoAirplaneOutline,
  IoCarSportOutline,
  IoGiftOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle,
  IoArrowForward,
  IoArrowBack,
  IoStar,
  IoFlash,
  IoShieldCheckmark,
  IoPricetag
} from 'react-icons/io5'
import { useHotel } from '../components/HotelContext'

// Types
interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  serviceType: 'ride' | 'hotel' | 'food' | 'rental' | 'flight' | 'bundle' | null
  initialData?: any
  onConfirm: (bookingData: any) => void
}

interface BookingStep {
  id: string
  title: string
  description: string
  icon: any
}

interface ServiceConfig {
  icon: any
  color: string
  gradient: [string, string]
  steps: BookingStep[]
  defaultData: any
}

// Service configurations
const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  ride: {
    icon: IoCarOutline,
    color: '#059669',
    gradient: ['#059669', '#10B981'],
    steps: [
      { id: 'pickup', title: 'Pickup Location', description: 'Where should we pick you up?', icon: IoLocationOutline },
      { id: 'destination', title: 'Destination', description: 'Where are you going?', icon: IoLocationOutline },
      { id: 'vehicle', title: 'Choose Vehicle', description: 'Select your ride type', icon: IoCarOutline },
      { id: 'confirm', title: 'Confirm & Pay', description: 'Review and book', icon: IoWalletOutline }
    ],
    defaultData: {
      pickup: '',
      destination: '',
      vehicleType: 'standard',
      passengers: 1,
      scheduledTime: null,
      notes: ''
    }
  },
  hotel: {
    icon: IoBedOutline,
    color: '#3B82F6',
    gradient: ['#3B82F6', '#60A5FA'],
    steps: [
      { id: 'search', title: 'Search Hotels', description: 'Find your perfect stay', icon: IoLocationOutline },
      { id: 'dates', title: 'Select Dates', description: 'When are you traveling?', icon: IoCalendarOutline },
      { id: 'rooms', title: 'Choose Room', description: 'Select room type and guests', icon: IoBedOutline },
      { id: 'confirm', title: 'Confirm & Pay', description: 'Complete your booking', icon: IoWalletOutline }
    ],
    defaultData: {
      location: '',
      checkIn: '',
      checkOut: '',
      rooms: 1,
      adults: 2,
      children: 0,
      roomType: 'standard'
    }
  },
  food: {
    icon: IoRestaurantOutline,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBB040'],
    steps: [
      { id: 'restaurant', title: 'Choose Restaurant', description: 'Browse nearby options', icon: IoRestaurantOutline },
      { id: 'menu', title: 'Select Items', description: 'Build your order', icon: IoRestaurantOutline },
      { id: 'delivery', title: 'Delivery Details', description: 'Where should we deliver?', icon: IoLocationOutline },
      { id: 'confirm', title: 'Confirm & Pay', description: 'Complete your order', icon: IoWalletOutline }
    ],
    defaultData: {
      restaurant: null,
      items: [],
      deliveryAddress: '',
      deliveryTime: 'asap',
      instructions: ''
    }
  },
  rental: {
    icon: IoCarSportOutline,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
    steps: [
      { id: 'location', title: 'Pickup Location', description: 'Where do you need the car?', icon: IoLocationOutline },
      { id: 'dates', title: 'Rental Period', description: 'How long do you need it?', icon: IoCalendarOutline },
      { id: 'vehicle', title: 'Choose Vehicle', description: 'Select your car', icon: IoCarSportOutline },
      { id: 'confirm', title: 'Confirm & Pay', description: 'Complete rental', icon: IoWalletOutline }
    ],
    defaultData: {
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: '',
      dropoffDate: '',
      vehicleClass: 'economy',
      insurance: false
    }
  },
  flight: {
    icon: IoAirplaneOutline,
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'],
    steps: [
      { id: 'route', title: 'Flight Route', description: 'Where are you flying?', icon: IoAirplaneOutline },
      { id: 'dates', title: 'Travel Dates', description: 'When do you want to travel?', icon: IoCalendarOutline },
      { id: 'flights', title: 'Select Flights', description: 'Choose your flights', icon: IoAirplaneOutline },
      { id: 'confirm', title: 'Confirm & Pay', description: 'Complete booking', icon: IoWalletOutline }
    ],
    defaultData: {
      from: '',
      to: '',
      departDate: '',
      returnDate: '',
      tripType: 'roundtrip',
      passengers: 1,
      class: 'economy'
    }
  },
  bundle: {
    icon: IoGiftOutline,
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'],
    steps: [
      { id: 'select', title: 'Choose Services', description: 'Build your package', icon: IoGiftOutline },
      { id: 'customize', title: 'Customize', description: 'Tailor to your needs', icon: IoPricetag },
      { id: 'review', title: 'Review Bundle', description: 'Check your savings', icon: IoCheckmarkCircle },
      { id: 'confirm', title: 'Confirm & Pay', description: 'Complete bundle', icon: IoWalletOutline }
    ],
    defaultData: {
      services: [],
      startDate: '',
      endDate: '',
      travelers: 1,
      customizations: {}
    }
  }
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  serviceType, 
  initialData,
  onConfirm 
}: BookingModalProps) {
  const { isAtHotel, hotelName, reservation } = useHotel()
  const [currentStep, setCurrentStep] = useState(0)
  const [bookingData, setBookingData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isClosing, setIsClosing] = useState(false)

  // Initialize booking data
  useEffect(() => {
    if (serviceType && SERVICE_CONFIGS[serviceType]) {
      setBookingData({
        ...SERVICE_CONFIGS[serviceType].defaultData,
        ...initialData
      })
      setCurrentStep(0)
      setErrors({})
    }
  }, [serviceType, initialData])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !serviceType || !SERVICE_CONFIGS[serviceType]) {
    return null
  }

  const config = SERVICE_CONFIGS[serviceType]
  const steps = config.steps
  const currentStepData = steps[currentStep]
  const Icon = config.icon

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  // Handle step navigation
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Validate current step
  const validateStep = (): boolean => {
    const stepId = currentStepData.id
    const newErrors: Record<string, string> = {}

    // Add validation logic based on step
    switch(serviceType) {
      case 'ride':
        if (stepId === 'pickup' && !bookingData.pickup) {
          newErrors.pickup = 'Pickup location is required'
        }
        if (stepId === 'destination' && !bookingData.destination) {
          newErrors.destination = 'Destination is required'
        }
        break
      case 'hotel':
        if (stepId === 'search' && !bookingData.location) {
          newErrors.location = 'Location is required'
        }
        if (stepId === 'dates') {
          if (!bookingData.checkIn) newErrors.checkIn = 'Check-in date is required'
          if (!bookingData.checkOut) newErrors.checkOut = 'Check-out date is required'
        }
        break
      case 'food':
        if (stepId === 'restaurant' && !bookingData.restaurant) {
          newErrors.restaurant = 'Please select a restaurant'
        }
        if (stepId === 'menu' && bookingData.items?.length === 0) {
          newErrors.items = 'Please select at least one item'
        }
        break
      // Add more validation for other services
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Add hotel context if applicable
      const finalData = {
        ...bookingData,
        serviceType,
        isHotelGuest: isAtHotel,
        hotelName: isAtHotel ? hotelName : null,
        roomNumber: isAtHotel ? reservation?.roomNumber : null,
        timestamp: new Date().toISOString()
      }

      await onConfirm(finalData)
      handleClose()
    } catch (error) {
      console.error('Booking failed:', error)
      setErrors({ submit: 'Booking failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Render step content based on service and step
  const renderStepContent = () => {
    const stepId = currentStepData.id

    // Common confirm step
    if (stepId === 'confirm') {
      return (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              {/* Dynamic summary based on service type */}
              {serviceType === 'ride' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup:</span>
                    <span className="font-medium">{bookingData.pickup || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-medium">{bookingData.destination || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium capitalize">{bookingData.vehicleType}</span>
                  </div>
                </>
              )}
              {serviceType === 'hotel' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{bookingData.location || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{bookingData.checkIn || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{bookingData.checkOut || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{bookingData.adults} adults, {bookingData.children} children</span>
                  </div>
                </>
              )}
              {/* Add summaries for other service types */}
            </div>
          </div>

          {/* Hotel commission notice */}
          {isAtHotel && serviceType === 'ride' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Hotel Guest Benefit</p>
                  <p className="text-green-700 mt-1">
                    {hotelName} will earn 15% commission from this ride
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment method */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-900">Payment Method</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change
              </button>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <IoWalletOutline className="w-5 h-5 text-gray-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">•••• 4242</p>
                <p className="text-sm text-gray-600">Visa</p>
              </div>
              {isAtHotel && (
                <span className="text-sm text-green-600 font-medium">
                  Charge to Room
                </span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">$45.00</span>
            </div>
          </div>
        </div>
      )
    }

    // Service-specific step content
    switch(serviceType) {
      case 'ride':
        if (stepId === 'pickup') {
          return (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter pickup location"
                value={bookingData.pickup || ''}
                onChange={(e) => setBookingData({ ...bookingData, pickup: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
              {errors.pickup && (
                <p className="text-red-500 text-sm">{errors.pickup}</p>
              )}
              
              {/* Suggested locations */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Suggested Locations</p>
                {isAtHotel && (
                  <button
                    onClick={() => setBookingData({ ...bookingData, pickup: hotelName })}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <IoBedOutline className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{hotelName}</p>
                        <p className="text-sm text-gray-600">Your hotel</p>
                      </div>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => setBookingData({ ...bookingData, pickup: 'Phoenix Sky Harbor Airport' })}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <IoAirplaneOutline className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Phoenix Sky Harbor Airport</p>
                      <p className="text-sm text-gray-600">PHX</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )
        }
        
        if (stepId === 'destination') {
          return (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter destination"
                value={bookingData.destination || ''}
                onChange={(e) => setBookingData({ ...bookingData, destination: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
              {errors.destination && (
                <p className="text-red-500 text-sm">{errors.destination}</p>
              )}
            </div>
          )
        }

        if (stepId === 'vehicle') {
          const vehicles = [
            { id: 'economy', name: 'Economy', price: '$25-30', seats: '4 seats', icon: '🚗' },
            { id: 'standard', name: 'Standard', price: '$35-40', seats: '4 seats', icon: '🚙' },
            { id: 'premium', name: 'Premium', price: '$45-55', seats: '4 seats', icon: '🚘' },
            { id: 'suv', name: 'SUV', price: '$55-70', seats: '7 seats', icon: '🚐' }
          ]

          return (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setBookingData({ ...bookingData, vehicleType: vehicle.id })}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    bookingData.vehicleType === vehicle.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{vehicle.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{vehicle.name}</p>
                        <p className="text-sm text-gray-600">{vehicle.seats}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{vehicle.price}</p>
                      {bookingData.vehicleType === vehicle.id && (
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        }
        break

      case 'hotel':
        if (stepId === 'search') {
          return (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="City, hotel name, or airport"
                value={bookingData.location || ''}
                onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
            </div>
          )
        }
        
        if (stepId === 'dates') {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={bookingData.checkIn || ''}
                  onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.checkIn && (
                  <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={bookingData.checkOut || ''}
                  onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.checkOut && (
                  <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>
                )}
              </div>
            </div>
          )
        }
        
        if (stepId === 'rooms') {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                  <select
                    value={bookingData.adults}
                    onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                  <select
                    value={bookingData.children}
                    onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[0,1,2,3,4,5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={bookingData.roomType}
                  onChange={(e) => setBookingData({ ...bookingData, roomType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard Room</option>
                  <option value="deluxe">Deluxe Room</option>
                  <option value="suite">Suite</option>
                  <option value="executive">Executive Suite</option>
                </select>
              </div>
            </div>
          )
        }
        break

      case 'food':
        if (stepId === 'restaurant') {
          const restaurants = [
            { id: '1', name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, delivery: '30-40 min' },
            { id: '2', name: 'Burger Barn', cuisine: 'American', rating: 4.2, delivery: '25-35 min' },
            { id: '3', name: 'Sushi Supreme', cuisine: 'Japanese', rating: 4.8, delivery: '35-45 min' },
            { id: '4', name: 'Taco Town', cuisine: 'Mexican', rating: 4.3, delivery: '20-30 min' }
          ]

          return (
            <div className="space-y-3">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => setBookingData({ ...bookingData, restaurant: restaurant.id })}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    bookingData.restaurant === restaurant.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{restaurant.name}</p>
                      <p className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.delivery}</p>
                      <div className="flex items-center mt-1">
                        <IoStar className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700 ml-1">{restaurant.rating}</span>
                      </div>
                    </div>
                    {bookingData.restaurant === restaurant.id && (
                      <IoCheckmarkCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </button>
              ))}
              {errors.restaurant && (
                <p className="text-red-500 text-sm">{errors.restaurant}</p>
              )}
            </div>
          )
        }
        break

      // Add cases for other service types
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Step content for {serviceType} - {stepId}</p>
          </div>
        )
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isClosing ? 'opacity-0' : 'bg-opacity-50'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className={`w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}>
            {/* Header */}
            <div 
              className="relative px-6 py-4"
              style={{
                background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-6 h-6 text-white mr-3" />
                  <h3 className="text-lg font-semibold text-white">
                    Book {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>

              {/* Step Progress */}
              <div className="mt-4 flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex-1 flex items-center">
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          index <= currentStep
                            ? 'bg-white text-gray-900'
                            : 'bg-white bg-opacity-30 text-white'
                        }`}
                      >
                        {index < currentStep ? (
                          <IoCheckmarkCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded transition-all ${
                          index < currentStep
                            ? 'bg-white'
                            : 'bg-white bg-opacity-30'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Info */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <h4 className="font-semibold text-gray-900">{currentStepData.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[400px] overflow-y-auto">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <IoArrowBack className="w-4 h-4 mr-2" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className={`flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'hover:shadow-lg transform hover:scale-105'
                  }`}
                  style={{
                    background: !isLoading 
                      ? `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`
                      : undefined
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : currentStep === steps.length - 1 ? (
                    <>
                      Confirm Booking
                      <IoCheckmarkCircle className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <IoArrowForward className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>

              {errors.submit && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}