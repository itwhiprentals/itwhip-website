// app/sys-2847/layout.tsx
'use client'
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeProvider, ThemeToggle } from './fleet/providers/theme-provider'

function InternalLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Skip authorization check entirely in development
    if (process.env.NODE_ENV === 'development') {
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // Production authorization check
    const urlKey = searchParams.get('key')
    const cookieKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('fleet_access='))
      ?.split('=')[1]

    const validKey = process.env.NEXT_PUBLIC_FLEET_KEY || 'phoenix-fleet-2847'
    
    if (urlKey === validKey) {
      document.cookie = `fleet_access=${validKey}; path=/sys-2847; max-age=86400`
      setIsAuthorized(true)
    } else if (cookieKey === validKey) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
    
    setIsChecking(false)
  }, [searchParams])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    // Return 404 page - don't reveal this system exists
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Page not found</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <nav className="flex items-center gap-6 text-sm">
                  <Link 
                    href="/sys-2847/fleet" 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/sys-2847/fleet/add" 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Add Car
                  </Link>
                  <Link 
                    href="/sys-2847/fleet/bulk" 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Bulk Upload
                  </Link>
                  <Link 
                    href="/sys-2847/fleet/templates" 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Templates
                  </Link>
                </nav>
                
                <div className="border-l border-gray-300 dark:border-gray-700 pl-6">
                  <ThemeToggle />
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
              <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-3">
                <nav className="flex flex-col gap-2">
                  <Link 
                    href="/sys-2847/fleet" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/sys-2847/fleet/add" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Add Car
                  </Link>
                  <Link 
                    href="/sys-2847/fleet/bulk" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Bulk Upload
                  </Link>
                  <Link 
                    href="/sys-2847/fleet/templates" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Templates
                  </Link>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
    </ThemeProvider>
  )
}

export default function InternalLayout({
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