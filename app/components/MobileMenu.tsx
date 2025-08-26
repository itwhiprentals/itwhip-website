// app/components/MobileMenu.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  IoCloseOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoAirplaneOutline,
  IoCarOutline,
  IoPricetagOutline,
  IoBusinessOutline,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogInOutline,
  IoLogOutOutline,
  IoPersonOutline,
  IoPersonCircleOutline,
  IoCarSportOutline,
  IoCodeSlashOutline,
  IoSettingsOutline,
  IoKeyOutline
} from 'react-icons/io5'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  handleGetAppClick?: () => void
  handleSearchClick?: () => void
  isLoggedIn?: boolean
  user?: User | null
  onProfileClick?: () => void
  onLogout?: () => void
}

// Mobile navigation structure
const mobileNavItems = [
  {
    label: 'Services',
    icon: <IoAirplaneOutline className="w-5 h-5" />,
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
    icon: <IoCodeSlashOutline className="w-5 h-5" />,
    items: [
      { label: 'Developer APIs', href: '/developers' },
      { label: 'Instant Ride SDK™', href: '/sdk', highlight: true },
      { label: 'Integration Partners', href: '/integrations' },
      { label: 'Hotel Solutions', href: '/hotel-solutions' },
      { label: 'Hotel Portal', href: '/portal/login' },
      { label: 'GDS Documentation', href: '/gds' }
    ]
  },
  {
    label: 'Drivers',
    icon: <IoCarOutline className="w-5 h-5" />,
    badge: 'HIRING',
    items: [
      { label: 'Become a Driver', href: '/drive', highlight: true },
      { label: 'Driver Requirements', href: '/requirements' },
      { label: 'Earnings Calculator', href: '/earnings' },
      { label: 'Driver Portal', href: '/driver/login' }
    ]
  },
  {
    label: 'Company',
    icon: <IoBusinessOutline className="w-5 h-5" />,
    items: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers', badge: '12 open' },
      { label: 'Press', href: '/press' },
      { label: 'Investors', href: '/investors' },
      { label: 'Contact', href: '/contact' }
    ]
  }
]

export default function MobileMenu({
  isOpen,
  onClose,
  handleGetAppClick,
  handleSearchClick,
  isLoggedIn = false,
  user = null,
  onProfileClick,
  onLogout
}: MobileMenuProps) {
  const pathname = usePathname()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  // Determine active service based on pathname
  const getActiveService = () => {
    if (pathname?.startsWith('/rides')) return 'rides'
    if (pathname?.startsWith('/hotels')) return 'hotels'
    if (pathname?.startsWith('/rentals')) return 'rentals'
    return null
  }

  const activeService = getActiveService()
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle section toggle
  const toggleSection = (label: string) => {
    setExpandedSection(expandedSection === label ? null : label)
  }

  // Handle navigation click
  const handleNavClick = () => {
    onClose()
    setExpandedSection(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className={`
        absolute right-0 top-0 h-full w-full max-w-sm
        bg-white dark:bg-gray-900 shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            Menu
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)]">
          
          {/* User Info Section (if logged in) */}
          {isLoggedIn && user && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <IoPersonCircleOutline className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
              
              {/* Quick Actions for Logged In Users */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    if (onProfileClick) onProfileClick()
                    handleNavClick()
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <IoPersonOutline className="w-5 h-5" />
                    <span className="font-medium">Profile & Settings</span>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400" />
                </button>
                
                <Link
                  href="/dashboard"
                  onClick={handleNavClick}
                  className="w-full flex items-center justify-between px-4 py-3 
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <IoSettingsOutline className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>
          )}
          
          {/* THREE-WAY SERVICE NAVIGATION */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center">
              <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
                {/* Background slider */}
                <div 
                  className={`absolute h-8 w-24 rounded-full transition-transform duration-300 ${
                    activeService === 'rides' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 translate-x-0' 
                      : activeService === 'hotels'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 translate-x-[96px]'
                      : activeService === 'rentals'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 translate-x-[192px]'
                      : 'hidden'
                  }`} 
                />
                
                {/* Rides Button */}
                <Link
                  href="/rides"
                  onClick={handleNavClick}
                  className={`relative z-10 flex items-center justify-center w-24 py-2 rounded-full transition-colors text-sm font-medium ${
                    activeService === 'rides' 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoCarOutline className="w-3 h-3 mr-1" />
                  Rides
                </Link>
                
                {/* Hotels Button */}
                <Link
                  href="/hotels"
                  onClick={handleNavClick}
                  className={`relative z-10 flex items-center justify-center w-24 py-2 rounded-full transition-colors text-sm font-medium ${
                    activeService === 'hotels' 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoBusinessOutline className="w-3 h-3 mr-1" />
                  Hotels
                </Link>

                {/* Rentals Button */}
                <Link
                  href="/rentals"
                  onClick={handleNavClick}
                  className={`relative z-10 flex items-center justify-center w-24 py-2 rounded-full transition-colors text-sm font-medium ${
                    activeService === 'rentals' 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IoKeyOutline className="w-3 h-3 mr-1" />
                  Rentals
                </Link>
              </div>
            </div>
          </div>

          {/* Sign In / Sign Up Button (Only if not logged in) */}
          {!isLoggedIn && (
            <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-800">
              <Link
                href="/auth/login"
                onClick={handleNavClick}
                className="w-full flex items-center justify-between px-4 py-3 
                  bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <IoLogInOutline className="w-5 h-5" />
                  <span className="font-medium">Sign In / Sign Up</span>
                </div>
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* Navigation Sections */}
          <div className="py-2">
            {mobileNavItems.map((section) => (
              <div key={section.label} className="border-b border-gray-200 dark:border-gray-800">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-4 py-3
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600 dark:text-gray-400">
                      {section.icon}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {section.label}
                    </span>
                    {section.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <IoChevronDownOutline className={`
                    w-5 h-5 text-gray-400 transition-transform
                    ${expandedSection === section.label ? 'rotate-180' : ''}
                  `} />
                </button>

                {/* Section Items */}
                {expandedSection === section.label && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 py-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleNavClick}
                        className={`
                          block px-12 py-2.5 text-sm transition-colors
                          ${'highlight' in item && item.highlight 
                            ? 'text-blue-600 dark:text-blue-400 font-medium' 
                            : 'text-gray-700 dark:text-gray-300'
                          }
                          hover:bg-gray-100 dark:hover:bg-gray-800
                        `}
                      >
                        <span className="flex items-center justify-between">
                          {item.label}
                          {'highlight' in item && item.highlight && (
                            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                          {'badge' in item && item.badge && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sign Out Button (Only if logged in) */}
          {isLoggedIn && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  if (onLogout) onLogout()
                  handleNavClick()
                }}
                className="w-full flex items-center justify-between px-4 py-3 
                  bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg 
                  hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <IoLogOutOutline className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </div>
              </button>
            </div>
          )}

          {/* Contact Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Contact Us
            </div>
            <div className="space-y-3">
              <a
                href="tel:+16025550100"
                className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 
                  hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IoCallOutline className="w-5 h-5" />
                <span>(602) 555-0100</span>
              </a>
              
              <a
                href="mailto:support@itwhip.com"
                className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 
                  hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IoMailOutline className="w-5 h-5" />
                <span>support@itwhip.com</span>
              </a>
              
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <IoLocationOutline className="w-5 h-5" />
                <span>Phoenix, Arizona</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
              Follow Us
            </div>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <IoLogoFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <IoLogoTwitter className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <IoLogoLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800">
            <p>© 2019-2025 ItWhip Technologies, Inc.</p>
            <p className="mt-1">All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}