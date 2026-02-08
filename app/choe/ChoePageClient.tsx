'use client'

import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { ChatViewStreaming } from '@/app/components/ai'

export default function ChoePageClient() {
  const router = useRouter()

  return (
    <>
      {/* Safari bottom bar + atmosphere — same pattern as /help/choe ChoeStyles */}
      <style jsx global>{`
        /* iOS Safari bottom bar picks up body background — match Choé theme */
        body:has(.choe-page) {
          background-color: #ffffff !important;
        }
        html.dark body:has(.choe-page) {
          background-color: #111827 !important;
        }

        .choe-atmosphere {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 0;
          background: radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.04), transparent 70%);
        }
        html.dark .choe-atmosphere {
          background: radial-gradient(ellipse at top right, rgba(88, 28, 135, 0.08), transparent 70%);
        }
      `}</style>

      <div className="choe-page h-[100dvh] overflow-hidden bg-white dark:bg-gray-900 relative" style={{ overscrollBehavior: 'none' }}>
        <Header />
        <div className="choe-atmosphere" />
        <div className="relative z-10 h-full pt-[calc(env(safe-area-inset-top)+4rem)]">
          <ChatViewStreaming
            hideHeader
            onNavigateToBooking={(vehicleId, startDate, endDate) => {
              router.push(`/rentals/${vehicleId}?startDate=${startDate}&endDate=${endDate}`)
            }}
            onNavigateToLogin={() => {
              router.push('/login?redirect=/choe')
            }}
          />
        </div>
      </div>
    </>
  )
}
