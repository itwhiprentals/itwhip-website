'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from './components/Header'
import LiveTicker from './components/LiveTicker'
import Footer from './components/Footer'
import Modals from './components/Modals'
import {
  HeroSection,
  CompareSection,
  DriveSection,
  HowItWorksSection,
  FlightIntelligenceSection,
  SurgePredictionSection,
  GroupCoordinationSection
} from './components/Sections'
import { 
  initialFlightPredictions,
  initialTrafficRoutes,
  initialDriversPositioned,
  initialGroupMembers,
  compareOptions
} from './utils/constants'
import { 
  calculateDynamicPrice,
  generateSurgePredictions,
  getTickerBgColor,
  getStatusColor 
} from './utils/helpers'
import type {
  LiveTickerItem,
  FlightPrediction,
  TrafficRoute,
  SurgePrediction,
  DriverPosition,
  GroupMember,
  DynamicPrices
} from './types'

export default function HomePage() {
  // Core state
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Live data state
  const [liveTickerItems, setLiveTickerItems] = useState<LiveTickerItem[]>([])
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0)
  const [flightPredictions, setFlightPredictions] = useState<FlightPrediction[]>(initialFlightPredictions)
  const [trafficRoutes, setTrafficRoutes] = useState<TrafficRoute[]>(initialTrafficRoutes)
  const [surgePredictions, setSurgePredictions] = useState<SurgePrediction[]>([])
  const [driversPositioned, setDriversPositioned] = useState<DriverPosition[]>(initialDriversPositioned)
  const [currentUberSurge, setCurrentUberSurge] = useState(1.0)
  const [nextSurgeTime, setNextSurgeTime] = useState<Date | null>(null)
  const [totalSavings, setTotalSavings] = useState(47892)
  const [flightsTracked, setFlightsTracked] = useState(1247)
  
  // UI state
  const [showAppModal, setShowAppModal] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  
  // Dynamic pricing state
  const [dynamicPrices, setDynamicPrices] = useState<DynamicPrices>({
    itwhip: 29,
    competitorMin: 45,
    competitorMax: 67,
    savings: 25
  })

  // Group coordination state
  const [groupMembers] = useState<GroupMember[]>(initialGroupMembers)

  // Dark mode effect
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)
    
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
    
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches)
      }
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  // Calculate time until surge
  const timeUntilSurge = useMemo(() => {
    if (!nextSurgeTime) return 'Calculating...'
    const diff = nextSurgeTime.getTime() - currentTime.getTime()
    if (diff <= 0) return 'NOW'
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60)
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [currentTime, nextSurgeTime])

  // Initialize all data and intervals
  useEffect(() => {
    // Generate initial surge predictions
    const predictions = generateSurgePredictions()
    setSurgePredictions(predictions)
    
    // Set next surge time
    const nextSurge = predictions.find(p => p.multiplier > 1.5)
    if (nextSurge) {
      const [time, period] = nextSurge.time.split(' ')
      const [hours, minutes] = time.split(':')
      const nextSurgeDate = new Date()
      let hour = parseInt(hours)
      if (period === 'PM' && hour !== 12) hour += 12
      if (period === 'AM' && hour === 12) hour = 0
      nextSurgeDate.setHours(hour)
      nextSurgeDate.setMinutes(parseInt(minutes))
      setNextSurgeTime(nextSurgeDate)
    }

    // Update current time
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Update ticker
    const tickerInterval = setInterval(() => {
      setCurrentTickerIndex(prev => (prev + 1) % 4)
    }, 5000)

    // Regenerate surge predictions
    const surgeInterval = setInterval(() => {
      const newPredictions = generateSurgePredictions()
      setSurgePredictions(newPredictions)
    }, 300000) // Every 5 minutes

    // Simulate surge changes
    const surgeSimulation = setInterval(() => {
      const hour = new Date().getHours()
      let baseSurge = 1.0
      
      if ((hour >= 15 && hour <= 18) || (hour >= 6 && hour <= 9)) {
        baseSurge = 2.0 + Math.random() * 1.5
      } else if (hour >= 12 && hour <= 14) {
        baseSurge = 1.3 + Math.random() * 0.7
      }
      
      setCurrentUberSurge(Math.round(baseSurge * 10) / 10)
    }, 30000) // Every 30 seconds

    // Update stats
    const statsInterval = setInterval(() => {
      setFlightsTracked(prev => prev + Math.floor(Math.random() * 3))
      setTotalSavings(prev => prev + Math.floor(Math.random() * 100))
    }, 10000) // Every 10 seconds

    setIsLoading(false)

    // Cleanup
    return () => {
      clearInterval(timeInterval)
      clearInterval(tickerInterval)
      clearInterval(surgeInterval)
      clearInterval(surgeSimulation)
      clearInterval(statsInterval)
    }
  }, [])

  // Update dynamic pricing when surge changes
  useEffect(() => {
    const prices = calculateDynamicPrice(currentUberSurge)
    setDynamicPrices(prices)
  }, [currentUberSurge])

  // Update ticker items when prices change
  useEffect(() => {
    const updatedTickers: LiveTickerItem[] = [
      {
        id: '1',
        type: 'surge',
        message: `SURGE ALERT: ${currentUberSurge}x active at airport | Independent drivers: $${dynamicPrices.itwhip} (Save ~$${dynamicPrices.savings})`,
        severity: 'critical',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'flight',
        message: `Market surge detected: Typical fare $${dynamicPrices.competitorMin}-${dynamicPrices.competitorMax} | Platform rate: $${dynamicPrices.itwhip}`,
        severity: 'warning',
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'traffic',
        message: 'I-10 ACCIDENT | Smart routing active - avoiding delays',
        severity: 'warning',
        timestamp: new Date()
      },
      {
        id: '4',
        type: 'weather',
        message: `Peak pricing detected | Others surging to ${currentUberSurge}x | Independent drivers stay fair at $${dynamicPrices.itwhip}`,
        severity: 'critical',
        timestamp: new Date()
      }
    ]
    
    setLiveTickerItems(updatedTickers)
  }, [dynamicPrices, currentUberSurge])

  // Handlers
  const handleSearchClick = () => {
    setShowAppModal(true)
  }

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ItWhip Intelligence
          </div>
          <div className="text-gray-600 dark:text-gray-400">Loading live data...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />
      
      <LiveTicker
        items={liveTickerItems}
        currentIndex={currentTickerIndex}
        currentTime={currentTime}
      />

      <HeroSection
        handleSearchClick={handleSearchClick}
        flightsTracked={flightsTracked}
        totalSavings={totalSavings}
        driversPositioned={driversPositioned}
        timeUntilSurge={timeUntilSurge}
      />

      <CompareSection
        compareOptions={compareOptions}
      />

      <DriveSection
        handleSearchClick={handleSearchClick}
      />

      <HowItWorksSection />

      <FlightIntelligenceSection
        flightPredictions={flightPredictions}
        trafficRoutes={trafficRoutes}
        dynamicPrices={dynamicPrices}
      />

      <SurgePredictionSection
        surgePredictions={surgePredictions}
      />

      <GroupCoordinationSection
        groupMembers={groupMembers}
        handleSearchClick={handleSearchClick}
      />

      <Footer
        handleSearchClick={handleSearchClick}
        handleGetAppClick={handleGetAppClick}
      />

      <Modals
        showAppModal={showAppModal}
        setShowAppModal={setShowAppModal}
        handleGetAppClick={handleGetAppClick}
      />

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 w-full bg-gradient-to-r from-blue-600 to-blue-700 py-2 md:py-3 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm font-bold text-white">SURGE: {currentUberSurge}x</span>
            </div>
            <span className="text-xs md:text-sm text-blue-100 hidden sm:block">Next: {timeUntilSurge}</span>
          </div>
          <button 
            onClick={handleSearchClick}
            className="px-4 md:px-6 py-1.5 md:py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition text-xs md:text-sm shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span>View Options</span>
          </button>
        </div>
      </div>
    </main>
  )
}