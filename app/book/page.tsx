// app/book/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoLocationOutline,
  IoAirplaneOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoCarSportOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoInformationCircleOutline,
  IoStarOutline
} from 'react-icons/io5'

interface VehicleOption {
  id: string
  name: string
  type: string
  capacity: number
  price: number
  eta: string
  rating: number
  image: string
}

export default function BookPage() {
  const router = useRouter()
  
  // Form states
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [passengers, setPassengers] = useState('1')
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  
  // UI states
  const [showVehicles, setShowVehicles] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Available vehicles (mock data)
  const vehicles: VehicleOption[] = [
    {
      id: '1',
      name: 'Tesla Model S',
      type: 'Luxury Sedan',
      capacity: 4,
      price: 29,
      eta: '5 min',
      rating: 4.9,
      image: '/tesla-model-s.png'
    },
    {
      id: '2',
      name: 'Mercedes S-Class',
      type: 'Premium Sedan',
      capacity: 4,
      price: 29,
      eta: '8 min',
      rating: 4.8,
      image: '/mercedes-s-class.png'
    },
    {
      id: '3',
      name: 'BMW X7',
      type: 'Luxury SUV',
      capacity: 6,
      price: 39,
      eta: '12 min',
      rating: 4.9,
      image: '/bmw-x7.png'
    },
    {
      id: '4',
      name: 'Cadillac Escalade',
      type: 'Premium SUV',
      capacity: 7,
      price: 45,
      eta: '15 min',
      rating: 4.7,
      image: '/escalade.png'
    }
  ]

  const searchRides = () => {
    if (pickupLocation && dropoffLocation) {
      setShowVehicles(true)
    }
  }

  const bookRide = async () => {
    if (!selectedVehicle) return
    
    setIsBooking(true)
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsBooking(false)
    setBookingConfirmed(true)
  }

  const quickFill = (pickup: string, dropoff: string) => {
    setPickupLocation(pickup)
    setDropoffLocation(dropoff)
  }

  if (bookingConfirmed) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-950 dark:to-black">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <section className="pt-24 pb-20 px-4 min-h-[80vh] flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full 
                flex items-center justify-center mx-auto">
                <IoCheckmarkCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ride Confirmed!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your driver will arrive in approximately 5-10 minutes. 
              You'll receive a text message with driver details and live tracking.
            </p>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-8">
              <p className="text-sm text-gray-500 mb-2">Confirmation Code</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                PHX-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold 
                hover:bg-blue-700 transition"
            >
              Back to Home
            </button>
          </div>
        </section>
        
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <section className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Book Your Ride
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Fixed prices. Luxury vehicles. No surge pricing.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Trip Details
                </h2>

                {/* Quick Options */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Popular Routes:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => quickFill('Sky Harbor Airport', 'Scottsdale')}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm 
                        text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                      Airport → Scottsdale
                    </button>
                    <button
                      onClick={() => quickFill('Downtown Phoenix', 'Sky Harbor Airport')}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm 
                        text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                      Downtown → Airport
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <IoLocationOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter pickup address"
                      />
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dropoff Location
                    </label>
                    <div className="relative">
                      <IoLocationOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter destination"
                      />
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                      </label>
                      <div className="relative">
                        <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                          w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                            rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time
                      </label>
                      <div className="relative">
                        <IoTimeOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                          w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                            rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flight Number (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Flight Number (Optional)
                    </label>
                    <div className="relative">
                      <IoAirplaneOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., AA1234"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      We'll track your flight and adjust pickup time automatically
                    </p>
                  </div>

                  {/* Number of Passengers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Passengers
                    </label>
                    <div className="relative">
                      <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400" />
                      <select
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 
                          rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1">1 Passenger</option>
                        <option value="2">2 Passengers</option>
                        <option value="3">3 Passengers</option>
                        <option value="4">4 Passengers</option>
                        <option value="5">5 Passengers</option>
                        <option value="6">6 Passengers</option>
                        <option value="7">7 Passengers</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={searchRides}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                      rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 
                      transition-all transform hover:scale-[1.02]"
                  >
                    Search Available Rides
                  </button>
                </div>
              </div>

              {/* Vehicle Selection */}
              {showVehicles && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Available Vehicles
                  </h3>
                  
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className={`bg-white dark:bg-gray-900 rounded-xl p-4 cursor-pointer 
                        transition-all border-2 ${
                        selectedVehicle === vehicle.id
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg 
                            flex items-center justify-center">
                            <IoCarSportOutline className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {vehicle.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {vehicle.type} • {vehicle.capacity} seats
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                <IoStarOutline className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                                  {vehicle.rating}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                ETA: {vehicle.eta}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${vehicle.price}
                          </p>
                          <p className="text-xs text-green-600">Fixed price</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Book Button */}
                  {selectedVehicle && (
                    <button
                      onClick={bookRide}
                      disabled={isBooking}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white 
                        rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 
                        transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Why Book with ItWhip
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        No Surge Pricing
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Same price 24/7, even during peak times
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Luxury Vehicles Only
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Tesla, Mercedes, BMW guaranteed
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Flight Tracking
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        We adjust for delays automatically
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Professional Drivers
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Background checked & insured
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoInformationCircleOutline className="w-5 h-5" />
                    <p>Need help? Call (602) 555-0100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}