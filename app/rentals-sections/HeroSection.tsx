// app/(guest)/rentals/sections/HeroSection.tsx
'use client'

import RentalSearchCard from '@/app/(guest)/components/hero/RentalSearchWidget'

export default function HeroSection() {
  return (
    <section className="relative min-h-[45vh] md:min-h-[40vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video 
          className="w-full h-full object-cover opacity-40"
          autoPlay 
          muted 
          loop 
          playsInline
          poster="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1920&h=1080&fit=crop"
        >
          <source src="/itwhip-hero.webm" type="video/webm" />
          <source src="/itwhip-hero.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60" />

      {/* Hero Content - Moved up with negative margin */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-12 sm:-mt-16">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 md:mb-1.5 tracking-tight">
        Your Trip, Your Way.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-2.5 md:mb-3 max-w-2xl mx-auto px-4">
          
        </p>

        <div className="px-2 sm:px-0">
          <RentalSearchCard variant="hero" />
        </div>
      </div>
      
      {/* Scroll Indicator - Now visible with more space */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-2.5 bg-white/60 rounded-full mt-1.5 animate-pulse" />
        </div>
      </div>
    </section>
  )
}