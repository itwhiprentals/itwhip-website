// app/(guest)/dashboard/services/RentalCard.tsx
// Rental Card Component - Rent cars with transparent pricing and hotel delivery
// Shows available vehicles, rental periods, and insurance options

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCarSportOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoSnowOutline,
  IoWifiOutline,
  IoPhonePortraitOutline,
  IoNavigateOutline,
  IoFlashOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircleOutline,
  IoKeyOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoBriefcaseOutline,
  IoCarOutline,
  IoPeopleOutline,
  IoLeafOutline,
  IoTrendingUp,
  IoWarningOutline,
  IoBedOutline,
  IoStarOutline
} from 'react-icons/io5'

// Types
interface RentalCardProps {
  pickupLocation?: string
  dropoffLocation?: string
  pickupDate?: string
  dropoffDate?: string
  isAtHotel?: boolean
  hotelName?: string
  onRentCar?: (rental: RentalBooking) => void
}

interface Vehicle {
  id: string
  category: 'economy' | 'compact' | 'midsize' | 'fullsize' | 'suv' | 'luxury' | 'electric'
  make: string
  model: string
  year: number
  image: string
  seats: number
  doors: number
  transmission: 'automatic' | 'manual'
  fuelType: 'gas' | 'hybrid' | 'electric'
  mpg?: number
  range?: number // for electric
  luggage: {
    large: number
    small: number
  }
  features: string[]
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  originalPrice?: number
  available: boolean
  deliveryAvailable: boolean
  deliveryFee: number
  insurance: {
    basic: number
    premium: number
    full: number
  }
  mileage: {
    included: number // miles per day
    extraCost: number // per mile
  }
  deposit: number
  hotelPartner: boolean
  popular: boolean
  rating: number
  reviews: number
}

interface RentalBooking {
  id: string
  vehicle: Vehicle
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  pickupTime: string
  dropoffDate: string
  dropoffTime: string
  days: number
  insurance: 'basic' | 'premium' | 'full' | 'none'
  extras: RentalExtra[]
  driver: {
    name: string
    age: number
    licenseNumber: string
  }
  subtotal: number
  insuranceCost: number
  extrasCost: number
  deliveryFee: number
  tax: number
  total: number
  paymentMethod: 'card' | 'roomCharge'
  roomNumber?: string
}

interface RentalExtra {
  id: string
  name: string
  price: number
  selected: boolean
}

