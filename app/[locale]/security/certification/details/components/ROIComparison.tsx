// app/security/certification/details/components/ROIComparison.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoCalculatorOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAnalyticsOutline,
  IoDocumentTextOutline,
  IoCarOutline,
  IoLeafOutline,
  IoShieldCheckmarkOutline,
  IoTimerOutline,
  IoArrowForwardOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function ROIComparison() {
  // Hotel configuration
  const [hotelSize, setHotelSize] = useState<'small' | 'medium' | 'large' | 'enterprise'>('medium')
  const [occupancyRate, setOccupancyRate] = useState(70)
  const [averageRate, setAverageRate] = useState(150)
  const [currentCompliance, setCurrentCompliance] = useState<string[]>(['SOC 2', 'PCI DSS'])
  const [includeTransportation, setIncludeTransportation] = useState(true)
  const [includeESG, setIncludeESG] = useState(true)
  
  // Calculated values
  const [traditionalCost, setTraditionalCost] = useState(0)
  const [tuInvestment, setTUInvestment] = useState(0)
  const [tuRevenue, setTURevenue] = useState(0)
  const [netBenefit, setNetBenefit] = useState(0)
  const [paybackPeriod, setPaybackPeriod] = useState(0)
  const [fiveYearROI, setFiveYearROI] = useState(0)

  const hotelSizes = {
    small: { rooms: 50, label: '< 100 rooms', multiplier: 0.5 },
    medium: { rooms: 200, label: '100-300 rooms', multiplier: 1 },
    large: { rooms: 400, label: '300-500 rooms', multiplier: 1.5 },
    enterprise: { rooms: 800, label: '500+ rooms', multiplier: 2.5 }
  }

  const complianceCosts = {
    'SOC 2': 65000,
    'ISO 27001': 50000,
    'PCI DSS': 35000,
    'HIPAA': 45000,
    'Manual ESG': 60000,
    'Auditor Fees': 40000
  }

  const tuPricing = {
    small: { monthly: 1500, setup: 0 },
    medium: { monthly: 4500, setup: 0 },
    large: { monthly: 7500, setup: 0 },
    enterprise: { monthly: 12500, setup: 0 }
  }

  const transportationRevenue = {
    small: { monthly: 15000, rides: 450 },
    medium: { monthly: 45000, rides: 1350 },
    large: { monthly: 75000, rides: 2250 },
    enterprise: { monthly: 125000, rides: 3750 }
  }

  const esgRevenue = {
    carbonCredits: { small: 5000, medium: 15000, large: 25000, enterprise: 50000 },
    greenPremium: 0.12, // 12% ADR increase for green bookings
    corporateContracts: { small: 150000, medium: 450000, large: 750000, enterprise: 1500000 },
    energySavings: 0.23, // 23% reduction in energy costs
    insuranceDiscount: 0.4 // 40% insurance discount
  }

  useEffect(() => {
    calculateROI()
  }, [hotelSize, occupancyRate, averageRate, currentCompliance, includeTransportation, includeESG])

  const calculateROI = () => {
    // Traditional compliance costs
    const annualCompliance = currentCompliance.reduce((total, cert) => {
      return total + (complianceCosts[cert as keyof typeof complianceCosts] || 0)
    }, 0)
    const staffTime = 50000 // Estimated staff time cost
    const totalTraditional = annualCompliance + staffTime
    setTraditionalCost(totalTraditional)

    // TU Investment
    const monthlyTU = tuPricing[hotelSize].monthly
    const annualTU = monthlyTU * 12
    setTUInvestment(annualTU)

    // TU Revenue
    let revenue = 0
    
    // Transportation revenue
    if (includeTransportation) {
      revenue += transportationRevenue[hotelSize].monthly * 12
    }

    // ESG revenue
    if (includeESG) {
      // Carbon credits
      revenue += esgRevenue.carbonCredits[hotelSize] * 12
      
      // Green booking premium
      const roomsPerYear = hotelSizes[hotelSize].rooms * 365 * (occupancyRate / 100)
      const greenBookings = roomsPerYear * 0.3 // 30% choose green option
      revenue += greenBookings * averageRate * esgRevenue.greenPremium
      
      // Corporate contracts
      revenue += esgRevenue.corporateContracts[hotelSize]
      
      // Energy savings (calculated as avoided cost)
      const energyCost = hotelSizes[hotelSize].rooms * 2000 // $2000 per room average energy
      revenue += energyCost * esgRevenue.energySavings
      
      // Insurance savings
      const insuranceCost = hotelSizes[hotelSize].rooms * 500 // $500 per room average
      revenue += insuranceCost * esgRevenue.insuranceDiscount
    }

    setTURevenue(Math.round(revenue))

    // Net benefit
    const benefit = revenue - annualTU + totalTraditional
    setNetBenefit(Math.round(benefit))

    // Payback period (months)
    const monthlyBenefit = benefit / 12
    const payback = annualTU / monthlyBenefit
    setPaybackPeriod(Math.round(payback * 10) / 10)

    // 5-year ROI
    const fiveYearBenefit = benefit * 5
    const fiveYearInvestment = annualTU * 5
    const roi = ((fiveYearBenefit - fiveYearInvestment) / fiveYearInvestment) * 100
    setFiveYearROI(Math.round(roi))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Calculator Configuration */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Configure Your Hotel Profile
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hotel Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Hotel Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(hotelSizes).map(([key, size]) => (
                <button
                  key={key}
                  onClick={() => setHotelSize(key as typeof hotelSize)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    hotelSize === key
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {size.label}
                  </p>
                  <p className="text-xs text-gray-500">{size.rooms} rooms avg</p>
                </button>
              ))}
            </div>
          </div>

          {/* Current Compliance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Current Compliance Costs
            </label>
            <div className="space-y-2">
              {Object.entries(complianceCosts).slice(0, 4).map(([cert, cost]) => (
                <label key={cert} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentCompliance.includes(cert)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCurrentCompliance([...currentCompliance, cert])
                      } else {
                        setCurrentCompliance(currentCompliance.filter(c => c !== cert))
                      }
                    }}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {cert} ({formatCurrency(cost)}/year)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Occupancy Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Average Occupancy Rate: {occupancyRate}%
            </label>
            <input
              type="range"
              min="40"
              max="95"
              value={occupancyRate}
              onChange={(e) => setOccupancyRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>40%</span>
              <span>95%</span>
            </div>
          </div>

          {/* Average Daily Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Average Daily Rate (ADR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={averageRate}
                onChange={(e) => setAverageRate(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800"
                min="50"
                max="1000"
              />
            </div>
          </div>

          {/* Revenue Modules */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              TU Revenue Modules
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeTransportation}
                  onChange={(e) => setIncludeTransportation(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Transportation Revenue
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeESG}
                  onChange={(e) => setIncludeESG(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  ESG Monetization
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Results */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Traditional Compliance Cost */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Traditional Compliance</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {formatCurrency(traditionalCost)}
              </p>
            </div>
            <IoTrendingDownOutline className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Annual cost with zero revenue
          </p>
        </div>

        {/* TU Investment */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">TU Certification</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {formatCurrency(tuInvestment)}
              </p>
            </div>
            <IoShieldCheckmarkOutline className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Annual investment
          </p>
        </div>

        {/* TU Revenue */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Revenue Generated</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                +{formatCurrency(tuRevenue)}
              </p>
            </div>
            <IoTrendingUpOutline className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Annual revenue from TU
          </p>
        </div>
      </div>

      {/* Net Benefit Highlight */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm font-semibold opacity-90 mb-2">Net Annual Benefit</p>
            <p className="text-4xl font-bold">
              +{formatCurrency(netBenefit)}
            </p>
            <p className="text-xs opacity-75 mt-1">vs traditional compliance</p>
          </div>
          <div>
            <p className="text-sm font-semibold opacity-90 mb-2">Payback Period</p>
            <p className="text-4xl font-bold">
              {paybackPeriod} months
            </p>
            <p className="text-xs opacity-75 mt-1">to recover investment</p>
          </div>
          <div>
            <p className="text-sm font-semibold opacity-90 mb-2">5-Year ROI</p>
            <p className="text-4xl font-bold">
              {fiveYearROI}%
            </p>
            <p className="text-xs opacity-75 mt-1">return on investment</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          TU Revenue Breakdown
        </h3>
        
        <div className="space-y-4">
          {includeTransportation && (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <IoCarOutline className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Transportation Revenue</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transportationRevenue[hotelSize].rides} rides/month @ 15% commission
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-green-600">
                +{formatCurrency(transportationRevenue[hotelSize].monthly * 12)}
              </p>
            </div>
          )}
          
          {includeESG && (
            <>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <IoLeafOutline className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">ESG & Carbon Credits</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monetized sustainability data
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  +{formatCurrency(esgRevenue.carbonCredits[hotelSize] * 12)}
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center">
                  <IoSparklesOutline className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Green Booking Premium</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      12% ADR increase on eco-conscious bookings
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-purple-600">
                  +{formatCurrency(hotelSizes[hotelSize].rooms * 365 * (occupancyRate / 100) * 0.3 * averageRate * 0.12)}
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex items-center">
                  <IoBusinessOutline className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Corporate ESG Contracts</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fortune 500 sustainability requirements
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-indigo-600">
                  +{formatCurrency(esgRevenue.corporateContracts[hotelSize])}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          10-Year Financial Projection
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Traditional Compliance Path
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Year 1</span>
                <span className="font-semibold text-red-600">-{formatCurrency(traditionalCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Year 5</span>
                <span className="font-semibold text-red-600">-{formatCurrency(traditionalCost * 5)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Year 10</span>
                <span className="font-semibold text-red-600">-{formatCurrency(traditionalCost * 10)}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Cost</span>
                  <span className="font-bold text-red-600 text-lg">-{formatCurrency(traditionalCost * 10)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              TU Certification Path
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Year 1</span>
                <span className="font-semibold text-green-600">+{formatCurrency(netBenefit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Year 5</span>
                <span className="font-semibold text-green-600">+{formatCurrency(netBenefit * 5)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Year 10</span>
                <span className="font-semibold text-green-600">+{formatCurrency(netBenefit * 10)}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Benefit</span>
                  <span className="font-bold text-green-600 text-lg">+{formatCurrency(netBenefit * 10)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <p className="text-center text-purple-900 dark:text-purple-100 font-bold text-lg">
            10-Year Advantage with TU: {formatCurrency((netBenefit * 10) + (traditionalCost * 10))}
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center">
        <IoCalculatorOutline className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-4">
          Your Custom ROI Report is Ready
        </h3>
        <p className="text-lg mb-6 opacity-90">
          Based on your configuration, TU Certification will generate {formatCurrency(netBenefit)} 
          in net benefit annually with a payback period of just {paybackPeriod} months.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Download Full ROI Report (PDF)
          </button>
          <button className="px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors">
            Schedule ROI Review Call
          </button>
        </div>
      </div>
    </div>
  )
}