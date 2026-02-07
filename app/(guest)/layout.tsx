// app/(guest)/layout.tsx

'use client'

import { usePathname } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Known sub-routes under /rentals that are NOT car detail pages
const RENTAL_SUB_ROUTES = [
  'search', 'long-term', 'weekend', 'daily', 'hourly', 'road-trip',
  'snowbird', 'spring-training', 'business', 'corporate-travel',
  'airport-delivery', 'hotel-delivery', 'budget', 'cities', 'types',
  'makes', 'airports', 'dashboard', 'manage', 'track', 'verify',
  'trip', 'book', 'near-me', 'tesla-near-me', 'luxury-near-me',
  'suv-near-me', 'exotic-near-me', 'airport-near-me'
]

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Hide Footer on all rental pages
  const isRentalPage = pathname?.startsWith('/rentals')

  // Hide Footer on dashboard/app-style pages (no marketing footer needed)
  const isDashboardPage =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/payments') ||
    pathname?.startsWith('/messages') ||
    pathname?.startsWith('/claims') ||
    pathname?.startsWith('/settings')

  // Check if this is a car detail page (not a known sub-route)
  // Car detail pages are like: /rentals/2017-lamborghini-lp-580-2-spyder-...
  const isCarDetailPage = (() => {
    if (!pathname?.startsWith('/rentals/')) return false
    const segments = pathname.split('/')
    // /rentals/[carId] = 3 segments: ['', 'rentals', 'carId']
    // /rentals/[carId]/book = 4 segments
    if (segments.length < 3) return false
    const firstSegment = segments[2]
    // If it's not a known sub-route, it's a car detail page
    return !RENTAL_SUB_ROUTES.includes(firstSegment)
  })()

  return (
    <>
      {/* Hide Header on mobile for car detail pages */}
      <div className={isCarDetailPage ? 'hidden sm:block' : ''}>
        <Header />
      </div>

      {/* Remove top padding on mobile for car detail pages */}
      <main className={isCarDetailPage ? 'pt-0 sm:pt-14 md:pt-16' : 'pt-14 md:pt-16'}>
        {children}
      </main>

      {/* Only show Footer if NOT on a rental or dashboard-style page */}
      {!isRentalPage && !isDashboardPage && <Footer />}
    </>
  )
}