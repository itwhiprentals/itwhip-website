'use client'

import RentalSearchWidget from '@/app/(guest)/components/hero/RentalSearchWidget'

interface HeroSectionProps {
  userCity?: string
}

export default function HeroSection({ userCity = 'Phoenix' }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[45vh] md:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=1080&fit=crop&crop=center&auto=format&q=80"
          alt="Peer-to-peer car rental Phoenix Arizona"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 md:-mt-12">
        <div className="text-center mb-4 sm:mb-5">
          {/* Main Headline - P2P Focused */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 sm:mb-1.5 leading-tight">
            Rent Cars From {userCity} Owners
          </h1>
          
          {/* Subheadline - P2P Value Props */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            • Fully insured • Hosts earn up to 90% •
          </p>
        </div>

        {/* Search Widget */}
        <div className="relative">
          <RentalSearchWidget />
        </div>
      </div>
    </section>
  )
}