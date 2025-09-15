// app/(guest)/layout.tsx

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Hide Footer on all rental pages
  const isRentalPage = pathname?.startsWith('/rentals')

  const handleGetAppClick = () => {
    // Handle get app click
    console.log('Get app clicked')
  }

  const handleSearchClick = () => {
    // Handle search click
    console.log('Search clicked')
  }

  return (
    <>
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />
      
      <main className="pt-14 md:pt-16">
        {children}
      </main>
      
      {/* Only show Footer if NOT on a rental page */}
      {!isRentalPage && <Footer />}
    </>
  )
}