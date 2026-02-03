// app/get-started/business/page.tsx
// Unified Business Signup - Choose your host type

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoCarOutline,
  IoPeopleOutline,
  IoLayersOutline,
  IoArrowForwardOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoSparklesOutline,
  IoBusinessOutline,
  IoMoonOutline,
  IoSunnyOutline
} from 'react-icons/io5'

type BusinessType = 'own_cars' | 'manage_others' | 'both'

export default function BusinessTypePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Set theme-color and body background for iOS safe areas (matches dark/light mode)
  useEffect(() => {
    const bgColor = isDarkMode ? '#111827' : '#f9fafb' // gray-900 or gray-50

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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center group">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Image
                  src={isDarkMode ? "/logo-white.png" : "/logo.png"}
                  alt="ItWhip"
                  width={192}
                  height={192}
                  className="h-10 w-10 group-hover:opacity-80 transition-opacity"
                  priority
                />
              </div>
              <span className={`text-[8px] tracking-widest uppercase font-medium mt-0.5 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                GET STARTED
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 transition-colors rounded-lg ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <IoSunnyOutline className="w-5 h-5" />
              ) : (
                <IoMoonOutline className="w-5 h-5" />
              )}
            </button>
            <Link
              href="/host/login"
              className={`text-sm transition-colors ${
                isDarkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Already a host? <span className="font-medium">Log in</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        {/* Back Button & Badge Row */}
        <div className="relative flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className={`inline-flex items-center gap-2 transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <IoArrowBackOutline className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              isDarkMode
                ? 'bg-blue-900/20 text-blue-400'
                : 'bg-blue-100 text-blue-700'
            }`}>
              <IoBusinessOutline className="w-4 h-4" />
              <span>Business Setup</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 text-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          How will you use ItWhip?
        </h1>

        {/* Subtitle */}
        <p className={`text-sm sm:text-base mb-8 text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Choose the option that best describes your situation. You can always expand your usage later.
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {options.map((option) => {
            const Icon = option.icon
            const isSelected = selectedType === option.id

            return (
              <button
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left flex flex-col ${
                  isSelected
                    ? 'border-green-500 shadow-lg shadow-green-500/10' + (isDarkMode ? ' bg-green-900/20' : ' bg-green-50')
                    : isDarkMode
                      ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />
                  </div>
                )}

                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  isSelected
                    ? 'bg-green-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-green-800 text-green-300'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {option.subtitle}
                  </span>
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {option.title}
                </h3>

                <p className={`text-sm mb-4 flex-grow ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>

                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {option.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
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
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedType
                ? isDarkMode
                  ? 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800 border border-gray-900'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
            }`}
          >
            {isLoading ? (
              <>
                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                  isDarkMode ? 'border-gray-900' : 'border-white'
                }`} />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Continue to Sign Up</span>
                <IoArrowForwardOutline className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className={`mt-10 p-6 rounded-lg border ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <IoSparklesOutline className={`w-5 h-5 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            Before you start
          </h3>
          <ul className={`text-sm space-y-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <li className="flex items-start gap-2">
              <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>•</span>
              <span>
                <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>No verification required until you list a car.</strong> You can explore the dashboard before adding vehicles.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>•</span>
              <span>
                <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>Your public profile appears when you list your first car.</strong> Until then, your account is private.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>•</span>
              <span>
                <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>You can change your role later.</strong> Start as an individual host and expand to fleet management anytime.
              </span>
            </li>
          </ul>
        </div>

        {/* Footer Note */}
        <p className={`text-center text-sm mt-8 ${
          isDarkMode ? 'text-gray-500' : 'text-gray-600'
        }`}>
          By continuing, you agree to our{' '}
          <Link href="/terms" className={`hover:underline ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Terms of Service
          </Link>
          ,{' '}
          <Link href="/privacy" className={`hover:underline ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Privacy Policy
          </Link>
          , and{' '}
          <Link href="/host-agreement" className={`hover:underline ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Host Agreement
          </Link>
        </p>
      </main>
    </div>
  )
}
