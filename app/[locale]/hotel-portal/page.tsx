// app/hotel-portal/page.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HotelPortalRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Immediate redirect to the actual portal login
    router.replace('/portal/login')
  }, [router])
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to portal...</p>
      </div>
    </div>
  )
}