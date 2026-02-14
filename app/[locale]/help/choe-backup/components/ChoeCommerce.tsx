// app/help/choe/components/ChoeCommerce.tsx
'use client'

import {
  IoCarSportOutline,
  IoBedOutline,
  IoCartOutline,
  IoBasketOutline,
  IoHomeOutline,
  IoLaptopOutline,
  IoSparklesOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

const verticals = [
  {
    icon: IoCarSportOutline,
    label: 'Car Rentals',
    example: '"SUV in Phoenix, under $50/day"',
    status: 'live',
    color: 'violet'
  },
  {
    icon: IoBedOutline,
    label: 'Hotels',
    example: '"Hotel near Old Town Scottsdale"',
    status: 'coming',
    color: 'blue'
  },
  {
    icon: IoCartOutline,
    label: 'Shopping',
    example: '"Wireless headphones, $80, not Beats"',
    status: 'future',
    color: 'emerald'
  },
  {
    icon: IoBasketOutline,
    label: 'Groceries',
    example: '"Tacos for 6, dairy-free, under $40"',
    status: 'future',
    color: 'amber'
  },
  {
    icon: IoHomeOutline,
    label: 'Real Estate',
    example: '"3BR in Tempe, under $400K, pool"',
    status: 'future',
    color: 'rose'
  },
  {
    icon: IoLaptopOutline,
    label: 'Electronics',
    example: '"Laptop for video editing, 32GB RAM"',
    status: 'future',
    color: 'cyan'
  }
]

const statusStyles: Record<string, string> = {
  live: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  coming: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  future: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
}

const colorStyles: Record<string, string> = {
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
}

export function ChoeCommerce() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BETA Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold">
            <IoSparklesOutline className="w-3.5 h-3.5" />
            THE VISION
          </span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Conversational Commerce
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The engine behind Choé isn&apos;t car-rental-specific. The pattern is universal.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-lg font-medium">
              User says what they want
            </span>
            <IoArrowForwardOutline className="w-4 h-4 text-gray-400 hidden sm:block" />
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium">
              AI understands intent
            </span>
            <IoArrowForwardOutline className="w-4 h-4 text-gray-400 hidden sm:block" />
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg font-medium">
              Searches inventory
            </span>
            <IoArrowForwardOutline className="w-4 h-4 text-gray-400 hidden sm:block" />
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg font-medium">
              Filters &amp; refines
            </span>
            <IoArrowForwardOutline className="w-4 h-4 text-gray-400 hidden sm:block" />
            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded-lg font-medium">
              User confirms
            </span>
            <IoArrowForwardOutline className="w-4 h-4 text-gray-400 hidden sm:block" />
            <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-3 py-1.5 rounded-lg font-medium">
              Payment processes
            </span>
          </div>
        </div>

        {/* Verticals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.map((vertical) => (
            <div
              key={vertical.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${colorStyles[vertical.color]} rounded-lg flex items-center justify-center`}>
                  <vertical.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusStyles[vertical.status]}`}>
                  {vertical.status === 'live' ? 'Live' : vertical.status === 'coming' ? 'Coming' : 'Future'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {vertical.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {vertical.example}
              </p>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">
            &quot;The decision layer is worth more than the payment layer because it comes first.&quot;
          </p>
        </div>
      </div>
    </section>
  )
}
