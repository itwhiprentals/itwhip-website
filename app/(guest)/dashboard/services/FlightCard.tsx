// app/(guest)/dashboard/services/FlightCard.tsx
// Flight Card Component - Search and book flights with transparent pricing
// Shows available flights, seat selection, and bundle options

'use client'

import { useState, useEffect } from 'react'
import { 
  IoAirplaneOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoSwapHorizontalOutline,
  IoTimeOutline,
  IoBriefcaseOutline,
  IoWifiOutline,
  IoRestaurantOutline,
  IoTvOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircleOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoTrendingUp,
  IoWarningOutline,
  IoStarOutline,
  IoFlashOutline,
  IoBagHandleOutline,
  IoBagCheckOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoShieldCheckmarkOutline,
  IoBedOutline,
  IoCarOutline
} from 'react-icons/io5'

// Types
interface FlightCardProps {
  origin?: string
  destination?: string
  departDate?: string
  returnDate?: string
  passengers?: number
  tripType?: 'roundtrip' | 'oneway'
  onBookFlight?: (booking: FlightBooking) => void
  showBundles?: boolean
  isAtHotel?: boolean
}

interface Flight {
  id: string
  airline: string
  flightNumber: string
  origin: {
    code: string
    city: string
    airport: string
    terminal?: string
  }
  destination: {
    code: string
    city: string
    airport: string
    terminal?: string
  }
  departure: string
  arrival: string
  duration: number // minutes
  stops: number
  layovers?: {
    airport: string
    duration: number
  }[]
  aircraft: string
  classes: {
    economy: FlightClass
    premium?: FlightClass
    business?: FlightClass
    first?: FlightClass
  }
  onTimePerformance: number // percentage
  popular: boolean
}

interface FlightClass {
  available: boolean
  seats: number
  price: number
  originalPrice?: number
  baggage: {
    carry: number
    checked: number
    checkCost?: number
  }
  amenities: string[]
  refundable: boolean
  changeFee?: number
}

interface FlightBooking {
  id: string
  outboundFlight: Flight
  returnFlight?: Flight
  passengers: PassengerInfo[]
  selectedClass: string
  seats?: string[]
  extras: FlightExtra[]
  insurance: boolean
  subtotal: number
  taxes: number
  fees: number
  extras_cost: number
  total: number
  bundleDiscount?: number
  hotelTransfer?: boolean
  carRental?: boolean
}

interface PassengerInfo {
  id: string
  type: 'adult' | 'child' | 'infant'
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  passport?: string
  tsa?: string
  seat?: string
}

interface FlightExtra {
  id: string
  name: string
  price: number
  selected: boolean
}

