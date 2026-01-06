// app/(guest)/rentals/sections/QuickActionsBar.tsx
// Smart sticky bar - smooth transition when attaching to header

'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  IoMapOutline,
  IoLocationOutline,
  IoFlashOutline,
  IoSparklesOutline,
  IoCarSportOutline,
  IoPeopleOutline
} from 'react-icons/io5'

interface QuickActionsBarProps {
  variant?: 'homepage' | 'rideshare'
}

export default function QuickActionsBar({ variant = 'homepage' }: QuickActionsBarProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  // Smart sticky logic with smooth transition
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const shouldBeSticky = scrollPosition > 250

      if (shouldBeSticky !== isSticky) {
        setIsSticky(shouldBeSticky)

        // Delay visibility for enter animation
        if (shouldBeSticky) {
          requestAnimationFrame(() => {
            setIsVisible(true)
          })
        } else {
          setIsVisible(false)
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isSticky])

  const navLinks = (
    <div className="flex items-center justify-between gap-2 py-3 sm:py-3.5 w-full">
      {/* Map View */}
      <Link
        href="/rentals/search?view=map"
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-sm shadow-sm hover:shadow border border-gray-200 dark:border-gray-600"
      >
        <IoMapOutline className="w-4 h-4 text-blue-500" />
        <span>Map</span>
      </Link>

      {/* Cities */}
      <Link
        href="/rentals/cities"
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-sm shadow-sm hover:shadow border border-gray-200 dark:border-gray-600"
      >
        <IoLocationOutline className="w-4 h-4 text-purple-500" />
        <span>Cities</span>
      </Link>

      {/* Third button - varies by variant */}
      {variant === 'homepage' ? (
        // Homepage: Show Rideshare link
        <Link
          href="/rideshare"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all font-medium text-sm shadow-sm hover:shadow border border-orange-200 dark:border-orange-800"
        >
          <IoCarSportOutline className="w-4 h-4" />
          <span>Rideshare</span>
        </Link>
      ) : (
        // Rideshare page: Show Rentals link
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all font-medium text-sm shadow-sm hover:shadow border border-green-200 dark:border-green-800"
        >
          <IoCarSportOutline className="w-4 h-4" />
          <span>Rentals</span>
        </Link>
      )}

      {/* Fourth button - varies by variant */}
      {variant === 'homepage' ? (
        // Homepage: List Your Car
        <Link
          href="/list-your-car"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-md hover:shadow-lg text-sm"
        >
          <IoSparklesOutline className="w-4 h-4" />
          <span className="hidden sm:inline">List Your Car</span>
          <span className="sm:hidden">List</span>
        </Link>
      ) : (
        // Rideshare page: Join Now
        <Link
          href="/partners/apply"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md hover:shadow-lg text-sm"
        >
          <IoPeopleOutline className="w-4 h-4" />
          <span>Join</span>
        </Link>
      )}
    </div>
  )

  const barInner = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {navLinks}
    </div>
  )

  return (
    <>
      {/* Normal flow bar (when not sticky) */}
      <section
        ref={barRef}
        className={`relative z-10 w-full bg-white dark:bg-gray-800 border-y border-gray-300 dark:border-gray-600 shadow-sm transition-opacity duration-200 ${
          isSticky ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {barInner}
      </section>

      {/* Fixed sticky bar (appears when scrolled) */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 w-full bg-white dark:bg-gray-800 border-y border-gray-300 dark:border-gray-600 shadow-lg transition-all duration-300 ease-out ${
          isSticky && isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {barInner}
      </div>

    </>
  )
}