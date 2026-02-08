// app/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import SplitHero from './components/SplitHero'
import RiderView from './components/RiderView'
import HotelView from './components/HotelView'
import Footer from './components/Footer'
import { 
  initializeUserType, 
  setUserTypeCookie,
  type UserType 
} from './utils/userTypeDetection'

export default function HomePage() {
  const [userType, setUserType] = useState<UserType>('unknown')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Initialize user type on mount
  useEffect(() => {
    const type = initializeUserType()
    setUserType(type)
    setIsLoading(false)
  }, [])

  // Listen for view changes from MobileMenu custom event
  useEffect(() => {
    const handleViewChangeEvent = (event: CustomEvent) => {
      const newView = event.detail as 'rider' | 'hotel'
      handleViewChange(newView)
    }
    
    window.addEventListener('viewChange', handleViewChangeEvent as EventListener)
    
    return () => {
      window.removeEventListener('viewChange', handleViewChangeEvent as EventListener)
    }
  }, [])

  // Handle user type selection from split hero
  const handleUserTypeSelection = (type: 'rider' | 'hotel') => {
    setUserType(type)
    setUserTypeCookie(type)
    
    // Also save to localStorage for MobileMenu compatibility
    localStorage.setItem('currentView', type)
    
    // Smooth scroll to top when switching views
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle view change from header toggle or mobile menu
  const handleViewChange = (type: 'rider' | 'hotel') => {
    setUserType(type)
    setUserTypeCookie(type)
    
    // Also save to localStorage for MobileMenu compatibility
    localStorage.setItem('currentView', type)
    
    // Close mobile menu if open
    setIsMobileMenuOpen(false)
    
    // Track the toggle action
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_toggled', {
        from_type: userType,
        to_type: type
      })
    }
  }

  // Handle app-related clicks
  const handleGetAppClick = () => {
    console.log('Get app clicked')
    // Could open a modal or redirect to app store
    if (typeof window !== 'undefined') {
      // For now, just go to TestFlight
      window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
    }
  }

  const handleSearchClick = () => {
    console.log('Search/Sign In clicked')
    // Could open auth modal or search interface
  }

  // Convert userType to currentView for Header compatibility
  const getCurrentView = (): 'rider' | 'hotel' | undefined => {
    if (userType === 'rider' || userType === 'hotel') {
      return userType
    }
    return undefined
  }

  // Loading state - keep it minimal
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-4">ItWhip</h1>
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  // Show split hero for unknown users
  if (userType === 'unknown') {
    return (
      <main className="min-h-screen bg-black">
        <SplitHero onSelectUserType={handleUserTypeSelection} />
      </main>
    )
  }

  // Show rider view
  if (userType === 'rider') {
    return (
      <main className="min-h-screen bg-white dark:bg-black">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
          {...{ currentView: "rider", onViewChange: handleViewChange } as any}
        />

        <div className="pt-14 md:pt-16">
          <RiderView />
        </div>

        <Footer />
      </main>
    )
  }

  // Show hotel view
  if (userType === 'hotel') {
    return (
      <main className="min-h-screen bg-white dark:bg-black">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
          {...{ currentView: "hotel", onViewChange: handleViewChange } as any}
        />

        <div className="pt-14 md:pt-16">
          <HotelView />
        </div>
        
        <Footer />
      </main>
    )
  }

  // Fallback (should never reach here)
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white mb-4">ItWhip</h1>
        <p className="text-gray-400 mb-4">Something went wrong.</p>
        <button 
          onClick={() => {
            setUserType('unknown')
            localStorage.removeItem('currentView')
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}