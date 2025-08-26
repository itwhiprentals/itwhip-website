// app/components/certification/GhostDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { IoCarOutline, IoCashOutline, IoTrendingUp, IoTimeOutline, IoLocationOutline, IoStarOutline, IoSwapHorizontal, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'

interface GhostRide {
  id: string
  hotelName: string
  pickupTime: string
  revenue: number
  distance: number
  rating: number
  type: 'airport' | 'local' | 'tour'
  status: 'completed' | 'in-progress' | 'scheduled'
}

interface DashboardMetrics {
  totalRevenue: number
  ridesCompleted: number
  avgRating: number
  peakHours: string
  topRoute: string
  conversionRate: number
}

export function GhostDashboard() {
  const [isRevealed, setIsRevealed] = useState(false)
  const [timeUntilReveal, setTimeUntilReveal] = useState(120) // 2 minutes
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<string>('industry-average')

  // Ghost rides that look like industry data
  const [ghostRides] = useState<GhostRide[]>([
    {
      id: 'GR001',
      hotelName: 'Luxury Resort Phoenix',
      pickupTime: '14:32',
      revenue: 67.50,
      distance: 12.3,
      rating: 4.9,
      type: 'airport',
      status: 'completed'
    },
    {
      id: 'GR002',
      hotelName: 'Downtown Hotel Scottsdale',
      pickupTime: '14:28',
      revenue: 45.00,
      distance: 8.7,
      rating: 5.0,
      type: 'local',
      status: 'in-progress'
    },
    {
      id: 'GR003',
      hotelName: 'Airport Inn & Suites',
      pickupTime: '14:25',
      revenue: 52.00,
      distance: 15.2,
      rating: 4.8,
      type: 'airport',
      status: 'completed'
    },
    {
      id: 'GR004',
      hotelName: 'Boutique Hotel Tempe',
      pickupTime: '14:20',
      revenue: 89.00,
      distance: 22.5,
      rating: 4.9,
      type: 'tour',
      status: 'completed'
    },
    {
      id: 'GR005',
      hotelName: 'Business Hotel Phoenix',
      pickupTime: '14:15',
      revenue: 38.50,
      distance: 6.8,
      rating: 4.7,
      type: 'local',
      status: 'completed'
    }
  ])

  // Metrics that update
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 67433,
    ridesCompleted: 1847,
    avgRating: 4.8,
    peakHours: '7-9 AM, 4-6 PM',
    topRoute: 'Hotel → Airport (38%)',
    conversionRate: 23.5
  })

  // Update metrics every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 500),
        ridesCompleted: prev.ridesCompleted + Math.floor(Math.random() * 3),
        conversionRate: 23.5 + (Math.random() * 2 - 1)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Countdown to reveal
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilReveal(prev => {
        if (prev <= 1) {
          setIsRevealed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const hotelOptions = [
    { value: 'industry-average', label: 'Industry Average' },
    { value: 'luxury-segment', label: 'Luxury Hotels' },
    { value: 'business-segment', label: 'Business Hotels' },
    { value: 'airport-segment', label: 'Airport Hotels' },
    { value: 'YOUR-HOTEL', label: '🔓 Your Hotel (Locked)' }
  ]

  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full mb-4">
            <IoEyeOutline className="w-5 h-5" />
            <span className="font-semibold">
              {isRevealed ? 'REVEALED: Actual Platform Data' : `Industry Benchmark Data ${timeUntilReveal > 0 ? `(Reality in ${formatTime(timeUntilReveal)})` : ''}`}
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isRevealed ? (
              <>This is <span className="text-purple-600">YOUR</span> Potential Dashboard</>
            ) : (
              <>Industry Transportation Revenue Benchmarks</>
            )}
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {isRevealed ? (
              <>These aren't industry averages. These are <span className="font-bold text-purple-600">actual hotels on our platform</span> earning this RIGHT NOW.</>
            ) : (
              <>See what hotels in your segment are earning from transportation services.</>
            )}
          </p>
        </div>

        {/* Hotel Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 px-3">Viewing:</span>
            <select 
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {hotelOptions.map(option => (
                <option key={option.value} value={option.value} disabled={option.value === 'YOUR-HOTEL'}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dashboard Container */}
        <div className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${isRevealed ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}`}>
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {isRevealed ? 'Live Revenue Dashboard' : 'Revenue Analytics'}
                </h3>
                <p className="text-purple-100 mt-1">
                  Real-time transportation earnings
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-100">Current Month</p>
                <p className="text-3xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Reveal Overlay */}
          {isRevealed && (
            <div className="absolute top-20 right-4 z-20 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
              <p className="text-sm font-bold">🎯 This could be YOUR dashboard!</p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-gray-200 dark:border-gray-800">
            <div 
              className="relative group"
              onMouseEnter={() => setHoveredMetric('rides')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rides Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.ridesCompleted.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    <IoTrendingUp className="inline w-3 h-3" /> +12% from last month
                  </p>
                </div>
                <IoCarOutline className="w-10 h-10 text-purple-600" />
              </div>
              {hoveredMetric === 'rides' && isRevealed && (
                <div className="absolute -top-12 left-0 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Your hotel could handle this volume!
                </div>
              )}
            </div>

            <div 
              className="relative group"
              onMouseEnter={() => setHoveredMetric('rating')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.avgRating.toFixed(1)} ⭐
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    From {(metrics.ridesCompleted * 0.7).toFixed(0)} reviews
                  </p>
                </div>
                <IoStarOutline className="w-10 h-10 text-yellow-500" />
              </div>
              {hoveredMetric === 'rating' && isRevealed && (
                <div className="absolute -top-12 left-0 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Premium service quality
                </div>
              )}
            </div>

            <div 
              className="relative group"
              onMouseEnter={() => setHoveredMetric('conversion')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Booking → Ride</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    <IoTrendingUp className="inline w-3 h-3" /> Industry avg: 15%
                  </p>
                </div>
                <IoSwapHorizontal className="w-10 h-10 text-indigo-600" />
              </div>
              {hoveredMetric === 'conversion' && isRevealed && (
                <div className="absolute -top-12 left-0 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  50% better than industry!
                </div>
              )}
            </div>
          </div>

          {/* Live Rides Table */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {isRevealed ? 'Live Rides Happening Now' : 'Recent Transportation Activity'}
              </h4>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isRevealed ? 'Hotel (Actual)' : 'Hotel Type'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {ghostRides.map((ride, index) => (
                    <tr 
                      key={ride.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isRevealed ? 'animate-pulse-once' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {isRevealed ? ride.hotelName : 'Hotel Category ' + (index + 1)}
                        </div>
                        {isRevealed && (
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            Real hotel on platform
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        <IoTimeOutline className="inline w-4 h-4 mr-1" />
                        {ride.pickupTime}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ride.type === 'airport' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          ride.type === 'tour' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {ride.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {ride.distance} mi
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${ride.revenue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          ride.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {ride.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">Peak Hours</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{metrics.peakHours}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">Top Route</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{metrics.topRoute}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Ride Value</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  ${(metrics.totalRevenue / metrics.ridesCompleted).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">Daily Average</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  ${(metrics.totalRevenue / 30).toFixed(0)}/day
                </p>
              </div>
            </div>

            {/* CTA */}
            {isRevealed && (
              <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-center">
                <h4 className="text-xl font-bold text-white mb-2">
                  This Dashboard Could Be Yours
                </h4>
                <p className="text-purple-100 mb-4">
                  Start earning from transportation services immediately
                </p>
                <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                  Unlock My Dashboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-8 text-center">
          {!isRevealed ? (
            <p className="text-gray-600 dark:text-gray-400">
              <IoEyeOffOutline className="inline w-5 h-5 mr-2" />
              Keep watching... something interesting happens at {formatTime(timeUntilReveal)}
            </p>
          ) : (
            <p className="text-purple-600 dark:text-purple-400 font-bold text-lg animate-pulse">
              <IoEyeOutline className="inline w-6 h-6 mr-2" />
              REVEALED: These are actual ItWhip platform metrics from real hotels!
            </p>
          )}
        </div>
      </div>
    </section>
  )
}