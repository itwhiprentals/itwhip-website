// app/components/Header.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  IoSunnyOutline,
  IoMoonOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoHomeOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoPersonOutline,
  IoLogOutOutline
} from 'react-icons/io5'
import MobileMenu from './MobileMenu'
import ProfileModal from '../(guest)/dashboard/modals/ProfileModal'
import NotificationBell from './notifications/NotificationBell'
import RoleSwitcher from './RoleSwitcher'
import { useAuth } from '@/app/contexts/AuthContext'

// Desktop Navigation Items
const navItems = [
  {
    label: 'Browse',
    items: [
      { label: 'All Cars', href: '/' },
      { label: 'Luxury', href: '/rentals/search?category=luxury' },
      { label: 'SUVs', href: '/rentals/search?category=suv' },
      { label: 'Economy', href: '/rentals/search?category=economy' }
    ]
  },
  {
    label: 'Host',
    items: [
      { label: 'List Your Car', href: '/host/signup', highlight: true },
      { label: 'Switch from Turo', href: '/switch-from-turo' },
      { label: 'Dashboard', href: '/host/dashboard' },
      { label: 'My Cars', href: '/host/cars' },
      { label: 'Bookings', href: '/host/bookings' },
      { label: 'Earnings', href: '/host/earnings' }
    ]
  },
  {
    label: 'Business',
    items: [
      { label: 'Corporate Rentals', href: '/corporate' },
      { label: 'Hotel Partners', href: '/hotel-solutions' },
      { label: 'API Access', href: '/developers' },
      { label: 'GDS Integration', href: '/gds', badge: 'NEW' }
    ]
  },
  {
    label: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/help' },
      { label: 'Contact', href: '/contact' }
    ]
  }
]

interface User {
  id: string
  name: string
  email: string
  role: string
  profilePhoto?: string
  avatar?: string
}

interface HeaderProps {
  handleGetAppClick?: () => void
  handleSearchClick?: () => void
}

