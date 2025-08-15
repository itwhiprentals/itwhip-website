// app/components/MobileMenu.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  IoCloseOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoAirplaneOutline,
  IoCarOutline,
  IoPricetagOutline,
  IoBusinessOutline,
  IoLogoApple,
  IoLogoGooglePlaystore,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogInOutline,
  IoRocketOutline
} from 'react-icons/io5'
import type { MobileMenuProps } from '../types'
import { socialLinks } from '../utils/constants'

// Mobile navigation structure
const mobileNavItems = [
  {
    label: 'Services',
    icon: <IoAirplaneOutline className="w-5 h-5" />,
    items: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Flight Tracker', href: '/flights' },
      { label: 'Group Rides', href: '/group-rides' },
      { label: 'Corporate Accounts', href: '/corporate' }
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
      { label: 'Driver Portal', href: '/portal' }
    ]
  },
  {
    label: 'Pricing',
    icon: <IoPricetagOutline className="w-5 h-5" />,
    items: [
      { label: 'Pricing Calculator', href: '/pricing' },
      { label: 'Compare Services', href: '/compare' },
      { label: 'No Surge Guarantee', href: '/no-surge' }
    ]
  },
  {
    label: 'Company',
    icon: <IoBusinessOutline className="w-5 h-5" />,
    items: [
      { label: 'About Us', href: '/about' },
      { label: 'Safety', href: '/safety' },
      { label: 'Support', href: '/support' },
      { label: 'Contact', href: '/contact' }
    ]
  }
]

export default function MobileMenu({
  isOpen,
  onClose,
  handleGetAppClick,
  handleSearchClick
}: MobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
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
    <div className="fixed inset-0 z-50 md:hidden">
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
          {/* Quick Actions */}
          <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                handleSearchClick()
                handleNavClick()
              }}
              className="w-full flex items-center justify-between px-4 py-3 
                bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <IoLogInOutline className="w-5 h-5" />
                <span className="font-medium">Sign In / Sign Up</span>
              </div>
              <IoChevronForwardOutline className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                handleGetAppClick()
                handleNavClick()
              }}
              className="w-full flex items-center justify-between px-4 py-3 
                bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white 
                rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <IoRocketOutline className="w-5 h-5" />
                <span className="font-medium">Get the App</span>
              </div>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                BETA
              </span>
            </button>
          </div>

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
                        {item.label}
                        {'highlight' in item && item.highlight && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                            • 23 spots left
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* App Download Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Download ItWhip App
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
                  handleNavClick()
                }}
                className="w-full flex items-center justify-center space-x-2 
                  bg-black dark:bg-white text-white dark:text-black 
                  px-4 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 
                  transition-colors"
              >
                <IoLogoApple className="w-5 h-5" />
                <span className="font-medium">Download for iOS</span>
              </button>
              
              <button
                disabled
                className="w-full flex items-center justify-center space-x-2 
                  bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 
                  px-4 py-2.5 rounded-lg cursor-not-allowed opacity-50"
              >
                <IoLogoGooglePlaystore className="w-5 h-5" />
                <span className="font-medium">Android Coming Soon</span>
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
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
            <div className="flex items-center justify-center space-x-4">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <IoLogoFacebook className="w-6 h-6" />
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <IoLogoTwitter className="w-6 h-6" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="w-6 h-6" />
              </a>
              <a
                href={socialLinks.linkedin}
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
          <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-500">
            © 2024 ItWhip. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}