export default function FlightCard({
  origin = '',
  destination = '',
  departDate = '',
  returnDate = '',
  passengers = 1,
  tripType = 'roundtrip',
  onBookFlight,
  showBundles = true,
  isAtHotel = false
}: FlightCardProps) {
  // State management
  const [searchOrigin, setSearchOrigin] = useState(origin)
  const [searchDestination, setSearchDestination] = useState(destination)
  const [searchDepartDate, setSearchDepartDate] = useState(departDate)
  const [searchReturnDate, setSearchReturnDate] = useState(returnDate)
  const [searchTripType, setSearchTripType] = useState<'roundtrip' | 'oneway'>(tripType)
  const [passengerCount, setPassengerCount] = useState({
    adults: passengers,
    children: 0,
    infants: 0
  })
  const [selectedClass, setSelectedClass] = useState<'economy' | 'premium' | 'business' | 'first'>('economy')
  const [flights, setFlights] = useState<Flight[]>([])
  const [returnFlights, setReturnFlights] = useState<Flight[]>([])
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null)
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingStage, setBookingStage] = useState<'search' | 'select-outbound' | 'select-return' | 'passengers' | 'extras' | 'confirm' | 'booked'>('search')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    maxStops: 2,
    airlines: [] as string[],
    maxPrice: 5000,
    departureTime: 'any',
    arrivalTime: 'any'
  })
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price')
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo[]>([])
  const [selectedExtras, setSelectedExtras] = useState<FlightExtra[]>([
    { id: 'priority', name: 'Priority Boarding', price: 35, selected: false },
    { id: 'lounge', name: 'Lounge Access', price: 45, selected: false },
    { id: 'extra-leg', name: 'Extra Legroom Seat', price: 65, selected: false },
    { id: 'wifi', name: 'In-Flight WiFi', price: 25, selected: false },
    { id: 'meal', name: 'Premium Meal', price: 35, selected: false },
    { id: 'insurance', name: 'Trip Insurance', price: 89, selected: false }
  ])
  const [addHotelTransfer, setAddHotelTransfer] = useState(false)
  const [addCarRental, setAddCarRental] = useState(false)

  // Search flights
  const searchFlights = async () => {
    if (!searchOrigin || !searchDestination || !searchDepartDate) return
    
    setIsLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockFlights: Flight[] = [
        {
          id: 'fl-1',
          airline: 'American Airlines',
          flightNumber: 'AA 451',
          origin: {
            code: 'PHX',
            city: 'Phoenix',
            airport: 'Sky Harbor Intl',
            terminal: '4'
          },
          destination: {
            code: 'LAX',
            city: 'Los Angeles',
            airport: 'Los Angeles Intl',
            terminal: '4'
          },
          departure: `${searchDepartDate}T08:00:00`,
          arrival: `${searchDepartDate}T09:30:00`,
          duration: 90,
          stops: 0,
          aircraft: 'Boeing 737-800',
          classes: {
            economy: {
              available: true,
              seats: 24,
              price: 127,
              originalPrice: 189,
              baggage: { carry: 1, checked: 0, checkCost: 35 },
              amenities: ['Snacks', 'Beverages'],
              refundable: false,
              changeFee: 75
            },
            premium: {
              available: true,
              seats: 8,
              price: 247,
              originalPrice: 329,
              baggage: { carry: 1, checked: 1 },
              amenities: ['Priority Boarding', 'Extra Legroom', 'Premium Snacks'],
              refundable: false,
              changeFee: 50
            },
            business: {
              available: true,
              seats: 4,
              price: 547,
              baggage: { carry: 2, checked: 2 },
              amenities: ['Priority Everything', 'Lounge Access', 'Full Meal', 'Lie-flat Seat'],
              refundable: true,
              changeFee: 0
            }
          },
          onTimePerformance: 82,
          popular: true
        },
        {
          id: 'fl-2',
          airline: 'Southwest',
          flightNumber: 'WN 1842',
          origin: {
            code: 'PHX',
            city: 'Phoenix',
            airport: 'Sky Harbor Intl',
            terminal: '4'
          },
          destination: {
            code: 'LAX',
            city: 'Los Angeles',
            airport: 'Los Angeles Intl',
            terminal: '1'
          },
          departure: `${searchDepartDate}T10:15:00`,
          arrival: `${searchDepartDate}T11:45:00`,
          duration: 90,
          stops: 0,
          aircraft: 'Boeing 737 MAX 8',
          classes: {
            economy: {
              available: true,
              seats: 47,
              price: 98,
              originalPrice: 149,
              baggage: { carry: 1, checked: 2 },
              amenities: ['Snacks', 'Beverages', 'Free Changes'],
              refundable: false,
              changeFee: 0
            }
          },
          onTimePerformance: 78,
          popular: true
        },
        {
          id: 'fl-3',
          airline: 'United Airlines',
          flightNumber: 'UA 238',
          origin: {
            code: 'PHX',
            city: 'Phoenix',
            airport: 'Sky Harbor Intl',
            terminal: '3'
          },
          destination: {
            code: 'LAX',
            city: 'Los Angeles',
            airport: 'Los Angeles Intl',
            terminal: '7'
          },
          departure: `${searchDepartDate}T14:30:00`,
          arrival: `${searchDepartDate}T16:05:00`,
          duration: 95,
          stops: 0,
          aircraft: 'Airbus A320',
          classes: {
            economy: {
              available: true,
              seats: 31,
              price: 142,
              originalPrice: 198,
              baggage: { carry: 1, checked: 0, checkCost: 40 },
              amenities: ['Snacks', 'Beverages', 'WiFi Available'],
              refundable: false,
              changeFee: 75
            },
            business: {
              available: true,
              seats: 2,
              price: 627,
              baggage: { carry: 2, checked: 2 },
              amenities: ['Priority Everything', 'Lounge Access', 'Full Meal', 'Extra Space'],
              refundable: true,
              changeFee: 0
            }
          },
          onTimePerformance: 91,
          popular: false
        },
        {
          id: 'fl-4',
          airline: 'Delta',
          flightNumber: 'DL 756',
          origin: {
            code: 'PHX',
            city: 'Phoenix',
            airport: 'Sky Harbor Intl',
            terminal: '3'
          },
          destination: {
            code: 'LAX',
            city: 'Los Angeles',
            airport: 'Los Angeles Intl',
            terminal: '2'
          },
          departure: `${searchDepartDate}T17:45:00`,
          arrival: `${searchDepartDate}T19:20:00`,
          duration: 95,
          stops: 0,
          aircraft: 'Boeing 757-200',
          classes: {
            economy: {
              available: true,
              seats: 18,
              price: 168,
              originalPrice: 225,
              baggage: { carry: 1, checked: 0, checkCost: 35 },
              amenities: ['Snacks', 'Beverages', 'Entertainment'],
              refundable: false,
              changeFee: 75
            },
            first: {
              available: true,
              seats: 3,
              price: 847,
              baggage: { carry: 2, checked: 3 },
              amenities: ['Sky Priority', 'Delta One Lounge', 'Full Dining', 'Lie-flat Bed'],
              refundable: true,
              changeFee: 0
            }
          },
          onTimePerformance: 88,
          popular: false
        }
      ]

      setFlights(mockFlights)
      
      // If roundtrip, generate return flights
      if (searchTripType === 'roundtrip' && searchReturnDate) {
        const returnMocks = mockFlights.map(f => ({
          ...f,
          id: f.id + '-return',
          origin: f.destination,
          destination: f.origin,
          departure: `${searchReturnDate}T${f.departure.split('T')[1]}`,
          arrival: `${searchReturnDate}T${f.arrival.split('T')[1]}`
        }))
        setReturnFlights(returnMocks)
      }
      
      setBookingStage('select-outbound')
    } catch (error) {
      console.error('Failed to search flights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Swap origin and destination
  const swapAirports = () => {
    const temp = searchOrigin
    setSearchOrigin(searchDestination)
    setSearchDestination(temp)
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Calculate total passengers
  const getTotalPassengers = () => {
    return passengerCount.adults + passengerCount.children + passengerCount.infants
  }

  // Get filtered and sorted flights
  const getFilteredFlights = (flightList: Flight[]) => {
    let filtered = [...flightList]
    
    // Apply filters
    if (filters.maxStops < 2) {
      filtered = filtered.filter(f => f.stops <= filters.maxStops)
    }
    
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(f => filters.airlines.includes(f.airline))
    }
    
    // Sort
    switch(sortBy) {
      case 'price':
        filtered.sort((a, b) => a.classes[selectedClass]?.price - b.classes[selectedClass]?.price)
        break
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration)
        break
      case 'departure':
        filtered.sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime())
        break
    }
    
    return filtered
  }

  // Calculate total cost
  const calculateTotal = () => {
    if (!selectedOutbound) return { subtotal: 0, taxes: 0, fees: 0, extras: 0, total: 0 }
    
    const passengers = getTotalPassengers()
    let subtotal = selectedOutbound.classes[selectedClass]?.price * passengers || 0
    
    if (selectedReturn) {
      subtotal += selectedReturn.classes[selectedClass]?.price * passengers || 0
    }
    
    const extrasCost = selectedExtras
      .filter(e => e.selected)
      .reduce((sum, e) => sum + (e.price * passengers), 0)
    
    const taxes = subtotal * 0.075
    const fees = 11.20 * passengers // TSA fees
    
    let bundleDiscount = 0
    if (showBundles && (addHotelTransfer || addCarRental)) {
      bundleDiscount = subtotal * 0.1 // 10% off when bundling
    }
    
    const total = subtotal + taxes + fees + extrasCost - bundleDiscount
    
    return { subtotal, taxes, fees, extras: extrasCost, bundleDiscount, total }
  }

  // Select flight
  const selectFlight = (flight: Flight) => {
    if (bookingStage === 'select-outbound') {
      setSelectedOutbound(flight)
      if (searchTripType === 'roundtrip') {
        setBookingStage('select-return')
      } else {
        // Initialize passenger info
        const passengers: PassengerInfo[] = []
        for (let i = 0; i < passengerCount.adults; i++) {
          passengers.push({
            id: `adult-${i}`,
            type: 'adult',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'male'
          })
        }
        for (let i = 0; i < passengerCount.children; i++) {
          passengers.push({
            id: `child-${i}`,
            type: 'child',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'male'
          })
        }
        setPassengerInfo(passengers)
        setBookingStage('passengers')
      }
    } else if (bookingStage === 'select-return') {
      setSelectedReturn(flight)
      // Initialize passenger info
      const passengers: PassengerInfo[] = []
      for (let i = 0; i < passengerCount.adults; i++) {
        passengers.push({
          id: `adult-${i}`,
          type: 'adult',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'male'
        })
      }
      for (let i = 0; i < passengerCount.children; i++) {
        passengers.push({
          id: `child-${i}`,
          type: 'child',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'male'
        })
      }
      setPassengerInfo(passengers)
      setBookingStage('passengers')
    }
  }

  // Book flight
  const bookFlight = async () => {
    if (!selectedOutbound) return
    
    setIsLoading(true)
    try {
      const costs = calculateTotal()
      
      const booking: FlightBooking = {
        id: Date.now().toString(),
        outboundFlight: selectedOutbound,
        returnFlight: selectedReturn || undefined,
        passengers: passengerInfo,
        selectedClass,
        extras: selectedExtras.filter(e => e.selected),
        insurance: selectedExtras.find(e => e.id === 'insurance')?.selected || false,
        ...costs,
        hotelTransfer: addHotelTransfer,
        carRental: addCarRental
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBookingStage('booked')
      
      if (onBookFlight) {
        onBookFlight(booking)
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique airlines from results
  const getAirlines = () => {
    const airlines = new Set(flights.map(f => f.airline))
    return Array.from(airlines)
  }

  // Booking confirmed view
  if (bookingStage === 'booked' && selectedOutbound) {
    const costs = calculateTotal()
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Flight Booked!</h3>
          <p className="text-gray-600 mb-6">
            Your {searchTripType === 'roundtrip' ? 'round-trip' : 'one-way'} flight is confirmed
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              {/* Outbound */}
              <div className="text-left">
                <p className="text-xs text-gray-500 mb-1">OUTBOUND</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedOutbound.origin.code} → {selectedOutbound.destination.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedOutbound.departure)} • {selectedOutbound.airline} {selectedOutbound.flightNumber}
                    </p>
                  </div>
                  <IoAirplaneOutline className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              {/* Return */}
              {selectedReturn && (
                <div className="text-left pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">RETURN</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedReturn.origin.code} → {selectedReturn.destination.code}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedReturn.departure)} • {selectedReturn.airline} {selectedReturn.flightNumber}
                      </p>
                    </div>
                    <IoAirplaneOutline className="w-5 h-5 text-gray-400 rotate-180" />
                  </div>
                </div>
              )}
              
              {/* Total */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {getTotalPassengers()} passenger{getTotalPassengers() > 1 ? 's' : ''}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${costs.total.toFixed(2)}
                  </p>
                </div>
              </div>
              
              {/* Bundle Additions */}
              {(addHotelTransfer || addCarRental) && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">BUNDLE INCLUDES</p>
                  <div className="space-y-1">
                    {addHotelTransfer && (
                      <div className="flex items-center text-sm text-gray-700">
                        <IoCarOutline className="w-4 h-4 mr-2 text-green-600" />
                        <span>Airport transfers included</span>
                      </div>
                    )}
                    {addCarRental && (
                      <div className="flex items-center text-sm text-gray-700">
                        <IoCarOutline className="w-4 h-4 mr-2 text-green-600" />
                        <span>Car rental discount applied</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setBookingStage('search')
                setSelectedOutbound(null)
                setSelectedReturn(null)
              }}
              className="bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
            >
              Book Another
            </button>
            <button
              onClick={() => window.location.href = '/flights'}
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
  if (bookingStage === 'confirm' && selectedOutbound) {
    const costs = calculateTotal()
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Booking</h3>
          <button
            onClick={() => setBookingStage('extras')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Flight Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            {/* Outbound */}
            <div>
              <p className="text-xs text-gray-500 mb-2">OUTBOUND FLIGHT</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedOutbound.origin.code} → {selectedOutbound.destination.code}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedOutbound.departure)} • {formatTime(selectedOutbound.departure)} - {formatTime(selectedOutbound.arrival)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOutbound.airline} {selectedOutbound.flightNumber} • {selectedClass}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Return */}
            {selectedReturn && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">RETURN FLIGHT</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedReturn.origin.code} → {selectedReturn.destination.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedReturn.departure)} • {formatTime(selectedReturn.departure)} - {formatTime(selectedReturn.arrival)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedReturn.airline} {selectedReturn.flightNumber} • {selectedClass}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Passengers */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Passengers</h4>
          <div className="space-y-2">
            {passengerInfo.map((passenger, idx) => (
              <div key={passenger.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {passenger.firstName} {passenger.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}
                  </p>
                </div>
                {passenger.seat && (
                  <span className="text-sm font-medium text-gray-700">
                    Seat {passenger.seat}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Extras Summary */}
        {selectedExtras.filter(e => e.selected).length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Selected Extras</h4>
            <div className="space-y-1">
              {selectedExtras.filter(e => e.selected).map(extra => (
                <div key={extra.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{extra.name}</span>
                  <span className="text-gray-900">${extra.price * getTotalPassengers()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bundle Additions */}
        {(addHotelTransfer || addCarRental) && (
          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Travel Bundle</h4>
            <div className="space-y-1">
              {addHotelTransfer && (
                <div className="flex items-center text-sm text-green-700">
                  <IoCarOutline className="w-4 h-4 mr-2" />
                  <span>Airport transfers included</span>
                </div>
              )}
              {addCarRental && (
                <div className="flex items-center text-sm text-green-700">
                  <IoCarOutline className="w-4 h-4 mr-2" />
                  <span>Car rental discount (10% off)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Flight{searchTripType === 'roundtrip' ? 's' : ''}</span>
              <span className="text-gray-900">${costs.subtotal.toFixed(2)}</span>
            </div>
            {costs.extras > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Extras</span>
                <span className="text-gray-900">${costs.extras.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes</span>
              <span className="text-gray-900">${costs.taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fees</span>
              <span className="text-gray-900">${costs.fees.toFixed(2)}</span>
            </div>
            {costs.bundleDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Bundle Discount</span>
                <span className="text-green-600">-${costs.bundleDiscount.toFixed(2)}</span>
              </div>
            )}
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

        {/* Book Button */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBookingStage('extras')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={bookFlight}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    )
  }

  // Extras selection view
  if (bookingStage === 'extras') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Extras & Add-ons</h3>
          <button
            onClick={() => setBookingStage('passengers')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Flight Extras */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Flight Extras</h4>
          <div className="space-y-3">
            {selectedExtras.map(extra => (
              <label
                key={extra.id}
                className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={extra.selected}
                    onChange={(e) => {
                      setSelectedExtras(selectedExtras.map(ex => 
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
                  ${extra.price}/person
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Bundle Options */}
        {showBundles && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Bundle & Save</h4>
            <div className="space-y-3">
              <label className="flex items-start p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                <input
                  type="checkbox"
                  checked={addHotelTransfer}
                  onChange={(e) => setAddHotelTransfer(e.target.checked)}
                  className="mt-1 text-green-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Add Airport Transfers</p>
                      <p className="text-sm text-gray-600">Round-trip transfers to/from airport</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">Save 10%</p>
                      <p className="text-sm text-gray-500">When bundled</p>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-start p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                <input
                  type="checkbox"
                  checked={addCarRental}
                  onChange={(e) => setAddCarRental(e.target.checked)}
                  className="mt-1 text-green-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Add Car Rental</p>
                      <p className="text-sm text-gray-600">Get a discount on car rental</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">Save 10%</p>
                      <p className="text-sm text-gray-500">When bundled</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            
            {(addHotelTransfer || addCarRental) && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-700">
                  <IoTrendingUp className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">
                    Bundle discount will be applied at checkout
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cost Preview */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Estimated Total</p>
              <p className="text-xs text-gray-500">Including selected extras</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${calculateTotal().total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBookingStage('passengers')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setBookingStage('confirm')}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Confirmation
          </button>
        </div>
      </div>
    )
  }

  // Passenger information view
  if (bookingStage === 'passengers') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Passenger Information</h3>
          <button
            onClick={() => setBookingStage(searchTripType === 'roundtrip' ? 'select-return' : 'select-outbound')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Passenger Forms */}
        <div className="space-y-6">
          {passengerInfo.map((passenger, idx) => (
            <div key={passenger.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Passenger {idx + 1} ({passenger.type})
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={passenger.firstName}
                  onChange={(e) => {
                    setPassengerInfo(passengerInfo.map(p => 
                      p.id === passenger.id 
                        ? { ...p, firstName: e.target.value }
                        : p
                    ))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={passenger.lastName}
                  onChange={(e) => {
                    setPassengerInfo(passengerInfo.map(p => 
                      p.id === passenger.id 
                        ? { ...p, lastName: e.target.value }
                        : p
                    ))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="Date of birth"
                  value={passenger.dateOfBirth}
                  onChange={(e) => {
                    setPassengerInfo(passengerInfo.map(p => 
                      p.id === passenger.id 
                        ? { ...p, dateOfBirth: e.target.value }
                        : p
                    ))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                  value={passenger.gender}
                  onChange={(e) => {
                    setPassengerInfo(passengerInfo.map(p => 
                      p.id === passenger.id 
                        ? { ...p, gender: e.target.value as any }
                        : p
                    ))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {passenger.type === 'adult' && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Passport number (optional)"
                    value={passenger.passport || ''}
                    onChange={(e) => {
                      setPassengerInfo(passengerInfo.map(p => 
                        p.id === passenger.id 
                          ? { ...p, passport: e.target.value }
                          : p
                      ))
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="TSA PreCheck (optional)"
                    value={passenger.tsa || ''}
                    onChange={(e) => {
                      setPassengerInfo(passengerInfo.map(p => 
                        p.id === passenger.id 
                          ? { ...p, tsa: e.target.value }
                          : p
                      ))
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Important Information */}
        <div className="mt-6 p-3 bg-amber-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <IoWarningOutline className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Important</p>
              <p className="text-xs text-amber-700 mt-1">
                Names must match government-issued ID exactly. Date of birth required for all passengers.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => setBookingStage(searchTripType === 'roundtrip' ? 'select-return' : 'select-outbound')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setBookingStage('extras')}
            disabled={passengerInfo.some(p => !p.firstName || !p.lastName || !p.dateOfBirth)}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            Continue to Extras
          </button>
        </div>
      </div>
    )
  }

  // Flight selection views
  if ((bookingStage === 'select-outbound' || bookingStage === 'select-return') && flights.length > 0) {
    const flightList = bookingStage === 'select-outbound' ? flights : returnFlights
    const title = bookingStage === 'select-outbound' ? 'Select Outbound Flight' : 'Select Return Flight'
    
    return (
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={() => setBookingStage('search')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to search
            </button>
          </div>
          
          {/* Route Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {bookingStage === 'select-outbound' ? searchOrigin : searchDestination}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(bookingStage === 'select-outbound' ? searchDepartDate : searchReturnDate)}
                </p>
              </div>
              <IoAirplaneOutline className="w-6 h-6 text-gray-400" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {bookingStage === 'select-outbound' ? searchDestination : searchOrigin}
                </p>
                <p className="text-sm text-gray-500">
                  {getTotalPassengers()} passenger{getTotalPassengers() > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="price">Price</option>
                <option value="duration">Duration</option>
                <option value="departure">Departure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <IoFilterOutline className="mr-1" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Stops</label>
                <select
                  value={filters.maxStops}
                  onChange={(e) => setFilters({...filters, maxStops: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={0}>Nonstop only</option>
                  <option value={1}>1 stop or fewer</option>
                  <option value={2}>2 stops or fewer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Airlines</label>
                <select
                  multiple
                  value={filters.airlines}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    setFilters({...filters, airlines: selected})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {getAirlines().map(airline => (
                    <option key={airline} value={airline}>{airline}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Flight List */}
        <div className="p-6">
          <div className="space-y-4">
            {getFilteredFlights(flightList).map(flight => {
              const flightClass = flight.classes[selectedClass]
              if (!flightClass || !flightClass.available) return null
              
              return (
                <div
                  key={flight.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => selectFlight(flight)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Flight Times */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {formatTime(flight.departure)}
                          </p>
                          <p className="text-sm text-gray-500">{flight.origin.code}</p>
                        </div>
                        
                        <div className="flex-1 flex items-center">
                          <div className="flex-1 border-t-2 border-gray-300 border-dashed relative">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                              <p className="text-xs text-gray-500">{formatDuration(flight.duration)}</p>
                              {flight.stops > 0 && (
                                <p className="text-xs text-orange-600">
                                  {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                          <IoAirplaneOutline className="w-5 h-5 text-gray-400 mx-2" />
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {formatTime(flight.arrival)}
                          </p>
                          <p className="text-sm text-gray-500">{flight.destination.code}</p>
                        </div>
                      </div>
                      
                      {/* Airline & Aircraft */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {flight.airline} {flight.flightNumber}
                            </p>
                            <p className="text-xs text-gray-500">{flight.aircraft}</p>
                          </div>
                          
                          {flight.popular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <IoTrendingUp className="mr-0.5" />
                              Popular
                            </span>
                          )}
                          
                          {flight.stops === 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Nonstop
                            </span>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <IoTimeOutline className="w-3.5 h-3.5 mr-1" />
                            <span>{flight.onTimePerformance}% on-time</span>
                          </div>
                        </div>
                        
                        {/* Amenities */}
                        <div className="flex items-center space-x-2">
                          {flightClass.amenities.includes('WiFi') && (
                            <IoWifiOutline className="w-4 h-4 text-gray-400" title="WiFi" />
                          )}
                          {flightClass.amenities.includes('Entertainment') && (
                            <IoTvOutline className="w-4 h-4 text-gray-400" title="Entertainment" />
                          )}
                          {flightClass.amenities.includes('Full Meal') && (
                            <IoRestaurantOutline className="w-4 h-4 text-gray-400" title="Meal" />
                          )}
                        </div>
                      </div>
                      
                      {/* Baggage Info */}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <IoBagHandleOutline className="w-3.5 h-3.5 mr-1" />
                          <span>{flightClass.baggage.carry} carry-on</span>
                        </div>
                        <div className="flex items-center">
                          <IoBagCheckOutline className="w-3.5 h-3.5 mr-1" />
                          <span>
                            {flightClass.baggage.checked} checked
                            {flightClass.baggage.checkCost && flightClass.baggage.checked === 0 && 
                              ` ($${flightClass.baggage.checkCost} each)`
                            }
                          </span>
                        </div>
                        {flightClass.refundable && (
                          <span className="text-green-600">Refundable</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-gray-900">
                        ${flightClass.price}
                      </p>
                      {flightClass.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          ${flightClass.originalPrice}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">per person</p>
                      
                      {flightClass.seats < 10 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Only {flightClass.seats} left
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Main search view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Search Flights</h3>
        {isAtHotel && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <IoBedOutline className="mr-1" />
            Bundle with Hotel
          </span>
        )}
      </div>

      {/* Trip Type */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={() => setSearchTripType('roundtrip')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            searchTripType === 'roundtrip'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Round Trip
        </button>
        <button
          onClick={() => setSearchTripType('oneway')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            searchTripType === 'oneway'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          One Way
        </button>
      </div>

      {/* Search Form */}
      <div className="space-y-3 mb-6">
        {/* From/To */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <IoLocationOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              placeholder="From (city or airport)"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10">
              <button
                onClick={swapAirports}
                className="bg-white border-2 border-gray-300 rounded-full p-1.5 hover:border-green-500 transition-colors"
                title="Swap airports"
              >
                <IoSwapHorizontalOutline className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <IoLocationOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              placeholder="To (city or airport)"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={searchDepartDate}
              onChange={(e) => setSearchDepartDate(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {searchTripType === 'roundtrip' && (
            <div className="relative">
              <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={searchReturnDate}
                onChange={(e) => setSearchReturnDate(e.target.value)}
                min={searchDepartDate}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
        
        {/* Passengers & Class */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <IoPersonOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={passengerCount.adults}
                    onChange={(e) => setPassengerCount({...passengerCount, adults: parseInt(e.target.value)})}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="relative">
                  <IoPersonOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={passengerCount.children}
                    onChange={(e) => setPassengerCount({...passengerCount, children: parseInt(e.target.value)})}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    {[0,1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <div className="relative">
              <IoBusinessOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as any)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          </div>
        </div>
        
        <button
          onClick={searchFlights}
          disabled={!searchOrigin || !searchDestination || !searchDepartDate || (searchTripType === 'roundtrip' && !searchReturnDate)}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
        >
          Search Flights
        </button>
      </div>

      {/* Popular Routes (when no search) */}
      {!isLoading && flights.length === 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Popular Routes from Phoenix</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { city: 'Los Angeles', code: 'LAX', price: 98 },
              { city: 'San Francisco', code: 'SFO', price: 127 },
              { city: 'Denver', code: 'DEN', price: 89 },
              { city: 'Chicago', code: 'ORD', price: 167 },
              { city: 'New York', code: 'JFK', price: 247 },
              { city: 'Miami', code: 'MIA', price: 198 }
            ].map(route => (
              <button
                key={route.code}
                onClick={() => {
                  setSearchOrigin('PHX')
                  setSearchDestination(route.code)
                }}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
              >
                <p className="font-medium text-gray-900">{route.city}</p>
                <p className="text-sm text-gray-500">{route.code}</p>
                <p className="text-sm text-green-600 font-medium mt-1">From ${route.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching flights...</p>
        </div>
      )}

      {/* Bundle Options */}
      {showBundles && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Bundle & Save</h4>
              <p className="text-sm text-gray-600 mt-1">
                Add hotel and car rental to save up to 20%
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-green-700">
                <IoBedOutline className="mr-1" />
                + Hotel
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-700">
                <IoCarOutline className="mr-1" />
                + Car
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <IoShieldCheckmarkOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>Best price guarantee</span>
            </div>
            <div className="flex items-center">
              <IoFlashOutline className="w-4 h-4 mr-1 text-green-600" />
              <span>Instant booking</span>
            </div>
            <div className="flex items-center">
              <IoTrendingUp className="w-4 h-4 mr-1 text-green-600" />
              <span>Bundle savings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}