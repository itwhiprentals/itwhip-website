// app/components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
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
  IoPersonOutline
} from 'react-icons/io5'
import MobileMenu from './MobileMenu'
import ProfileModal from '../(guest)/dashboard/modals/ProfileModal'
import NotificationBell from './notifications/NotificationBell'

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

export default function Header({
  handleGetAppClick = () => {},
  handleSearchClick = () => {}
}: HeaderProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check if we're on specific pages
  const isHostPage = pathname?.startsWith('/host/')
  const isAdminPage = pathname?.startsWith('/admin/')
  const isGuestPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile') || pathname?.startsWith('/messages')

  // ✅ FIXED: Determine user type with fallback logic
  const isAdmin = user?.role === 'ADMIN'
  const isHost = user?.role === 'BUSINESS' || (isHostPage && isLoggedIn && !isAdmin)
  const isGuest = isLoggedIn && !isAdmin && !isHost

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

  // Check authentication status
  const checkAuth = async () => {
    try {
      setIsLoggedIn(false)
      setUser(null)
      
      if (window.location.pathname.startsWith('/auth/') || 
          window.location.pathname.startsWith('/portal/')) {
        setIsCheckingAuth(false)
        return
      }
      
      // Check for admin auth first if on admin pages
      if (window.location.pathname.startsWith('/admin/')) {
        const adminResponse = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (adminResponse.ok) {
          const data = await adminResponse.json()
          setIsLoggedIn(true)
          setUser({
            id: data.user.id,
            name: data.user.name || 'Admin',
            email: data.user.email,
            role: 'ADMIN',
            profilePhoto: data.user.profilePhoto || data.user.avatar
          })
          setIsCheckingAuth(false)
          return
        }
      }

      // Check for host auth if on host pages
      if (window.location.pathname.startsWith('/host/')) {
        const hostResponse = await fetch('/api/host/login', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (hostResponse.ok) {
          const data = await hostResponse.json()
          
          if (data.authenticated && data.host) {
            setIsLoggedIn(true)
            setUser({
              id: data.host.id,
              name: data.host.name,
              email: data.host.email,
              role: 'BUSINESS',
              profilePhoto: data.host.profilePhoto
            })
            setIsCheckingAuth(false)
            return
          }
        }
      }
      
      // Check guest auth - includes profile photo from ReviewerProfile
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Fetch guest profile to get photo
        let profilePhoto = data.user.avatar || data.user.profilePhoto
        
        try {
          const profileResponse = await fetch('/api/guest/profile', {
            credentials: 'include'
          })
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            if (profileData.success && profileData.profile?.profilePhoto) {
              profilePhoto = profileData.profile.profilePhoto
            }
          }
        } catch (error) {
          console.log('Could not fetch guest profile photo')
        }
        
        setIsLoggedIn(true)
        setUser({
          ...data.user,
          profilePhoto,
          role: data.user.role || 'GUEST'
        })
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    setIsMobileMenuOpen(false)
    
    try {
      let logoutUrl = '/api/auth/logout'
      let redirectUrl = '/'
      
      if (isAdmin) {
        logoutUrl = '/api/admin/auth/logout'
        redirectUrl = '/admin/auth/login'
      } else if (isHost) {
        const hostLogoutResponse = await fetch('/api/host/login', {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!hostLogoutResponse.ok) {
          document.cookie = 'host_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'hostAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'hostRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        }
        
        setIsLoggedIn(false)
        setUser(null)
        localStorage.removeItem('user')
        sessionStorage.clear()
        
        window.location.href = '/host/login'
        return
      }
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      setIsLoggedIn(false)
      setUser(null)
      localStorage.removeItem('user')
      sessionStorage.clear()
      
      window.location.href = redirectUrl
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggedIn(false)
      setUser(null)
      localStorage.removeItem('user')
      sessionStorage.clear()
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
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

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm' 
          : 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md'
      } border-b border-gray-200/50 dark:border-gray-800/50`}>
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
                <div className="flex flex-col items-center">
                  <div className="relative top-1 -left-1.5">
                    {/* Light mode logo */}
                    <Image
                      src="/logo.png"
                      alt="ItWhip"
                      width={192}
                      height={192}
                      className="h-10 w-10 group-hover:opacity-80 transition-opacity dark:hidden"
                      priority
                    />
                    {/* Dark mode logo */}
                    <Image
                      src="/logo-white.png"
                      alt="ItWhip"
                      width={192}
                      height={192}
                      className="h-10 w-10 group-hover:opacity-80 transition-opacity hidden dark:block"
                      priority
                    />
                  </div>
                  <span className="text-[8px] text-gray-700 dark:text-gray-300 tracking-widest uppercase font-medium mt-0.5 ml-1">
                    {isAdmin ? 'ADMIN PORTAL' : (isHost && isHostPage) ? 'HOST PORTAL' : 'ITWHIP TECHNOLOGY'}
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
              {isLoggedIn && !isCheckingAuth && (
                <>
                  {isGuest && <NotificationBell userRole="GUEST" />}
                  {isHost && <NotificationBell userRole="HOST" />}
                  {isAdmin && <NotificationBell userRole="ADMIN" />}
                </>
              )}
              
              {/* Profile/Sign In Button */}
              {!isCheckingAuth && (
                <div>
                  {isLoggedIn && user ? (
                    <button
                      onClick={handleProfileClick}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                      aria-label="Go to profile"
                    >
                      <div className="relative">
                        {profilePhotoUrl ? (
                          <img 
                            src={profilePhotoUrl} 
                            alt={user.name || 'Profile'} 
                            className="w-7 h-7 rounded-full object-cover border-2 border-green-500 shadow-sm"
                          />
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
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
        isLoggedIn={isLoggedIn}
        user={user}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        isHost={isHost}
        isHostPage={isHostPage}
        hostNavItems={hostNavItems}
      />

      {/* Profile Modal - Deprecated for guests, they go to /profile now */}
      {showProfileModal && !isGuest && !isHost && !isAdmin && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => {
            checkAuth()
          }}
        />
      )}
    </>
  )
}