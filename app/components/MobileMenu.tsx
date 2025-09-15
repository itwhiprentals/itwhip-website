// app/components/MobileMenu.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  IoCloseOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoKeyOutline,
  IoSparklesOutline,
  IoCodeSlashOutline,
  IoPersonCircleOutline,
  IoGridOutline,
  IoLogOutOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoSearchOutline,
  IoPricetagOutline,
  IoMapOutline,
  IoHomeOutline,
  IoCalculatorOutline,
  IoShieldOutline,
  IoCarSportOutline,
  IoFlashOutline,
  IoDiamondOutline
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

// Navigation data structure for cleaner code
const navigationSections = [
  {
    id: 'browse',
    label: 'Browse Cars',
    icon: IoCarOutline,
    items: [
      { href: '/', label: 'All Cars', icon: IoCarOutline },
      { href: '/rentals/search?category=luxury', label: 'Luxury', icon: IoDiamondOutline },
      { href: '/rentals/search?category=suv', label: 'SUVs', icon: IoCarSportOutline },
      { href: '/rentals/search?category=economy', label: 'Economy', icon: IoPricetagOutline },
      { href: '/rentals/search?category=electric', label: 'Electric', icon: IoFlashOutline }
    ]
  },
  {
    id: 'host',
    label: 'Host',
    icon: IoKeyOutline,
    badge: { text: 'EARN', color: 'from-green-500 to-emerald-500' },
    items: [
      { href: '/list-your-car', label: 'List Your Car', icon: IoSparklesOutline, highlight: true },
      { href: '/host-requirements', label: 'Host Requirements', icon: IoDocumentTextOutline },
      { href: '/host-earnings', label: 'Earnings Calculator', icon: IoCalculatorOutline },
      { href: '/host-insurance', label: 'Insurance & Protection', icon: IoShieldOutline }
    ]
  },
  {
    id: 'business',
    label: 'Business',
    icon: IoBusinessOutline,
    items: [
      { href: '/corporate', label: 'Corporate Rentals', icon: IoBusinessOutline },
      { href: '/integrations', label: 'Integration Partners', icon: IoShieldCheckmarkOutline },
      { href: '/developers', label: 'API Access', icon: IoCodeSlashOutline },
      { 
        href: '/gds', 
        label: 'GDS Integration', 
        icon: IoGridOutline,
        badge: { text: 'NEW', color: 'from-blue-500 to-purple-500' }
      }
    ]
  },
  {
    id: 'support',
    label: 'Support',
    icon: IoHelpCircleOutline,
    items: [
      { href: '/how-it-works', label: 'How It Works', icon: IoHelpCircleOutline },
      { href: '/contact', label: 'Contact Us', icon: IoMailOutline },
      { href: '/about', label: 'About', icon: IoBusinessOutline }
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
  const menuRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      // Store the current focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Prevent body scroll
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      // Focus on close button for accessibility
      setTimeout(() => {
        const closeBtn = menuRef.current?.querySelector('[aria-label="Close menu"]') as HTMLElement
        closeBtn?.focus()
      }, 100)
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      
      // Restore focus to previous element
      previousFocusRef.current?.focus()
    }
    
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Trap focus within menu when open
  useEffect(() => {
    if (!isOpen) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select'
      )
      
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  // Handle section toggle with memoization
  const toggleSection = useCallback((label: string) => {
    setExpandedSection(prev => prev === label ? null : label)
  }, [])

  // Handle navigation click
  const handleNavClick = useCallback(() => {
    onClose()
    setExpandedSection(null)
  }, [onClose])

  // Check if link is active
  const isActiveLink = useCallback((href: string) => {
    return pathname === href
  }, [pathname])

  // Quick action handler
  const handleQuickAction = useCallback((action: () => void) => {
    action()
    handleNavClick()
  }, [handleNavClick])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Backdrop with animation */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <div 
        ref={menuRef}
        className={`
          absolute right-0 top-0 h-full w-80 max-w-[85vw]
          bg-white dark:bg-gray-950 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              It<span className="font-black">W</span>hip
            </h2>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase font-medium">
              TECHNOLOGY
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close menu"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] overscroll-contain">
          
          {/* User Profile Section (if logged in) */}
          {isLoggedIn && user && (
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center 
                  text-white font-medium text-lg shadow-lg
                  ${user.role === 'ADMIN' 
                    ? 'bg-gradient-to-br from-red-500 to-red-600' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'}
                `}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  {user.role === 'ADMIN' && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Administrator
                    </span>
                  )}
                </div>
              </div>
              
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickAction(onProfileClick || (() => {}))}
                  className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                    rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="View profile"
                >
                  <IoPersonOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Profile</span>
                </button>
                
                <Link
                  href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                  onClick={handleNavClick}
                  className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                    rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Go to dashboard"
                >
                  <IoGridOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Dashboard</span>
                </Link>
                
                {user?.role !== 'ADMIN' && (
                  <Link
                    href="/dashboard/bookings"
                    onClick={handleNavClick}
                    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                      rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="View my rentals"
                  >
                    <IoKeyOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">My Rentals</span>
                  </Link>
                )}
                
                <Link
                  href="/settings"
                  onClick={handleNavClick}
                  className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                    rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Go to settings"
                >
                  <IoSettingsOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Settings</span>
                </Link>
              </div>
            </div>
          )}
          
          {/* Map View Button */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <Link
              href="/rentals/search?view=map"
              onClick={handleNavClick}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                bg-gradient-to-r from-blue-500 to-purple-500 text-white
                rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] font-medium
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Explore cars on map view"
            >
              <IoMapOutline className="w-5 h-5" aria-hidden="true" />
              <span>Explore Cars on Map</span>
            </Link>
          </div>

          {/* Navigation Sections */}
          <nav className="px-4 py-2" aria-label="Main navigation">
            {/* Home Link */}
            <div className="border-b border-gray-100 dark:border-gray-900">
              <Link
                href="/"
                onClick={handleNavClick}
                className={`
                  w-full flex items-center space-x-3 py-3 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg
                  ${isActiveLink('/') 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'hover:text-blue-600 dark:hover:text-blue-400'}
                `}
                aria-current={isActiveLink('/') ? 'page' : undefined}
              >
                <div className={`transition-colors ${
                  isActiveLink('/') 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <IoHomeOutline className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  Home
                </span>
              </Link>
            </div>

            {/* Dynamic Navigation Sections */}
            {navigationSections.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSection === section.id
              
              return (
                <div key={section.id} className="border-b border-gray-100 dark:border-gray-900">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between py-3 
                      hover:text-blue-600 dark:hover:text-blue-400 transition-colors
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                    aria-expanded={isExpanded}
                    aria-controls={`${section.id}-menu`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {section.label}
                      </span>
                      {section.badge && (
                        <span className={`
                          text-xs bg-gradient-to-r ${section.badge.color} 
                          text-white px-2 py-0.5 rounded-full font-medium shadow-sm
                        `}>
                          {section.badge.text}
                        </span>
                      )}
                    </div>
                    <IoChevronDownOutline 
                      className={`
                        w-5 h-5 text-gray-400 transition-transform duration-200
                        ${isExpanded ? 'rotate-180' : ''}
                      `}
                      aria-hidden="true"
                    />
                  </button>
                  
                  {/* Expandable Menu Items */}
                  <div
                    id={`${section.id}-menu`}
                    className={`
                      overflow-hidden transition-all duration-200 ease-in-out
                      ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="pb-3 pl-12 space-y-1">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleNavClick}
                            className={`
                              flex items-center gap-2 py-2 text-sm transition-colors
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg px-2
                              ${item.highlight 
                                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}
                            `}
                          >
                            {ItemIcon && <ItemIcon className="w-4 h-4" aria-hidden="true" />}
                            <div className="flex items-center justify-between flex-1">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className={`
                                  text-xs bg-gradient-to-r ${item.badge.color} 
                                  text-white px-2 py-0.5 rounded-full
                                `}>
                                  {item.badge.text}
                                </span>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Sign Out (if logged in) */}
          {isLoggedIn && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => handleQuickAction(onLogout || (() => {}))}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 
                  text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                  rounded-lg transition-all hover:scale-[0.98] font-medium
                  focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Sign out"
              >
                <IoLogOutOutline className="w-5 h-5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// Add CSS for animation (add to your global CSS or module)
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
`