'use client'

import { useRouter } from 'next/navigation'
import { ChatViewStreaming } from '@/app/components/ai'

export default function ChoePageClient() {
  const router = useRouter()

  return (
    <div className="h-[100dvh] overflow-hidden bg-white dark:bg-gray-900">
    <ChatViewStreaming
      onNavigateToBooking={(vehicleId, startDate, endDate) => {
        router.push(`/rentals/${vehicleId}?startDate=${startDate}&endDate=${endDate}`)
      }}
      onNavigateToLogin={() => {
        router.push('/login?redirect=/choe')
      }}
      onClassicSearch={() => {
        router.push('/rentals/search')
      }}
    />
    </div>
  )
}
