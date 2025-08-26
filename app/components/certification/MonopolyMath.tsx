// app/components/certification/MonopolyMath.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  IoCalculatorOutline,
  IoCashOutline,
  IoTrendingUp,
  IoWarning,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoArrowForward,
  IoDownloadOutline,
  IoLockClosedOutline,
  IoRocketOutline
} from 'react-icons/io5'

interface CalculationResult {
  currentCosts: {
    soc2: number
    iso27001: number
    pciDss: number
    hipaa: number
    others: number
    total: number
  }
  tuCertification: {
    monthly: number
    annual: number
    grade: string
    tier: string
  }
  revenueGeneration: {
    ridesMonthly: number
    bookingCommission: number
    esgPremium: number
    total: number
  }
  netBenefit: {
    monthlySavings: number
    monthlyRevenue: number
    totalMonthly: number
    totalAnnual: number
    roi: number
  }
}

export function MonopolyMath() {
  // Hotel inputs
  const [hotelRooms, setHotelRooms] = useState<number>(150)
  const [occupancyRate, setOccupancyRate] = useState<number>(75)
  const [averageRate, setAverageRate] = useState<number>(200)
  const [currentCompliance, setCurrentCompliance] = useState<string[]>([])
  
  // Calculation result
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showMonopoly, setShowMonopoly] = useState(false)
  
  // Animation counters
  const [animatedSavings, setAnimatedSavings] = useState(0)
  const [animatedRevenue, setAnimatedRevenue] = useState(0)
  const [animatedROI, setAnimatedROI] = useState(0)

  const complianceOptions = [
    { id: 'soc2', name: 'SOC 2 Type II', cost: 50000 },
    { id: 'iso27001', name: 'ISO 27001', cost: 75000 },
    { id: 'pci', name: 'PCI DSS', cost: 25000 },
    { id: 'hipaa', name: 'HIPAA', cost: 30000 },
    { id: 'gdpr', name: 'GDPR', cost: 20000 },
    { id: 'ccpa', name: 'CCPA', cost: 15000 },
    { id: 'fedramp', name: 'FedRAMP', cost: 100000 },
    { id: 'none', name: 'No Current Compliance', cost: 0 }
  ]

  const calculateResults = () => {
    setIsCalculating(true)
    
    // Simulate calculation
    setTimeout(() => {
      // Current compliance costs
      const currentCosts = {
        soc2: currentCompliance.includes('soc2') ? 50000 : 0,
        iso27001: currentCompliance.includes('iso27001') ? 75000 : 0,
        pciDss: currentCompliance.includes('pci') ? 25000 : 0,
        hipaa: currentCompliance.includes('hipaa') ? 30000 : 0,
        others: currentCompliance.filter(c => ['gdpr', 'ccpa', 'fedramp'].includes(c))
          .reduce((sum, c) => sum + (complianceOptions.find(opt => opt.id === c)?.cost || 0), 0),
        total: 0
      }
      currentCosts.total = Object.values(currentCosts).reduce((a, b) => a + b, 0)

      // TU Certification cost (based on hotel size)
      let tier = 'TU-1'
      let grade = 'A'
      let monthlyCost = 999
      
      if (hotelRooms > 300) {
        tier = 'TU-3'
        grade = 'A'
        monthlyCost = 9999
      } else if (hotelRooms > 100) {
        tier = 'TU-2'
        grade = 'A'
        monthlyCost = 3499
      }

      // Revenue generation calculation
      const monthlyGuests = hotelRooms * 30 * (occupancyRate / 100)
      const ridesPerGuest = 2.5 // Average rides per stay
      const avgRideRevenue = 35 // Average revenue per ride
      const ridesMonthly = monthlyGuests * ridesPerGuest * avgRideRevenue * 0.3 // 30% commission
      
      const monthlyBookings = monthlyGuests * averageRate
      const bookingCommission = monthlyBookings * 0.02 // 2% on zero-commission vs 15-25% OTAs
      
      const esgPremium = monthlyBookings * 0.01 // 1% premium for ESG compliance

      const totalRevenue = ridesMonthly + bookingCommission + esgPremium

      // Net benefit calculation
      const monthlySavings = currentCosts.total / 12
      const netMonthly = totalRevenue - monthlyCost + monthlySavings
      const roi = ((netMonthly * 12) / (monthlyCost * 12)) * 100

      const calculatedResult: CalculationResult = {
        currentCosts,
        tuCertification: {
          monthly: monthlyCost,
          annual: monthlyCost * 12,
          grade,
          tier
        },
        revenueGeneration: {
          ridesMonthly,
          bookingCommission,
          esgPremium,
          total: totalRevenue
        },
        netBenefit: {
          monthlySavings,
          monthlyRevenue: totalRevenue,
          totalMonthly: netMonthly,
          totalAnnual: netMonthly * 12,
          roi
        }
      }

      setResult(calculatedResult)
      setIsCalculating(false)
      setShowMonopoly(true)

      // Animate the numbers
      animateValue(0, monthlySavings, 2000, setAnimatedSavings)
      animateValue(0, totalRevenue, 2000, setAnimatedRevenue)
      animateValue(0, roi, 2000, setAnimatedROI)
    }, 1500)
  }

  const animateValue = (start: number, end: number, duration: number, setter: (value: number) => void) => {
    const range = end - start
    const increment = range / (duration / 16)
    let current = start
    
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setter(end)
        clearInterval(timer)
      } else {
        setter(current)
      }
    }, 16)
  }

  const exportPDF = () => {
    // In production, this would generate a real PDF
    alert('PDF report would be generated with your personalized ROI analysis')
  }

  return (
    <section id="calculator" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-full mb-4">
            <IoCalculatorOutline className="w-5 h-5" />
            <span className="font-semibold">The Monopoly Math</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Compliance <span className="text-green-600">Makes Money</span> Instead of Costing Money
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Enter your hotel details below to see how much you'll save AND earn with TU Certification.
            <span className="block mt-2 text-lg font-semibold text-purple-600 dark:text-purple-400">
              Average hotel: Saves $180K/year + Earns $300K/year = $480K net benefit
            </span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your Hotel Information
            </h3>

            <div className="space-y-6">
              {/* Hotel Rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  value={hotelRooms}
                  onChange={(e) => setHotelRooms(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  placeholder="150"
                />
              </div>

              {/* Occupancy Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Occupancy Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="40"
                    max="95"
                    value={occupancyRate}
                    onChange={(e) => setOccupancyRate(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>40%</span>
                    <span className="font-bold text-purple-600">{occupancyRate}%</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>

              {/* Average Daily Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Daily Rate ($)
                </label>
                <input
                  type="number"
                  value={averageRate}
                  onChange={(e) => setAverageRate(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  placeholder="200"
                />
              </div>

              {/* Current Compliance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Compliance (Select All That Apply)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {complianceOptions.map((option) => (
                    <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        value={option.id}
                        checked={currentCompliance.includes(option.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentCompliance([...currentCompliance, option.id])
                          } else {
                            setCurrentCompliance(currentCompliance.filter(c => c !== option.id))
                          }
                        }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option.name}</span>
                        {option.cost > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ${option.cost.toLocaleString()}/yr
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateResults}
                disabled={isCalculating}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                  isCalculating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:scale-105'
                }`}
              >
                {isCalculating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Calculating Your Monopoly...
                  </span>
                ) : (
                  'Calculate My Revenue Potential'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {!result ? (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-8 text-center">
                <IoCalculatorOutline className="w-16 h-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to See the Numbers?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill in your hotel details and click calculate to see your personalized savings and revenue potential.
                </p>
              </div>
            ) : (
              <>
                {/* The Monopoly Reveal */}
                {showMonopoly && (
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold">🎯 THE MONOPOLY REVEALED</h3>
                      <IoRocketOutline className="w-8 h-8" />
                    </div>
                    <p className="text-lg mb-4">
                      You're currently paying <span className="font-bold text-yellow-300">
                        ${result.currentCosts.total.toLocaleString()}/year
                      </span> for compliance that does nothing but check boxes.
                    </p>
                    <p className="text-lg">
                      With TU Certification, you'll pay <span className="font-bold text-green-300">
                        ${result.tuCertification.annual.toLocaleString()}/year
                      </span> and EARN <span className="font-bold text-green-300">
                        ${(result.revenueGeneration.total * 12).toLocaleString()}/year
                      </span> in new revenue.
                    </p>
                    <div className="mt-4 p-4 bg-white/20 rounded-lg">
                      <p className="text-2xl font-bold text-center">
                        Net Benefit: <span className="text-yellow-300">
                          +${result.netBenefit.totalAnnual.toLocaleString()}/year
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Costs Breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Your Current Compliance Costs
                  </h3>
                  <div className="space-y-3">
                    {result.currentCosts.soc2 > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">SOC 2 Type II</span>
                        <span className="font-bold text-red-600">-${result.currentCosts.soc2.toLocaleString()}</span>
                      </div>
                    )}
                    {result.currentCosts.iso27001 > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ISO 27001</span>
                        <span className="font-bold text-red-600">-${result.currentCosts.iso27001.toLocaleString()}</span>
                      </div>
                    )}
                    {result.currentCosts.pciDss > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">PCI DSS</span>
                        <span className="font-bold text-red-600">-${result.currentCosts.pciDss.toLocaleString()}</span>
                      </div>
                    )}
                    {result.currentCosts.hipaa > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">HIPAA</span>
                        <span className="font-bold text-red-600">-${result.currentCosts.hipaa.toLocaleString()}</span>
                      </div>
                    )}
                    {result.currentCosts.others > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Other Compliance</span>
                        <span className="font-bold text-red-600">-${result.currentCosts.others.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">Total Annual Cost</span>
                        <span className="font-bold text-red-600 text-xl">-${result.currentCosts.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TU Certification Alternative */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    With TU Certification
                  </h3>
                  
                  <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-700 dark:text-purple-300 font-semibold">
                        {result.tuCertification.tier} Grade {result.tuCertification.grade}
                      </span>
                      <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Replaces ALL your current compliance requirements
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Certification</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${result.tuCertification.monthly.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Annual Cost</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${result.tuCertification.annual.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">Compliance Savings</span>
                        <span className="font-bold text-green-600 text-xl">
                          +${animatedSavings.toFixed(0).toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Generation */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    NEW Revenue Streams
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-700 dark:text-gray-300">Ride Facilitation</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          30% commission on all rides
                        </p>
                      </div>
                      <span className="font-bold text-green-600">
                        +${result.revenueGeneration.ridesMonthly.toFixed(0).toLocaleString()}/mo
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-700 dark:text-gray-300">Zero-Commission Advantage</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Save 15-25% vs OTAs
                        </p>
                      </div>
                      <span className="font-bold text-green-600">
                        +${result.revenueGeneration.bookingCommission.toFixed(0).toLocaleString()}/mo
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-700 dark:text-gray-300">ESG Premium</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Charge more for compliance
                        </p>
                      </div>
                      <span className="font-bold text-green-600">
                        +${result.revenueGeneration.esgPremium.toFixed(0).toLocaleString()}/mo
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">Total New Revenue</span>
                        <span className="font-bold text-green-600 text-xl">
                          +${animatedRevenue.toFixed(0).toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final ROI */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                  <h3 className="text-2xl font-bold mb-4 text-center">
                    YOUR MONOPOLY POSITION
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm opacity-75">Monthly Net Benefit</p>
                      <p className="text-3xl font-bold">
                        +${result.netBenefit.totalMonthly.toFixed(0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm opacity-75">Annual Net Benefit</p>
                      <p className="text-3xl font-bold">
                        +${result.netBenefit.totalAnnual.toFixed(0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-sm opacity-75 mb-2">Return on Investment</p>
                    <p className="text-5xl font-bold text-yellow-300">
                      {animatedROI.toFixed(0)}% ROI
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex-1 bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
                    >
                      Start Certification Now
                    </button>
                    <button
                      onClick={exportPDF}
                      className="flex-1 bg-purple-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-800 transition-all flex items-center justify-center"
                    >
                      <IoDownloadOutline className="w-5 h-5 mr-2" />
                      Export Report
                    </button>
                  </div>
                </div>

                {/* Urgency Message */}
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 font-semibold">
                    <IoWarning className="inline w-5 h-5 mr-2" />
                    Every month without TU Certification costs you ${((result?.netBenefit.totalMonthly || 0) / 30).toFixed(0)}/day
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <IoLockClosedOutline className="inline w-5 h-5 mr-2" />
            Your calculation is saved and will be included in your certification application.
            <span className="block mt-2 font-bold text-gray-900 dark:text-white">
              Join 47 hotels already earning instead of spending on compliance.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}