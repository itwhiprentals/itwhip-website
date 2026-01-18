// app/components/sections/WhyBookSection.tsx
// Horizontal scrollable "Why Book with ItWhip" section for home page

'use client'

import {
  IoShieldCheckmarkOutline,
  IoPricetagOutline,
  IoCarSportOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoStarOutline,
  IoFlashOutline,
  IoPhonePortraitOutline
} from 'react-icons/io5'

const WHY_BOOK_ITEMS = [
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Full Insurance Coverage',
    description: 'Every rental includes comprehensive insurance for peace of mind',
    color: 'emerald'
  },
  {
    icon: IoPricetagOutline,
    title: 'Best Price Guarantee',
    description: 'Competitive rates with no hidden fees or surprise charges',
    color: 'blue'
  },
  {
    icon: IoCarSportOutline,
    title: 'Rideshare Ready',
    description: 'Approved for Uber, Lyft, DoorDash and all gig platforms',
    color: 'purple'
  },
  {
    icon: IoLocationOutline,
    title: 'Free Delivery',
    description: 'Door-to-door delivery available throughout Phoenix metro',
    color: 'amber'
  },
  {
    icon: IoTimeOutline,
    title: 'Flexible Terms',
    description: 'Daily, weekly, or monthly rentals to fit your schedule',
    color: 'cyan'
  },
  {
    icon: IoStarOutline,
    title: 'Verified Hosts',
    description: 'All hosts are background checked and highly rated',
    color: 'orange'
  },
  {
    icon: IoFlashOutline,
    title: 'Instant Booking',
    description: 'Book instantly - no waiting for host approval',
    color: 'pink'
  },
  {
    icon: IoPhonePortraitOutline,
    title: '24/7 Support',
    description: 'Round-the-clock customer support when you need it',
    color: 'indigo'
  }
]

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' }
}

export default function WhyBookSection() {
  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <span className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            Why ItWhip
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            Why Book With Us
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            The smarter way to rent cars for rideshare and personal use
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Scroll Shadow Indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10 pointer-events-none" />

          {/* Scrollable Cards */}
          <div className="flex overflow-x-auto gap-4 px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Left spacer for proper padding */}
            <div className="flex-shrink-0 w-0 sm:w-2 lg:w-4" />

            {WHY_BOOK_ITEMS.map((item, index) => {
              const Icon = item.icon
              const colors = colorClasses[item.color]
              return (
                <div
                  key={index}
                  className={`flex-shrink-0 w-[200px] sm:w-[240px] p-4 sm:p-5 rounded-xl border ${colors.border} ${colors.bg} snap-start transition-transform hover:scale-[1.02]`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.text}`} />
                  </div>
                  <h3 className={`font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1`}>
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              )
            })}

            {/* Right spacer for proper padding */}
            <div className="flex-shrink-0 w-0 sm:w-2 lg:w-4" />
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="sm:hidden px-4 mt-2">
          <p className="text-xs text-gray-400 text-center">
            Swipe to see more
          </p>
        </div>
      </div>
    </section>
  )
}
