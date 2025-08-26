// app/components/certification/RevenueActivator.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  IoCarOutline,
  IoCashOutline,
  IoTrendingUp,
  IoTimerOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoPhonePortraitOutline,
  IoCheckmarkCircle,
  IoArrowForward,
  IoSpeedometerOutline,
  IoWalletOutline,
  IoStatsChartOutline,
  IoRocketOutline
} from 'react-icons/io5'

interface RideSimulation {
  id: string
  guestName: string
  pickup: string
  dropoff: string
  distance: number
  fare: number
  hotelCommission: number
  platformFee: number
  time: string
  status: 'requested' | 'dispatched' | 'enroute' | 'completed'
}

interface RevenueStream {
  name: string
  description: string
  percentage: number
  monthlyAverage: number
  icon: React.ReactNode
  color: string
}

export function RevenueActivator() {
  const [activeRides, setActiveRides] = useState<RideSimulation[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [rideCount, setRideCount] = useState(0)
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Revenue streams
  const revenueStreams: RevenueStream[] = [
    {
      name: 'Airport Transfers',
      description: 'Premium airport pickup/dropoff service',
      percentage: 40,
      monthlyAverage: 28500,
      icon: <IoLocationOutline className="w-6 h-6" />,
      color: 'blue'
    },
    {
      name: 'Local Transportation',
      description: 'Restaurant, shopping, entertainment rides',
      percentage: 35,
      monthlyAverage: 24900,
      icon: <IoCarOutline className="w-6 h-6" />,
      color: 'green'
    },
    {
      name: 'Tour Services',
      description: 'Guided tours and excursions',
      percentage: 15,
      monthlyAverage: 10700,
      icon: <IoPersonOutline className="w-6 h-6" />,
      color: 'purple'
    },
    {
      name: 'Event Transportation',
      description: 'Conference, wedding, special events',
      percentage: 10,
      monthlyAverage: 7100,
      icon: <IoTimerOutline className="w-6 h-6" />,
      color: 'orange'
    }
  ]

  // Guest names for simulation
  const guestNames = [
    'Sarah Johnson', 'Mike Chen', 'Emma Williams', 'James Rodriguez',
    'Lisa Anderson', 'David Kim', 'Maria Garcia', 'Robert Taylor'
  ]

  const locations = [
    { pickup: 'Hotel Lobby', dropoff: 'Phoenix Sky Harbor Airport', distance: 12.5, type: 'airport' },
    { pickup: 'Hotel Lobby', dropoff: 'Scottsdale Fashion Square', distance: 8.3, type: 'local' },
    { pickup: 'Hotel Lobby', dropoff: 'Chase Field', distance: 15.2, type: 'event' },
    { pickup: 'Hotel Lobby', dropoff: 'Desert Botanical Garden', distance: 10.7, type: 'tour' },
    { pickup: 'Phoenix Airport', dropoff: 'Hotel Lobby', distance: 12.5, type: 'airport' },
    { pickup: 'Hotel Lobby', dropoff: 'Old Town Scottsdale', distance: 9.8, type: 'local' }
  ]

  // Simulate ride generation
  const generateRide = (): RideSimulation => {
    const guest = guestNames[Math.floor(Math.random() * guestNames.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const baseFare = location.distance * 3.5
    const surgeFactor = 1 + (Math.random() * 0.5) // 1x to 1.5x surge
    const totalFare = baseFare * surgeFactor
    
    return {
      id: `RIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      guestName: guest,
      pickup: location.pickup,
      dropoff: location.dropoff,
      distance: location.distance,
      fare: totalFare,
      hotelCommission: totalFare * 0.30, // Hotel gets 30%
      platformFee: totalFare * 0.10, // Platform gets 10%
      time: new Date().toLocaleTimeString(),
      status: 'requested'
    }
  }

  // Start simulation
  const startSimulation = () => {
    setIsSimulating(true)
    setActiveRides([])
    setTotalRevenue(0)
    setRideCount(0)

    // Generate rides every 2-4 seconds
    const interval = setInterval(() => {
      const newRide = generateRide()
      
      setActiveRides(prev => {
        const updated = [newRide, ...prev].slice(0, 5)
        
        // Update ride statuses
        return updated.map((ride, index) => {
          if (index === 0) return { ...ride, status: 'requested' as const }
          if (index === 1) return { ...ride, status: 'dispatched' as const }
          if (index === 2) return { ...ride, status: 'enroute' as const }
          return { ...ride, status: 'completed' as const }
        })
      })
      
      setTotalRevenue(prev => prev + newRide.hotelCommission)
      setRideCount(prev => prev + 1)
    }, 3000)

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval)
      setIsSimulating(false)
      setShowBreakdown(true)
    }, 30000)

    return () => clearInterval(interval)
  }

  // Monthly projection based on simulation
  const monthlyProjection = rideCount > 0 ? (totalRevenue / rideCount) * 1850 : 71200 // Average 1850 rides/month

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full mb-4">
            <IoCashOutline className="w-5 h-5" />
            <span className="font-semibold">Revenue Generation Engine</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Turn Every Guest Into <span className="text-green-600">Revenue</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your hotel becomes a transportation hub. Guests book rides, you earn 30% commission.
            No drivers to manage, no vehicles to maintain. Pure profit.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How Ride Revenue Works
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoPhonePortraitOutline className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Guest Books</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Through your app, website, or front desk
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoSpeedometerOutline className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Instant Dispatch</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Driver arrives in 5-10 minutes
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoWalletOutline className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Ride Completes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Guest charged, receipt sent
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoStatsChartOutline className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">You Earn 30%</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Direct deposit weekly
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Revenue Streams
            </h3>
            
            <div className="space-y-4">
              {revenueStreams.map((stream) => (
                <div
                  key={stream.name}
                  className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                    selectedStream === stream.name ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedStream(selectedStream === stream.name ? null : stream.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        stream.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                        stream.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                        stream.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
                        'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                      }`}>
                        {stream.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{stream.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stream.percentage}% of total revenue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ${stream.monthlyAverage.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </div>
                  
                  {selectedStream === stream.name && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {stream.description}
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Avg rides/day:</span>
                          <span className="font-bold">{Math.floor(stream.percentage * 2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Avg fare:</span>
                          <span className="font-bold">${(stream.monthlyAverage / (stream.percentage * 60)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Your commission:</span>
                          <span className="font-bold text-green-600">30%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Total Projection */}
            <div className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold">Total Monthly Revenue</h4>
                <IoTrendingUp className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold mb-2">
                ${revenueStreams.reduce((sum, s) => sum + s.monthlyAverage, 0).toLocaleString()}
              </p>
              <p className="text-sm opacity-90">
                Based on 150-room hotel at 75% occupancy
              </p>
            </div>
          </div>

          {/* Live Simulation */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Live Revenue Simulator
            </h3>
            
            <div className="bg-gray-900 rounded-lg p-6">
              {!isSimulating && activeRides.length === 0 && (
                <div className="text-center py-12">
                  <IoRocketOutline className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">
                    Ready to See Money Flow?
                  </h4>
                  <p className="text-gray-400 mb-6">
                    Watch how real rides generate revenue for your hotel
                  </p>
                  <button
                    onClick={startSimulation}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    Start 30-Second Simulation
                  </button>
                </div>
              )}
              
              {(isSimulating || activeRides.length > 0) && (
                <>
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 rounded p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Rides</p>
                      <p className="text-2xl font-bold text-white">{rideCount}</p>
                    </div>
                    <div className="bg-gray-800 rounded p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Avg/Ride</p>
                      <p className="text-2xl font-bold text-purple-400">
                        ${rideCount > 0 ? (totalRevenue / rideCount).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active Rides */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activeRides.map((ride) => (
                      <div
                        key={ride.id}
                        className={`bg-gray-800 rounded p-3 border transition-all ${
                          ride.status === 'requested' ? 'border-yellow-500 animate-pulse' :
                          ride.status === 'completed' ? 'border-green-500' :
                          'border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <IoPersonOutline className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-white">
                              {ride.guestName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{ride.time}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span>{ride.pickup}</span>
                          <IoArrowForward className="w-3 h-3" />
                          <span>{ride.dropoff}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="text-gray-400">
                              {ride.distance} mi
                            </span>
                            <span className="text-white">
                              ${ride.fare.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              ride.status === 'requested' ? 'bg-yellow-900/50 text-yellow-400' :
                              ride.status === 'dispatched' ? 'bg-blue-900/50 text-blue-400' :
                              ride.status === 'enroute' ? 'bg-purple-900/50 text-purple-400' :
                              'bg-green-900/50 text-green-400'
                            }`}>
                              {ride.status}
                            </span>
                            {ride.status === 'completed' && (
                              <span className="text-xs font-bold text-green-400">
                                +${ride.hotelCommission.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Simulation Status */}
                  {isSimulating && (
                    <div className="mt-4 text-center text-sm text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Simulating real-time ride requests...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Results Breakdown */}
              {showBreakdown && !isSimulating && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg">
                  <h4 className="text-lg font-bold text-white mb-3">
                    30-Second Results
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Rides completed:</span>
                      <span className="font-bold">{rideCount}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Total revenue generated:</span>
                      <span className="font-bold text-green-400">
                        ${totalRevenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Projected monthly:</span>
                      <span className="font-bold text-yellow-400">
                        ${monthlyProjection.toFixed(0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Projected annually:</span>
                      <span className="font-bold text-green-400 text-lg">
                        ${(monthlyProjection * 12).toFixed(0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={startSimulation}
                    className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 transition-colors"
                  >
                    Run Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Your Revenue Share Breakdown
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">30%</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Hotel Share</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your commission on every ride
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">60%</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Driver Earnings</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fair pay ensures quality service
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">10%</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Platform Fee</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Technology & support
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              <IoCheckmarkCircle className="inline w-6 h-6 text-green-500 mr-2" />
              No vehicles to buy. No drivers to hire. No insurance to manage.
              <span className="block mt-2 text-xl font-bold text-green-600 dark:text-green-400">
                Just pure profit from existing guests.
              </span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Average hotel with 150 rooms generates
            <span className="block text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              $71,200/month in ride revenue
            </span>
          </p>
          <button
            onClick={() => document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Activate Revenue Generation Now
          </button>
        </div>
      </div>
    </section>
  )
}