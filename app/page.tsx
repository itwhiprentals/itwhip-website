'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  IoSunnyOutline, 
  IoMoonOutline, 
  IoSearchOutline,
  IoCalendarOutline,
  IoCarOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoWarningOutline,
  IoAnalyticsOutline,
  IoConstructOutline,
  IoBasketballOutline,
  IoCloudOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoApple,
  IoLogoGooglePlaystore,
  IoAirplaneOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoShieldOutline,
  IoCodeOutline,
  IoServerOutline,
  IoLayersOutline,
  IoHeadsetOutline
} from 'react-icons/io5'

// Type definitions
interface LiveTickerItem {
  id: string
  type: 'surge' | 'flight' | 'traffic' | 'weather'
  message: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: Date
}

interface FlightPrediction {
  flightNumber: string
  from: string
  scheduled: string
  delayProbability: number
  surgePrediction: number
  status: string
}

interface TrafficRoute {
  route: string
  status: 'clear' | 'moderate' | 'heavy'
  delay: number
  alternative?: string
}

interface SurgePrediction {
  time: string
  multiplier: number
  probability: number
}

interface DriverPosition {
  id: string
  name: string
  terminal: number
  status: 'positioned' | 'enroute' | 'available'
  eta?: number
}

interface GroupMember {
  id: string
  name: string
  flight: string
  arrival: string
  terminal: number
}

interface PriceComparison {
  service: string
  price: string
  time: string
  available: boolean
}

