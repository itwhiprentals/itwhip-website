'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AISearchToggle from './AISearchToggle'
import AIChatView from './AIChatView'

interface AISearchWrapperProps {
  children: React.ReactNode
}

export default function AISearchWrapper({ children }: AISearchWrapperProps) {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'normal' | 'ai'>(
    searchParams.get('mode') === 'ai' ? 'ai' : 'normal'
  )
  const router = useRouter()

  const handleNavigateToBooking = (vehicleId: string, startDate: string, endDate: string) => {
    router.push(`/rentals/${vehicleId}?startDate=${startDate}&endDate=${endDate}`)
  }

  const handleNavigateToLogin = () => {
    router.push('/login?redirect=/rentals')
  }

  return (
    <div>
      {/* AI Toggle */}
      <div className="flex justify-center mb-4">
        <AISearchToggle mode={mode} onToggle={setMode} />
      </div>

      {/* Normal search (filters + grid) */}
      {mode === 'normal' && children}

      {/* AI search */}
      {mode === 'ai' && (
        <div className="max-w-2xl mx-auto" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          <AIChatView
            onNavigateToBooking={handleNavigateToBooking}
            onNavigateToLogin={handleNavigateToLogin}
          />
        </div>
      )}
    </div>
  )
}
