// app/components/LiveTicker.tsx

'use client'

import type { LiveTickerProps } from '../types'

export default function LiveTicker({
  items,
  currentIndex,
  currentTime
}: LiveTickerProps) {
  const currentItem = items[currentIndex] || items[0]

  // Get background color based on severity - professional colors
  const getTickerBgColor = (severity: string) => {
    switch(severity) {
      case 'critical': 
        return '#dc2626' // red-600
      case 'warning': 
        return '#d97706' // amber-600
      default: 
        return '#2563eb' // blue-600
    }
  }

  if (!currentItem) return null

  return (
    <div 
      className="fixed top-14 md:top-16 w-full py-1.5 md:py-2 z-40 overflow-hidden text-white"
      style={{ backgroundColor: getTickerBgColor(currentItem.severity) }}
    >
      <div className="flex items-center">
        {/* Mobile: Scrolling ticker */}
        <div className="sm:hidden w-full">
          <div className="flex items-center px-2">
            <div className="flex items-center flex-shrink-0 mr-3">
              <span className="text-xs font-bold uppercase tracking-wider">LIVE</span>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse ml-1.5"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="whitespace-nowrap animate-scroll-left text-xs font-medium">
                {currentItem.message}
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop: Static centered ticker */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 w-full items-center justify-between">
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider">LIVE</span>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1 text-center text-xs md:text-sm font-medium mx-2 truncate">
            {currentItem.message}
          </div>
          <div className="text-xs opacity-75">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Simple CSS for scrolling animation */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 15s linear infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}