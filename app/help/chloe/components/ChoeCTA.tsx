// app/help/chloe/components/ChoeCTA.tsx
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
    <section className="py-10 sm:py-14 relative overflow-hidden border-t border-gray-200 dark:border-[#222]">
      {/* Arizona Sunset Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c94c24] via-[#e87040] to-[#ff7f50]" />

      {/* Animated ambient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] choe-glow-orb" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4a574]/20 rounded-full blur-[80px] choe-glow-orb" style={{ animationDelay: '2s' }} />
      </div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8 choe-animate-in">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shadow-2xl ring-4 ring-white/20 bg-[#1a1a1a]">
            <Image
              src="/images/choe-logo.png"
              alt="Choé AI Logo"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight choe-animate-in choe-delay-1">
          Ready to Try Choé?
        </h2>
        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto choe-animate-in choe-delay-2">
          Find your perfect car in Arizona with just a conversation.
          No filters. No dropdowns. Just tell Choé what you need.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 choe-animate-in choe-delay-3">
          <Link
            href="/rentals/search?mode=ai"
            className="group inline-flex items-center justify-center gap-3 bg-white text-[#c94c24] px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            <IoRocketOutline className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Try Choé Now
            <IoChevronForwardOutline className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="https://choe.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-white/15 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/25 transition-all"
          >
            <IoGlobeOutline className="w-6 h-6" />
            Visit choe.cloud
          </Link>
        </div>

        <p className="text-sm text-white/60 choe-animate-in choe-delay-4">
          Choé can make mistakes. Always verify booking details before confirming.
        </p>
      </div>
    </section>
  )
}
