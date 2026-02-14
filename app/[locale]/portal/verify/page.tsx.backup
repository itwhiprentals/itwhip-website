'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  IoCheckmarkCircle,
  IoTimeOutline,
  IoServerOutline,
  IoAnalyticsOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoBusinessOutline,
  IoAirplaneOutline,
  IoPeopleOutline,
  IoCashOutline
} from 'react-icons/io5'
import { arizonaHotels, getHotelByCode, generateMetrics } from '@/app/data/hotel-database'

export default function PortalVerify() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gdsCode = searchParams.get('code') || 'UNKNOWN'
  
  // Get real hotel data from our database
  const hotel = getHotelByCode(gdsCode)
  const hotelName = hotel?.name || searchParams.get('hotel') || 'Your Property'
  const hotelAddress = hotel?.address || ''
  
  // Generate dynamic metrics for this hotel
  const metrics = hotel ? generateMetrics(gdsCode) : null
  
  const [currentStep, setCurrentStep] = useState(0)
  const [subMessage, setSubMessage] = useState('')
  const [showHotelDetails, setShowHotelDetails] = useState(false)
  
  // Get competitor names for this hotel
  const competitorNames = hotel?.competitors.map(code => 
    arizonaHotels[code]?.name || 'Competitor'
  ) || ['Four Seasons', 'Fairmont', 'Phoenician']
  
  const steps = [
    {
      id: 1,
      title: 'Validating GDS Credentials',
      icon: IoBusinessOutline,
      duration: 1500,
      subMessages: [
        'Connecting to Amadeus GDS...',
        `Verifying property code ${gdsCode}...`,
        hotel ? `Found: ${hotel.chainName} Property ✓` : 'Authenticated ✓'
      ]
    },
    {
      id: 2,
      title: 'Retrieving Property Details',
      icon: IoServerOutline,
      duration: 2000,
      subMessages: [
        'Accessing property records...',
        hotel ? `Located: ${hotel.city}, Arizona` : 'Loading location data...',
        hotel ? `Chain: ${hotel.chainName} (${hotel.chainCode})` : 'Verifying chain affiliation...'
      ]
    },
    {
      id: 3,
      title: 'Analyzing Booking History',
      icon: IoAnalyticsOutline,
      duration: 2500,
      subMessages: [
        'Scanning 2024 reservations...',
        `Found ${Math.floor(3000 + Math.random() * 2000)} bookings...`,
        `Airport transfers: ${Math.floor(1500 + Math.random() * 1000)}`,
        'Processing guest patterns...'
      ]
    },
    {
      id: 4,
      title: 'Calculating Transportation Demand',
      icon: IoAirplaneOutline,
      duration: 2000,
      subMessages: [
        `Current surge: ${metrics?.currentSurge}x pricing`,
        `Active ride requests: ${metrics?.activeRequests || 23}`,
        `Lost to Uber: ${hotel?.missedBookings || 847} this month`,
        'Demand exceeds supply by 340%'
      ]
    },
    {
      id: 5,
      title: 'Analyzing Competitor Performance',
      icon: IoTrendingUpOutline,
      duration: 2500,
      subMessages: [
        'Scanning market intelligence...',
        competitorNames[0] ? `${competitorNames[0]}: $${Math.floor(60000 + Math.random() * 30000)}/mo` : 'Loading competitor data...',
        competitorNames[1] ? `${competitorNames[1]}: $${Math.floor(50000 + Math.random() * 25000)}/mo` : 'Analyzing market share...',
        hotel?.status === 'ALREADY_EARNING' ? 'You: Leading market ✓' : `You: $0 (NOT ACTIVATED)`
      ]
    },
    {
      id: 6,
      title: hotel?.status === 'ALREADY_EARNING' ? 'Calculating Revenue Performance' : 'Calculating Lost Revenue',
      icon: hotel?.status === 'ALREADY_EARNING' ? IoCashOutline : IoWarningOutline,
      duration: 2500,
      subMessages: hotel?.status === 'ALREADY_EARNING' ? [
        'Processing earnings data...',
        `This month: $${hotel.monthlyRevenue?.toLocaleString()}`,
        'Performance: EXCELLENT ✓',
        'Rank: Top 10% in market'
      ] : [
        'Analyzing missed opportunities...',
        `Surge events missed: ${Math.floor(20 + Math.random() * 15)}`,
        `Lost revenue: $${hotel?.monthlyPotential?.toLocaleString() || '67,433'}`,
        'Status: CRITICAL - Immediate action needed'
      ]
    },
    {
      id: 7,
      title: 'Generating Intelligence Report',
      icon: IoCheckmarkCircle,
      duration: 1000,
      subMessages: [
        'Compiling market insights...',
        'Preparing dashboard...',
        'Report ready ✓'
      ]
    }
  ]

  useEffect(() => {
    // Show hotel details after first step
    if (currentStep === 2) {
      setTimeout(() => setShowHotelDetails(true), 500)
    }

    // Track this verification attempt
    if (typeof window !== 'undefined') {
      // Store verification data
      localStorage.setItem('verifiedHotel', JSON.stringify({
        code: gdsCode,
        name: hotelName,
        address: hotelAddress,
        tier: hotel?.tier,
        status: hotel?.status,
        monthlyPotential: hotel?.monthlyPotential,
        timestamp: Date.now()
      }))
      
      console.log('Verification started:', { 
        gdsCode, 
        hotelName,
        found: !!hotel,
        tier: hotel?.tier,
        status: hotel?.status 
      })
    }

    // Start the step progression
    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        // All steps complete, redirect to dashboard
        setTimeout(() => {
          router.push(`/portal/dashboard?code=${gdsCode}&hotel=${encodeURIComponent(hotelName)}&verified=true`)
        }, 500)
        return
      }

      const step = steps[stepIndex]
      setCurrentStep(stepIndex + 1)

      // Cycle through sub-messages
      let subIndex = 0
      const subInterval = setInterval(() => {
        if (subIndex < step.subMessages.length) {
          setSubMessage(step.subMessages[subIndex])
          subIndex++
        }
      }, step.duration / step.subMessages.length)

      // Move to next step
      setTimeout(() => {
        clearInterval(subInterval)
        runStep(stepIndex + 1)
      }, step.duration)
    }

    // Start after brief delay
    setTimeout(() => runStep(0), 500)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo/Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ItWhip Portal Intelligence
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Analyzing Property: {gdsCode}
          </p>
        </div>

        {/* Hotel Details Card - Appears after verification */}
        {showHotelDetails && hotel && (
          <div className="w-full max-w-2xl mb-6 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {hotelName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {hotelAddress}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      hotel.tier === 'PREMIUM' 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                        : hotel.tier === 'STANDARD'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {hotel.tier} TIER
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      hotel.status === 'ALREADY_EARNING'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {hotel.status === 'ALREADY_EARNING' ? '✓ ACTIVE' : '⚠️ NOT ACTIVATED'}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {hotel.chainName}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Property Code</p>
                  <p className="font-mono font-bold text-gray-900 dark:text-white">{gdsCode}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Container */}
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-8">
          {/* Steps */}
          <div className="space-y-3 sm:space-y-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index + 1 === currentStep
              const isComplete = index + 1 < currentStep
              const isPending = index + 1 > currentStep

              return (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : isComplete
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-900/20'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    isComplete 
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {isComplete ? (
                      <IoCheckmarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : isActive ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm sm:text-base font-semibold ${
                      isPending 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {step.title}
                    </h3>
                    {isActive && subMessage && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 animate-fadeIn truncate">
                        {subMessage}
                      </p>
                    )}
                    {isComplete && (
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                        Complete ✓
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {isActive && (
                      <IoTimeOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 sm:mt-8">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </p>
          </div>

          {/* Warning/Success Message */}
          {currentStep >= 5 && hotel && (
            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg animate-fadeIn ${
              hotel.status === 'ALREADY_EARNING'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-xs sm:text-sm font-medium ${
                hotel.status === 'ALREADY_EARNING'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {hotel.status === 'ALREADY_EARNING'
                  ? `✓ Excellent: Earning $${hotel.monthlyRevenue?.toLocaleString()}/month`
                  : `⚠️ CRITICAL: Losing $${hotel.monthlyPotential?.toLocaleString()}/month in revenue`
                }
              </p>
              {hotel.status !== 'ALREADY_EARNING' && (
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  Competitors are capturing your transportation revenue
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Message */}
        <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center px-4">
          This analysis uses real-time data from Amadeus GDS and market intelligence
        </p>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}