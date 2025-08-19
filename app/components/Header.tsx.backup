// app/components/Header.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  IoSunnyOutline,
  IoMoonOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoAirplaneOutline,
  IoCarOutline,
  IoPricetagOutline,
  IoBusinessOutline,
  IoCarSportOutline,
  IoCodeSlashOutline,
  IoLogoApple,
  IoLogoGooglePlaystore,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoPersonOutline
} from 'react-icons/io5'
import MobileMenu from './MobileMenu'
import type { HeaderProps } from '../types'

// Navigation Items - Updated with Technology section
const navItems = [
  {
    label: 'Services',
    icon: <IoAirplaneOutline className="w-4 h-4" />,
    items: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Flight Tracker', href: '/flights' },
      { label: 'Group Rides', href: '/group-rides' },
      { label: 'Corporate Accounts', href: '/corporate' },
      { label: 'Private Club', href: '/private-club' }
    ]
  },
  {
    label: 'Technology',
    icon: <IoCodeSlashOutline className="w-4 h-4" />,
    items: [
      { label: 'Developer APIs', href: '/developers' },
      { label: 'Instant Ride SDK™', href: '/sdk', highlight: true },
      { label: 'Integration Partners', href: '/integrations' },
      { label: 'Hotel Solutions', href: '/hotel-solutions' },
      { label: 'Hotel Portal', href: '/hotel-portal' },
      { label: 'GDS Documentation', href: '/gds' }
    ]
  },
  {
    label: 'Drivers',
    icon: <IoCarOutline className="w-4 h-4" />,
    items: [
      { label: 'Become a Driver', href: '/drive', highlight: true },
      { label: 'Driver Requirements', href: '/requirements' },
      { label: 'Earnings Calculator', href: '/earnings' },
      { label: 'Driver Portal', href: '/portal' }
    ]
  },
  {
    label: 'Pricing',
    icon: <IoPricetagOutline className="w-4 h-4" />,
    items: [
      { label: 'Pricing Calculator', href: '/pricing' },
      { label: 'Compare Services', href: '/compare' },
      { label: 'No Surge Guarantee', href: '/no-surge' }
    ]
  },
  {
    label: 'Company',
    icon: <IoBusinessOutline className="w-4 h-4" />,
    items: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers', badge: '12' },
      { label: 'Safety', href: '/safety' },
      { label: 'Support', href: '/support' },
      { label: 'Contact', href: '/contact' }
    ]
  }
]

interface ExtendedHeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
  handleGetAppClick: () => void
  handleSearchClick: () => void
  currentView?: 'rider' | 'hotel'
  onViewChange?: (view: 'rider' | 'hotel') => void
}

export default function Header({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleGetAppClick,
  handleSearchClick,
  currentView = 'rider',
  onViewChange
}: ExtendedHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.nav-dropdown')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Check initial theme
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true)
    }
  }, [])

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Left side - Logo and Nav */}
            <div className="flex items-center">
              {/* Logo - Reduced spacing */}
              <Link href="/" className="flex items-center mr-6 lg:mr-8">
                <div className="flex flex-col">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    ItWhip
                  </h1>
                  <span className="text-[9px] md:hidden text-gray-600 dark:text-gray-400 mt-0.5">
                    Est. 2019 • Technology
                  </span>
                  <span className="hidden md:block text-xs text-gray-600 dark:text-gray-400">
                    Premium Transportation Network • Est. 2019
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation - Tighter spacing */}
              <nav className="hidden lg:flex items-center">
                {navItems.map((item) => (
                  <div key={item.label} className="nav-dropdown relative">
                    <button
                      onClick={() => setActiveDropdown(
                        activeDropdown === item.label ? null : item.label
                      )}
                      className="flex items-center space-x-0.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <IoChevronDownOutline 
                        className={`w-3 h-3 transition-transform ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-2">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                              subItem.highlight 
                                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="flex items-center justify-between">
                              {subItem.label}
                              {subItem.highlight && (
                                <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                  NEW
                                </span>
                              )}
                              {subItem.badge && (
                                <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                  {subItem.badge}
                                </span>
                              )}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* View Toggle - Desktop Only, Integrated in Nav */}
                {onViewChange && (
                  <div className="ml-4 flex items-center">
                    <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
                      {/* Background slider */}
                      <div 
                        className={`absolute h-7 w-[76px] bg-gradient-to-r rounded-full transition-transform duration-300 ${
                          currentView === 'rider' 
                            ? 'from-blue-500 to-blue-600 translate-x-0' 
                            : 'from-amber-500 to-amber-600 translate-x-[80px]'
                        }`} 
                      />
                      
                      {/* Rider Button */}
                      <button
                        onClick={() => onViewChange('rider')}
                        className={`relative z-10 flex items-center space-x-0.5 px-3 py-1.5 rounded-full transition-colors text-xs font-medium ${
                          currentView === 'rider' 
                            ? 'text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <IoArrowBackOutline className="w-3 h-3" />
                        <span>Riders</span>
                      </button>
                      
                      {/* Hotel Button */}
                      <button
                        onClick={() => onViewChange('hotel')}
                        className={`relative z-10 flex items-center space-x-0.5 px-3 py-1.5 rounded-full transition-colors text-xs font-medium ${
                          currentView === 'hotel' 
                            ? 'text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <span>Hotels</span>
                        <IoArrowForwardOutline className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </nav>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <IoSunnyOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <IoMoonOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {/* Get App Button - More space */}
              <div className="relative group">
                <button 
                  className="px-4 py-2 text-sm font-medium 
                    text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 
                    rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  Get App
                </button>
                
                {/* Dropdown for App Options */}
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-gray-900 
                  border border-gray-200 dark:border-gray-800 py-2 invisible group-hover:visible 
                  opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <a
                    href="https://testflight.apple.com/join/ygzsQbNf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <IoLogoApple className="w-5 h-5" />
                    <div>
                      <div className="font-medium">iOS App</div>
                      <div className="text-xs text-gray-500">TestFlight Beta</div>
                    </div>
                  </a>
                  <button
                    disabled
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-400 
                      dark:text-gray-600 cursor-not-allowed w-full text-left"
                  >
                    <IoLogoGooglePlaystore className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Android App</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Sign In Button - Icon only */}
              <button 
                onClick={handleSearchClick}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 
                  dark:hover:bg-gray-700 transition-colors group relative"
                aria-label="Sign In / Account"
              >
                <IoPersonOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                
                {/* Tooltip on hover */}
                <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 
                  text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 
                  pointer-events-none transition-opacity">
                  Sign In / Account
                </div>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <IoCloseOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <IoMenuOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
        currentView={currentView}
        onViewChange={onViewChange}
      />
    </>
  )
}