// app/help/choe/components/ChoeAuto.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  IoPhonePortraitOutline,
  IoCarOutline,
  IoDesktopOutline,
  IoMicOutline,
  IoVolumeHighOutline,
  IoCheckmarkCircle,
  IoSparklesOutline,
  IoShieldCheckmarkOutline,
  IoRefreshOutline,
  IoSunnyOutline,
  IoMoonOutline
} from 'react-icons/io5'

const devices = [
  { icon: IoDesktopOutline, label: 'Desktop', description: 'Browse, plan, save to cart' },
  { icon: IoPhonePortraitOutline, label: 'Phone', description: 'Review, compare, manage' },
  { icon: IoCarOutline, label: 'CarPlay / Android Auto', description: 'Purchase by voice' }
]

const voiceCommands = [
  {
    command: '"Choé, my cart"',
    typing: 'Choé, my cart',
    response: 'You have 3 vehicles saved. Number 1: 2024 Toyota Camry, $45/day, Phoenix pickup...'
  },
  {
    command: '"Book number 1"',
    typing: 'Book number 1',
    response: 'Toyota Camry for March 15-18. Total: $180. Pay with Visa ending 4242?'
  },
  {
    command: '"Confirm"',
    typing: 'Confirm',
    response: 'Booked! Confirmation sent to your phone. Drive safe.'
  }
]

