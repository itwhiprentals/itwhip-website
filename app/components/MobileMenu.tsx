// app/components/MobileMenu.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  IoCloseOutline,
  IoChevronDownOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoKeyOutline,
  IoSparklesOutline,
  IoCodeSlashOutline,
  IoGridOutline,
  IoLogOutOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoMailOutline,
  IoMapOutline,
  IoHomeOutline,
  IoCalculatorOutline,
  IoShieldCheckmarkOutline,
  IoCarSportOutline,
  IoFlashOutline,
  IoDiamondOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoPricetagOutline,
  IoChatbubbleOutline,
  IoDocumentTextOutline,
  IoStarOutline,
  IoCardOutline
} from 'react-icons/io5'

interface User {
  id: string
  name: string
  email: string
  role: string
  profilePhoto?: string
}

interface HostNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
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
  isHost?: boolean
  isHostPage?: boolean
  hostNavItems?: HostNavItem[]
}

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
      { href: '/rentals/search?category=electric', label: 'Electric', icon: IoFlashOutline },
      { href: '/rentals/search?view=map', label: 'Map View', icon: IoMapOutline }
    ]
  },
  {
    id: 'rentals',
    label: 'Rental Options',
    icon: IoCalendarOutline,
    items: [
      { href: '/rentals/daily', label: 'Daily Rentals', icon: IoCalendarOutline },
      { href: '/rentals/long-term', label: 'Long-Term Rentals', icon: IoDocumentTextOutline },
      { href: '/rentals/weekend', label: 'Weekend Rentals', icon: IoCarSportOutline },
      { href: '/reviews', label: 'Reviews', icon: IoStarOutline },
      { href: '/insurance-guide', label: 'Insurance Guide', icon: IoShieldCheckmarkOutline }
    ]
  },
  {
    id: 'host',
    label: 'For Hosts',
    icon: IoKeyOutline,
    badge: { text: 'EARN', color: 'from-green-500 to-emerald-500' },
    items: [
      { href: '/list-your-car', label: 'List Your Car', icon: IoSparklesOutline, highlight: true },
      { href: '/host/fleet-owners', label: 'Fleet Owners', icon: IoCarOutline },
      { href: '/host/payouts', label: 'Payouts & Earnings', icon: IoWalletOutline },
      { href: '/host/insurance-options', label: 'Insurance Options', icon: IoShieldCheckmarkOutline },
      { href: '/host-requirements', label: 'Host Requirements', icon: IoDocumentTextOutline },
      { href: '/host/tax-benefits', label: 'Tax Benefits', icon: IoCalculatorOutline }
    ]
  },
  {
    id: 'support',
    label: 'Support',
    icon: IoHelpCircleOutline,
    items: [
      { href: '/support', label: 'Help Center', icon: IoHelpCircleOutline },
      { href: '/support/insurance', label: 'Insurance Support', icon: IoShieldCheckmarkOutline },
      { href: '/how-it-works', label: 'How It Works', icon: IoHelpCircleOutline },
      { href: '/cancellation-policy', label: 'Cancellation Policy', icon: IoDocumentTextOutline },
      { href: '/contact', label: 'Contact Us', icon: IoMailOutline }
    ]
  },
  {
    id: 'company',
    label: 'Company',
    icon: IoBusinessOutline,
    items: [
      { href: '/about', label: 'About Us', icon: IoBusinessOutline },
      { href: '/corporate', label: 'Corporate Rentals', icon: IoBusinessOutline },
      { href: '/developers', label: 'Developers', icon: IoCodeSlashOutline },
      { href: '/blog', label: 'Blog', icon: IoDocumentTextOutline }
    ]
  }
]

// Guest Navigation Items
const guestNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: IoHomeOutline },
  { name: 'My Trips', href: '/rentals/dashboard/bookings', icon: IoCalendarOutline },
  { name: 'Messages', href: '/messages', icon: IoChatbubbleOutline },
  { name: 'Profile', href: '/profile', icon: IoPersonOutline },
  { name: 'Payment Methods', href: '/profile?tab=payment', icon: IoCardOutline },
  { name: 'Reviews', href: '/profile?tab=reviews', icon: IoStarOutline },
]

