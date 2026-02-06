// app/help/chloe/components/ChoeCommerce.tsx
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
    status: 'live'
  },
  {
    icon: IoBedOutline,
    label: 'Hotels',
    example: '"Hotel near Old Town Scottsdale"',
    status: 'coming'
  },
  {
    icon: IoCartOutline,
    label: 'Shopping',
    example: '"Wireless headphones, $80, not Beats"',
    status: 'future'
  },
  {
    icon: IoBasketOutline,
    label: 'Groceries',
    example: '"Tacos for 6, dairy-free, under $40"',
    status: 'future'
  },
  {
    icon: IoHomeOutline,
    label: 'Real Estate',
    example: '"3BR in Tempe, under $400K, pool"',
    status: 'future'
  },
  {
    icon: IoLaptopOutline,
    label: 'Electronics',
    example: '"Laptop for video editing, 32GB RAM"',
    status: 'future'
  }
]

const pipelineSteps = [
  { label: 'User says what they want', color: '#e87040' },
  { label: 'AI understands intent', color: '#ff7f50' },
  { label: 'Searches inventory', color: '#d4a574' },
  { label: 'Filters & refines', color: '#c94c24' },
  { label: 'User confirms', color: '#e87040' },
  { label: 'Payment processes', color: '#27ca3f' }
]

export function ChoeCommerce() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-300 dark:border-[#222]">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#e87040]/5 dark:bg-[#e87040]/8 rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-[#d4a574] text-xs font-bold uppercase tracking-wider">
            <IoSparklesOutline className="w-4 h-4" />
            The Vision
          </span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Conversational Commerce
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto">
            The engine behind Choé isn&apos;t car-rental-specific. The pattern is universal.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-5 sm:p-6 border border-gray-300 dark:border-[#333] mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {pipelineSteps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                <span
                  className="text-xs sm:text-sm px-3 py-2 rounded-lg font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: `${step.color}15`,
                    color: step.color,
                    borderWidth: 1,
                    borderColor: `${step.color}30`
                  }}
                >
                  {step.label}
                </span>
                {index < pipelineSteps.length - 1 && (
                  <IoArrowForwardOutline className="w-4 h-4 text-gray-300 dark:text-[#333] hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Verticals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.map((vertical, index) => (
            <div
              key={vertical.label}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-5 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all choe-animate-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#e87040]/10 group-hover:scale-110 transition-transform">
                  <vertical.icon className="w-6 h-6 text-[#e87040]" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                    vertical.status === 'live'
                      ? 'bg-[#27ca3f]/15 text-[#27ca3f]'
                      : vertical.status === 'coming'
                        ? 'bg-[#d4a574]/15 text-[#d4a574]'
                        : 'bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-[#666]'
                  }`}
                >
                  {vertical.status === 'live' ? 'Live' : vertical.status === 'coming' ? 'Coming' : 'Future'}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {vertical.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#666] font-mono">
                {vertical.example}
              </p>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="mt-10 text-center">
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] italic">
            &quot;The decision layer is worth more than the payment layer because it comes first.&quot;
          </p>
        </div>
      </div>
    </section>
  )
}
