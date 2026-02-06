// app/help/chloe/components/ChoeHero.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  IoTimeOutline,
  IoFlashOutline,
  IoLocationOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export function ChoeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#0f0f0f] dark:via-[#0f0f0f] dark:to-[#0f0f0f]">
      {/* Atmospheric Background */}
      <div className="absolute inset-0">
        {/* Light mode gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#e87040]/10 dark:bg-[#e87040]/20 rounded-full blur-[120px] dark:choe-glow-orb" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#d4a574]/10 dark:bg-[#c94c24]/15 rounded-full blur-[100px] dark:choe-glow-orb" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#ff7f50]/5 dark:bg-[#d4a574]/10 rounded-full blur-[80px] dark:choe-glow-orb" style={{ animationDelay: '1s' }} />
      </div>

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Content */}
      <div className="relative z-10 pt-20 pb-10 sm:pt-24 sm:pb-14">
        {/* Breadcrumbs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 choe-animate-in">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#a8a8a8]">
              <li className="flex items-center gap-2">
                <Link href="/" className="hover:text-[#e87040] transition-colors flex items-center gap-1.5">
                  <IoHomeOutline className="w-4 h-4" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-3 h-3 text-gray-400 dark:text-[#666]" />
              </li>
              <li className="flex items-center gap-2">
                <Link href="/support" className="hover:text-[#e87040] transition-colors">Help</Link>
                <IoChevronForwardOutline className="w-3 h-3 text-gray-400 dark:text-[#666]" />
              </li>
              <li className="text-[#e87040] font-medium">Choé AI</li>
            </ol>
          </nav>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 choe-animate-in choe-delay-1">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden shadow-2xl ring-2 ring-[#e87040]/30 bg-white dark:bg-[#1a1a1a] choe-float">
              <Image
                src="/images/choe-logo.png"
                alt="Choé AI Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-3 tracking-tight choe-animate-in choe-delay-2">
            Meet <span className="bg-gradient-to-r from-[#e87040] via-[#ff7f50] to-[#d4a574] bg-clip-text text-transparent">Choé</span>
          </h1>

          {/* Pronunciation */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-[#a8a8a8] mb-6 choe-animate-in choe-delay-2">
            Pronounced <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1a1a1a] px-2.5 py-1 rounded-lg border border-gray-300 dark:border-[#333]">&quot;Kow-We&quot;</span>
          </p>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-600 dark:text-[#a8a8a8] mb-12 max-w-2xl mx-auto choe-animate-in choe-delay-3">
            The AI that <span className="text-gray-900 dark:text-white">books cars</span> for you
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto mb-10 choe-animate-in choe-delay-4">
            <div className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-4 sm:p-5 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/50 transition-all hover:shadow-lg hover:shadow-[#e87040]/10 dark:hover:shadow-[#e87040]/5">
              <IoTimeOutline className="w-7 h-7 sm:w-8 sm:h-8 text-[#e87040] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">24/7</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-[#666]">Available</div>
            </div>
            <div className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-4 sm:p-5 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/50 transition-all hover:shadow-lg hover:shadow-[#e87040]/10 dark:hover:shadow-[#e87040]/5">
              <IoFlashOutline className="w-7 h-7 sm:w-8 sm:h-8 text-[#ff7f50] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Instant</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-[#666]">Search</div>
            </div>
            <div className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-4 sm:p-5 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/50 transition-all hover:shadow-lg hover:shadow-[#e87040]/10 dark:hover:shadow-[#e87040]/5">
              <IoLocationOutline className="w-7 h-7 sm:w-8 sm:h-8 text-[#d4a574] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Arizona</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-[#666]">Expert</div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-sm text-gray-500 dark:text-[#666] choe-animate-in choe-delay-4">
            Choé is AI-powered and can make mistakes. Always verify booking details.
          </p>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#0f0f0f] to-transparent" />
    </section>
  )
}
