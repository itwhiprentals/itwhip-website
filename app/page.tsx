'use client'

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Header from './components/Header'
import LiveTicker from './components/LiveTicker'
import Footer from './components/Footer'
import Modals from './components/Modals'

// Critical components loaded immediately
import {
  HeroSection,
  CompareSection,
  DriveSection,
  HowItWorksSection
} from './components/Sections'

// Lazy load heavy sections for better performance
const FlightIntelligenceSection = lazy(() => 
  import('./components/Sections').then(mod => ({ 
    default: mod.FlightIntelligenceSection 
  }))
)
const SurgePredictionSection = lazy(() => 
  import('./components/Sections').then(mod => ({ 
    default: mod.SurgePredictionSection 
  }))
)
const GroupCoordinationSection = lazy(() => 
  import('./components/Sections').then(mod => ({ 
    default: mod.GroupCoordinationSection 
  }))
)

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

// Loading fallback component
const SectionLoader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-pulse text-gray-500 dark:text-gray-400">
      Loading section...
    </div>
  </div>
)

export default function HomePage() {
  // Core state
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Visibility state for lazy loading
  const [visibleSections, setVisibleSections] = useState({
    flight: false,
    surge: false,
    group: false
  })
  
  // Live data state
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0)
  const [flightPredictions] = useState<FlightPrediction[]>(initialFlightPredictions)
  const [trafficRoutes] = useState<TrafficRoute[]>(initialTrafficRoutes)
  const [surgePredictions, setSurgePredictions] = useState<SurgePrediction[]>([])
  const [driversPositioned] = useState<DriverPosition[]>(initialDriversPositioned)
  const [currentUberSurge, setCurrentUberSurge] = useState(1.0)
  const [nextSurgeTime, setNextSurgeTime] = useState<Date | null>(null)
  const [totalSavings, setTotalSavings] = useState(47892)
  const [flightsTracked, setFlightsTracked] = useState(1247)
  
  // UI state
  const [showAppModal, setShowAppModal] = useState(false)
  
  // Group coordination state
  const [groupMembers] = useState<GroupMember[]>(initialGroupMembers)

  // Memoized dynamic pricing to prevent recalculation
  const dynamicPrices = useMemo<DynamicPrices>(() => 
    calculateDynamicPrice(currentUberSurge), 
    [currentUberSurge]
  )

  // Memoized ticker items to prevent recreation on every render
  const liveTickerItems = useMemo<LiveTickerItem[]>(() => [
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
  ], [currentUberSurge, dynamicPrices])

  // Dark mode setup with error handling
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDarkMode(mediaQuery.matches)
      
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark')
        }
      }
      
      const handler = (e: MediaQueryListEvent) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (!localStorage.getItem('theme')) {
            setIsDarkMode(e.matches)
          }
        }
      }
      
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } catch (error) {
      console.error('Error setting up dark mode:', error)
      setIsDarkMode(true)
    }
  }, [])

  // Apply theme class
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  // Memoized toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      } catch (error) {
        console.error('Error saving theme:', error)
      }
    }
  }, [isDarkMode])

  // Optimized time until surge calculation
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

  // Optimized initialization with reduced intervals
  useEffect(() => {
    try {
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

      // OPTIMIZED: Update time only every 10 seconds when visible
      const timeInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          setCurrentTime(new Date())
        }
      }, 10000) // Reduced from 1 second to 10 seconds

      // Update ticker
      const tickerInterval = setInterval(() => {
        setCurrentTickerIndex(prev => (prev + 1) % 4)
      }, 5000)

      // OPTIMIZED: Single combined interval for all updates
      const dataUpdateInterval = setInterval(() => {
        // Update surge
        const hour = new Date().getHours()
        let baseSurge = 1.0
        
        if ((hour >= 15 && hour <= 18) || (hour >= 6 && hour <= 9)) {
          baseSurge = 2.0 + Math.random() * 1.5
        } else if (hour >= 12 && hour <= 14) {
          baseSurge = 1.3 + Math.random() * 0.7
        }
        
        setCurrentUberSurge(Math.round(baseSurge * 10) / 10)
        
        // Update stats
        setFlightsTracked(prev => prev + Math.floor(Math.random() * 5))
        setTotalSavings(prev => prev + Math.floor(Math.random() * 150))
        
        // Update surge predictions occasionally
        if (Math.random() > 0.9) {
          const newPredictions = generateSurgePredictions()
          setSurgePredictions(newPredictions)
        }
      }, 30000) // Single interval for all updates

      // Cleanup
      return () => {
        clearInterval(timeInterval)
        clearInterval(tickerInterval)
        clearInterval(dataUpdateInterval)
      }
    } catch (error) {
      console.error('Error initializing app:', error)
    }
  }, [])

  // Intersection Observer for lazy loading sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section')
            if (sectionId) {
              setVisibleSections(prev => ({
                ...prev,
                [sectionId]: true
              }))
            }
          }
        })
      },
      { 
        rootMargin: '100px',
        threshold: 0.1 
      }
    )

    // Observe section placeholders
    const placeholders = document.querySelectorAll('[data-section]')
    placeholders.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Memoized handlers
  const handleSearchClick = useCallback(() => {
    setShowAppModal(true)
  }, [])

  const handleGetAppClick = useCallback(() => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }, [])

  // Loading state (removed since we set it to false initially)
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

      {/* Critical above-the-fold sections loaded immediately */}
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

      {/* Lazy loaded sections - only load when user scrolls near them */}
      <div data-section="flight" className="min-h-[100px]">
        {visibleSections.flight && (
          <Suspense fallback={<SectionLoader />}>
            <FlightIntelligenceSection
              flightPredictions={flightPredictions}
              trafficRoutes={trafficRoutes}
              dynamicPrices={dynamicPrices}
            />
          </Suspense>
        )}
      </div>

      <div data-section="surge" className="min-h-[100px]">
        {visibleSections.surge && (
          <Suspense fallback={<SectionLoader />}>
            <SurgePredictionSection
              surgePredictions={surgePredictions}
            />
          </Suspense>
        )}
      </div>

      <div data-section="group" className="min-h-[100px]">
        {visibleSections.group && (
          <Suspense fallback={<SectionLoader />}>
            <GroupCoordinationSection
              groupMembers={groupMembers}
              handleSearchClick={handleSearchClick}
            />
          </Suspense>
        )}
      </div>

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
              <span className="text-xs md:text-sm font-bold text-white">
                SURGE: {currentUberSurge}x
              </span>
            </div>
            <span className="text-xs md:text-sm text-blue-100 hidden sm:block">
              Next: {timeUntilSurge}
            </span>
          </div>
          <button 
            onClick={handleSearchClick}
            className="px-4 md:px-6 py-1.5 md:py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition text-xs md:text-sm shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
              />
            </svg>
            <span>View Options</span>
          </button>
        </div>
      </div>
    </main>
  )
}