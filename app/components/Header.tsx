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
  IoAirplaneOutline,
  IoCarOutline,
  IoPricetagOutline,
  IoBusinessOutline,
  IoCarSportOutline,
  IoCodeSlashOutline,
  IoLogoApple,
  IoLogoGooglePlaystore,
  IoPersonOutline,
  IoPersonCircleOutline,
  IoLogOutOutline,
  IoSettingsOutline,
  IoKeyOutline
} from 'react-icons/io5'
import MobileMenu from './MobileMenu'
import ProfileModal from '../(guest)/dashboard/modals/ProfileModal'

// Navigation Items - Same as before, no rentals section
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
      { label: 'Hotel Portal', href: '/portal/login' },
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
      { label: 'Driver Portal', href: '/driver/login' }
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

// Updated interface - removed view-related props
interface HeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
  handleGetAppClick: () => void
  handleSearchClick: () => void
}

// User type for auth state
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
  
  // Auth state management
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Determine active service based on pathname
  const getActiveService = () => {
    if (pathname?.startsWith('/rides')) return 'rides'
    if (pathname?.startsWith('/hotels')) return 'hotels'
    if (pathname?.startsWith('/rentals')) return 'rentals'
    return null
  }

  const activeService = getActiveService()

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

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setIsLoggedIn(false)
        setUser(null)
        setShowProfileDropdown(false)
        router.push('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfileClick = () => {
    setShowProfileModal(true)
    setShowProfileDropdown(false)
  }

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
              {/* Logo */}
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

              {/* Desktop Navigation */}
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
                      <div className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-2">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                              subItem.highlight 
                                ? 'text-amber-600 dark:text-amber-400 font-medium' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="flex items-center justify-between">
                              {subItem.label}
                              {subItem.highlight && !subItem.badge && (
                                <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                  HOT
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

                {/* Three-way Service Toggle - Now with routing */}
                <div className="ml-4 flex items-center">
                  <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
                    {/* Background slider */}
                    <div 
                      className={`absolute h-7 w-[76px] rounded-full transition-transform duration-300 ${
                        activeService === 'rides' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 translate-x-0' 
                          : activeService === 'hotels'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 translate-x-[80px]'
                          : activeService === 'rentals'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 translate-x-[160px]'
                          : 'hidden'
                      }`} 
                    />
                    
                    {/* Rides Button */}
                    <Link
                      href="/rides"
                      className={`relative z-10 flex items-center space-x-0.5 px-3 py-1.5 rounded-full transition-colors text-xs font-medium ${
                        activeService === 'rides' 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <IoCarOutline className="w-3 h-3" />
                      <span>Rides</span>
                    </Link>
                    
                    {/* Hotels Button */}
                    <Link
                      href="/hotels"
                      className={`relative z-10 flex items-center space-x-0.5 px-3 py-1.5 rounded-full transition-colors text-xs font-medium ${
                        activeService === 'hotels' 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <IoBusinessOutline className="w-3 h-3" />
                      <span>Hotels</span>
                    </Link>

                    {/* Rentals Button */}
                    <Link
                      href="/rentals"
                      className={`relative z-10 flex items-center space-x-0.5 px-3 py-1.5 rounded-full transition-colors text-xs font-medium ${
                        activeService === 'rentals' 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <IoKeyOutline className="w-3 h-3" />
                      <span>Rentals</span>
                    </Link>
                  </div>
                </div>
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

              {/* Get App Button */}
              <div className="relative group">
                <button 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  Get App
                </button>
                
                {/* Dropdown for App Options */}
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <a
                    href="https://testflight.apple.com/join/ygzsQbNf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <IoLogoApple className="w-5 h-5" />
                    <div>
                      <div className="font-medium">iOS App</div>
                      <div className="text-xs text-gray-500">TestFlight Beta</div>
                    </div>
                  </a>
                  <button
                    disabled
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed w-full text-left"
                  >
                    <IoLogoGooglePlaystore className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Android App</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Profile/Sign In Button */}
              {!isCheckingAuth && (
                <div className="profile-dropdown relative">
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group relative"
                        aria-label="Account menu"
                      >
                        <IoPersonCircleOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                      </button>
                      
                      {/* Profile Dropdown Menu */}
                      {showProfileDropdown && (
                        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.email}
                            </p>
                          </div>
                          
                          <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                          >
                            <IoPersonOutline className="w-4 h-4" />
                            <span>Profile & Settings</span>
                          </button>
                          
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                          >
                            <IoSettingsOutline className="w-4 h-4" />
                            <span>Dashboard</span>
                          </button>

                          <button
                            onClick={() => router.push('/rentals/manage')}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                          >
                            <IoKeyOutline className="w-4 h-4" />
                            <span>My Rentals</span>
                          </button>
                          
                          <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                            >
                              <IoLogOutOutline className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link 
                      href="/auth/login"
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group relative inline-block"
                      aria-label="Sign In / Account"
                    >
                      <IoPersonOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        Sign In / Account
                      </div>
                    </Link>
                  )}
                </div>
              )}

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
        isLoggedIn={isLoggedIn}
        user={user}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => {
            console.log('User updated:', updatedUser)
          }}
        />
      )}
    </>
  )
}