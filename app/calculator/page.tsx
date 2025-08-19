// app/calculator/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoCalculatorOutline,
  IoTrendingUpOutline,
  IoBusinessOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoDownloadOutline,
  IoCashOutline,
  IoCarOutline,
  IoWarningOutline
} from 'react-icons/io5'

export default function CalculatorPage() {
  const router = useRouter()
  
  // Calculator inputs
  const [hotelName, setHotelName] = useState('')
  const [rooms, setRooms] = useState('293')
  const [occupancy, setOccupancy] = useState('70')
  const [currentShuttleCost, setCurrentShuttleCost] = useState('35000')
  
  // Results
  const [results, setResults] = useState<{
    monthlyRevenue: number
    annualRevenue: number
    totalImprovement: number
    breakEvenDays: number
    dailyRides: number
    revenuePerRoom: number
  } | null>(null)
  
  const [showResults, setShowResults] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const calculateRevenue = () => {
    const roomCount = parseInt(rooms) || 0
    const occupancyRate = parseInt(occupancy) / 100 || 0
    const shuttleMonthlyCost = parseInt(currentShuttleCost) || 0
    
    // Calculations
    const avgGuestsPerDay = roomCount * occupancyRate
    const ridesPerGuest = 0.5 // Conservative: 50% of guests use service
    const avgRidePrice = 50
    const commissionRate = 0.30
    
    const dailyRides = avgGuestsPerDay * ridesPerGuest
    const dailyRevenue = dailyRides * avgRidePrice * commissionRate
    const monthlyRevenue = dailyRevenue * 30
    const annualRevenue = monthlyRevenue * 12
    const totalImprovement = annualRevenue + (shuttleMonthlyCost * 12)
    const breakEvenDays = shuttleMonthlyCost > 0 ? Math.ceil(shuttleMonthlyCost / dailyRevenue) : 0
    const revenuePerRoom = annualRevenue / roomCount
    
    setResults({
      monthlyRevenue: Math.round(monthlyRevenue),
      annualRevenue: Math.round(annualRevenue),
      totalImprovement: Math.round(totalImprovement),
      breakEvenDays,
      dailyRides: Math.round(dailyRides),
      revenuePerRoom: Math.round(revenuePerRoom)
    })
    
    setShowResults(true)
  }

  const downloadReport = () => {
    // In production, this would generate a PDF
    alert('Detailed report will be sent to your email')
  }

  const scheduleDemo = () => {
    router.push('/demo')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <Header
        userType="hotel"
        onUserTypeChange={() => router.push('/')}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <section className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <IoCalculatorOutline className="w-12 h-12 text-amber-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Revenue Calculator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See exactly how much your hotel can earn from guest rides
            </p>
          </div>

          {/* Calculator Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your Hotel Information
            </h2>

            <div className="space-y-6">
              {/* Hotel Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hotel Name (Optional)
                </label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Omni Scottsdale Resort"
                />
              </div>

              {/* Number of Rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="293"
                />
                <p className="text-xs text-gray-500 mt-1">Total rooms in your property</p>
              </div>

              {/* Average Occupancy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Occupancy Rate (%)
                </label>
                <input
                  type="number"
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="70"
                />
                <p className="text-xs text-gray-500 mt-1">Your typical occupancy percentage</p>
              </div>

              {/* Current Shuttle Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Monthly Shuttle Cost ($)
                </label>
                <input
                  type="number"
                  value={currentShuttleCost}
                  onChange={(e) => setCurrentShuttleCost(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="35000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include all costs: vehicles, drivers, maintenance, insurance
                </p>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateRevenue}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white 
                  rounded-lg font-bold text-lg hover:from-amber-600 hover:to-amber-700 
                  transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Calculate My Revenue
              </button>
            </div>
          </div>

          {/* Results Section */}
          {showResults && results && (
            <div className="space-y-6 animate-fadeIn">
              {/* Main Results */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">
                  {hotelName ? `${hotelName}'s` : 'Your'} Revenue Potential
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-green-100 mb-2">Monthly Revenue</p>
                    <p className="text-4xl font-bold">
                      ${results.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-100 mb-2">Annual Revenue</p>
                    <p className="text-4xl font-bold">
                      ${results.annualRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-green-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Annual Improvement</p>
                      <p className="text-sm text-green-200">
                        (Revenue + Eliminated Shuttle Costs)
                      </p>
                    </div>
                    <p className="text-3xl font-bold">
                      ${results.totalImprovement.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <IoCarOutline className="w-8 h-8 text-blue-600 mb-3" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {results.dailyRides}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rides per day
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <IoCashOutline className="w-8 h-8 text-green-600 mb-3" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${results.revenuePerRoom}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revenue per room/year
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <IoTrendingUpOutline className="w-8 h-8 text-amber-600 mb-3" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {results.breakEvenDays || 'Immediate'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {results.breakEvenDays ? 'Days to break even' : 'Profit from day 1'}
                  </p>
                </div>
              </div>

              {/* Comparison */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Current vs. ItWhip Model
                </h3>
                
                <div className="space-y-4">
                  {/* Current Model */}
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 
                    rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-3">
                      <IoWarningOutline className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Current Shuttle Model
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Annual cost with zero revenue
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                      -${(parseInt(currentShuttleCost) * 12).toLocaleString()}
                    </p>
                  </div>

                  {/* ItWhip Model */}
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 
                    rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ItWhip Model
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Annual revenue with zero investment
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      +${results.annualRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={downloadReport}
                  className="flex items-center justify-center px-6 py-4 bg-white dark:bg-gray-900 
                    text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 
                    rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <IoDownloadOutline className="w-5 h-5 mr-2" />
                  Download Full Report
                </button>
                
                <button
                  onClick={scheduleDemo}
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r 
                    from-amber-500 to-amber-600 text-white rounded-lg font-bold 
                    hover:from-amber-600 hover:to-amber-700 transition"
                >
                  Schedule Demo
                  <IoArrowForwardOutline className="w-5 h-5 ml-2" />
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                * Calculations based on industry averages and conservative estimates. 
                Actual results may vary based on location, guest demographics, and market conditions.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer userType="hotel" />
    </main>
  )
}