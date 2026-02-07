// app/help/chloe/components/ChoeTripPlanner.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoAirplaneOutline,
  IoBedOutline,
  IoCarSportOutline,
  IoRestaurantOutline,
  IoCloudyOutline,
  IoNavigateOutline,
  IoSparklesOutline,
  IoChevronForwardOutline,
  IoTerminalOutline,
  IoRefreshOutline,
  IoSunnyOutline,
  IoMoonOutline
} from 'react-icons/io5'

const tripFeatures = [
  { icon: IoAirplaneOutline, label: 'Real Flights', description: 'Best arrival windows' },
  { icon: IoBedOutline, label: 'Real Hotels', description: 'Pool, group rates' },
  { icon: IoCarSportOutline, label: 'Real Cars', description: 'No-deposit SUVs' },
  { icon: IoRestaurantOutline, label: 'Real Dining', description: 'Near your hotel' },
  { icon: IoCloudyOutline, label: 'Real Weather', description: 'Live forecasts' },
  { icon: IoNavigateOutline, label: 'Real Traffic', description: 'Optimal timing' }
]

// Cycling options for each category
const flightOptions = ['LAX → PHX 8:30 AM', 'SFO → PHX 11:15 AM', 'DEN → PHX 1:45 PM', 'Sky Harbor arrival 2 PM Friday']
const hotelOptions = ['Hyatt Regency...', 'Marriott Tempe...', 'Hilton Phoenix...', 'W Scottsdale - pool, group rate $189/night']
const carOptions = ['Searching SUVs...', 'Checking deposits...', 'Comparing rates...', '2 SUVs from ItWhip, no deposit, $52/day each']
const dinnerOptions = ['Searching nearby...', 'STK Scottsdale...', 'Ocean 44...', 'Maple & Ash (0.3 mi from hotel)']

const userMessage = '"Bachelor party in Scottsdale, 6 guys, March 15-18, budget $200/person/day"'

