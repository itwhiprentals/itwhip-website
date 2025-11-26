// app/(guest)/rentals/sections/QuickActionsBar.tsx
// Smart sticky bar - smooth transition when attaching to header

'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { 
  IoSearchOutline,
  IoMapOutline,
  IoLocationOutline,
  IoBedOutline,
  IoFlashOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function QuickActionsBar() {
  const [isSticky, setIsSticky] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [barHeight, setBarHeight] = useState(52)

  // Measure bar height for spacer
  useEffect(() => {
    if (barRef.current) {
      setBarHeight(barRef.current.offsetHeight)
    }
  }, [])

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
    <div className="flex items-center gap-2 py-3 sm:py-3.5">
      {/* Browse Cars */}
      <Link 
        href="/rentals/search" 
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 font-medium text-sm whitespace-nowrap flex-shrink-0"
      >
        <IoSearchOutline className="w-4 h-4" />
        <span>Browse</span>
      </Link>

      {/* Map View */}
      <Link 
        href="/rentals/search?view=map" 
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 font-medium text-sm whitespace-nowrap flex-shrink-0"
      >
        <IoMapOutline className="w-4 h-4" />
        <span>Map</span>
      </Link>

      {/* Cities */}
      <Link 
        href="/rentals/cities" 
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 font-medium text-sm whitespace-nowrap flex-shrink-0"
      >
        <IoLocationOutline className="w-4 h-4" />
        <span>Cities</span>
      </Link>

      {/* Hotels */}
      <Link 
        href="/hotel-solutions" 
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 font-medium text-sm whitespace-nowrap flex-shrink-0"
      >
        <IoBedOutline className="w-4 h-4" />
        <span>Hotels</span>
      </Link>

      {/* Instant Book */}
      <Link 
        href="/rentals/search?instantBook=true" 
        className="flex items-center gap-1.5 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all hover:scale-105 font-medium text-sm whitespace-nowrap flex-shrink-0"
      >
        <IoFlashOutline className="w-4 h-4" />
        <span className="hidden sm:inline">Instant Book</span>
        <span className="sm:hidden">Instant</span>
      </Link>

      {/* List Your Car */}
      <Link 
        href="/list-your-car" 
        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-md hover:shadow-lg hover:scale-105 text-sm whitespace-nowrap flex-shrink-0"
      >
        <IoSparklesOutline className="w-4 h-4" />
        <span className="hidden sm:inline">List Your Car</span>
        <span className="sm:hidden">List</span>
      </Link>
    </div>
  )

  const barInner = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative w-full">
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth lg:justify-center"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {navLinks}
        </div>

        {/* Scroll indicators for mobile only */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none lg:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none lg:hidden" />
      </div>
    </div>
  )

  return (
    <>
      {/* Normal flow bar (when not sticky) */}
      <section 
        ref={barRef}
        className={`relative z-10 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-opacity duration-200 ${
          isSticky ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {barInner}
      </section>

      {/* Fixed sticky bar (appears when scrolled) */}
      <div 
        className={`fixed top-16 left-0 right-0 z-40 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out ${
          isSticky && isVisible
            ? 'opacity-100 translate-y-0 shadow-md' 
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {barInner}
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}