export default function ItWhipHomepage() {
  // Core state
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Live data state
  const [liveTickerItems, setLiveTickerItems] = useState<LiveTickerItem[]>([])
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0)
  const [flightPredictions, setFlightPredictions] = useState<FlightPrediction[]>([])
  const [trafficRoutes, setTrafficRoutes] = useState<TrafficRoute[]>([])
  const [surgePredictions, setSurgePredictions] = useState<SurgePrediction[]>([])
  const [driversPositioned, setDriversPositioned] = useState<DriverPosition[]>([])
  const [currentUberSurge, setCurrentUberSurge] = useState(1.0)
  const [nextSurgeTime, setNextSurgeTime] = useState<Date | null>(null)
  const [totalSavings, setTotalSavings] = useState(47892)
  const [flightsTracked, setFlightsTracked] = useState(1247)
  
  // UI state
  const [showAppModal, setShowAppModal] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  
  // Dynamic pricing state
  const [dynamicPrices, setDynamicPrices] = useState({
    itwhip: 29,
    competitorMin: 45,
    competitorMax: 67,
    savings: 25
  })

  // Group coordination state
  const [groupMembers] = useState<GroupMember[]>([
    { id: '1', name: 'Mike', flight: 'AA123', arrival: '3:45 PM', terminal: 4 },
    { id: '2', name: 'Dave', flight: 'SW456', arrival: '4:15 PM', terminal: 2 },
    { id: '3', name: 'John', flight: 'UA789', arrival: '4:30 PM', terminal: 3 }
  ])

  // Compare all options
  const compareOptions: PriceComparison[] = [
    { service: 'Independent Drivers', price: '$22-28', time: '2-5 min', available: true },
    { service: 'Current Market Rate', price: '$45-67', time: 'Varies', available: true },
    { service: 'Parking (3 days)', price: '$54', time: 'Walk to terminal', available: true },
    { service: 'Shuttle Service', price: '$35', time: '15-20 min wait', available: true },
    { service: 'Rental Car (1 day)', price: '$89', time: '30 min process', available: false },
  ]

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

  // Apply theme class to body
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

  // Calculate dynamic pricing
  const calculateDynamicPrice = useCallback((surge: number, distance: number = 15) => {
    const baseFare = 2.50
    const perMile = 1.50
    const basePrice = baseFare + (distance * perMile)
    const competitorEstimate = basePrice * surge
    let itwhipPrice = competitorEstimate * 0.65
    const driverMinimum = 15
    itwhipPrice = Math.max(itwhipPrice, driverMinimum)
    itwhipPrice = Math.round(itwhipPrice)
    
    return {
      itwhip: itwhipPrice,
      competitorMin: Math.round(competitorEstimate * 0.9),
      competitorMax: Math.round(competitorEstimate * 1.1),
      savings: Math.round(competitorEstimate - itwhipPrice)
    }
  }, [])

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

  // Initialize all data
  useEffect(() => {
    setTrafficRoutes([
      { route: 'I-10 Eastbound', status: 'heavy', delay: 30, alternative: 'Use Loop 202' },
      { route: 'Loop 202', status: 'clear', delay: 0 },
      { route: 'Loop 101', status: 'moderate', delay: 15 },
      { route: 'SR-143', status: 'clear', delay: 0 }
    ])

    setFlightPredictions([
      {
        flightNumber: 'AA123',
        from: 'Dallas (DFW)',
        scheduled: '3:45 PM',
        delayProbability: 67,
        surgePrediction: 2.3,
        status: 'High delay risk - Pattern match'
      },
      {
        flightNumber: 'SW456',
        from: 'Denver (DEN)',
        scheduled: '4:15 PM',
        delayProbability: 15,
        surgePrediction: 1.2,
        status: 'On time'
      },
      {
        flightNumber: 'UA789',
        from: 'Chicago (ORD)',
        scheduled: '4:30 PM',
        delayProbability: 45,
        surgePrediction: 1.8,
        status: 'Moderate delay risk'
      },
      {
        flightNumber: 'DL321',
        from: 'Los Angeles (LAX)',
        scheduled: '5:00 PM',
        delayProbability: 89,
        surgePrediction: 3.1,
        status: 'Delayed - Weather at origin'
      }
    ])

    setDriversPositioned([
      { id: '1', name: 'John S.', terminal: 4, status: 'positioned' },
      { id: '2', name: 'Maria G.', terminal: 3, status: 'positioned' },
      { id: '3', name: 'Mike D.', terminal: 4, status: 'enroute', eta: 5 },
      { id: '4', name: 'Sarah L.', terminal: 2, status: 'positioned' },
      { id: '5', name: 'Tom W.', terminal: 4, status: 'available' }
    ])

    const generateSurgePredictions = () => {
      const now = new Date()
      const predictions: SurgePrediction[] = []
      
      for (let i = 0; i < 6; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000)
        const hour = time.getHours()
        let multiplier = 1.0
        let probability = 50
        
        if ((hour >= 15 && hour <= 18) || (hour >= 6 && hour <= 9)) {
          multiplier = 2.3 + Math.random() * 0.8
          probability = 85
        } else if (hour >= 12 && hour <= 14) {
          multiplier = 1.5 + Math.random() * 0.5
          probability = 65
        }
        
        predictions.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          multiplier: Math.round(multiplier * 10) / 10,
          probability
        })
      }
      
      setSurgePredictions(predictions)
      
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
    }

    generateSurgePredictions()

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const tickerInterval = setInterval(() => {
      setCurrentTickerIndex(prev => (prev + 1) % 4)
    }, 5000)

    const surgeInterval = setInterval(generateSurgePredictions, 300000)

    const surgeSimulation = setInterval(() => {
      const hour = new Date().getHours()
      let baseSurge = 1.0
      
      if ((hour >= 15 && hour <= 18) || (hour >= 6 && hour <= 9)) {
        baseSurge = 2.0 + Math.random() * 1.5
      } else if (hour >= 12 && hour <= 14) {
        baseSurge = 1.3 + Math.random() * 0.7
      }
      
      setCurrentUberSurge(Math.round(baseSurge * 10) / 10)
    }, 30000)

    const statsInterval = setInterval(() => {
      setFlightsTracked(prev => prev + Math.floor(Math.random() * 3))
      setTotalSavings(prev => prev + Math.floor(Math.random() * 100))
    }, 10000)

    setIsLoading(false)

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
  }, [currentUberSurge, calculateDynamicPrice])

  // Update ticker items when prices change
  useEffect(() => {
    const updatedTickers = [
      {
        id: '1',
        type: 'surge' as const,
        message: `SURGE ALERT: ${currentUberSurge}x active at airport | Independent drivers: $${dynamicPrices.itwhip} (Save ~$${dynamicPrices.savings})`,
        severity: 'critical' as const,
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'flight' as const,
        message: `Market surge detected: Typical fare $${dynamicPrices.competitorMin}-${dynamicPrices.competitorMax} | Platform rate: $${dynamicPrices.itwhip}`,
        severity: 'warning' as const,
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'traffic' as const,
        message: 'I-10 ACCIDENT | Smart routing active - avoiding delays',
        severity: 'warning' as const,
        timestamp: new Date()
      },
      {
        id: '4',
        type: 'weather' as const,
        message: `Peak pricing detected | Others surging to ${currentUberSurge}x | Independent drivers stay fair at $${dynamicPrices.itwhip}`,
        severity: 'critical' as const,
        timestamp: new Date()
      }
    ]
    
    setLiveTickerItems(updatedTickers)
  }, [dynamicPrices, currentUberSurge])

  // Handle search pill click and app downloads
  const handleSearchClick = () => {
    setShowAppModal(true)
  }

  // Handle Get App button click - goes to TestFlight
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const getTickerBgColor = (severity: string) => {
    switch(severity) {
      case 'critical': return '#dc2626'
      case 'warning': return '#d97706'
      default: return '#2563eb'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'heavy': return '#ef4444'
      case 'moderate': return '#f59e0b'
      default: return '#10b981'
    }
  }

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
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                ItWhip
              </h1>
              <span className="hidden sm:block text-xs text-gray-600 dark:text-gray-400">Flight Intelligence & Driver Connection Platform</span>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <IoSunnyOutline style={{ fontSize: '1.25rem' }} />
                ) : (
                  <IoMoonOutline style={{ fontSize: '1.25rem' }} />
                )}
              </button>

              {/* Desktop and Mobile buttons */}
              <button 
                onClick={handleGetAppClick}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                Get App
              </button>
              <button 
                onClick={handleSearchClick}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <IoCloseOutline style={{ fontSize: '1.5rem' }} /> : <IoMenuOutline style={{ fontSize: '1.5rem' }} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden py-3 border-t border-gray-200 dark:border-gray-800">
              <button 
                onClick={handleGetAppClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Download App
              </button>
              <button 
                onClick={handleSearchClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Track Flights
              </button>
              <button 
                onClick={handleSearchClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Driver Portal
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Live Ticker */}
      <div 
        className="fixed top-14 md:top-16 w-full py-1.5 md:py-2 z-40 overflow-hidden text-white"
        style={{ backgroundColor: getTickerBgColor(liveTickerItems[currentTickerIndex]?.severity || 'info') }}
      >
        <div className="flex items-center">
          {/* Mobile: Scrolling ticker for long messages */}
          <div className="sm:hidden w-full">
            <div className="flex items-center px-2">
              <span className="text-xs font-bold uppercase tracking-wider mr-2">LIVE</span>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-2"></div>
              <div className="flex-1 overflow-hidden">
                <div className="whitespace-nowrap animate-scroll-left text-xs font-medium">
                  {liveTickerItems[currentTickerIndex]?.message}
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop: Static centered ticker */}
          <div className="hidden sm:flex max-w-7xl mx-auto px-4 w-full items-center justify-between">
            <div className="flex items-center space-x-1 md:space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider">LIVE</span>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 text-center text-xs md:text-sm font-medium mx-2 truncate">
              {liveTickerItems[currentTickerIndex]?.message}
            </div>
            <div className="text-xs opacity-75">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 15s linear infinite;
        }
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hero-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          z-index: 0;
          object-fit: cover;
        }
        @media (max-width: 640px) {
          .hero-video {
            min-width: 100vw;
            min-height: 100vh;
            width: 100vw;
            height: auto;
          }
        }
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.3) 50%,
            rgba(0, 0, 0, 0.6) 85%,
            rgba(0, 0, 0, 0.8) 95%,
            rgba(0, 0, 0, 0.95) 100%
          );
          z-index: 1;
        }
        .dark .hero-overlay {
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.85) 0%,
            rgba(0, 0, 0, 0.5) 50%,
            rgba(0, 0, 0, 0.75) 85%,
            rgba(0, 0, 0, 0.9) 95%,
            rgba(0, 0, 0, 1) 100%
          );
        }
        .hero-fade-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 150px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgb(249, 250, 251) 100%
          );
          z-index: 3;
          pointer-events: none;
        }
        .dark .hero-fade-bottom {
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgb(3, 7, 18) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
        }
      `}</style>

      {/* Hero Section with Video Background */}
      <section className="hero-section">
        {/* Hero Video Background - Plays BEHIND all content */}
        <video 
          className="hero-video"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
        {/* Semi-transparent Overlay for better text readability */}
        <div className="hero-overlay" />
        
        {/* Bottom fade gradient for seamless transition */}
        <div className="hero-fade-bottom" />
        
        {/* Hero Content - All text and buttons ABOVE the video */}
        <div className="hero-content px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-12 md:pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Main Headline - This text appears OVER the video */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 leading-tight drop-shadow-2xl">
                Your Flight. Your Price.
                <span className="block text-blue-400 mt-2 drop-shadow-2xl">Your Driver.</span>
              </h1>
            </div>

            {/* Search Pill with Title - Original from your file */}
            <div className="max-w-2xl mx-auto mb-6 px-2 sm:px-4 md:px-0">
              <div className="text-center mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-white">
                  Connect with Independent Drivers
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Drivers set their own rates • No surge pricing • Airport specialists
                </p>
              </div>
              <button
                onClick={handleSearchClick}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                <div className="flex items-center space-x-2 md:space-x-3 text-white">
                  <IoSearchOutline style={{ fontSize: '1.25rem' }} />
                  <span className="text-base md:text-lg font-semibold">Where to?</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 bg-white/20 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-white">
                  <IoCalendarOutline style={{ fontSize: '0.875rem' }} />
                  <span className="text-xs md:text-sm font-medium">Later</span>
                </div>
              </button>
              <div className="text-center text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-2">
                Flight Intelligence & Driver Connection Platform
              </div>
            </div>

            {/* Subtitle */}
            <div className="text-center mb-8 md:mb-12">
              <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto px-4">
                We predict delays before they happen. Connect you with independent drivers. 
                Always 30-40% less than surge pricing. Platform guaranteed.
              </p>
            </div>

            {/* Live Stats Bar - Smaller on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 sm:mb-8 md:mb-12 px-2 sm:px-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-400">{flightsTracked.toLocaleString()}</div>
                <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider">Flights Tracked</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-green-400">${(totalSavings/1000).toFixed(1)}k</div>
                <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider">Saved vs Surge</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-400">{driversPositioned.filter(d => d.status === 'positioned').length}</div>
                <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider">Drivers Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-red-400">{timeUntilSurge}</div>
                <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider">Next Surge</div>
              </div>
            </div>

            {/* Primary CTAs - Removed per request */}
          </div>
        </div>
      </section>

      {/* Compare All Options Section - NEW */}
      <section className="py-12 md:py-16 px-4 bg-gray-50 dark:bg-gray-950 -mt-12 sm:-mt-16 md:-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto pt-4 sm:pt-6 md:pt-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Compare All Transportation Options
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real-time pricing from all services to Sky Harbor
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 md:p-8 max-w-6xl mx-auto border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Your Route: Sky Harbor → Scottsdale</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Change Route
              </button>
            </div>

            <div className="space-y-3">
              {compareOptions.map((option, index) => (
                <div 
                  key={index} 
                  className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between ${
                    option.service === 'Independent Drivers' ? 'ring-2 ring-blue-500' : ''
                  }`}
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
                      <button className={`mt-2 px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                        option.service === 'Independent Drivers' 
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

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Platform Notice:</strong> Independent drivers set their own competitive rates. 
                Prices shown are typical ranges. ItWhip facilitates connections only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Drive & Earn Section */}
      <section className="py-12 md:py-16 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Drive with ItWhip
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Set your own rates. Choose your rides. Build YOUR business.
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-900 rounded-lg p-6 md:p-8 max-w-6xl mx-auto border border-yellow-200 dark:border-yellow-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left side - Content */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  First 100 Drivers Special
                </h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start space-x-2">
                    <IoCheckmarkCircle style={{ fontSize: '1rem', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Keep 80% of fares - we only take 20% platform fee</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <IoCheckmarkCircle style={{ fontSize: '1rem', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">YOU set your own prices (we just suggest)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <IoCheckmarkCircle style={{ fontSize: '1rem', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Get flight data 3 hours in advance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <IoCheckmarkCircle style={{ fontSize: '1rem', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Instant approval with platform verification</span>
                  </li>
                </ul>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">$28-35/hr</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Average earnings</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600 dark:text-red-400">23 spots left</div>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '77%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleSearchClick}
                  className="w-full md:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition text-sm"
                >
                  Apply to Drive Now
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Already driving for another platform? Get instant approval!
                </p>
              </div>
              
              {/* Right side - iPhone Mockups */}
              <div className="relative h-[350px] lg:h-[450px] mt-8 lg:mt-0">
                {/* Desktop: Stacked/Cascaded Layout */}
                <div className="hidden lg:block relative h-full">
                  {/* Phone 1 - Back */}
                  <div className="absolute left-[80px] top-0 transform rotate-[-5deg] scale-95">
                    <div className="relative w-[160px] h-[360px] bg-black rounded-[1.5rem] p-1 shadow-2xl">
                      <div className="absolute top-[35px] left-1/2 transform -translate-x-1/2 w-[70px] h-[18px] bg-black rounded-full"></div>
                      <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
                        <img 
                          src="/screenshot1.png" 
                          alt="Flight Tracker Dashboard"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Phone 2 - Middle */}
                  <div className="absolute left-[150px] top-[15px] transform rotate-[3deg] z-10">
                    <div className="relative w-[160px] h-[360px] bg-black rounded-[1.5rem] p-1 shadow-2xl">
                      <div className="absolute top-[35px] left-1/2 transform -translate-x-1/2 w-[70px] h-[18px] bg-black rounded-full"></div>
                      <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
                        <img 
                          src="/screenshot2.png" 
                          alt="Surge Predictor Dashboard"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Phone 3 - Front */}
                  <div className="absolute left-[220px] top-[30px] transform rotate-[8deg] z-20">
                    <div className="relative w-[160px] h-[360px] bg-black rounded-[1.5rem] p-1 shadow-2xl">
                      <div className="absolute top-[35px] left-1/2 transform -translate-x-1/2 w-[70px] h-[18px] bg-black rounded-full"></div>
                      <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
                        <img 
                          src="/screenshot3.png" 
                          alt="Earnings Dashboard"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile: Horizontal Scroll Carousel */}
                <div className="lg:hidden overflow-x-auto">
                  <div className="flex space-x-4 pb-4" style={{ width: 'max-content' }}>
                    {/* Phone 1 */}
                    <div className="relative w-[140px] h-[300px] bg-black rounded-[1.5rem] p-1 shadow-xl flex-shrink-0">
                      <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 w-[55px] h-[14px] bg-black rounded-full"></div>
                      <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
                        <img 
                          src="/screenshot1.png" 
                          alt="Flight Tracker Dashboard"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                    
                    {/* Phone 2 */}
                    <div className="relative w-[140px] h-[300px] bg-black rounded-[1.5rem] p-1 shadow-xl flex-shrink-0">
                      <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 w-[55px] h-[14px] bg-black rounded-full"></div>
                      <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
                        <img 
                          src="/screenshot2.png" 
                          alt="Surge Predictor Dashboard"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                    
                    {/* Phone 3 */}
                    <div className="relative w-[140px] h-[300px] bg-black rounded-[1.5rem] p-1 shadow-xl flex-shrink-0">
                      <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 w-[55px] h-[14px] bg-black rounded-full"></div>
                      <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
                        <img 
                          src="/screenshot3.png" 
                          alt="Earnings Dashboard"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - NEW */}
      <section className="py-12 md:py-16 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              How ItWhip Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Simple, transparent, and driver-friendly platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Track Your Flight',
                description: 'Real-time flight tracking and delay predictions',
                icon: <IoAirplaneOutline style={{ fontSize: '1.5rem' }} />
              },
              {
                step: '2',
                title: 'Check Surge Predictions',
                description: 'AI-powered surge forecasting up to 6 hours ahead',
                icon: <IoAnalyticsOutline style={{ fontSize: '1.5rem' }} />
              },
              {
                step: '3',
                title: 'Connect with Drivers',
                description: 'Independent drivers set their own competitive rates',
                icon: <IoPeopleOutline style={{ fontSize: '1.5rem' }} />
              },
              {
                step: '4',
                title: 'Choose Your Option',
                description: 'Select based on price, time, and driver rating',
                icon: <IoCheckmarkCircleOutline style={{ fontSize: '1.5rem' }} />
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    {item.icon}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300 dark:bg-gray-700 -translate-x-4"></div>
                  )}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold mb-2 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-center text-sm text-blue-800 dark:text-blue-300">
              <strong>Platform Notice:</strong> ItWhip is a technology platform connecting passengers with independent transportation providers. 
              All drivers are independent contractors who set their own rates and maintain their own permits and insurance.
            </p>
          </div>
        </div>
      </section>

      {/* Flight Intelligence Section */}
      <section className="py-12 md:py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 text-center">
            Phoenix Airport Intelligence - FREE
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Flights Card */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center justify-between">
                <span>Incoming Flights</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
              </h3>
              
              <div className="space-y-3 md:space-y-4">
                {flightPredictions.slice(0, 3).map((flight, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 md:p-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-base md:text-lg text-gray-900 dark:text-white">{flight.flightNumber}</div>
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{flight.from}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300">{flight.scheduled}</div>
                        <div className={`text-xs font-medium ${
                          flight.delayProbability > 60 ? 'text-red-600 dark:text-red-400' : 
                          flight.delayProbability > 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {flight.delayProbability}% delay risk
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-2 py-1 text-red-700 dark:text-red-300">
                        Market: ${Math.round(25 * flight.surgePrediction)}+
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-2 py-1 text-green-700 dark:text-green-300">
                        Platform: ${Math.round(25 * flight.surgePrediction * 0.65)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Card */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center justify-between">
                <span>Airport Traffic</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Current</span>
              </h3>
              
              <div className="space-y-3 md:space-y-4">
                {trafficRoutes.map((route, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 md:p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{route.route}</div>
                      <div 
                        className="text-xs md:text-sm font-bold uppercase"
                        style={{ color: getStatusColor(route.status) }}
                      >
                        {route.status}
                      </div>
                    </div>
                    
                    {route.delay > 0 && (
                      <div className="text-xs md:text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                        +{route.delay} min delay
                      </div>
                    )}
                    
                    {route.alternative && (
                      <div className="text-xs md:text-sm text-green-600 dark:text-green-400">
                        Alt: {route.alternative}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 md:p-3 mt-3 md:mt-4">
                  <div className="flex items-center space-x-2">
                    <IoWarningOutline style={{ fontSize: '1rem', color: '#d97706' }} />
                    <span className="text-xs md:text-sm text-yellow-700 dark:text-yellow-300">Dust storm 3-6 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surge Prediction Engine */}
      <section className="py-12 md:py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 text-center">
            6-Hour Surge Forecast
          </h2>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-4 mb-8 md:mb-12">
            {surgePredictions.map((prediction, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg md:rounded-xl p-2 md:p-4 text-center">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2">{prediction.time}</div>
                <div className={`text-xl md:text-2xl font-bold mb-1 ${
                  prediction.multiplier > 2 ? 'text-red-600 dark:text-red-400' :
                  prediction.multiplier > 1.5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {prediction.multiplier}x
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{prediction.probability}%</div>
              </div>
            ))}
          </div>

          {/* Pattern Recognition */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Pattern Recognition Active</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="flex items-start space-x-2">
                <IoAnalyticsOutline style={{ fontSize: '1.25rem', color: '#3b82f6' }} />
                <div>
                  <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">Friday</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">2.3x likely</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <IoConstructOutline style={{ fontSize: '1.25rem', color: '#f59e0b' }} />
                <div>
                  <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">I-10 Work</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Delays</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <IoBasketballOutline style={{ fontSize: '1.25rem', color: '#a855f7' }} />
                <div>
                  <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">Suns Game</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">7PM surge</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <IoCloudOutline style={{ fontSize: '1.25rem', color: '#ef4444' }} />
                <div>
                  <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">Dust Storm</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">3PM alert</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Group Coordination */}
      <section className="py-12 md:py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 text-center">
            Group Coordination Intelligence
          </h2>
          
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-8 max-w-4xl mx-auto">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">Bachelor Party Example</h3>
            
            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              {groupMembers.map((member) => (
                <div key={member.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <IoPersonOutline style={{ fontSize: '1rem', color: '#3b82f6' }} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{member.name}</div>
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Flight {member.flight}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300">{member.arrival}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Terminal {member.terminal}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm md:text-base">Platform Coordination</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
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
                  <span className="text-green-600 dark:text-green-400 ml-2 font-bold">$75 ($25 each)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                onClick={handleSearchClick}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
              >
                Start Group Coordination
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4">ItWhip</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
                Flight Intelligence & Driver Connection Platform. Connecting passengers with independent drivers.
              </p>
              <div className="flex space-x-3">
                <IoLogoFacebook style={{ fontSize: '1.25rem', color: '#6b7280', cursor: 'pointer' }} />
                <IoLogoTwitter style={{ fontSize: '1.25rem', color: '#6b7280', cursor: 'pointer' }} />
                <IoLogoInstagram style={{ fontSize: '1.25rem', color: '#6b7280', cursor: 'pointer' }} />
                <IoLogoLinkedin style={{ fontSize: '1.25rem', color: '#6b7280', cursor: 'pointer' }} />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>How It Works</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Track Flights</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Connect with Drivers</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Airport Guide</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Surge Calendar</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">Drivers</h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Apply to Drive</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Driver Portal</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Requirements</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Earnings Calculator</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition" onClick={handleSearchClick}>Driver Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Terms of Service</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Privacy Policy</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Platform Agreement</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Driver Agreement</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Contact Us</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">Support</h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Help Center</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Safety</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Accessibility</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Blog</li>
                <li className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition">Press</li>
              </ul>
            </div>
          </div>
          
          {/* Service Areas */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Service Areas</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div>Phoenix Sky Harbor</div>
              <div>Scottsdale</div>
              <div>Tempe</div>
              <div>Mesa</div>
              <div>Chandler</div>
              <div>Glendale</div>
              <div>Paradise Valley</div>
              <div>Gilbert</div>
              <div>Peoria</div>
              <div>Surprise</div>
              <div>Goodyear</div>
              <div>Avondale</div>
            </div>
          </div>
          
          {/* App Download Section */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Download the ItWhip App</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Available on iOS and Android</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')}
                  className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                >
                  <IoLogoApple style={{ fontSize: '1.25rem' }} />
                  <div className="text-left">
                    <div className="text-xs leading-tight">TestFlight</div>
                    <div className="text-sm font-semibold leading-tight">Beta App</div>
                  </div>
                </button>
                <button 
                  disabled
                  className="flex items-center space-x-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
                >
                  <IoLogoGooglePlaystore style={{ fontSize: '1.25rem' }} />
                  <div className="text-left">
                    <div className="text-xs leading-tight">Coming</div>
                    <div className="text-sm font-semibold leading-tight">Soon</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-xs text-gray-500 dark:text-gray-500">© 2024 ItWhip. Technology platform connecting independent service providers.</p>
              <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-500">
                <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Terms</span>
                <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Privacy</span>
                <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Cookies</span>
                <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Sitemap</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <IoLocationOutline style={{ fontSize: '1rem' }} />
              <span>Phoenix, Arizona</span>
              <span>•</span>
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* App Download Modal */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 max-w-md w-full">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Download ItWhip App</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Connect with independent drivers, track flights, and beat surge pricing - all in one platform!
            </p>
            
            <div className="space-y-2 md:space-y-3">
              <button 
                onClick={() => window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')}
                className="w-full px-4 py-2.5 md:py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition flex items-center justify-center space-x-2"
              >
                <IoLogoApple style={{ fontSize: '1.25rem' }} />
                <span className="text-sm md:text-base">Download TestFlight Beta</span>
              </button>
              
              <button 
                disabled
                className="w-full px-4 py-2.5 md:py-3 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <IoLogoGooglePlaystore style={{ fontSize: '1.25rem' }} />
                <span className="text-sm md:text-base">Android Coming Soon</span>
              </button>
            </div>
            
            <button 
              onClick={() => setShowAppModal(false)}
              className="w-full mt-3 md:mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
            <IoCarOutline style={{ fontSize: '1rem' }} />
            <span>View Options</span>
          </button>
        </div>
      </div>
    </main>
  )
}