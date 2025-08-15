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
  IoBusinessOutline
} from 'react-icons/io5'
import MobileMenu from './MobileMenu'
import type { HeaderProps } from '../types'

// Navigation Items - keeping original structure
const navItems = [
  {
    label: 'Services',
    icon: <IoAirplaneOutline className="w-4 h-4" />,
    items: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Flight Tracker', href: '/flights' },
      { label: 'Group Rides', href: '/group-rides' },
      { label: 'Corporate Accounts', href: '/corporate' }
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
      { label: 'Safety', href: '/safety' },
      { label: 'Support', href: '/support' },
      { label: 'Contact', href: '/contact' }
    ]
  }
]

export default function Header({
  isDarkMode,
  toggleTheme,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleGetAppClick,
  handleSearchClick
}: HeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

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

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Left side - Logo and Nav */}
            <div className="flex items-center space-x-4 md:space-x-8">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    ItWhip
                  </h1>
                  <span className="sm:hidden text-[10px] text-gray-600 dark:text-gray-400 -mt-1">
                    Technology
                  </span>
                  <span className="hidden sm:block text-xs text-gray-600 dark:text-gray-400">
                    Flight Intelligence & Driver Connection Platform
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <div key={item.label} className="nav-dropdown relative">
                    <button
                      onClick={() => setActiveDropdown(
                        activeDropdown === item.label ? null : item.label
                      )}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                            {subItem.label}
                            {subItem.highlight && (
                              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                NEW
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <IoSunnyOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <IoMoonOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {/* Get App Button */}
              <button 
                onClick={handleGetAppClick}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                Get App
              </button>
              
              {/* Sign In Button */}
              <button 
                onClick={handleSearchClick}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden py-3 border-t border-gray-200 dark:border-gray-800">
              <button 
                onClick={handleGetAppClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Download App
              </button>
              <button 
                onClick={handleSearchClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Track Flights
              </button>
              <button 
                onClick={handleSearchClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Driver Portal
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />
    </>
  )
}