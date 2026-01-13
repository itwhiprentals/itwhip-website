// app/get-started/page.tsx
// Unified Entry Point - Choose between renting or renting out cars

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoCarOutline,
  IoBusinessOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircleOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function GetStartedPage() {
  const router = useRouter()
  const [selectedPath, setSelectedPath] = useState<'rent' | 'business' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = () => {
    if (!selectedPath) return

    setIsLoading(true)

    if (selectedPath === 'rent') {
      // Guest path - go to guest signup
      router.push('/auth/signup')
    } else {
      // Business path - go to business type selection
      router.push('/get-started/business')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center group">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Image
                  src="/logo-white.png"
                  alt="ItWhip"
                  width={192}
                  height={192}
                  className="h-10 w-10 group-hover:opacity-80 transition-opacity"
                  priority
                />
              </div>
              <span className="text-[8px] text-gray-300 tracking-widest uppercase font-medium mt-0.5">
                GET STARTED
              </span>
            </div>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
          >
            Already have an account? <span className="font-medium">Log in</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 rounded-full text-sm font-medium mb-4">
            <IoSparklesOutline className="w-4 h-4" />
            <span>Join the ItWhip Community</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What brings you to ItWhip?
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Whether you&apos;re looking for the perfect rental car or want to start your car rental business, we&apos;ve got you covered.
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Option 1: Rent Cars */}
          <button
            onClick={() => setSelectedPath('rent')}
            className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedPath === 'rent'
                ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            {selectedPath === 'rent' && (
              <div className="absolute top-4 right-4">
                <IoCheckmarkCircleOutline className="w-6 h-6 text-blue-500" />
              </div>
            )}

            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 ${
              selectedPath === 'rent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}>
              <IoCarOutline className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              I want to rent cars
            </h3>

            <p className="text-gray-400 mb-4">
              Find and book vehicles from local hosts and rental businesses. Great selection, competitive prices.
            </p>

            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Browse thousands of vehicles</span>
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Book instantly or request approval</span>
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Secure payments and insurance</span>
              </li>
            </ul>
          </button>

          {/* Option 2: Rent Out Cars (Business) */}
          <button
            onClick={() => setSelectedPath('business')}
            className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedPath === 'business'
                ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            {selectedPath === 'business' && (
              <div className="absolute top-4 right-4">
                <IoCheckmarkCircleOutline className="w-6 h-6 text-blue-500" />
              </div>
            )}

            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 ${
              selectedPath === 'business'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}>
              <IoBusinessOutline className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              I want to rent out cars
            </h3>

            <p className="text-gray-400 mb-4">
              List your vehicles, manage your fleet, and grow your car rental business with ItWhip.
            </p>

            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>List your own car(s) for rent</span>
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Manage fleets for others</span>
              </li>
              <li className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Powerful business tools & analytics</span>
              </li>
            </ul>
          </button>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedPath || isLoading}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 ${
              selectedPath
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <IoArrowForwardOutline className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-blue-400 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </main>
    </div>
  )
}
