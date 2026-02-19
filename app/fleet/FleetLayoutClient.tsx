// app/fleet/FleetLayoutClient.tsx
'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeProvider, ThemeToggle } from './providers/theme-provider'
import PhoneWidgetWrapper from './components/PhoneWidgetWrapper'

function InternalLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [langBadge, setLangBadge] = useState(0)

  // Check if we're on the login page
  const isLoginPage = pathname === '/fleet/login'

  useEffect(() => {
    // Skip auth check on login page
    if (isLoginPage) {
      setIsChecking(false)
      setIsAuthorized(false)
      return
    }

    // Check session with API
    const checkSession = async () => {
      try {
        const res = await fetch('/api/fleet/auth', {
          method: 'GET',
          credentials: 'include'
        })

        if (res.ok) {
          const data = await res.json()
          setIsAuthorized(data.authenticated)
          if (!data.authenticated) {
            router.push('/fleet/login')
          }
        } else {
          setIsAuthorized(false)
          router.push('/fleet/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthorized(false)
        router.push('/fleet/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkSession()
  }, [isLoginPage, router])

  // Fetch language badge count (missing keys)
  useEffect(() => {
    if (!isAuthorized) return
    const fetchLangBadge = async () => {
      try {
        const res = await fetch('/fleet/api/language?key=phoenix-fleet-2847')
        if (res.ok) {
          const data = await res.json()
          const missing = Object.values(data.summary?.totalMissingKeys || {}).reduce((a: number, b: unknown) => a + (b as number), 0)
          setLangBadge(missing as number)
        }
      } catch { /* ignore */ }
    }
    fetchLangBadge()
  }, [isAuthorized])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/fleet/auth', {
        method: 'DELETE',
        credentials: 'include'
      })
      router.push('/fleet/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  // If on login page, render children (the login form)
  if (isLoginPage) {
    return <>{children}</>
  }

  if (!isAuthorized) {
    // Redirect will happen from useEffect, show loading
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Logo/Title */}
              <div className="flex items-center">
                <h1 className="text-sm font-mono text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Internal Fleet Management</span>
                  <span className="sm:hidden">Fleet</span>
                </h1>
              </div>

              {/* Desktop Navigation - Scrollable */}
              <div className="hidden md:flex items-center gap-4 flex-1 min-w-0 ml-4">
                <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide flex-1 min-w-0 pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <Link
                    href="/fleet"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/fleet/add"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Add Car
                  </Link>
                  <Link
                    href="/fleet/vehicles"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Vehicles
                  </Link>
                  <Link
                    href="/fleet/bulk"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Bulk
                  </Link>
                  <Link
                    href="/fleet/templates"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Templates
                  </Link>
                  <Link
                    href="/fleet/partners"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Partners
                  </Link>
                  <Link
                    href="/fleet/business"
                    className="px-2.5 py-1.5 rounded-md text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors whitespace-nowrap font-medium"
                  >
                    Business
                  </Link>
                  <Link
                    href="/fleet/refunds"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Refunds
                  </Link>
                  <Link
                    href="/fleet/bonuses"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Bonuses
                  </Link>
                  <Link
                    href="/fleet/guest-prospects"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Guest Invites
                  </Link>
                  <Link
                    href="/fleet/claims"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Claims
                  </Link>
                  <Link
                    href="/fleet/analytics"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/fleet/monitoring"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Monitoring
                  </Link>
                  <Link
                    href="/fleet/choe"
                    className="px-2.5 py-1.5 rounded-md text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors whitespace-nowrap font-medium"
                  >
                    Choé AI
                  </Link>
                  <Link
                    href="/fleet/esign"
                    className="px-2.5 py-1.5 rounded-md text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors whitespace-nowrap font-medium"
                  >
                    E-Sign
                  </Link>
                  <Link
                    href="/fleet/verifications"
                    className="px-2.5 py-1.5 rounded-md text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors whitespace-nowrap font-medium"
                  >
                    ID Check
                  </Link>
                  <Link
                    href="/fleet/language"
                    className="px-2.5 py-1.5 rounded-md text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors whitespace-nowrap font-medium relative"
                  >
                    Language
                    {langBadge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {langBadge > 9 ? '9+' : langBadge}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/fleet/communications"
                    className="px-2.5 py-1.5 rounded-md text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors whitespace-nowrap font-medium"
                  >
                    Comms
                  </Link>
                  <Link
                    href="/fleet/settings"
                    className="px-2.5 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Settings
                  </Link>
                </nav>

                <div className="border-l border-gray-300 dark:border-gray-700 pl-4 flex items-center gap-3 flex-shrink-0">
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors whitespace-nowrap"
                  >
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-3 max-h-[70vh] overflow-y-auto">
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/fleet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/fleet/add"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Add Car
                  </Link>
                  <Link
                    href="/fleet/vehicles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Vehicles
                  </Link>
                  <Link
                    href="/fleet/bulk"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Bulk Upload
                  </Link>
                  <Link
                    href="/fleet/templates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Templates
                  </Link>
                  <Link
                    href="/fleet/partners"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Partners
                  </Link>
                  <Link
                    href="/fleet/business"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 font-medium"
                  >
                    Business
                  </Link>
                  <Link
                    href="/fleet/refunds"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Refunds
                  </Link>
                  <Link
                    href="/fleet/bonuses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Bonuses
                  </Link>
                  <Link
                    href="/fleet/guest-prospects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Guest Invites
                  </Link>
                  <Link
                    href="/fleet/claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Claims
                  </Link>
                  <Link
                    href="/fleet/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/fleet/monitoring"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Monitoring
                  </Link>
                  <Link
                    href="/fleet/choe"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium"
                  >
                    Choé AI
                  </Link>
                  <Link
                    href="/fleet/esign"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium"
                  >
                    E-Sign
                  </Link>
                  <Link
                    href="/fleet/verifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium"
                  >
                    ID Check
                  </Link>
                  <Link
                    href="/fleet/language"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium flex items-center gap-2"
                  >
                    Language
                    {langBadge > 0 && (
                      <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {langBadge > 9 ? '9+' : langBadge}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/fleet/communications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 font-medium"
                  >
                    Comms
                  </Link>
                  <Link
                    href="/fleet/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    disabled={loggingOut}
                    className="px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left w-full"
                  >
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Internal System • Fleet Management • {new Date().getFullYear()}
            </p>
          </div>
        </footer>

      </div>
      <PhoneWidgetWrapper />
    </ThemeProvider>
  )
}

export default function FleetLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <InternalLayoutContent>{children}</InternalLayoutContent>
    </Suspense>
  )
}
