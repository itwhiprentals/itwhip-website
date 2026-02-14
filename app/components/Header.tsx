// app/components/Header.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { Link } from '@/i18n/navigation'
import NextLink from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  IoChevronDownOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoHomeOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoPersonOutline
} from 'react-icons/io5'
import MobileMenu from './MobileMenu'
import LanguageSwitcher from './LanguageSwitcher'
import ProfileModal from '@/app/[locale]/(guest)/dashboard/modals/ProfileModal'
import HeaderActions from './header/HeaderActions'
import { useAuth } from '@/app/contexts/AuthContext'
import { routing } from '@/i18n/routing'

// Strip locale prefix from pathname (e.g., /es/about → /about)
// Safe to use in both i18n and non-i18n contexts (routing is a static config)
const nonDefaultLocales = routing.locales.filter(l => l !== routing.defaultLocale)
const localeRegex = nonDefaultLocales.length > 0
  ? new RegExp(`^/(${nonDefaultLocales.join('|')})(/|$)`)
  : null

function stripLocalePrefix(pathname: string): string {
  if (!localeRegex) return pathname
  return pathname.replace(localeRegex, '/').replace(/\/$/, '') || '/'
}

interface User {
  id: string
  name: string
  email: string
  role: string
  profilePhoto?: string
  avatar?: string
}

interface HeaderProps {
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
  handleGetAppClick?: () => void
  handleSearchClick?: () => void
}

