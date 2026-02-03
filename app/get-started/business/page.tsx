// app/get-started/business/page.tsx
// Unified Business Signup - Choose your host type

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoCarOutline,
  IoPeopleOutline,
  IoLayersOutline,
  IoArrowForwardOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoSparklesOutline,
  IoBusinessOutline
} from 'react-icons/io5'

type BusinessType = 'own_cars' | 'manage_others' | 'both'

export default function BusinessTypePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Set theme-color and body background for iOS safe areas
  useEffect(() => {
    const bgColor = isDarkMode ? '#111827' : '#ffffff' // gray-900 or white

    let metaTag = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'theme-color'
      document.head.appendChild(metaTag)
    }
    metaTag.content = bgColor
    document.body.style.backgroundColor = bgColor

    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [isDarkMode])

  const handleContinue = () => {
    if (!selectedType) return

    setIsLoading(true)

    // Store the selected type and redirect to host signup with pre-selected flags
    const params = new URLSearchParams()
    params.set('type', selectedType)

    router.push(`/host/signup?${params.toString()}`)
  }

  const options: {
    id: BusinessType
    icon: typeof IoCarOutline
    title: string
    subtitle: string
    description: string
    benefits: string[]
  }[] = [
    {
      id: 'own_cars',
      icon: IoCarOutline,
      title: 'Rent out my own car(s)',
      subtitle: 'Individual Host',
      description: 'You own vehicles and want to list them on ItWhip to earn rental income.',
      benefits: [
        'List your personal vehicles',
        'Set your own prices & availability',
        'Earn passive income',
        'Get your own branded landing page'
      ]
    },
    {
      id: 'manage_others',
      icon: IoPeopleOutline,
      title: 'Manage cars for others',
      subtitle: 'Fleet Manager',
      description: 'You manage vehicles owned by other people and handle rentals on their behalf.',
      benefits: [
        'Manage multiple vehicle owners',
        'Handle bookings & guest communication',
        'Track earnings per owner',
        'Scale your management business'
      ]
    },
    {
      id: 'both',
      icon: IoLayersOutline,
      title: 'Both - I own & manage',
      subtitle: 'Hybrid Host',
      description: 'You have your own vehicles AND manage cars for other owners.',
      benefits: [
        'Full access to all features',
        'Separate tracking for owned vs managed',
        'Best of both worlds',
        'Maximum flexibility'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center group">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="ItWhip"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full group-hover:opacity-80 transition-opacity"
                />
              </div>
              <span className="text-[8px] tracking-widest uppercase font-medium mt-0.5 text-gray-600 dark:text-gray-400">
                GET STARTED
              </span>
            </div>
          </Link>
          <Link
            href="/host/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            Already a host? <span className="font-medium">Log in</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            <IoBusinessOutline className="w-4 h-4" />
            <span>Business Setup</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          How will you use ItWhip?
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base mb-6 md:mb-8 text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Choose the option that best describes your situation. You can always expand later.
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {options.map((option) => {
            const Icon = option.icon
            const isSelected = selectedType === option.id

            return (
              <button
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className={`relative p-5 md:p-6 rounded-lg border-2 transition-all duration-200 text-left flex flex-col ${
                  isSelected
                    ? 'border-green-500 shadow-lg shadow-green-500/20 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-gray-600 hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />
                  </div>
                )}

                {/* Mobile: Horizontal layout for icon + title */}
                <div className="flex items-start gap-4 md:flex-col md:gap-0">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0 md:mb-4 ${
                    isSelected
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>

                  <div className="flex-1 md:w-full">
                    <div className="mb-1 md:mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {option.subtitle}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 dark:text-white">
                      {option.title}
                    </h3>

                    <p className="text-sm mb-0 md:mb-4 text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Benefits - Hidden on mobile when not selected, always visible on desktop */}
                <ul className={`space-y-2 text-sm mt-4 pt-4 border-t text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 ${isSelected ? 'block' : 'hidden md:block'}`}>
                  {option.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <IoCheckmarkCircleOutline className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isSelected ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            className={`inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 rounded-lg text-base font-semibold transition-all duration-200 ${
              selectedType
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Continue to Sign Up</span>
                <IoArrowForwardOutline className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-5 md:p-6 rounded-lg border bg-blue-50 dark:bg-gray-800 border-blue-100 dark:border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
            <IoSparklesOutline className="w-5 h-5 text-blue-500" />
            Before you start
          </h3>
          <ul className="text-sm space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              <span>
                <strong className="text-gray-900 dark:text-white">No verification required until you list a car.</strong> You can explore the dashboard before adding vehicles.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              <span>
                <strong className="text-gray-900 dark:text-white">Your public profile appears when you list your first car.</strong> Until then, your account is private.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              <span>
                <strong className="text-gray-900 dark:text-white">You can change your role later.</strong> Start as an individual host and expand to fleet management anytime.
              </span>
            </li>
          </ul>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs md:text-sm mt-8 text-gray-500 dark:text-gray-500">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
            Terms of Service
          </Link>
          ,{' '}
          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </Link>
          , and{' '}
          <Link href="/host-agreement" className="text-blue-600 dark:text-blue-400 hover:underline">
            Host Agreement
          </Link>
        </p>
      </main>
    </div>
  )
}
