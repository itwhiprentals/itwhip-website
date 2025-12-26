// app/partner/layout.tsx
// Partner Dashboard Layout - Enterprise-grade sidebar navigation
// Cloned from /app/admin/ structure, customized for B2B partners

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoGridOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoAnalyticsOutline,
  IoGlobeOutline,
  IoPricetagOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoBusinessOutline,
  IoMoonOutline,
  IoSunnyOutline,
  IoPersonOutline,
  IoNotificationsOutline
} from 'react-icons/io5'

interface PartnerData {
  id: string
  name: string
  email: string
  partnerCompanyName: string
  partnerLogo?: string
  partnerSlug?: string
  currentCommissionRate: number
  partnerFleetSize: number
  partnerTotalBookings: number
  partnerTotalRevenue: number
}

const navigationItems = [
  { name: 'Dashboard', href: '/partner/dashboard', icon: IoGridOutline },
  { name: 'Fleet', href: '/partner/fleet', icon: IoCarOutline },
  { name: 'Bookings', href: '/partner/bookings', icon: IoCalendarOutline },
  { name: 'Revenue', href: '/partner/revenue', icon: IoWalletOutline },
  { name: 'Analytics', href: '/partner/analytics', icon: IoAnalyticsOutline },
  { name: 'Landing Page', href: '/partner/landing', icon: IoGlobeOutline },
  { name: 'Discounts', href: '/partner/discounts', icon: IoPricetagOutline },
  { name: 'Settings', href: '/partner/settings', icon: IoSettingsOutline },
]

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [partner, setPartner] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Skip auth check on login page
  const isLoginPage = pathname === '/partner/login'

  useEffect(() => {
    if (!isLoginPage) {
      checkSession()
    } else {
      setLoading(false)
    }
  }, [pathname])

  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('partner-dark-mode') === 'true' ||
      (!localStorage.getItem('partner-dark-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('partner-dark-mode', String(newMode))
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const checkSession = async () => {
    try {
      const response = await fetch('/api/partner/session', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        router.push('/partner/login')
        return
      }

      const data = await response.json()
      if (data.authenticated && data.partner) {
        setPartner(data.partner)
      } else {
        router.push('/partner/login')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/partner/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/partner/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/partner/login')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading partner portal...</p>
        </div>
      </div>
    )
  }

  // Login page - no layout
  if (isLoginPage) {
    return <>{children}</>
  }

  const getTierInfo = (rate: number) => {
    if (rate <= 0.10) return { label: 'Diamond', color: 'bg-purple-500' }
    if (rate <= 0.15) return { label: 'Platinum', color: 'bg-blue-500' }
    if (rate <= 0.20) return { label: 'Gold', color: 'bg-yellow-500' }
    return { label: 'Standard', color: 'bg-gray-500' }
  }

  const tier = partner ? getTierInfo(partner.currentCommissionRate) : { label: 'Standard', color: 'bg-gray-500' }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {partner?.partnerLogo ? (
              <Image
                src={partner.partnerLogo}
                alt=""
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoBusinessOutline className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {partner?.partnerCompanyName || 'Partner Portal'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${tier.color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{tier.label} Partner</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-600 dark:text-orange-400' : ''}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{partner?.partnerFleetSize || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vehicles</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{partner?.partnerTotalBookings || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bookings</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <IoMoonOutline className="w-5 h-5" /> : <IoSunnyOutline className="w-5 h-5" />}
              {darkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-10 h-5 rounded-full transition-colors ${darkMode ? 'bg-orange-600' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform mt-0.5 ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full mt-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IoLogOutOutline className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <IoMenuOutline className="w-6 h-6" />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="hidden lg:flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navigationItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'))?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Partner Slug Link */}
              {partner?.partnerSlug && (
                <a
                  href={`/rideshare/${partner.partnerSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <IoGlobeOutline className="w-4 h-4" />
                  /rideshare/{partner.partnerSlug}
                </a>
              )}

              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative">
                <IoNotificationsOutline className="w-6 h-6" />
                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <IoPersonOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <IoChevronDownOutline className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {partner?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {partner?.email}
                        </p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/partner/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <IoSettingsOutline className="w-4 h-4" />
                          Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <IoLogOutOutline className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