function HeaderInner({
  handleGetAppClick = () => {},
  handleSearchClick = () => {}
}: HeaderProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
    hasBothProfiles,
    currentRole,
    logout: contextLogout,
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
  const [profileImageError, setProfileImageError] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Check if we're on specific pages
  const isHostPage = pathname?.startsWith('/host/')
  const isAdminPage = pathname?.startsWith('/admin/')
  const isGuestPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile') || pathname?.startsWith('/messages')

  // Override isLoggedIn display when guard screen is active
  // User should appear logged out until they choose an action on the guard screen
  const showAsLoggedIn = isLoggedIn && !isGuardActive && !isSignupMode

  // ✅ FIXED: Determine user type - only by actual role, not by page location
  // User must have role === 'BUSINESS' to be considered a host (have actual host profile)
  const isAdmin = user?.role === 'ADMIN'
  const isHost = user?.role === 'BUSINESS'
  const isGuest = showAsLoggedIn && !isAdmin && !isHost

  // ✅ DEBUG: Log user detection (can remove later)
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

  // ========== AUTH STATE IS NOW MANAGED BY AuthContext ==========
  // The AuthContext handles all auth checking automatically
  // It refreshes on mount, on window focus, and after role switches
  // This removes the need for the old checkAuth() function

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

    // ========== MUST WAIT FOR LOGOUT API ==========
    // httpOnly cookies can ONLY be cleared by the Set-Cookie headers in the API response
    // If we redirect before the response is received, cookies remain and user stays logged in
    // The UI already shows "Signing Out..." via isLoggingOut state
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
      // Even if API fails, proceed with redirect
      console.error('Logout API error:', error)
    }

    // Now redirect after cookies are cleared by the API response
    window.location.href = redirectUrl
  }

  const handleProfileClick = () => {
    if (isHost) {
      router.push('/host/profile')
    } else if (isAdmin) {
      router.push('/admin/profile')
    } else if (isGuest) {
      router.push('/profile')
    } else {
      setShowProfileModal(true)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.nav-dropdown')) {
        setActiveDropdown(null)
      }
      if (!target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false)
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
    { name: 'Dashboard', href: '/host/dashboard', icon: IoHomeOutline },
    { name: 'My Cars', href: '/host/cars', icon: IoCarOutline },
    { name: 'Bookings', href: '/host/bookings', icon: IoCalendarOutline },
    { name: 'Earnings', href: '/host/earnings', icon: IoWalletOutline },
    { name: 'Profile', href: '/host/profile', icon: IoPersonOutline },
  ] : []

  // Get profile photo - prioritize profilePhoto over avatar
  const profilePhotoUrl = user?.profilePhoto || user?.avatar

  // Reset image error state when user or photo URL changes
  useEffect(() => {
    setProfileImageError(false)
  }, [profilePhotoUrl])

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 pt-safe bg-white dark:bg-gray-900 ${
        scrolled ? 'shadow-sm' : ''
      } border-b border-gray-200 dark:border-gray-800`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Nav */}
            <div className="flex items-center ml-4 sm:ml-0">
              {/* Logo */}
              <Link
                href={
                  isAdmin ? '/admin/dashboard' :
                  isHost && isHostPage ? '/host/dashboard' :
                  isGuest ? '/dashboard' :
                  '/'
                }
                className="flex items-center mr-4 group"
              >
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
                    {isAdmin ? 'ADMIN PORTAL' : (isHost && isHostPage) ? 'HOST PORTAL' : 'ITWHIP RIDES'}
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation - Show for non-admin and non-host pages */}
              {!isAdminPage && !isHostPage && (
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
                          {item.items.map((subItem) => (
                            <Link
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
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              )}
              
              {/* Simple Host Navigation - when on host pages */}
              {isHostPage && isHost && (
                <nav className="hidden lg:flex items-center space-x-1 ml-4">
                  <Link href="/host/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/host/cars" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    My Cars
                  </Link>
                  <Link href="/host/bookings" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    Bookings
                  </Link>
                  <Link href="/host/earnings" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    Earnings
                  </Link>
                </nav>
              )}

              {/* Admin Badge */}
              {isAdminPage && isAdmin && (
                <div className="hidden lg:flex items-center space-x-2 ml-4">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <IoShieldCheckmarkOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Admin Mode</span>
                  </div>
                </div>
              )}

              {/* Host Badge */}
              {isHostPage && isHost && (
                <div className="hidden lg:flex items-center space-x-2 ml-4">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <IoCarOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Host Mode</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <IoSunnyOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <IoMoonOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* ✅ FIXED: Notifications - Show correct bell based on user type */}
              {/* Hide when transitioning (auth check or role switch) or guard is active */}
              {showAsLoggedIn && !isTransitioning && (
                <>
                  {isGuest && <NotificationBell userRole="GUEST" />}
                  {isHost && <NotificationBell userRole="HOST" />}
                  {isAdmin && <NotificationBell userRole="ADMIN" />}
                </>
              )}

              {/* Role Switcher - Only for dual-role users */}
              {/* Hide when transitioning or guard screen is active */}
              {showAsLoggedIn && !isTransitioning && <RoleSwitcher />}

              {/* Show loading spinner during role switch */}
              {isSwitchingRole && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Switching...</span>
                </div>
              )}

              {/* Profile/Sign In Button */}
              {/* Show Sign In when guard is active (showAsLoggedIn is false) */}
              {/* Hide during role switch to prevent confusion */}
              {/* Show logout loading indicator when logging out */}
              {/* Show subtle loading during initial auth check */}
              {isLoggingOut ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Signing out...</span>
                </div>
              ) : isCheckingAuth ? (
                // Show subtle loading indicator during auth check
                <div className="p-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              ) : !isSwitchingRole && (
                <div>
                  {showAsLoggedIn && user ? (
                    <div className="profile-dropdown relative">
                      <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        aria-label="Account menu"
                      >
                        <div className="relative">
                          {profilePhotoUrl && !profileImageError ? (
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-white border-2 border-green-500 shadow-sm">
                              <img
                                src={profilePhotoUrl}
                                alt={user.name || 'Profile'}
                                className="w-full h-full object-contain"
                                style={{ transform: 'scale(1.15) translateY(0.5px)', transformOrigin: 'center center' }}
                                onError={() => setProfileImageError(true)}
                              />
                            </div>
                          ) : (
                            <div className={`w-7 h-7 ${
                              isAdmin ? 'bg-gradient-to-br from-red-500 to-red-600' :
                              isHost ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                              'bg-gradient-to-br from-green-500 to-blue-600'
                            } rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-green-500 shadow-sm`}>
                              {user.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Profile Dropdown Menu */}
                      {showProfileDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-2 overflow-hidden z-50">
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false)
                              handleProfileClick()
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <IoPersonOutline className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                          <div className="border-t border-gray-200 dark:border-gray-800 my-1" />
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false)
                              handleLogout()
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <IoLogOutOutline className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={
                        isAdminPage ? '/admin/auth/login' :
                        isHostPage ? '/host/login' :
                        '/auth/login'
                      }
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-sm"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
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

      {/* Mobile Menu */}
      {/* Pass showAsLoggedIn to hide logged-in state when guard is active */}
      {/* Pass isSwitchingRole to sync loading state with header */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
        isLoggedIn={showAsLoggedIn && !isSwitchingRole}
        user={showAsLoggedIn && !isSwitchingRole ? user : null}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        isHost={isHost && !isSwitchingRole}
        isHostPage={isHostPage}
        hostNavItems={hostNavItems}
        isSwitchingRole={isSwitchingRole}
        isLoggingOut={isLoggingOut}
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
      <HeaderInner {...props} />
    </Suspense>
  )
}