export function ChoeAuto() {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isDarkCard, setIsDarkCard] = useState(true)
  const [currentCommand, setCurrentCommand] = useState(-1)
  const [typedCommand, setTypedCommand] = useState('')
  const [showResponse, setShowResponse] = useState<boolean[]>([false, false, false])
  const [isComplete, setIsComplete] = useState(false)
  const [animationTrigger, setAnimationTrigger] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Intersection observer
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

  // Start animation sequence
  useEffect(() => {
    if (animationTrigger === 0) return

    // Start first command after a short delay
    const startTimeout = setTimeout(() => {
      setCurrentCommand(0)
    }, 500)

    return () => clearTimeout(startTimeout)
  }, [animationTrigger])

  // Typing animation for current command
  useEffect(() => {
    if (currentCommand < 0 || currentCommand >= voiceCommands.length) return

    const command = voiceCommands[currentCommand]
    let i = 0
    setTypedCommand('')

    const typeInterval = setInterval(() => {
      if (i < command.typing.length) {
        setTypedCommand(command.typing.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeInterval)
        // Show response after typing completes
        setTimeout(() => {
          setShowResponse(prev => {
            const newState = [...prev]
            newState[currentCommand] = true
            return newState
          })
          // Move to next command
          setTimeout(() => {
            if (currentCommand < voiceCommands.length - 1) {
              setCurrentCommand(currentCommand + 1)
            } else {
              setIsComplete(true)
            }
          }, 1500)
        }, 500)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [currentCommand])

  // Reset animation
  const replayAnimation = () => {
    setCurrentCommand(-1)
    setTypedCommand('')
    setShowResponse([false, false, false])
    setIsComplete(false)
    // Trigger animation restart with new trigger value
    setAnimationTrigger(prev => prev + 1)
  }

  return (
    <section ref={sectionRef} className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-300 dark:border-[#222]">
      {/* Ambient car dashboard glow */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#e87040]/5 dark:from-[#e87040]/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#e87040]/5 dark:bg-[#e87040]/8 rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#c94c24] to-[#e87040] text-white text-xs font-bold uppercase tracking-wider">
            <IoSparklesOutline className="w-4 h-4" />
            Coming Soon
          </span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Choé Auto
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto">
            The first AI that lives in your car and handles commerce while you drive.
            CarPlay &amp; Android Auto integration.
          </p>
        </div>

        {/* Cross-Device Flow - Dashboard style */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-10">
          {devices.map((device, index) => (
            <div
              key={device.label}
              className="relative group choe-animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all text-center">
                <device.icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#e87040] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                  {device.label}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[#666]">
                  {device.description}
                </p>
              </div>

              {/* Connection line */}
              {index < devices.length - 1 && (
                <div className="absolute top-1/2 -right-1.5 sm:-right-2.5 w-3 sm:w-5 h-0.5 bg-gradient-to-r from-[#e87040] to-[#ff7f50] hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Voice Commands - Animated Car dashboard aesthetic */}
        <div className={`rounded-lg overflow-hidden border mb-8 shadow-lg transition-colors ${
          isDarkCard
            ? 'bg-[#1a1a1a] border-[#333]'
            : 'bg-white border-gray-200'
        }`}>
          {/* Dashboard header */}
          <div className={`px-5 py-4 border-b flex items-center gap-3 transition-colors ${
            isDarkCard
              ? 'bg-[#252525] border-[#333]'
              : 'bg-gray-100 border-gray-200'
          }`}>
            <Image src="/images/choe-logo.png" alt="Choé" width={150} height={44} className="h-[44px] w-auto -my-1" />
            <div className="flex-1">
              <span className={`font-bold text-sm sm:text-base ${isDarkCard ? 'text-white' : 'text-gray-900'}`}>
                Voice Commands While Driving
              </span>
              <p className={`text-xs ${isDarkCard ? 'text-[#666]' : 'text-gray-500'}`}>
                Hands-free booking experience
              </p>
            </div>
            {/* Dark/Light toggle */}
            <button
              onClick={() => setIsDarkCard(!isDarkCard)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isDarkCard
                  ? 'bg-[#333] text-[#a8a8a8] hover:bg-[#444]'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isDarkCard ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkCard ? <IoSunnyOutline className="w-3.5 h-3.5" /> : <IoMoonOutline className="w-3.5 h-3.5" />}
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

          {/* Commands list - Animated */}
          <div className="p-5 sm:p-6 space-y-5 min-h-[280px]">
            {voiceCommands.map((item, index) => (
              <div
                key={index}
                className={`transition-opacity duration-300 ${
                  currentCommand >= index || showResponse[index] ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {/* User voice command */}
                <div className="flex items-start gap-4 mb-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentCommand === index && !showResponse[index]
                        ? 'bg-[#e87040]/30 animate-pulse'
                        : 'bg-[#e87040]/10'
                    }`}>
                      <IoVolumeHighOutline className="w-4 h-4 text-[#e87040]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <code className={`font-mono text-sm block ${isDarkCard ? 'text-white' : 'text-gray-900'}`}>
                      {currentCommand === index && !showResponse[index]
                        ? `"${typedCommand}${typedCommand.length < item.typing.length ? '|' : ''}"`
                        : item.command
                      }
                    </code>
                  </div>
                </div>

                {/* Choé response */}
                {showResponse[index] && (
                  <div className={`ml-12 pl-3 border-l-2 border-[#e87040] animate-fadeIn ${
                    isDarkCard ? 'text-[#a8a8a8]' : 'text-gray-600'
                  }`}>
                    <p className="text-xs">
                      <span className="text-[#27ca3f] font-medium">Choé:</span> {item.response}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Completion message */}
            {isComplete && (
              <div className="flex items-center gap-2 text-[#27ca3f] mt-4 animate-fadeIn">
                <IoCheckmarkCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Booking complete - hands never left the wheel</span>
              </div>
            )}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-5 border border-[#27ca3f]/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#27ca3f]/15 flex items-center justify-center flex-shrink-0">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-[#27ca3f]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Safety First</h3>
              <p className="text-sm text-gray-600 dark:text-[#a8a8a8]">
                While driving, Choé is <span className="text-[#27ca3f] font-medium">voice-only</span>. No visual browsing. No scrolling.
                Full browsing with photos and comparisons is for when you&apos;re parked.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            'Same cart across all devices',
            'Voice confirmation for bookings',
            'Real-time price updates',
            'Traffic-aware suggestions',
            'Apple CarPlay ready',
            'Android Auto ready'
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#a8a8a8]">
              <IoCheckmarkCircle className="w-4 h-4 text-[#e87040] flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