function HeaderInner(_props: HeaderProps = {}) {
  const rawPathname = usePathname()
  const pathname = rawPathname ? stripLocalePrefix(rawPathname) : null
  const searchParams = useSearchParams()
  const t = useTranslations('Header')

  // Desktop Navigation Items — translated
  const navItems = [
    {
      label: t('browse'),
      items: [
        { label: t('allCars'), href: '/' },
        { label: t('luxury'), href: '/rentals/search?category=luxury' },
        { label: t('suvs'), href: '/rentals/search?category=suv' },
        { label: t('economy'), href: '/rentals/search?category=economy' }
      ]
    },
    {
      label: t('host'),
      items: [
        { label: t('listYourCar'), href: '/host/signup', highlight: true, portal: true },
        { label: t('switchFromTuro'), href: '/switch-from-turo' },
        { label: t('dashboard'), href: '/host/dashboard', portal: true },
        { label: t('myCars'), href: '/host/cars', portal: true },
        { label: t('bookings'), href: '/host/bookings', portal: true },
        { label: t('earnings'), href: '/host/earnings', portal: true }
      ]
    },
    {
      label: t('business'),
      items: [
        { label: t('corporateRentals'), href: '/corporate' },
        { label: t('hotelPartners'), href: '/hotel-solutions' },
        { label: t('apiAccess'), href: '/developers' },
        { label: t('gdsIntegration'), href: '/gds', badge: t('new') }
      ]
    },
    {
      label: t('company'),
      items: [
        { label: t('about'), href: '/about' },
        { label: t('howItWorks'), href: '/how-it-works' },
        { label: t('reviews'), href: '/reviews' },
        { label: t('blog'), href: '/blog' },
        { label: t('helpCenter'), href: '/help' },
        { label: t('contact'), href: '/contact' }
      ]
    }
  ]

  // ========== GUARD SCREEN DETECTION ==========
  // When guard screen is active, don't show logged-in header
  // This prevents confusing UX where user sees they're logged in but can't access
  const guardMode = searchParams?.get('guard')
  const isGuardActive = guardMode === 'host-on-guest' || guardMode === 'guest-on-host'

  // ========== SIGNUP MODE DETECTION ==========
  // When user is on complete-profile page in signup mode OR noAccount mode, don't show logged-in header
  // This applies to orphan users (have User+Account but no app profiles) who need to complete signup
  const isSignupMode = pathname === '/auth/complete-profile' &&
    (searchParams?.get('mode') === 'signup' || searchParams?.get('noAccount') === 'true')

  // ========== AUTH CONTEXT (Industry Best Practice) ==========
  // Use centralized auth state for instant role switching
  // No more page refreshes needed - context updates trigger re-renders
  const {
    isLoggedIn,
    user: authUser,
    isLoading: isCheckingAuth,
    isSwitchingRole,
    refreshAuth
  } = useAuth()

  // Combined loading state - show loading UI during auth check OR role switch
  const isTransitioning = isCheckingAuth || isSwitchingRole

  // Map auth context user to local User type
  const user: User | null = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
    profilePhoto: authUser.profilePhoto
  } : null

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check if we're on specific pages
  const isHostPage = pathname?.startsWith('/host/')
  const isAdminPage = pathname?.startsWith('/admin/')
  const isFleetPage = pathname?.startsWith('/fleet/')
  const isPartnerPage = pathname?.startsWith('/partner/')
  const isChoePage = pathname?.startsWith('/help/choe') || pathname === '/choe'
  const isChoeStandalone = pathname === '/choe'

  // Show language switcher only on guest-facing pages (not portals)
  const isPortalPage = isHostPage || isAdminPage || isFleetPage || isPartnerPage
  const showLanguageSwitcher = !isPortalPage

  // Override isLoggedIn display when guard screen is active
  // User should appear logged out until they choose an action on the guard screen
  const showAsLoggedIn = isLoggedIn && !isGuardActive && !isSignupMode

  // Determine user type - only by actual role, not by page location
  const isAdmin = user?.role === 'ADMIN'
  const isHost = user?.role === 'BUSINESS'
  const isGuest = showAsLoggedIn && !isAdmin && !isHost

  useEffect(() => {
    if (user) {
      console.log('🔍 Header User Detection:', {
        user,
        isHost,
        isGuest,
        isAdmin,
        isHostPage,
        pathname,
        role: user.role
      })
    }
  }, [user, isHost, isGuest, isAdmin, isHostPage, pathname])

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setIsMobileMenuOpen(false)

    // Clear local storage immediately for UI responsiveness
    localStorage.removeItem('user')
    sessionStorage.clear()

    // Determine redirect URL based on user type
    let redirectUrl = '/'
    if (isAdmin) {
      redirectUrl = '/admin/auth/login'
    } else if (isHost) {
      redirectUrl = '/host/login'
    }

    try {
      if (isAdmin) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      } else if (isHost) {
        await fetch('/api/host/login', {
          method: 'DELETE',
          credentials: 'include'
        })
      } else {
        // Guest logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    }

    window.location.href = redirectUrl
  }

  // Close dropdowns when clicking outside
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

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true)
    }
  }, [])

  // Host-specific navigation items for mobile
  const hostNavItems = isHost && isHostPage ? [
    { name: t('dashboard'), href: '/host/dashboard', icon: IoHomeOutline },
    { name: t('myCars'), href: '/host/cars', icon: IoCarOutline },
    { name: t('bookings'), href: '/host/bookings', icon: IoCalendarOutline },
    { name: t('earnings'), href: '/host/earnings', icon: IoWalletOutline },
    { name: 'Profile', href: '/host/profile', icon: IoPersonOutline },
  ] : []

  // Get profile photo - prioritize profilePhoto over avatar
  const profilePhotoUrl = user?.profilePhoto || user?.avatar

  // Logo link: portal pages use NextLink (no locale prefix), guest pages use i18n Link
  const logoHref = isAdmin ? '/admin/dashboard' :
    isHost && isHostPage ? '/host/dashboard' :
    isChoePage ? '/help/choe' :
    isGuest ? '/dashboard' : '/'
  const LogoLink = isPortalPage ? NextLink : Link

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 pt-safe bg-white dark:bg-gray-900 ${
        scrolled ? 'shadow-sm' : ''
      } border-b border-gray-200 dark:border-gray-800`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Nav */}
            <div className="flex items-center ml-4 sm:ml-0">
              {/* Logo — use NextLink for portal destinations, i18n Link for guest */}
              <LogoLink
                href={logoHref}
                className="flex items-center mr-4 group"
              >
                {isChoePage ? (
                  <div className={`-ml-2 ${isChoeStandalone ? '-my-4 -mt-10' : '-my-2'}`}>
                    <Image
                      src="/images/choe-logo.png"
                      alt="Choé"
                      width={300}
                      height={87}
                      className={`${isChoeStandalone ? 'h-[83px]' : 'h-[60px]'} w-auto group-hover:opacity-80 transition-opacity`}
                      priority
                    />
                    {isChoeStandalone && (
                      <span className="text-[9px] text-gray-400 block -mt-7">ItWhip Search Studio</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center -ml-2">
                    <div className="relative top-[0.2px] w-7 h-7 rounded-full overflow-hidden bg-white dark:bg-gray-800">
                      {/* Light mode logo */}
                      <Image
                        src="/logo.png"
                        alt="ItWhip"
                        fill
                        className="object-contain group-hover:opacity-80 transition-opacity dark:hidden"
                        style={{ transform: 'scale(1.15) translateY(0.5px)', transformOrigin: 'center center' }}
                        priority
                      />
                      {/* Dark mode logo */}
                      <Image
                        src="/logo-white.png"
                        alt="ItWhip"
                        fill
                        className="object-contain group-hover:opacity-80 transition-opacity hidden dark:block"
                        style={{ transform: 'scale(1.15) translateY(0.5px)', transformOrigin: 'center center' }}
                        priority
                      />
                    </div>
                    <span className="text-[8px] text-gray-700 dark:text-gray-300 tracking-widest uppercase font-medium mt-0.5">
                      {isAdmin ? t('adminPortal') : (isHost && isHostPage) ? t('hostPortal') : t('itwhipRides')}
                    </span>
                  </div>
                )}
              </LogoLink>

              {/* Desktop Navigation - Show for non-admin, non-host, non-choe-standalone pages */}
              {!isAdminPage && !isHostPage && !isChoeStandalone && (
                <nav className="hidden lg:flex items-center space-x-1">
                  {navItems.map((item) => (
                    <div key={item.label} className="nav-dropdown relative">
                      <button
                        onClick={() => setActiveDropdown(
                          activeDropdown === item.label ? null : item.label
                        )}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                      >
                        <span>{item.label}</span>
                        <IoChevronDownOutline
                          className={`w-3.5 h-3.5 transition-transform ${
                            activeDropdown === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === item.label && (
                        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-2 overflow-hidden">
                          {item.items.map((subItem) => {
                            const LinkComponent = ('portal' in subItem && subItem.portal) ? NextLink : Link
                            return (
                              <LinkComponent
                                key={subItem.label}
                                href={subItem.href}
                                className={`block px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                  'highlight' in subItem && subItem.highlight
                                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{subItem.label}</span>
                                  {'badge' in subItem && subItem.badge && (
                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                              </LinkComponent>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              )}

              {/* Simple Host Navigation - when on host pages */}
              {isHostPage && isHost && (
                <nav className="hidden lg:flex items-center space-x-1 ml-4">
                  <NextLink href="/host/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    {t('dashboard')}
                  </NextLink>
                  <NextLink href="/host/cars" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    {t('myCars')}
                  </NextLink>
                  <NextLink href="/host/bookings" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    {t('bookings')}
                  </NextLink>
                  <NextLink href="/host/earnings" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    {t('earnings')}
                  </NextLink>
                </nav>
              )}

              {/* Admin Badge */}
              {isAdminPage && isAdmin && (
                <div className="hidden lg:flex items-center space-x-2 ml-4">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <IoShieldCheckmarkOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{t('adminMode')}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Right side - Actions Component */}
            <HeaderActions
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
              isLoggedIn={showAsLoggedIn}
              isTransitioning={isTransitioning}
              isCheckingAuth={isCheckingAuth}
              isGuest={isGuest}
              isHost={isHost}
              isAdmin={isAdmin}
              isHostPage={isHostPage}
              isAdminPage={isAdminPage}
              isChoeStandalone={isChoeStandalone}
              profilePhotoUrl={profilePhotoUrl}
              userName={user?.name}
              isMobileMenuOpen={isMobileMenuOpen}
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              languageSwitcher={showLanguageSwitcher ? <LanguageSwitcher /> : undefined}
            />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={showAsLoggedIn && !isSwitchingRole}
        user={showAsLoggedIn && !isSwitchingRole ? user : null}
        onLogout={handleLogout}
        isHost={isHost && !isSwitchingRole}
        isHostPage={isHostPage}
        hostNavItems={hostNavItems}
      />

      {/* Profile Modal - Deprecated for guests, they go to /profile now */}
      {showProfileModal && !isGuest && !isHost && !isAdmin && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onUpdate={() => {
            // Refresh auth state from context after profile update
            refreshAuth()
          }}
        />
      )}
    </>
  )
}

// Wrap Header with Suspense to handle useSearchParams() during static generation
// This is required by Next.js 15 for components using useSearchParams
export default function Header(props: HeaderProps = {}) {
  return (
    <Suspense fallback={
      <nav className="fixed top-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center ml-4 sm:ml-0">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    }>
      <HeaderInner
        isMobileMenuOpen={props.isMobileMenuOpen}
        setIsMobileMenuOpen={props.setIsMobileMenuOpen}
        handleGetAppClick={props.handleGetAppClick}
        handleSearchClick={props.handleSearchClick}
      />
    </Suspense>
  )
}
