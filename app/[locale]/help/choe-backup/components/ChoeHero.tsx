// app/help/choe/components/ChoeHero.tsx
'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import {
  IoTimeOutline,
  IoFlashOutline,
  IoLocationOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export function ChoeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 dark:from-violet-900 dark:via-purple-900 dark:to-violet-950" />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 sm:pt-28 sm:pb-16">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-white/70">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-white flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-white">Help</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-white font-medium">Choé AI</li>
            </ol>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            Meet Choé
          </h1>

          {/* Pronunciation */}
          <p className="text-lg sm:text-xl text-white/80 mb-4">
            Pronounced <span className="font-semibold text-white">&quot;Kow-We&quot;</span>
          </p>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl font-medium text-white/90 mb-8 max-w-xl mx-auto">
            The AI that books cars for you
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <IoTimeOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white mx-auto mb-1" />
              <div className="text-sm sm:text-base font-bold text-white">24/7</div>
              <div className="text-[10px] sm:text-xs text-white/70">Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <IoFlashOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white mx-auto mb-1" />
              <div className="text-sm sm:text-base font-bold text-white">Instant</div>
              <div className="text-[10px] sm:text-xs text-white/70">Search</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <IoLocationOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white mx-auto mb-1" />
              <div className="text-sm sm:text-base font-bold text-white">Arizona</div>
              <div className="text-[10px] sm:text-xs text-white/70">Expert</div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-white/60">
            Choé is AI-powered and can make mistakes. Always verify booking details.
          </p>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 60V30C360 0 720 60 1080 30C1260 15 1350 45 1440 45V60H0Z"
            className="fill-gray-50 dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  )
}
