// app/hotel-solutions/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Layout Components
import Header from '../components/Header'
import Footer from '../components/Footer'

// Hotel Solutions Components (All 10)
import CrisisHeader from '../components/hotel-solutions/CrisisHeader'
import LiveEventStreams from '../components/hotel-solutions/LiveEventStreams'
import FourDisasters from '../components/hotel-solutions/FourDisasters'
import InstantRideSection from '../components/hotel-solutions/InstantRideSection'
import PlatformPreview from '../components/hotel-solutions/PlatformPreview'
import ROICalculator from '../components/hotel-solutions/ROICalculator'
import TabbedComparison from '../components/hotel-solutions/TabbedComparison'
import StrategicHonesty from '../components/hotel-solutions/StrategicHonesty'
import ObjectionCrusher from '../components/hotel-solutions/ObjectionCrusher'
import LiveProofWidgets from '../components/hotel-solutions/LiveProofWidgets'

// Icons for remaining sections
import {
  IoWarningOutline,
  IoBusinessOutline,
  IoPlayCircleOutline,
  IoArrowForwardOutline,
  IoServerOutline,
  IoCodeSlashOutline,
  IoConstructOutline,
  IoCloudOutline,
  IoEarthOutline,
  IoSchoolOutline,
  IoCheckmarkCircle,
  IoTrophyOutline,
  IoTrendingDownOutline,
  IoExpandOutline,
  IoContractOutline,
  IoCloseCircleOutline,
  IoStatsChartOutline,
  IoSparklesOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoTerminalOutline,
  IoLeafOutline,
  IoDocumentTextOutline,
  IoTimerOutline,
  IoCopyOutline,
  IoRocketOutline,
  IoAlertCircleOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

export default function HotelSolutionsEnhanced() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Live Crisis Metrics
  const [crisisMetrics, setCrisisMetrics] = useState({
    dailyLoss: 2847,
    totalLoss: 0,
    missedRides: 47,
    surgePricing: 3.2,
    nuclearVerdicts: 462,
    complianceDeadline: 342,
    californiaDeadline: calculateDaysUntil('2026-01-01'),
    activeHotels: 487,
    lostRevenue: 127500,
    driversAvailable: 847,
    instantRidesActive: 128,
    averageWaitTime: 0,
    hotelRevenue: 67433
  })

  // Floating Sidebar State
  const [showFloatingSidebar, setShowFloatingSidebar] = useState(true)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)

  // Live Event Streams (3 different types)
  const [bookingEvents, setBookingEvents] = useState([
    { time: '14:23:01', type: 'booking.new', detail: 'Guest #4739 - King Suite - 3 nights', value: '$1,247' },
    { time: '14:23:04', type: 'instant.ride.booked', detail: 'Room 412 → Airport', value: 'Commission: $23.40' },
    { time: '14:23:07', type: 'viewing.active', detail: '47 users viewing your hotel now', value: '' },
    { time: '14:23:10', type: 'cart.abandoned', detail: '$789 suite - Guest still browsing', value: 'Recovery possible' },
    { time: '14:23:13', type: 'booking.intent', detail: 'Guest comparing dates', value: '78% likely' }
  ])

  const [driverEvents, setDriverEvents] = useState([
    { time: '14:23:22', type: 'driver.assigned', detail: 'John M. → Room 218 guest', value: 'ETA: 2 min' },
    { time: '14:23:25', type: 'driver.arrived', detail: 'Sarah K. at lobby', value: 'Guest notified' },
    { time: '14:23:28', type: 'vip.pickup', detail: 'Executive guest - Premium vehicle', value: 'Priority' },
    { time: '14:23:31', type: 'driver.completed', detail: 'Airport delivery successful', value: '$78.50 earned' },
    { time: '14:23:34', type: 'fleet.ready', detail: '12 drivers at your property', value: 'Zero wait' }
  ])

  const [esgEvents, setEsgEvents] = useState([
    { time: '14:23:40', type: 'emission.tracked', detail: '4.7kg CO2 saved - Ride #8439', value: 'CDP logged' },
    { time: '14:23:43', type: 'compliance.updated', detail: 'Scope 3 data ready', value: 'Submit ready' },
    { time: '14:23:46', type: 'esg.milestone', detail: '100 tonnes CO2 prevented', value: 'This month' },
    { time: '14:23:49', type: 'report.ready', detail: 'Q4 ESG report generated', value: 'One-click submit' },
    { time: '14:23:52', type: 'california.compliant', detail: 'SB 253 requirements met', value: '✓ Compliant' }
  ])

  // Flight Tracking Data
  const [flights, setFlights] = useState([
    { flight: 'AA523', eta: '12 min', passengers: 187, hotelGuests: 42, status: 'approaching', instantReady: true },
    { flight: 'DL892', eta: '28 min', passengers: 234, hotelGuests: 65, status: 'scheduled', instantReady: true },
    { flight: 'UA445', eta: '45 min', passengers: 156, hotelGuests: 38, status: 'scheduled', instantReady: true }
  ])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Utility Functions
  function calculateDaysUntil(date: string) {
    const deadline = new Date(date)
    const today = new Date()
    const difference = deadline.getTime() - today.getTime()
    return Math.ceil(difference / (1000 * 3600 * 24))
  }

  // Update Metrics Effect - only on client
  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setCrisisMetrics(prev => ({
        ...prev,
        dailyLoss: prev.dailyLoss + Math.floor(Math.random() * 50) + 25,
        totalLoss: prev.totalLoss + (prev.dailyLoss / 86400),
        missedRides: prev.missedRides + (Math.random() > 0.8 ? 1 : 0),
        surgePricing: parseFloat((2.5 + Math.random() * 2.5).toFixed(1)),
        driversAvailable: Math.floor(800 + Math.random() * 100),
        instantRidesActive: Math.floor(100 + Math.random() * 50),
        hotelRevenue: prev.hotelRevenue + Math.floor(Math.random() * 100) + 50
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isClient])

  // Update Events Effect - only on client
  useEffect(() => {
    if (!isClient) return

    const eventInterval = setInterval(() => {
      const eventType = Math.floor(Math.random() * 3)
      
      if (eventType === 0) {
        const newBookingEvent = generateBookingEvent()
        setBookingEvents(prev => [newBookingEvent, ...prev.slice(0, 4)])
      } else if (eventType === 1) {
        const newDriverEvent = generateDriverEvent()
        setDriverEvents(prev => [newDriverEvent, ...prev.slice(0, 4)])
      } else {
        const newEsgEvent = generateEsgEvent()
        setEsgEvents(prev => [newEsgEvent, ...prev.slice(0, 4)])
      }
    }, 4000)

    return () => clearInterval(eventInterval)
  }, [isClient])

  function generateBookingEvent() {
    const bookingTypes = [
      { type: 'booking.new', detail: `Guest #${Math.floor(1000 + Math.random() * 9000)} - Suite`, value: `$${(800 + Math.random() * 700).toFixed(0)}` },
      { type: 'instant.ride.booked', detail: `Room ${Math.floor(100 + Math.random() * 500)} → Airport`, value: `Commission: $${(15 + Math.random() * 35).toFixed(2)}` },
      { type: 'viewing.active', detail: `${Math.floor(20 + Math.random() * 80)} users viewing now`, value: '' },
      { type: 'revenue.earned', detail: `${Math.floor(3 + Math.random() * 10)} instant rides`, value: `$${(100 + Math.random() * 200).toFixed(2)}` },
      { type: 'booking.intent', detail: 'Guest comparing rates', value: `${Math.floor(60 + Math.random() * 40)}% likely` }
    ]
    const event = bookingTypes[Math.floor(Math.random() * bookingTypes.length)]
    const now = new Date()
    const timeString = now.toTimeString().split(' ')[0]
    return { time: timeString, ...event }
  }

  function generateDriverEvent() {
    const driverNames = ['John M.', 'Sarah K.', 'Michael R.', 'Lisa T.', 'David L.', 'Maria G.']
    const driverTypes = [
      { type: 'driver.assigned', detail: `${driverNames[Math.floor(Math.random() * driverNames.length)]} → Room ${Math.floor(100 + Math.random() * 500)}`, value: `ETA: ${Math.floor(1 + Math.random() * 5)} min` },
      { type: 'driver.arrived', detail: `${driverNames[Math.floor(Math.random() * driverNames.length)]} at lobby`, value: 'Guest notified' },
      { type: 'vip.pickup', detail: 'Premium vehicle dispatched', value: 'Executive guest' },
      { type: 'instant.available', detail: `${Math.floor(5 + Math.random() * 15)} drivers ready`, value: 'Zero wait active' },
      { type: 'ride.completed', detail: 'Successful delivery', value: `$${(50 + Math.random() * 100).toFixed(2)} earned` }
    ]
    const event = driverTypes[Math.floor(Math.random() * driverTypes.length)]
    const now = new Date()
    const timeString = now.toTimeString().split(' ')[0]
    return { time: timeString, ...event }
  }

  function generateEsgEvent() {
    const esgTypes = [
      { type: 'emission.tracked', detail: `${(2 + Math.random() * 8).toFixed(1)}kg CO2 saved`, value: 'CDP logged' },
      { type: 'compliance.updated', detail: 'Transportation data synced', value: 'Auto-reported' },
      { type: 'carbon.offset', detail: `${(0.5 + Math.random() * 3).toFixed(1)} tonnes offset`, value: 'Purchased' },
      { type: 'report.ready', detail: 'Weekly ESG summary', value: 'Download ready' },
      { type: 'milestone.reached', detail: `${Math.floor(50 + Math.random() * 200)} tonnes saved`, value: 'Year to date' }
    ]
    const event = esgTypes[Math.floor(Math.random() * esgTypes.length)]
    const now = new Date()
    const timeString = now.toTimeString().split(' ')[0]
    return { time: timeString, ...event }
  }

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }

  const handleSeeSolution = () => {
    document.getElementById('instant-ride')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-black">
      {/* Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      {/* SECTION 1: Crisis Header with Live Ticker */}
      <CrisisHeader 
        crisisMetrics={crisisMetrics}
        onSeeSolution={handleSeeSolution}
      />
      
      {/* Live Event Streams */}
      <LiveEventStreams
        bookingEvents={bookingEvents}
        driverEvents={driverEvents}
        esgEvents={esgEvents}
      />

      {/* SECTION 2: The 4 Disasters */}
      <FourDisasters californiaDeadline={crisisMetrics.californiaDeadline} />

      {/* SECTION 3: Instant Ride Showcase */}
      <InstantRideSection />

      {/* SECTION 4: Platform Architecture Showcase */}
      <PlatformPreview 
        crisisMetrics={{
          hotelRevenue: crisisMetrics.hotelRevenue,
          instantRidesActive: crisisMetrics.instantRidesActive,
          driversAvailable: crisisMetrics.driversAvailable
        }}
        flights={flights}
      />

      {/* SECTION 5: Financial Transformation Calculator */}
      <div id="roi-calculator">
        <ROICalculator />
      </div>

      {/* SECTION 6: Technical Superiority Comparison (Tabbed) */}
      <TabbedComparison />

      {/* SECTION 7: Strategic Honesty - What We DON'T Do */}
      <StrategicHonesty />

      {/* SECTION 8: Live Proof Widgets */}
      <LiveProofWidgets />

      {/* SECTION 9: Objection Crusher - Hard Questions */}
      <ObjectionCrusher />

      {/* SECTION 10: Technical Integration - OPTIMIZED */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-blue-300 dark:border-blue-800">
              <IoFlashOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Zero Setup Time</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">15-Minute</span> Integration
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
              Three ways to integrate. 
              <span className="block mt-1 sm:inline sm:mt-0">Works with any system you already have.</span>
            </p>
          </div>

          {/* Integration Options - Mobile Optimized */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* REST API */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">REST API</h3>
                <IoServerOutline className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                Direct API integration with any language
              </p>
              <div className="bg-slate-900 dark:bg-black rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-xs">api.itwhip.com</span>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <IoCopyOutline className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-green-400">
{`POST /api/v3/instant-ride
{
  "hotelId": "PHX-MAR-001",
  "pickup": "Terminal 4",
  "guest": "reservation.id"
}

// Response: 127ms ⚡
{
  "rideId": "instant_r3x9k",
  "driver": "2.3 min away",
  "fare": "$78.50",
  "commission": "$23.55"
}`}
                </pre>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center space-x-2 text-xs text-green-600">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>Live & Production Ready</span>
              </div>
            </div>

            {/* JavaScript SDK */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">JavaScript SDK</h3>
                <IoCodeSlashOutline className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                NPM package with TypeScript support
              </p>
              <div className="bg-slate-900 dark:bg-black rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-xs">package.json</span>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <IoCopyOutline className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-green-400">
{`npm install @itwhip/instant-ride-sdk

const itwhip = new ItWhip({
  apiKey: process.env.ITWHIP_KEY,
  hotelCode: 'PHX-MAR-001'
});

await itwhip.instant.pickup({
  guest: reservation.id,
  location: 'Terminal 4'
});
// Guest has ride, hotel earns 💰`}
                </pre>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center space-x-2 text-xs text-purple-600">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>TypeScript Ready</span>
              </div>
            </div>

            {/* No-Code Widget */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No-Code Widget</h3>
                <IoConstructOutline className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                Copy-paste widget for any website
              </p>
              <div className="bg-slate-900 dark:bg-black rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-xs">index.html</span>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <IoCopyOutline className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-green-400">
{`<!-- Add to your website -->
<script 
  src="cdn.itwhip.com/widget.js">
</script>
<div 
  id="itwhip-instant"
  data-hotel="PHX-MAR-001"
  data-theme="dark">
</div>

<!-- That's it! 🚀 -->`}
                </pre>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center space-x-2 text-xs text-amber-600">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>Zero Code Required</span>
              </div>
            </div>
          </div>

          {/* Live Webhook Stream - Mobile Optimized */}
          <div className="bg-slate-900 dark:bg-black rounded-xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-white font-bold text-sm sm:text-base">Live Webhook Events</h3>
              <div className="flex items-center space-x-2">
                {isClient && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <span className="text-green-400 text-xs sm:text-sm">Streaming</span>
              </div>
            </div>
            
            <div className="font-mono text-xs sm:text-sm space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
              <div className="text-green-400">
                <span className="text-slate-500">POST /webhooks</span>
                <pre className="mt-2 overflow-x-auto">{`{
  "event": "instant.ride.requested",
  "timestamp": "${isClient ? new Date().toISOString() : '2024-12-14T14:23:01Z'}",
  "data": {
    "hotelId": "PHX-MAR-001",
    "guestId": "res_847392",
    "pickup": "Sky Harbor Terminal 4",
    "status": "driver_dispatched",
    "eta": "0 seconds"
  }
}`}</pre>
              </div>
            </div>
          </div>

          {/* Integration Link */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/integrations"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base"
            >
              <span>See all 47 PMS/GDS integrations</span>
              <IoArrowForwardOutline className="w-4 sm:w-5 h-4 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 11: ESG Compliance Automation - OPTIMIZED */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-amber-300 dark:border-amber-800">
              <IoWarningOutline className={`w-5 sm:w-6 h-5 sm:h-6 ${isClient ? 'animate-pulse' : ''}`} />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                {crisisMetrics.californiaDeadline} Days Until Deadline
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
              Automated <span className="text-green-600">ESG Compliance</span>
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
              CDP, EPA, and California SB 253/261 reporting automated. 
              <span className="block mt-1 sm:inline sm:mt-0">You literally cannot comply without transportation tracking.</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Compliance Requirements - Mobile Optimized */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                What You Must Report
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start space-x-3">
                    <IoCloseCircleOutline className="w-5 sm:w-6 h-5 sm:h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">Without ItWhip</p>
                      <ul className="mt-2 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex items-start space-x-1">
                          <span>❌</span>
                          <span>No Scope 3 transportation data</span>
                        </li>
                        <li className="flex items-start space-x-1">
                          <span>❌</span>
                          <span>Can't connect to CDP API</span>
                        </li>
                        <li className="flex items-start space-x-1">
                          <span>❌</span>
                          <span>Manual EPA submissions</span>
                        </li>
                        <li className="flex items-start space-x-1 font-semibold text-red-600">
                          <span>❌</span>
                          <span>$500K non-compliance risk</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">With ItWhip</p>
                      <ul className="mt-2 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex items-start space-x-1">
                          <span>✓</span>
                          <span>Automatic Scope 3 tracking</span>
                        </li>
                        <li className="flex items-start space-x-1">
                          <span>✓</span>
                          <span>CDP API integration</span>
                        </li>
                        <li className="flex items-start space-x-1">
                          <span>✓</span>
                          <span>EPA auto-reporting</span>
                        </li>
                        <li className="flex items-start space-x-1 font-semibold text-green-600">
                          <span>✓</span>
                          <span>Full compliance achieved</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Mobile-Only Quick Stats */}
                <div className="sm:hidden grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-amber-100 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-amber-600">{crisisMetrics.californiaDeadline}</p>
                    <p className="text-xs text-slate-600">Days Left</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-red-600">$500K</p>
                    <p className="text-xs text-slate-600">Penalty</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-600">$0</p>
                    <p className="text-xs text-slate-600">With Us</p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Connections - Mobile Optimized */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                API Integrations
              </h3>
              
              <div className="bg-slate-900 dark:bg-black rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-xs">esg-api.js</span>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <IoCopyOutline className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-green-400 overflow-x-auto">
{`// Automatic ESG Reporting
const emissions = await itwhip.esg.calculate({
  period: 'Q4-2024',
  scope: 3,
  categories: [4, 6, 7, 9]
});

// Submit to CDP ✓
await itwhip.esg.submitCDP({
  data: emissions,
  format: 'CDP-2025'
});

// File with EPA ✓
await itwhip.esg.reportEPA({
  ghgrp: emissions,
  facility: 'PHX-MAR-001'
});`}
                </pre>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg hover:shadow-lg transition-all">
                  <IoCloudOutline className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">CDP</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Connected</p>
                  <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-green-600">
                    <IoCheckmarkCircle className="w-3 h-3" />
                    <span>Live</span>
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg hover:shadow-lg transition-all">
                  <IoEarthOutline className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">EPA</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Connected</p>
                  <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-green-600">
                    <IoCheckmarkCircle className="w-3 h-3" />
                    <span>Live</span>
                  </div>
                </div>
              </div>

              {/* One-Click Compliance Button */}
              <div className="mt-4 sm:mt-6">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2">
                  <IoLeafOutline className="w-5 h-5" />
                  <span>Generate Compliance Report</span>
                </button>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                  One click to full compliance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: GDS Expertise & Credibility - Mobile Optimized */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
              <IoSchoolOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Industry Expertise</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
              Built by the Team That <span className="text-purple-600">Managed 6,500 Hotels</span>
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
              Former Choice Hotels and Amadeus executives who understand your systems
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 sm:p-6 text-center border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all">
              <h3 className="text-2xl sm:text-4xl font-black text-purple-600 mb-1 sm:mb-2">6,500</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Hotels Managed</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">Choice Hotels</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 sm:p-6 text-center border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
              <h3 className="text-2xl sm:text-4xl font-black text-blue-600 mb-1 sm:mb-2">2B</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">GDS Transactions</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">Processed</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 sm:p-6 text-center border border-green-200 dark:border-green-800 hover:shadow-lg transition-all">
              <h3 className="text-2xl sm:text-4xl font-black text-green-600 mb-1 sm:mb-2">15min</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Integration</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">Any PMS</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 sm:p-6 text-center border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all">
              <h3 className="text-2xl sm:text-4xl font-black text-amber-600 mb-1 sm:mb-2">99.99%</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Uptime SLA</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">Enterprise</p>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="text-center">
            <Link
              href="/gds"
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold text-sm sm:text-base"
            >
              <span>Learn about our GDS expertise</span>
              <IoArrowForwardOutline className="w-4 sm:w-5 h-4 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 13: City Monopoly Urgency - Mobile Optimized */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-red-300 dark:border-red-800">
              <IoTrophyOutline className={`w-5 sm:w-6 h-5 sm:h-6 ${isClient ? 'animate-pulse' : ''}`} />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Exclusive Opportunity</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
              First Hotel in Phoenix <span className="text-amber-600">Controls the Market</span>
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-2">
              We're offering city-wide exclusivity to early partners. 
              <span className="block mt-1 sm:inline sm:mt-0">Once your competitors activate, you're locked out.</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-center">Phoenix Market Status</h3>
            </div>
            
            <div className="p-6 sm:p-8">
              {/* Mobile Priority Alert */}
              <div className="sm:hidden bg-red-100 dark:bg-red-900/20 rounded-lg p-3 mb-4 border border-red-300 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <IoAlertCircleOutline className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                    Only 3 spots remaining - Deciding this week
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-black text-amber-600 mb-1 sm:mb-2">3</div>
                  <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Exclusive Spots</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Remaining</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-black text-green-600 mb-1 sm:mb-2">7</div>
                  <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Hotels Active</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Earning now</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-black text-red-600 mb-1 sm:mb-2">14</div>
                  <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Negotiating</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">This week</p>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
                <p className="text-center text-base sm:text-lg text-slate-900 dark:text-white font-semibold mb-3 sm:mb-4">
                  What Exclusivity Means:
                </p>
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-start space-x-2">
                      <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Control pricing in your area</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Lock out competitors</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Priority driver allocation</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-start space-x-2">
                      <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Custom branding options</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Revenue from entire zone</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <IoCheckmarkCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">First-mover advantage</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="sm:hidden mt-4">
                <Link
                  href="/portal/login"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-bold text-center"
                >
                  Claim Your Exclusive Spot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 14: Final CTA - Mobile Optimized */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6">
            Stop Losing ${isClient ? (crisisMetrics.dailyLoss / 24).toFixed(0) : '118'} Every Hour
          </h2>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 px-2">
            Your competitors are earning while you're burning. 
            <span className="block mt-1 sm:inline sm:mt-0">Every day you wait is money lost forever.</span>
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">{crisisMetrics.activeHotels}</div>
              <div className="text-xs sm:text-sm text-white/70">Hotels Live</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">15min</div>
              <div className="text-xs sm:text-sm text-white/70">Integration</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">$0</div>
              <div className="text-xs sm:text-sm text-white/70">Setup Cost</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">30%</div>
              <div className="text-xs sm:text-sm text-white/70">You Earn</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/portal/login"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-base sm:text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <IoBusinessOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span className="hidden sm:inline">Access Your Hotel Dashboard</span>
              <span className="sm:hidden">Access Dashboard</span>
            </Link>
            <Link
              href="/demo"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 rounded-lg font-bold text-base sm:text-lg hover:bg-slate-100 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <IoPlayCircleOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              <span>Watch 5-Min Demo</span>
            </Link>
          </div>
          
          <p className="mt-6 sm:mt-8 text-white/70 text-xs sm:text-sm">
            Your hotel is already in our system. See your potential revenue now.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Sidebar - Desktop Only with Close/Minimize */}
      {showFloatingSidebar && isClient && (
        <div className={`hidden lg:block fixed right-8 ${sidebarMinimized ? 'bottom-8' : 'top-1/2 transform -translate-y-1/2'} z-40 transition-all duration-300`}>
          {sidebarMinimized ? (
            // Minimized State - Small bubble
            <button
              onClick={() => setSidebarMinimized(false)}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform"
            >
              <div className="flex items-center space-x-2">
                <IoTrendingDownOutline className="w-5 h-5" />
                <span className="font-bold">${(crisisMetrics.dailyLoss).toLocaleString()}/day</span>
                <IoExpandOutline className="w-4 h-4" />
              </div>
            </button>
          ) : (
            // Expanded State
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-4 w-64 border border-slate-200 dark:border-slate-700">
              {/* Controls */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Live Metrics</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSidebarMinimized(true)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Minimize"
                  >
                    <IoContractOutline className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => setShowFloatingSidebar(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Close"
                  >
                    <IoCloseCircleOutline className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Daily Loss</p>
                  <p className="text-2xl font-black text-red-600">${crisisMetrics.dailyLoss.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Compliance Deadline</p>
                  <p className="text-2xl font-black text-amber-600">{crisisMetrics.californiaDeadline} days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hotels Earning</p>
                  <p className="text-2xl font-black text-green-600">{crisisMetrics.activeHotels}</p>
                </div>
                <Link
                  href="/portal/login"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-center hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Stop Losing Money
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restore Floating Sidebar Button - If closed */}
      {!showFloatingSidebar && isClient && (
        <button
          onClick={() => {
            setShowFloatingSidebar(true)
            setSidebarMinimized(false)
          }}
          className="hidden lg:block fixed bottom-8 right-8 z-40 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full p-3 shadow-2xl hover:scale-110 transition-transform"
          title="Show Live Metrics"
        >
          <IoStatsChartOutline className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}