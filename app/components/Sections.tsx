// app/components/Sections.tsx

'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { 
  IoSearchOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoAirplaneOutline,
  IoAnalyticsOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoPersonOutline,
  IoCarOutline,
  IoConstructOutline,
  IoBasketballOutline,
  IoCloudOutline,
  IoTrendingUpOutline,
  IoBusinessOutline,
  IoCarSportOutline
} from 'react-icons/io5'
import type {
  HeroSectionProps,
  CompareSectionProps,
  DriveSectionProps,
  FlightIntelligenceSectionProps,
  SurgePredictionSectionProps,
  GroupCoordinationSectionProps
} from '../types'
import { 
  howItWorksSteps, 
  driverBenefits,
  driverPromotion,
  patternEvents 
} from '../utils/constants'
import { getStatusColor, getDelayRiskLevel } from '../utils/helpers'

// Enhanced Hero Section Component with Hotel Psychology
export function HeroSection({
  handleSearchClick,
  flightsTracked,
  totalSavings,
  driversPositioned,
  timeUntilSurge
}: HeroSectionProps) {
  // Add rotating subheadlines for psychological impact
  const [subheadlineIndex, setSubheadlineIndex] = useState(0)
  const subheadlines = [
    "Powered by Phoenix's Premier Hotels",
    "Skip the Surge. Every Time.",
    "The Transportation Network Hotels Trust"
  ]

  // Rotate subheadlines every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSubheadlineIndex((prev) => (prev + 1) % subheadlines.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Calculate surge multiplier from time
  const getSurgeMultiplier = (timeStr: string) => {
    // Extract hours from timeUntilSurge (e.g., "2h 47m" -> 2.78)
    const match = timeStr.match(/(\d+)h\s*(\d+)m/)
    if (match) {
      const hours = parseInt(match[1])
      const minutes = parseInt(match[2])
      const totalHours = hours + minutes / 60
      // Simulate surge multiplier based on time until surge
      if (totalHours < 1) return "3.2x"
      if (totalHours < 2) return "2.7x"
      if (totalHours < 3) return "2.1x"
      return "1.8x"
    }
    return "2.5x"
  }

  // Partner logos (mix of real and pending)
  const partnerLogos = [
    { name: "Omni Scottsdale", status: "pending" },
    { name: "The Phoenician", status: "pending" },
    { name: "W Scottsdale", status: "pending" },
    { name: "Four Seasons", status: "pending" },
    { name: "Mastro's", status: "active" },
    { name: "Maple & Ash", status: "active" }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video 
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        <source src="/hero-video.webm" type="video/webm" />
      </video>
      
      {/* Overlay with subtle map pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      
      {/* Subtle animated dots representing rides (hotel psychology) */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
              Your Flight. Your Price.
              <span className="block text-blue-400 mt-2">Your Driver.</span>
            </h1>
            
            {/* Animated Subheadline (Hotel Psychology) */}
            <div className="h-8 relative overflow-hidden">
              <div className="absolute w-full transition-all duration-500 transform"
                style={{
                  transform: `translateY(-${subheadlineIndex * 100}%)`,
                }}>
                {subheadlines.map((text, idx) => (
                  <p key={idx} className="h-8 flex items-center justify-center text-lg text-gray-300">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Search Pill */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Connect with Independent Drivers
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Drivers set their own rates • No surge pricing • Airport specialists
              </p>
            </div>
            <button
              onClick={handleSearchClick}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-6 py-4 
                flex items-center justify-between hover:from-blue-700 hover:to-blue-800 
                transition-all shadow-lg group"
            >
              <div className="flex items-center space-x-3 text-white">
                <IoSearchOutline className="w-6 h-6" />
                <span className="text-lg font-semibold">Where to?</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg text-white">
                <IoCalendarOutline className="w-4 h-4" />
                <span className="text-sm font-medium">Later</span>
              </div>
            </button>
            <div className="text-center text-xs text-gray-400 font-medium tracking-wider uppercase mt-2">
              Flight Intelligence & Driver Connection Platform
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-8">
            <p className="text-base text-gray-200 max-w-2xl mx-auto">
              We predict delays before they happen. Connect you with independent drivers. 
              Always 30-40% less than surge pricing. Platform guaranteed.
            </p>
            {/* Subtle Hotel Hook */}
            <p className="text-xs text-gray-400 mt-2">
              Partner establishments earn from every ride
            </p>
          </div>

          {/* Enhanced Live Stats with Hotel Psychology */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 relative group">
              {/* Live indicator dot */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                {flightsTracked.toLocaleString()}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wider">
                Flights → Phoenix
              </div>
              {/* Hotel psychology: these are potential customers */}
              <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                Avg 127 hotel guests per flight
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 relative group">
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <div className="text-2xl md:text-3xl font-bold text-green-400">
                ${(totalSavings/1000).toFixed(1)}k
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wider">
                Saved vs Surge
              </div>
              {/* Hotel psychology: this could be their revenue */}
              <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                Partners earn 30% of rides
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 relative group">
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                {driversPositioned.filter(d => d.status === 'positioned').length}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wider">
                Luxury Drivers
              </div>
              {/* Hotel psychology: infrastructure ready */}
              <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                Ready to serve hotels
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 relative group">
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <div className="text-2xl md:text-3xl font-bold text-red-400">
                {getSurgeMultiplier(timeUntilSurge)}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wider">
                Next Surge in {timeUntilSurge}
              </div>
              {/* Hotel psychology: ongoing revenue opportunity */}
              <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                Peak earning window
              </div>
            </div>
          </div>

          {/* Partner Trust Bar (Hotel FOMO Generator) */}
          <div className="mb-8">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Trusted by Phoenix's Leading Establishments
              </p>
            </div>
            
            {/* Scrolling Partner Logos */}
            <div className="overflow-hidden relative">
              <div className="flex space-x-8 animate-scroll">
                {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                  <div key={idx} className="flex items-center space-x-2 flex-shrink-0">
                    <IoBusinessOutline className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{partner.name}</span>
                    {partner.status === 'pending' && (
                      <span className="text-[10px] text-gray-500">*</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 text-center mt-2">
              *Partnership pending
            </p>
          </div>

          {/* CTA for Hotels (Subtle but Visible) */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Hotels & Restaurants: 
              <a href="/partner" className="text-blue-400 hover:text-blue-300 ml-1 underline">
                Join 127 partners earning →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
    </section>
  )
}

// Compare Section Component
export function CompareSection({ compareOptions }: CompareSectionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-950 -mt-20 relative z-10">
      <div className="max-w-7xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Compare All Transportation Options
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real-time pricing from all services to Sky Harbor
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-6xl mx-auto border border-gray-200 dark:border-gray-800 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Your Route: Sky Harbor → Scottsdale
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Change Route
            </button>
          </div>

          <div className="space-y-3">
            {compareOptions.map((option, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between 
                  ${option.service === 'Independent Drivers' ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {option.service}
                    </h4>
                    {option.service === 'Independent Drivers' && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        BEST VALUE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {option.time}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {option.price}
                  </div>
                  {option.available ? (
                    <button className={`mt-2 px-4 py-1 rounded-lg text-sm font-medium transition-colors 
                      ${option.service === 'Independent Drivers' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {option.service === 'Independent Drivers' ? 'View Options' : 'Details'}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">Not Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Drive Section Component
export function DriveSection({ handleSearchClick }: DriveSectionProps) {
  return (
    <section className="py-16 px-4 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Drive with ItWhip
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Set your own rates. Choose your rides. Build YOUR business.
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-900 
          rounded-lg p-8 max-w-6xl mx-auto border border-yellow-200 dark:border-yellow-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                First 100 Drivers Special
              </h3>
              <ul className="space-y-2 mb-6">
                {driverBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {driverPromotion.averageEarnings}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Average earnings</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600 dark:text-red-400">
                      {driverPromotion.spotsLeft} spots left
                    </div>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${driverPromotion.percentageFilled}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleSearchClick}
                className="w-full md:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 
                  text-white font-semibold rounded-lg transition"
              >
                Apply to Drive Now
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Already driving for another platform? Get instant approval!
              </p>
            </div>
            
            {/* Phone Mockups */}
            <div className="relative h-[450px] hidden lg:block">
              {[1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className={`absolute ${
                    index === 1 ? 'left-[80px] top-0 rotate-[-5deg] scale-95' :
                    index === 2 ? 'left-[150px] top-[15px] rotate-[3deg] z-10' :
                    'left-[220px] top-[30px] rotate-[8deg] z-20'
                  }`}
                >
                  <div className="relative w-[160px] h-[360px] bg-black rounded-[1.5rem] p-1 shadow-2xl">
                    <div className="absolute top-[35px] left-1/2 transform -translate-x-1/2 w-[70px] h-[18px] bg-black rounded-full" />
                    <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
                      <img 
                        src={`/screenshot${index}.png`}
                        alt={`App Screenshot ${index}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// How It Works Section Component
export function HowItWorksSection() {
  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'airplane':
        return <IoAirplaneOutline className="w-6 h-6" />
      case 'analytics':
        return <IoAnalyticsOutline className="w-6 h-6" />
      case 'people':
        return <IoPeopleOutline className="w-6 h-6" />
      case 'checkmark':
        return <IoCheckmarkCircleOutline className="w-6 h-6" />
      default:
        return null
    }
  }

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            How ItWhip Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Simple, transparent, and driver-friendly platform
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {howItWorksSteps.map((item, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {getIcon(item.iconName)}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300 dark:bg-gray-700 -translate-x-4" />
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full 
                  flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                  {item.step}
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Flight Intelligence Section Component
export function FlightIntelligenceSection({
  flightPredictions,
  trafficRoutes,
  dynamicPrices
}: FlightIntelligenceSectionProps) {
  return (
    <section className="py-20 px-4 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Phoenix Airport Intelligence - FREE
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flights Card */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Incoming Flights</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
            </h3>
            
            <div className="space-y-4">
              {flightPredictions.slice(0, 3).map((flight, idx) => {
                const riskLevel = getDelayRiskLevel(flight.delayProbability)
                return (
                  <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 
                    hover:bg-gray-100 dark:hover:bg-gray-800/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {flight.flightNumber}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{flight.from}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{flight.scheduled}</div>
                        <div 
                          className="text-xs font-medium"
                          style={{ color: riskLevel.color }}
                        >
                          {flight.delayProbability}% delay risk
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                        rounded px-2 py-1 text-red-700 dark:text-red-300">
                        Market: ${Math.round(25 * flight.surgePrediction)}+
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                        rounded px-2 py-1 text-green-700 dark:text-green-300">
                        Platform: ${Math.round(25 * flight.surgePrediction * 0.65)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Traffic Card */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Airport Traffic</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Current</span>
            </h3>
            
            <div className="space-y-4">
              {trafficRoutes.map((route, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900 dark:text-white">{route.route}</div>
                    <div 
                      className="text-sm font-bold uppercase"
                      style={{ color: getStatusColor(route.status) }}
                    >
                      {route.status}
                    </div>
                  </div>
                  
                  {route.delay > 0 && (
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                      +{route.delay} min delay
                    </div>
                  )}
                  
                  {route.alternative && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Alt: {route.alternative}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 
                rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2">
                  <IoWarningOutline className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">Dust storm 3-6 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Surge Prediction Section Component
export function SurgePredictionSection({ surgePredictions }: SurgePredictionSectionProps) {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          6-Hour Surge Forecast
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-12">
          {surgePredictions.map((prediction, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
              rounded-xl p-4 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{prediction.time}</div>
              <div className={`text-2xl font-bold mb-1 ${
                prediction.multiplier > 2 ? 'text-red-600 dark:text-red-400' :
                prediction.multiplier > 1.5 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-green-600 dark:text-green-400'
              }`}>
                {prediction.multiplier}x
              </div>
              <div className="text-xs text-gray-500">{prediction.probability}%</div>
            </div>
          ))}
        </div>

        {/* Pattern Recognition */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pattern Recognition Active</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {patternEvents.map((event, index) => {
              const Icon = event.icon === 'analytics' ? IoAnalyticsOutline :
                          event.icon === 'construct' ? IoConstructOutline :
                          event.icon === 'basketball' ? IoBasketballOutline :
                          IoCloudOutline
              
              return (
                <div key={index} className="flex items-start space-x-2">
                  <Icon className="w-6 h-6" style={{ color: event.color }} />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {event.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// Group Coordination Section Component
export function GroupCoordinationSection({
  groupMembers,
  handleSearchClick
}: GroupCoordinationSectionProps) {
  return (
    <section className="py-20 px-4 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Group Coordination Intelligence
        </h2>
        
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
          rounded-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Bachelor Party Example</h3>
          
          <div className="space-y-4 mb-6">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex justify-between items-center border-b 
                border-gray-200 dark:border-gray-800 pb-2">
                <div className="flex items-center space-x-4">
                  <IoPersonOutline className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Flight {member.flight}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-700 dark:text-gray-300">{member.arrival}</div>
                  <div className="text-xs text-gray-500">Terminal {member.terminal}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
            rounded-lg p-4">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Platform Coordination</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Strategy:</span>
                <span className="text-gray-900 dark:text-white ml-2">Wait for all</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
                <span className="text-gray-900 dark:text-white ml-2">7-seat SUV</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Pickup:</span>
                <span className="text-gray-900 dark:text-white ml-2">Terminal 4</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="text-green-600 dark:text-green-400 ml-2 font-bold">
                  $75 ($25 each)
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={handleSearchClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Group Coordination
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}