export default function RentalCard({
  pickupLocation = '',
  dropoffLocation = '',
  pickupDate = '',
  dropoffDate = '',
  isAtHotel = false,
  hotelName = '',
  onRentCar
}: RentalCardProps) {
  // State management
  const [pickup, setPickup] = useState(pickupLocation)
  const [dropoff, setDropoff] = useState(dropoffLocation)
  const [pickupDateTime, setPickupDateTime] = useState({
    date: pickupDate,
    time: '10:00'
  })
  const [dropoffDateTime, setDropoffDateTime] = useState({
    date: dropoffDate,
    time: '10:00'
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [bookingStage, setBookingStage] = useState<'browse' | 'details' | 'extras' | 'confirm' | 'booked'>('browse')
  const [selectedInsurance, setSelectedInsurance] = useState<'basic' | 'premium' | 'full' | 'none'>('basic')
  const [extras, setExtras] = useState<RentalExtra[]>([
    { id: 'gps', name: 'GPS Navigation', price: 15, selected: false },
    { id: 'child-seat', name: 'Child Seat', price: 12, selected: false },
    { id: 'wifi', name: 'Mobile WiFi Hotspot', price: 10, selected: false },
    { id: 'ski-rack', name: 'Ski/Snowboard Rack', price: 20, selected: false },
    { id: 'toll-pass', name: 'Toll Pass', price: 8, selected: false },
    { id: 'additional-driver', name: 'Additional Driver', price: 15, selected: false }
  ])
  const [driverInfo, setDriverInfo] = useState({
    name: '',
    age: 25,
    licenseNumber: ''
  })
  const [sameLocation, setSameLocation] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'category' | 'rating'>('price')

  // Vehicle categories
  const categories = [
    { id: 'all', name: 'All', icon: IoCarOutline },
    { id: 'economy', name: 'Economy', icon: IoWalletOutline },
    { id: 'compact', name: 'Compact', icon: IoCarOutline },
    { id: 'midsize', name: 'Midsize', icon: IoCarSportOutline },
    { id: 'fullsize', name: 'Full Size', icon: IoCarSportOutline },
    { id: 'suv', name: 'SUV', icon: IoPeopleOutline },
    { id: 'luxury', name: 'Luxury', icon: IoFlashOutline },
    { id: 'electric', name: 'Electric', icon: IoLeafOutline }
  ]

  // Load vehicles
  useEffect(() => {
    if (pickupDateTime.date && dropoffDateTime.date) {
      searchVehicles()
    }
  }, [pickupDateTime.date, dropoffDateTime.date])

  // Set hotel pickup if at hotel
  useEffect(() => {
    if (isAtHotel) {
      setPickup(hotelName || 'Hotel Valet Pickup')
      if (sameLocation) {
        setDropoff(hotelName || 'Hotel Valet Return')
      }
    }
  }, [isAtHotel, hotelName, sameLocation])

  // Search available vehicles
  const searchVehicles = async () => {
    setIsLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockVehicles: Vehicle[] = [
        {
          id: 'veh-1',
          category: 'economy',
          make: 'Nissan',
          model: 'Versa',
          year: 2024,
          image: 'nissan-versa.jpg',
          seats: 5,
          doors: 4,
          transmission: 'automatic',
          fuelType: 'gas',
          mpg: 35,
          luggage: { large: 1, small: 1 },
          features: ['AC', 'Bluetooth', 'Backup Camera'],
          dailyRate: 45,
          weeklyRate: 280,
          monthlyRate: 950,
          originalPrice: 65,
          available: true,
          deliveryAvailable: true,
          deliveryFee: 25,
          insurance: { basic: 15, premium: 25, full: 35 },
          mileage: { included: 200, extraCost: 0.25 },
          deposit: 200,
          hotelPartner: true,
          popular: true,
          rating: 4.3,
          reviews: 234
        },
        {
          id: 'veh-2',
          category: 'midsize',
          make: 'Toyota',
          model: 'Camry',
          year: 2024,
          image: 'toyota-camry.jpg',
          seats: 5,
          doors: 4,
          transmission: 'automatic',
          fuelType: 'hybrid',
          mpg: 48,
          luggage: { large: 2, small: 2 },
          features: ['AC', 'Bluetooth', 'Apple CarPlay', 'Backup Camera', 'Cruise Control'],
          dailyRate: 65,
          weeklyRate: 420,
          monthlyRate: 1450,
          originalPrice: 85,
          available: true,
          deliveryAvailable: true,
          deliveryFee: 25,
          insurance: { basic: 18, premium: 30, full: 42 },
          mileage: { included: 250, extraCost: 0.25 },
          deposit: 300,
          hotelPartner: true,
          popular: true,
          rating: 4.6,
          reviews: 567
        },
        {
          id: 'veh-3',
          category: 'suv',
          make: 'Chevrolet',
          model: 'Tahoe',
          year: 2024,
          image: 'chevy-tahoe.jpg',
          seats: 7,
          doors: 4,
          transmission: 'automatic',
          fuelType: 'gas',
          mpg: 22,
          luggage: { large: 3, small: 3 },
          features: ['AC', 'Bluetooth', 'Apple CarPlay', '3rd Row', 'Towing Package', '4WD'],
          dailyRate: 95,
          weeklyRate: 630,
          monthlyRate: 2200,
          originalPrice: 125,
          available: true,
          deliveryAvailable: true,
          deliveryFee: 35,
          insurance: { basic: 25, premium: 40, full: 55 },
          mileage: { included: 300, extraCost: 0.30 },
          deposit: 500,
          hotelPartner: false,
          popular: false,
          rating: 4.5,
          reviews: 189
        },
        {
          id: 'veh-4',
          category: 'luxury',
          make: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          image: 'mercedes-eclass.jpg',
          seats: 5,
          doors: 4,
          transmission: 'automatic',
          fuelType: 'gas',
          mpg: 28,
          luggage: { large: 2, small: 2 },
          features: ['Leather', 'Heated Seats', 'Sunroof', 'Premium Audio', 'Navigation', 'Adaptive Cruise'],
          dailyRate: 145,
          weeklyRate: 980,
          monthlyRate: 3500,
          originalPrice: 195,
          available: true,
          deliveryAvailable: true,
          deliveryFee: 0, // Free for luxury
          insurance: { basic: 35, premium: 55, full: 75 },
          mileage: { included: 350, extraCost: 0.40 },
          deposit: 750,
          hotelPartner: true,
          popular: false,
          rating: 4.8,
          reviews: 92
        },
        {
          id: 'veh-5',
          category: 'electric',
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          image: 'tesla-model3.jpg',
          seats: 5,
          doors: 4,
          transmission: 'automatic',
          fuelType: 'electric',
          range: 333,
          luggage: { large: 1, small: 2 },
          features: ['Autopilot', 'Glass Roof', 'Premium Audio', 'Supercharging', 'App Control'],
          dailyRate: 125,
          weeklyRate: 840,
          monthlyRate: 2950,
          originalPrice: 165,
          available: true,
          deliveryAvailable: true,
          deliveryFee: 0, // Free for electric
          insurance: { basic: 30, premium: 45, full: 65 },
          mileage: { included: 300, extraCost: 0.20 },
          deposit: 500,
          hotelPartner: true,
          popular: true,
          rating: 4.9,
          reviews: 412
        }
      ]

      setVehicles(mockVehicles)
    } catch (error) {
      console.error('Failed to search vehicles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate rental days
  const calculateDays = () => {
    if (!pickupDateTime.date || !dropoffDateTime.date) return 0
    const start = new Date(pickupDateTime.date)
    const end = new Date(dropoffDateTime.date)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 1
  }

  // Calculate rental cost
  const calculateRentalCost = (vehicle: Vehicle, days: number) => {
    if (days >= 30) {
      const months = Math.floor(days / 30)
      const remainingDays = days % 30
      return (months * vehicle.monthlyRate) + (remainingDays * vehicle.dailyRate)
    } else if (days >= 7) {
      const weeks = Math.floor(days / 7)
      const remainingDays = days % 7
      return (weeks * vehicle.weeklyRate) + (remainingDays * vehicle.dailyRate)
    } else {
      return days * vehicle.dailyRate
    }
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    if (!selectedVehicle) return { subtotal: 0, insurance: 0, extras: 0, delivery: 0, tax: 0, total: 0 }
    
    const days = calculateDays()
    const subtotal = calculateRentalCost(selectedVehicle, days)
    
    let insuranceCost = 0
    if (selectedInsurance !== 'none') {
      insuranceCost = selectedVehicle.insurance[selectedInsurance] * days
    }
    
    const extrasCost = extras
      .filter(e => e.selected)
      .reduce((sum, extra) => sum + (extra.price * days), 0)
    
    const deliveryFee = selectedVehicle.deliveryAvailable && isAtHotel ? selectedVehicle.deliveryFee : 0
    const tax = (subtotal + insuranceCost + extrasCost) * 0.1
    const total = subtotal + insuranceCost + extrasCost + deliveryFee + tax
    
    return {
      subtotal,
      insurance: insuranceCost,
      extras: extrasCost,
      delivery: deliveryFee,
      tax,
      total
    }
  }

  // Filter vehicles
  const getFilteredVehicles = () => {
    let filtered = vehicles
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.category === selectedCategory)
    }
    
    // Sort vehicles
    switch(sortBy) {
      case 'price':
        filtered.sort((a, b) => a.dailyRate - b.dailyRate)
        break
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category))
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
    }
    
    return filtered
  }

  // Book vehicle
  const bookVehicle = async () => {
    if (!selectedVehicle) return
    
    setIsLoading(true)
    try {
      const days = calculateDays()
      const costs = calculateTotalCost()
      
      const booking: RentalBooking = {
        id: Date.now().toString(),
        vehicle: selectedVehicle,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        pickupDate: pickupDateTime.date,
        pickupTime: pickupDateTime.time,
        dropoffDate: dropoffDateTime.date,
        dropoffTime: dropoffDateTime.time,
        days,
        insurance: selectedInsurance,
        extras: extras.filter(e => e.selected),
        driver: driverInfo,
        ...costs,
        paymentMethod: isAtHotel ? 'roomCharge' : 'card',
        roomNumber: isAtHotel ? 'Room 412' : undefined
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBookingStage('booked')
      
      if (onRentCar) {
        onRentCar(booking)
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'economy': return 'from-gray-500 to-gray-600'
      case 'compact': return 'from-blue-500 to-blue-600'
      case 'midsize': return 'from-indigo-500 to-indigo-600'
      case 'fullsize': return 'from-purple-500 to-purple-600'
      case 'suv': return 'from-orange-500 to-orange-600'
      case 'luxury': return 'from-amber-500 to-amber-600'
      case 'electric': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const days = calculateDays()

  // Booking confirmed view
  if (bookingStage === 'booked' && selectedVehicle) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Rental Confirmed!</h3>
          <p className="text-gray-600 mb-6">
            Your {selectedVehicle.make} {selectedVehicle.model} is reserved
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-left">
                <p className="text-xs text-gray-500 mb-1">PICKUP</p>
                <p className="font-medium text-gray-900">{pickup}</p>
                <p className="text-sm text-gray-600">
                  {pickupDateTime.date} at {pickupDateTime.time}
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 mb-1">RETURN</p>
                <p className="font-medium text-gray-900">{dropoff}</p>
                <p className="text-sm text-gray-600">
                  {dropoffDateTime.date} at {dropoffDateTime.time}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <p className="text-sm text-gray-500">Total ({days} days)</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${calculateTotalCost().total.toFixed(2)}
                  </p>
                </div>
                {isAtHotel && (
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      <IoBedOutline className="mr-1" />
                      Room Charge
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setBookingStage('browse')
                setSelectedVehicle(null)
              }}
              className="bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
            >
              Book Another
            </button>
            <button
              onClick={() => window.location.href = '/rentals'}
              className="bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
            >
              View Booking
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Confirmation view
  if (bookingStage === 'confirm' && selectedVehicle) {
    const costs = calculateTotalCost()
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Rental</h3>
          <button
            onClick={() => setBookingStage('extras')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Vehicle Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedVehicle.category.charAt(0).toUpperCase() + selectedVehicle.category.slice(1)} • 
                {selectedVehicle.seats} seats • {selectedVehicle.transmission}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${costs.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">{days} days total</p>
            </div>
          </div>
        </div>

        {/* Rental Details */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Rental Details</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">PICKUP</p>
                <p className="text-sm font-medium text-gray-900">{pickup}</p>
                <p className="text-sm text-gray-600">
                  {pickupDateTime.date} at {pickupDateTime.time}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">RETURN</p>
                <p className="text-sm font-medium text-gray-900">{dropoff}</p>
                <p className="text-sm text-gray-600">
                  {dropoffDateTime.date} at {dropoffDateTime.time}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Information */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Driver Information</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={driverInfo.name}
              onChange={(e) => setDriverInfo({...driverInfo, name: e.target.value})}
              placeholder="Driver's full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={driverInfo.age}
                onChange={(e) => setDriverInfo({...driverInfo, age: parseInt(e.target.value)})}
                placeholder="Age"
                min="21"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                value={driverInfo.licenseNumber}
                onChange={(e) => setDriverInfo({...driverInfo, licenseNumber: e.target.value})}
                placeholder="License number"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          {driverInfo.age < 25 && driverInfo.age > 0 && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg">
              <div className="flex items-center text-amber-700">
                <IoWarningOutline className="w-4 h-4 mr-2" />
                <span className="text-sm">Young driver fee may apply (under 25)</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rental ({days} days)</span>
              <span className="text-gray-900">${costs.subtotal.toFixed(2)}</span>
            </div>
            {selectedInsurance !== 'none' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {selectedInsurance.charAt(0).toUpperCase() + selectedInsurance.slice(1)} Insurance
                </span>
                <span className="text-gray-900">${costs.insurance.toFixed(2)}</span>
              </div>
            )}
            {costs.extras > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Extras</span>
                <span className="text-gray-900">${costs.extras.toFixed(2)}</span>
              </div>
            )}
            {costs.delivery > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hotel Delivery</span>
                <span className="text-gray-900">${costs.delivery.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${costs.tax.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-green-600">
                  ${costs.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <IoInformationCircleOutline className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="text-xs text-gray-600 space-y-1">
              <p>• {selectedVehicle.mileage.included} miles/day included, ${selectedVehicle.mileage.extraCost}/mile after</p>
              <p>• Refundable deposit of ${selectedVehicle.deposit} required</p>
              <p>• Must return with same fuel level</p>
              <p>• Driver must be 21+ with valid license</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBookingStage('extras')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={bookVehicle}
            disabled={isLoading || !driverInfo.name || !driverInfo.licenseNumber}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    )
  }

  // Extras selection view
  if (bookingStage === 'extras' && selectedVehicle) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Insurance & Extras</h3>
          <button
            onClick={() => setBookingStage('details')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Insurance Options */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Select Insurance</h4>
          <div className="space-y-3">
            <label className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
              <input
                type="radio"
                value="none"
                checked={selectedInsurance === 'none'}
                onChange={(e) => setSelectedInsurance(e.target.value as any)}
                className="mt-1 text-green-600"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">No Insurance</p>
                    <p className="text-sm text-gray-600">Use your own insurance</p>
                  </div>
                  <span className="font-semibold text-gray-900">$0/day</span>
                </div>
              </div>
            </label>
            
            <label className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
              <input
                type="radio"
                value="basic"
                checked={selectedInsurance === 'basic'}
                onChange={(e) => setSelectedInsurance(e.target.value as any)}
                className="mt-1 text-green-600"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Basic Protection</p>
                    <p className="text-sm text-gray-600">Covers damage with $1000 deductible</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${selectedVehicle.insurance.basic}/day
                  </span>
                </div>
              </div>
            </label>
            
            <label className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
              <input
                type="radio"
                value="premium"
                checked={selectedInsurance === 'premium'}
                onChange={(e) => setSelectedInsurance(e.target.value as any)}
                className="mt-1 text-green-600"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Premium Protection</p>
                    <p className="text-sm text-gray-600">Covers damage with $500 deductible + theft</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${selectedVehicle.insurance.premium}/day
                  </span>
                </div>
              </div>
            </label>
            
            <label className="flex items-start p-3 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer">
              <input
                type="radio"
                value="full"
                checked={selectedInsurance === 'full'}
                onChange={(e) => setSelectedInsurance(e.target.value as any)}
                className="mt-1 text-green-600"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">Full Coverage</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Zero deductible, covers everything</p>
                  </div>
                  <span className="font-semibold text-green-600">
                    ${selectedVehicle.insurance.full}/day
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Extra Options */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Add Extras</h4>
          <div className="space-y-3">
            {extras.map(extra => (
              <label
                key={extra.id}
                className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={extra.selected}
                    onChange={(e) => {
                      setExtras(extras.map(ex => 
                        ex.id === extra.id 
                          ? { ...ex, selected: e.target.checked }
                          : ex
                      ))
                    }}
                    className="text-green-600"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {extra.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${extra.price}/day
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Cost Preview */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Estimated Total</p>
              <p className="text-xs text-gray-500">{days} days with selected options</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${calculateTotalCost().total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBookingStage('details')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setBookingStage('confirm')}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Vehicle details view
  if (bookingStage === 'details' && selectedVehicle) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setBookingStage('browse')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to vehicles
          </button>
          {selectedVehicle.hotelPartner && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <IoBedOutline className="mr-1" />
              Hotel Partner
            </span>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
              <span>{selectedVehicle.rating} ({selectedVehicle.reviews} reviews)</span>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              selectedVehicle.category === 'luxury' ? 'bg-amber-100 text-amber-700' :
              selectedVehicle.category === 'electric' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {selectedVehicle.category.charAt(0).toUpperCase() + selectedVehicle.category.slice(1)}
            </span>
          </div>
        </div>

        {/* Vehicle Specs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <IoPeopleOutline className="w-6 h-6 text-gray-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">{selectedVehicle.seats} Seats</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <IoBriefcaseOutline className="w-6 h-6 text-gray-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {selectedVehicle.luggage.large}L + {selectedVehicle.luggage.small}S
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <IoSpeedometerOutline className="w-6 h-6 text-gray-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {selectedVehicle.transmission === 'automatic' ? 'Auto' : 'Manual'}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            {selectedVehicle.fuelType === 'electric' ? (
              <>
                <IoFlashOutline className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{selectedVehicle.range} mi</p>
              </>
            ) : (
              <>
                <IoSpeedometerOutline className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{selectedVehicle.mpg} MPG</p>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Features</h4>
          <div className="flex flex-wrap gap-2">
            {selectedVehicle.features.map(feature => (
              <span key={feature} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                <IoCheckmarkCircle className="w-4 h-4 mr-1 text-green-600" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Rental Rates</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Daily</p>
              <p className="text-lg font-semibold text-gray-900">
                ${selectedVehicle.dailyRate}
                {selectedVehicle.originalPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ${selectedVehicle.originalPrice}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly</p>
              <p className="text-lg font-semibold text-gray-900">
                ${selectedVehicle.weeklyRate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly</p>
              <p className="text-lg font-semibold text-gray-900">
                ${selectedVehicle.monthlyRate}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Your rental: <span className="font-semibold text-gray-900">{days} days</span>
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ${calculateRentalCost(selectedVehicle, days).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Hotel Delivery */}
        {isAtHotel && selectedVehicle.deliveryAvailable && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IoBedOutline className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Hotel Delivery Available</p>
                  <p className="text-xs text-blue-700">
                    Vehicle delivered to hotel valet
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-blue-900">
                {selectedVehicle.deliveryFee === 0 ? 'FREE' : `$${selectedVehicle.deliveryFee}`}
              </span>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={() => setBookingStage('extras')}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
        >
          Select Insurance & Extras
        </button>
      </div>
    )
  }

  // Main browse view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Rent a Car</h3>
        {isAtHotel && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <IoBedOutline className="mr-1" />
            Hotel Delivery Available
          </span>
        )}
      </div>

      {/* Search Form */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <IoLocationOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value)
                if (sameLocation) setDropoff(e.target.value)
              }}
              placeholder="Pickup location"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <IoLocationOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Return location"
              disabled={sameLocation}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={sameLocation}
            onChange={(e) => {
              setSameLocation(e.target.checked)
              if (e.target.checked) setDropoff(pickup)
            }}
            className="text-green-600"
          />
          <span className="text-sm text-gray-700">Return to same location</span>
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={pickupDateTime.date}
              onChange={(e) => setPickupDateTime({...pickupDateTime, date: e.target.value})}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <IoTimeOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              value={pickupDateTime.time}
              onChange={(e) => setPickupDateTime({...pickupDateTime, time: e.target.value})}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dropoffDateTime.date}
              onChange={(e) => setDropoffDateTime({...dropoffDateTime, date: e.target.value})}
              min={pickupDateTime.date}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <IoTimeOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              value={dropoffDateTime.time}
              onChange={(e) => setDropoffDateTime({...dropoffDateTime, time: e.target.value})}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={searchVehicles}
          disabled={!pickup || !pickupDateTime.date || !dropoffDateTime.date}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
        >
          Search Vehicles
        </button>
      </div>

      {/* Category Filter & Sort */}
      {vehicles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map(cat => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    <span className="text-sm">{cat.name}</span>
                  </button>
                )
              })}
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="price">Price</option>
              <option value="category">Category</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching available vehicles...</p>
        </div>
      )}

      {/* Vehicle List */}
      {!isLoading && getFilteredVehicles().length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {getFilteredVehicles().length} vehicles available
            </p>
            {days > 0 && (
              <p className="text-sm text-green-600 font-medium">
                {days} day rental
              </p>
            )}
          </div>
          
          {getFilteredVehicles().map(vehicle => (
            <div
              key={vehicle.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setSelectedVehicle(vehicle)
                setBookingStage('details')
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h4>
                    {vehicle.popular && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        <IoTrendingUp className="mr-0.5" />
                        Popular
                      </span>
                    )}
                    {vehicle.hotelPartner && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Partner
                      </span>
                    )}
                    {vehicle.fuelType === 'electric' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <IoLeafOutline className="mr-0.5" />
                        Electric
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <IoPeopleOutline className="w-4 h-4 mr-1" />
                      <span>{vehicle.seats}</span>
                    </div>
                    <div className="flex items-center">
                      <IoBriefcaseOutline className="w-4 h-4 mr-1" />
                      <span>{vehicle.luggage.large}+{vehicle.luggage.small}</span>
                    </div>
                    <div className="flex items-center">
                      {vehicle.transmission === 'automatic' ? 'Auto' : 'Manual'}
                    </div>
                    {vehicle.fuelType === 'electric' ? (
                      <div className="flex items-center">
                        <IoFlashOutline className="w-4 h-4 mr-1" />
                        <span>{vehicle.range} mi</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>{vehicle.mpg} MPG</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
                      <span>{vehicle.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.slice(0, 4).map(feature => (
                      <span key={feature} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{vehicle.features.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  {vehicle.deliveryAvailable && isAtHotel && (
                    <div className="mt-2 inline-flex items-center text-xs text-blue-600">
                      <IoKeyOutline className="w-3 h-3 mr-1" />
                      <span>
                        Hotel delivery {vehicle.deliveryFee === 0 ? 'FREE' : `$${vehicle.deliveryFee}`}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {days} day{days !== 1 ? 's' : ''}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculateRentalCost(vehicle, days).toFixed(0)}
                  </p>
                  {vehicle.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      ${(vehicle.originalPrice * days).toFixed(0)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    ${vehicle.dailyRate}/day
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && vehicles.length === 0 && pickupDateTime.date && dropoffDateTime.date && (
        <div className="text-center py-8">
          <IoCarSportOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No vehicles available for selected dates</p>
          <button
            onClick={searchVehicles}
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
              <span>Full insurance</span>
            </div>
            <div className="flex items-center">
              <IoKeyOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>Hotel delivery</span>
            </div>
            <div className="flex items-center">
              <IoTrendingUp className="w-4 h-4 mr-1 text-green-600" />
              <span>Best prices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}