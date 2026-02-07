// app/help/choe/components/ChoeCTA.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  IoRocketOutline,
  IoChevronForwardOutline,
  IoGlobeOutline
} from 'react-icons/io5'

export function ChoeCTA() {
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 dark:from-violet-900 dark:via-purple-900 dark:to-violet-950" />

      {/* Animated Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-2xl ring-4 ring-white/20">
            <Image
              src="/images/choe-logo.png"
              alt="Choé AI Logo"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Try Choé?
        </h2>
        <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl mx-auto">
          Find your perfect car in Arizona with just a conversation.
          No filters. No dropdowns. Just tell Choé what you need.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
          <Link
            href="/choe"
            className="inline-flex items-center justify-center gap-2 bg-white text-violet-600 px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg"
          >
            <IoRocketOutline className="w-5 h-5" />
            Try Choé Now
            <IoChevronForwardOutline className="w-4 h-4" />
          </Link>
          <Link
            href="https://choe.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            <IoGlobeOutline className="w-5 h-5" />
            Visit choe.cloud
          </Link>
        </div>

        <p className="text-xs text-white/60">
          Choé can make mistakes. Always verify booking details before confirming.
        </p>
      </div>
    </section>
  )
}
