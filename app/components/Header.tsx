// app/components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  IoSunnyOutline,
  IoMoonOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoCarOutline,
  IoPersonOutline,
  IoPersonCircleOutline,
  IoLogOutOutline,
  IoSettingsOutline,
  IoKeyOutline,
  IoShieldCheckmarkOutline,
  IoGridOutline,
  IoNotificationsOutline,
  IoHelpCircleOutline
} from 'react-icons/io5'
import MobileMenu from './MobileMenu'
import ProfileModal from '../(guest)/dashboard/modals/ProfileModal'

// Navigation Items - Focused on Rentals
const navItems = [
  {
    label: 'Browse',
    items: [
      { label: 'All Cars', href: '/' },
      { label: 'Luxury', href: '/search?category=luxury' },
      { label: 'SUVs', href: '/search?category=suv' },
      { label: 'Economy', href: '/search?category=economy' }
    ]
  },
  {
    label: 'Host',
    items: [
      { label: 'List Your Car', href: '/list-your-car', highlight: true },
      { label: 'Host Dashboard', href: '/host-dashboard' },
      { label: 'Earnings Calculator', href: '/host-earnings' },
      { label: 'Insurance & Protection', href: '/host-insurance' }
    ]
  },
  {
    label: 'Business',
    items: [
      { label: 'Corporate Rentals', href: '/corporate' },
      { label: 'Hotel Partners', href: '/hotels/solutions' },
      { label: 'API Access', href: '/developers' },
      { label: 'GDS Integration', href: '/gds', badge: 'NEW' }
    ]
  },
  {
    label: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Help Center', href: '/help' },
      { label: 'Contact', href: '/contact' }
    ]
  }
]

interface HeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
  handleGetAppClick: () => void
  handleSearchClick: () => void
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Header({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleGetAppClick,
  handleSearchClick
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Auth state management
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
            role: 'ADMIN'
          })
          setIsCheckingAuth(false)
          return
        }
      }
      
      // Check guest auth
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)
        setUser(data.user)
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

  // Initial auth check
  useEffect(() => {
    checkAuth()
  }, [pathname])

  // Enhanced logout function
  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    setShowProfileDropdown(false)
    
    try {
      const isAdmin = user?.role === 'ADMIN'
      const logoutUrl = isAdmin ? '/api/admin/auth/logout' : '/api/auth/logout'
      const redirectUrl = isAdmin ? '/admin/auth/login' : '/'
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setIsLoggedIn(false)
        setUser(null)
        setShowProfileDropdown(false)
        localStorage.removeItem('user')
        sessionStorage.clear()
        window.location.href = redirectUrl
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggedIn(false)
      setUser(null)
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleProfileClick = () => {
    setShowProfileModal(true)
    setShowProfileDropdown(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.nav-dropdown') && !target.closest('.profile-dropdown')) {
        setActiveDropdown(null)
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Check dark mode on mount
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true)
    }
  }, [])

  // Don't show main nav on admin pages
  const isAdminPage = pathname?.startsWith('/admin/')

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm' 
          : 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md'
      } border-b border-gray-200/50 dark:border-gray-800/50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Nav */}
            <div className="flex items-center">
              {/* Logo */}
              <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/'} className="flex items-center mr-8 group">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    It<span className="font-black">W</span>hip
                  </h1>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase font-medium">
                    {user?.role === 'ADMIN' ? 'ADMIN PORTAL' : 'TECHNOLOGY'}
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation - Hide on admin pages */}
              {!isAdminPage && (
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

              {/* Admin Badge - Show on admin pages */}
              {isAdminPage && user?.role === 'ADMIN' && (
                <div className="hidden lg:flex items-center space-x-2 ml-4">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <IoShieldCheckmarkOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Admin Mode</span>
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

              {/* Help Button */}
              <button
                className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                aria-label="Help"
              >
                <IoHelpCircleOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Notifications (if logged in) */}
              {isLoggedIn && (
                <button
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  aria-label="Notifications"
                >
                  <IoNotificationsOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              )}
              
              {/* Profile/Sign In Button */}
              {!isCheckingAuth && (
                <div className="profile-dropdown relative">
                  {isLoggedIn && user ? (
                    <>
                      <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Account menu"
                      >
                        <div className={`w-8 h-8 ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <IoChevronDownOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      
                      {/* Profile Dropdown Menu */}
                      {showProfileDropdown && (
                        <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
                          {/* User Info Section */}
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} rounded-full flex items-center justify-center text-white font-medium`}>
                                {user.name ? user.name[0].toUpperCase() : 'U'}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </p>
                                {user.role === 'ADMIN' && (
                                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                    Administrator
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Menu Items */}
                          <div className="py-2">
                            <button
                              onClick={() => {
                                setShowProfileDropdown(false)
                                const dashboardUrl = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
                                router.push(dashboardUrl)
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                            >
                              <IoGridOutline className="w-4 h-4" />
                              <span>{user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}</span>
                            </button>
                            
                            {/* Profile Settings - Not for admin */}
                            {user?.role !== 'ADMIN' && (
                              <button
                                onClick={handleProfileClick}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                              >
                                <IoPersonOutline className="w-4 h-4" />
                                <span>Profile Settings</span>
                              </button>
                            )}

                            {/* My Rentals - Not for admin */}
                            {user?.role !== 'ADMIN' && (
                              <button
                                onClick={() => {
                                  setShowProfileDropdown(false)
                                  router.push('/dashboard/bookings')
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                              >
                                <IoKeyOutline className="w-4 h-4" />
                                <span>My Rentals</span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                setShowProfileDropdown(false)
                                router.push('/settings')
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                            >
                              <IoSettingsOutline className="w-4 h-4" />
                              <span>Account Settings</span>
                            </button>
                          </div>
                          
                          {/* Sign Out */}
                          <div className="border-t border-gray-200 dark:border-gray-800 py-2">
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <IoLogOutOutline className="w-4 h-4" />
                              <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link 
                      href={isAdminPage ? '/admin/auth/login' : '/auth/login'}
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

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
        isLoggedIn={isLoggedIn}
        user={user}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />

      {/* Profile Modal - Only for non-admin users */}
      {showProfileModal && user?.role !== 'ADMIN' && (
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