export function ChoeTripPlanner() {
  const [typedText, setTypedText] = useState('')
  const [showThinking, setShowThinking] = useState(false)
  const [thinkingDots, setThinkingDots] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [flightIndex, setFlightIndex] = useState(0)
  const [hotelIndex, setHotelIndex] = useState(0)
  const [carIndex, setCarIndex] = useState(0)
  const [dinnerIndex, setDinnerIndex] = useState(0)
  const [showReady, setShowReady] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isDarkTerminal, setIsDarkTerminal] = useState(true)
  const [animationTrigger, setAnimationTrigger] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Reset animation to replay
  const replayAnimation = () => {
    setTypedText('')
    setShowThinking(false)
    setThinkingDots('')
    setShowSuccess(false)
    setCurrentStep(-1)
    setFlightIndex(0)
    setHotelIndex(0)
    setCarIndex(0)
    setDinnerIndex(0)
    setShowReady(false)
    // Trigger animation restart with new trigger value
    setAnimationTrigger(prev => prev + 1)
  }

  // Intersection observer to trigger animation when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          setAnimationTrigger(1)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  // Typing animation
  useEffect(() => {
    if (animationTrigger === 0) return

    let i = 0
    const typeInterval = setInterval(() => {
      if (i < userMessage.length) {
        setTypedText(userMessage.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => setShowThinking(true), 300)
      }
    }, 35)

    return () => clearInterval(typeInterval)
  }, [animationTrigger])

  // Thinking dots animation
  useEffect(() => {
    if (!showThinking || showSuccess) return

    let dotCount = 0
    const dotsInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4
      setThinkingDots('.'.repeat(dotCount || 1))
    }, 400)

    // After 2 seconds, show success
    const successTimeout = setTimeout(() => {
      setShowSuccess(true)
      setShowThinking(false)
      setCurrentStep(0)
    }, 2000)

    return () => {
      clearInterval(dotsInterval)
      clearTimeout(successTimeout)
    }
  }, [showThinking, showSuccess])

  // Sequential step reveal with cycling animations
  useEffect(() => {
    if (currentStep < 0) return

    // Flight cycling
    if (currentStep === 0) {
      let idx = 0
      const flightInterval = setInterval(() => {
        if (idx < flightOptions.length - 1) {
          setFlightIndex(idx)
          idx++
        } else {
          setFlightIndex(flightOptions.length - 1)
          clearInterval(flightInterval)
          setTimeout(() => setCurrentStep(1), 400)
        }
      }, 300)
      return () => clearInterval(flightInterval)
    }

    // Hotel cycling
    if (currentStep === 1) {
      let idx = 0
      const hotelInterval = setInterval(() => {
        if (idx < hotelOptions.length - 1) {
          setHotelIndex(idx)
          idx++
        } else {
          setHotelIndex(hotelOptions.length - 1)
          clearInterval(hotelInterval)
          setTimeout(() => setCurrentStep(2), 400)
        }
      }, 350)
      return () => clearInterval(hotelInterval)
    }

    // Car cycling
    if (currentStep === 2) {
      let idx = 0
      const carInterval = setInterval(() => {
        if (idx < carOptions.length - 1) {
          setCarIndex(idx)
          idx++
        } else {
          setCarIndex(carOptions.length - 1)
          clearInterval(carInterval)
          setTimeout(() => setCurrentStep(3), 400)
        }
      }, 300)
      return () => clearInterval(carInterval)
    }

    // Dinner cycling
    if (currentStep === 3) {
      let idx = 0
      const dinnerInterval = setInterval(() => {
        if (idx < dinnerOptions.length - 1) {
          setDinnerIndex(idx)
          idx++
        } else {
          setDinnerIndex(dinnerOptions.length - 1)
          clearInterval(dinnerInterval)
          setTimeout(() => setCurrentStep(4), 400)
        }
      }, 300)
      return () => clearInterval(dinnerInterval)
    }

    // Weather (no cycling, just show)
    if (currentStep === 4) {
      setTimeout(() => setCurrentStep(5), 600)
    }

    // Tip
    if (currentStep === 5) {
      setTimeout(() => setShowReady(true), 800)
    }
  }, [currentStep])

  const isSearching = (index: number, finalIndex: number) => index < finalIndex

  return (
    <section ref={sectionRef} className="py-10 sm:py-14 bg-white dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-300 dark:border-[#222]">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e87040]/5 dark:bg-[#e87040]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4a574]/5 dark:bg-[#d4a574]/10 rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BETA Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#c94c24] to-[#e87040] text-white text-xs font-bold uppercase tracking-wider">
            <IoSparklesOutline className="w-4 h-4" />
            Coming Soon
          </span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Choé Trip Planner
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto">
            Not &quot;here&apos;s a Pinterest board&quot; — an AI that pulls <span className="font-semibold text-[#e87040]">real data</span> and builds actionable itineraries with live bookings.
          </p>
        </div>

        {/* Terminal-style conversation */}
        <div className={`rounded-lg border overflow-hidden mb-8 shadow-lg transition-colors ${
          isDarkTerminal
            ? 'bg-[#1a1a1a] border-[#333]'
            : 'bg-white border-gray-200'
        }`}>
          {/* Terminal header */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b transition-colors ${
            isDarkTerminal
              ? 'bg-[#252525] border-[#333]'
              : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
            </div>
            <div className={`flex-1 flex items-center justify-center gap-2 text-xs ${
              isDarkTerminal ? 'text-[#666]' : 'text-gray-500'
            }`}>
              <Image src="/images/choe-logo.png" alt="Choé" width={100} height={29} className="h-[24px] w-auto" />
              <span>trip-planner</span>
            </div>
            {/* Dark/Light toggle */}
            <button
              onClick={() => setIsDarkTerminal(!isDarkTerminal)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isDarkTerminal
                  ? 'bg-[#333] text-[#a8a8a8] hover:bg-[#444]'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isDarkTerminal ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkTerminal ? <IoSunnyOutline className="w-3.5 h-3.5" /> : <IoMoonOutline className="w-3.5 h-3.5" />}
            </button>
            {/* Replay button */}
            <button
              onClick={replayAnimation}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e87040]/20 text-[#e87040] text-xs font-medium hover:bg-[#e87040]/30 transition-colors"
              title="Replay demo"
            >
              <IoRefreshOutline className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replay</span>
            </button>
          </div>

          {/* Terminal content */}
          <div className="p-5 sm:p-6 font-mono text-sm min-h-[320px]">
            {/* User input with typing animation */}
            <div className="flex items-start gap-3 mb-5">
              <span className="text-[#e87040] flex-shrink-0">$</span>
              <span className={isDarkTerminal ? 'text-[#a8a8a8]' : 'text-gray-600'}>
                {typedText}
                {typedText.length < userMessage.length && (
                  <span className="inline-block w-2 h-4 bg-[#e87040] ml-0.5 animate-pulse" />
                )}
              </span>
            </div>

            {/* Thinking animation */}
            {showThinking && (
              <div className="flex items-center gap-2 text-[#d4a574] mb-4">
                <span className="animate-spin">⟳</span>
                <span>Choé is thinking{thinkingDots}</span>
              </div>
            )}

            {/* AI Response */}
            {showSuccess && (
              <div className="border-l-2 border-[#e87040] pl-4 space-y-3">
                <div className="text-[#27ca3f] flex items-center gap-2">
                  <span>✓</span>
                  <span>Trip plan generated</span>
                </div>

                <div className={`space-y-2.5 ${isDarkTerminal ? 'text-[#a8a8a8]' : 'text-gray-600'}`}>
                  {/* Flights */}
                  {currentStep >= 0 && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                      <IoAirplaneOutline className="w-4 h-4 text-[#e87040] flex-shrink-0" />
                      <span>
                        <span className={`font-medium ${isDarkTerminal ? 'text-white' : 'text-gray-900'}`}>Flights:</span>{' '}
                        <span className={isSearching(flightIndex, flightOptions.length - 1) ? 'text-[#d4a574]' : ''}>
                          {flightOptions[flightIndex]}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Hotel */}
                  {currentStep >= 1 && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                      <IoBedOutline className="w-4 h-4 text-[#ff7f50] flex-shrink-0" />
                      <span>
                        <span className={`font-medium ${isDarkTerminal ? 'text-white' : 'text-gray-900'}`}>Hotel:</span>{' '}
                        <span className={isSearching(hotelIndex, hotelOptions.length - 1) ? 'text-[#d4a574]' : ''}>
                          {hotelOptions[hotelIndex]}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Cars */}
                  {currentStep >= 2 && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                      <IoCarSportOutline className="w-4 h-4 text-[#d4a574] flex-shrink-0" />
                      <span>
                        <span className={`font-medium ${isDarkTerminal ? 'text-white' : 'text-gray-900'}`}>Cars:</span>{' '}
                        <span className={isSearching(carIndex, carOptions.length - 1) ? 'text-[#d4a574]' : ''}>
                          {carOptions[carIndex]}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Dinner */}
                  {currentStep >= 3 && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                      <IoRestaurantOutline className="w-4 h-4 text-[#c94c24] flex-shrink-0" />
                      <span>
                        <span className={`font-medium ${isDarkTerminal ? 'text-white' : 'text-gray-900'}`}>Dinner:</span>{' '}
                        <span className={isSearching(dinnerIndex, dinnerOptions.length - 1) ? 'text-[#d4a574]' : ''}>
                          {dinnerOptions[dinnerIndex]}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Weather */}
                  {currentStep >= 4 && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                      <IoCloudyOutline className="w-4 h-4 text-[#e87040] flex-shrink-0" />
                      <span><span className={`font-medium ${isDarkTerminal ? 'text-white' : 'text-gray-900'}`}>Weather:</span> 85°F sunny — convertible upgrade available</span>
                    </div>
                  )}

                  {/* Tip */}
                  {currentStep >= 5 && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                      <IoNavigateOutline className="w-4 h-4 text-[#ff7f50] flex-shrink-0" />
                      <span><span className={`font-medium ${isDarkTerminal ? 'text-white' : 'text-gray-900'}`}>Tip:</span> Leave by 7 AM Saturday for Sedona day trip</span>
                    </div>
                  )}
                </div>

                {/* Ready to book */}
                {showReady && (
                  <div className={`pt-2 animate-fadeIn ${isDarkTerminal ? 'text-[#666]' : 'text-gray-500'}`}>
                    <span className="text-[#27ca3f]">Ready to book?</span> Type <span className={`font-medium ${isDarkTerminal ? 'text-white' : 'text-gray-900'}`}>&apos;confirm&apos;</span> to reserve all
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {tripFeatures.map((feature, index) => (
            <div
              key={feature.label}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-4 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all text-center choe-animate-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <feature.icon className="w-6 h-6 text-[#e87040] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-xs text-gray-900 dark:text-white mb-1">
                {feature.label}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-[#666]">
                {feature.description}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-lg font-medium text-[#e87040] mb-4">
            One conversation. Everything connected. Car is booked.
          </p>
          <Link
            href="https://choe.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-[#a8a8a8] hover:text-[#e87040] transition-colors"
          >
            Join the waitlist at choe.cloud
            <IoChevronForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
