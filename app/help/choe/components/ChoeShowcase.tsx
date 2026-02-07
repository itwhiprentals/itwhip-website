// app/help/choe/components/ChoeShowcase.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IoSparklesOutline } from 'react-icons/io5'

const screenshots = [
  {
    src: '/images/choe-showcase/choe-conversation.png',
    alt: 'Choé AI conversation - natural language car search',
    title: 'Natural Conversation',
    description: 'Just say what you need'
  },
  {
    src: '/images/choe-showcase/choe-search-results.png',
    alt: 'Choé AI search results - car listings',
    title: 'Instant Results',
    description: 'Real-time inventory search'
  },
  {
    src: '/images/choe-showcase/choe-pricing.png',
    alt: 'Choé AI pricing breakdown - transparent costs',
    title: 'Transparent Pricing',
    description: 'No hidden fees'
  },
  {
    src: '/images/choe-showcase/choe-booking.png',
    alt: 'Choé AI booking confirmation - easy checkout',
    title: 'Easy Booking',
    description: 'Confirm in seconds'
  }
]

export function ChoeShowcase() {
  return (
    <section className="pt-0 pb-10 sm:pb-14 bg-gradient-to-b from-white via-gray-50 to-white dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-[#0f0f0f] relative border-t border-gray-300 dark:border-[#222]">
      {/* Background accent - responsive sizing to prevent mobile overflow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[400px] lg:w-[800px] lg:h-[600px] bg-[#e87040]/5 dark:bg-[#e87040]/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <Image src="/images/choe-logo.png" alt="Choé" width={300} height={87} className="h-[90px] w-auto mx-auto -mb-5" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
            See Choé in Action
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-xl mx-auto mb-6">
            From conversation to confirmed booking in under a minute
          </p>
          <Link
            href="/choe"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c94c24] to-[#e87040] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#e87040]/20"
          >
            <IoSparklesOutline className="w-5 h-5" />
            Try Choé Now
          </Link>
        </div>

        {/* Phone mockups grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {screenshots.map((screenshot, index) => (
            <div
              key={screenshot.src}
              className="group choe-animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Phone frame */}
              <div className="relative mx-auto max-w-[200px] sm:max-w-[220px] lg:max-w-[240px]">
                {/* Screenshot with prominent bottom shadow */}
                <div className="relative">
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    width={540}
                    height={960}
                    className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08))'
                    }}
                    quality={90}
                  />
                </div>

                {/* Step number badge */}
                <div
                  className="absolute -top-2 -left-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: `hsl(${20 + index * 8}, 70%, ${52 - index * 3}%)` }}
                >
                  {index + 1}
                </div>
              </div>

              {/* Label */}
              <div className="text-center mt-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  {screenshot.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-[#666]">
                  {screenshot.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Flow indicator - desktop only */}
        <div className="hidden lg:flex items-center justify-center mt-10 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: `hsl(${20 + i * 8}, 70%, ${52 - i * 3}%)` }}
              />
              {i < 3 && (
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#e87040] to-[#d4a574] opacity-30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