export default function MobileMenu({
  isOpen,
  onClose,
  handleGetAppClick,
  handleSearchClick,
  isLoggedIn = false,
  user = null,
  onProfileClick,
  onLogout,
  isHost = false,
  isHostPage = false,
  hostNavItems = []
}: MobileMenuProps) {
  const pathname = usePathname()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Determine user type
  const isAdmin = user?.role === 'ADMIN'
  const isGuest = isLoggedIn && user && !isAdmin && !isHost
  
  // Check if we're on guest pages
  const isGuestPage = pathname?.startsWith('/dashboard') || 
                      pathname?.startsWith('/profile') || 
                      pathname?.startsWith('/messages') ||
                      pathname?.startsWith('/rentals/dashboard')
  
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      setTimeout(() => {
        const closeBtn = menuRef.current?.querySelector('[aria-label="Close menu"]') as HTMLElement
        closeBtn?.focus()
      }, 100)
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      previousFocusRef.current?.focus()
    }
    
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const toggleSection = useCallback((label: string) => {
    setExpandedSection(prev => prev === label ? null : label)
  }, [])

  const handleNavClick = useCallback(() => {
    onClose()
    setExpandedSection(null)
  }, [onClose])

  const isActiveLink = useCallback((href: string) => {
    return pathname === href
  }, [pathname])

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
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        ref={menuRef}
        className={`
          absolute right-0 top-0 h-full w-80 max-w-[85vw]
          bg-white dark:bg-gray-950 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="relative">
              {/* Light mode logo */}
              <Image
                src="/logo.png"
                alt="ItWhip"
                width={40}
                height={40}
                className="h-10 w-10 dark:hidden"
                priority
              />
              {/* Dark mode logo */}
              <Image
                src="/logo-white.png"
                alt="ItWhip"
                width={40}
                height={40}
                className="h-10 w-10 hidden dark:block"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase font-medium">
                {isAdmin ? 'ADMIN PORTAL' :
                 isHost && isHostPage ? 'HOST PORTAL' :
                 isGuest && isGuestPage ? 'GUEST PORTAL' :
                 'ITWHIP TECHNOLOGY'}
              </span>
            </div>
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

        <div className="overflow-y-auto h-[calc(100%-80px)] overscroll-contain">
          
          {/* User Profile Section */}
          {isLoggedIn && user && (
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                {/* Profile Photo or Initial */}
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={user.name || 'Profile'} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500 shadow-lg"
                  />
                ) : (
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center 
                    text-white font-medium text-lg shadow-lg border-2 border-green-500
                    ${isAdmin 
                      ? 'bg-gradient-to-br from-red-500 to-red-600' 
                      : isHost
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                      : 'bg-gradient-to-br from-green-500 to-blue-600'}
                  `}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Administrator
                    </span>
                  )}
                  {isHost && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      Host
                    </span>
                  )}
                  {isGuest && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Guest
                    </span>
                  )}
                </div>
              </div>
              
              {/* Quick Actions Grid - Different for Each User Type */}
              <div className="grid grid-cols-2 gap-2">
                {isHost ? (
                  // HOST QUICK ACTIONS
                  <>
                    <Link
                      href="/host/dashboard"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <IoHomeOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Dashboard</span>
                    </Link>
                    <Link
                      href="/host/cars"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <IoCarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">My Cars</span>
                    </Link>
                    <Link
                      href="/host/bookings"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <IoCalendarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Bookings</span>
                    </Link>
                    <Link
                      href="/host/earnings"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <IoWalletOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Earnings</span>
                    </Link>
                  </>
                ) : isGuest ? (
                  // GUEST QUICK ACTIONS
                  <>
                    <Link
                      href="/dashboard"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <IoHomeOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Dashboard</span>
                    </Link>
                    <Link
                      href="/rentals/dashboard/bookings"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <IoCalendarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">My Bookings</span>
                    </Link>
                    <Link
                      href="/messages"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <IoChatbubbleOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Messages</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <IoPersonOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Profile</span>
                    </Link>
                  </>
                ) : isAdmin ? (
                  // ADMIN QUICK ACTIONS
                  <>
                    <Link
                      href="/admin/dashboard"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <IoGridOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Dashboard</span>
                    </Link>
                    <Link
                      href="/admin/hosts"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <IoCarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Hosts</span>
                    </Link>
                    <Link
                      href="/admin/profile"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <IoPersonOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={handleNavClick}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 
                        rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <IoSettingsOutline className="w-5 h-5 text-gray-700 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Settings</span>
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Host Navigation Section */}
          {isHost && isHostPage && hostNavItems.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Host Navigation</h3>
              <div className="space-y-1">
                {hostNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActiveLink(item.href)
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Guest Navigation Section */}
          {isGuest && isGuestPage && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Guest Navigation</h3>
              <div className="space-y-1">
                {guestNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActiveLink(item.href)
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation Sections - Site Navigation (Always visible) */}
          <nav className="px-4 py-2" aria-label="Main navigation">
            {(isHost || isGuest || isAdmin) && (
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Site Navigation</p>
            )}
            
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

          {/* Sign Out */}
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