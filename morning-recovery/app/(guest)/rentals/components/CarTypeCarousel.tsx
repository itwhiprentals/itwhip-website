// app/(guest)/rentals/components/CarTypeCarousel.tsx
// Main carousel component for car types showcase

'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  IoChevronBackOutline, 
  IoChevronForwardOutline,
  IoCarOutline,
  IoLocationOutline
} from 'react-icons/io5'
import CarTypeCard from './CarTypeCard'
import { carTypes } from './CarTypeData'

export default function CarTypeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      handleNext()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [activeIndex, isAutoPlaying])
  
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? carTypes.length - 1 : prev - 1))
    setIsAutoPlaying(false)
  }
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev === carTypes.length - 1 ? 0 : prev + 1))
  }
  
  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const cardWidth = isMobile ? 280 : 320
    const gap = 16
    const scrollPosition = index * (cardWidth + gap)
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
    
    setActiveIndex(index)
    setIsAutoPlaying(false)
  }
  
  // Handle scroll snap on mobile
  const handleScroll = () => {
    if (!scrollContainerRef.current || !isMobile) return
    
    const container = scrollContainerRef.current
    const cardWidth = 280
    const gap = 16
    const scrollLeft = container.scrollLeft
    const index = Math.round(scrollLeft / (cardWidth + gap))
    
    if (index !== activeIndex) {
      setActiveIndex(index)
      setIsAutoPlaying(false)
    }
  }
  
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
            <IoCarOutline className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Vehicle Categories
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Browse by Vehicle Type
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select a category to see all available cars in that class
          </p>
        </div>
        
        {/* Mobile Carousel */}
        <div className="block md:hidden">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitScrollbar: { display: 'none' } }}
          >
            {carTypes.map((car, index) => (
              <div key={car.id} className="snap-center">
                <CarTypeCard 
                  car={car} 
                  index={index}
                  isActive={index === activeIndex}
                />
              </div>
            ))}
          </div>
          
          {/* Mobile Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {carTypes.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`
                  transition-all duration-300
                  ${index === activeIndex 
                    ? 'w-8 h-2 bg-amber-500 rounded-full' 
                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400'
                  }
                `}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop Grid */}
        <div className="hidden md:block">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carTypes.map((car, index) => (
              <CarTypeCard 
                key={car.id}
                car={car} 
                index={index}
                isActive={false}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all hover:scale-110"
          >
            <IoChevronBackOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex gap-2">
            {carTypes.map((car, index) => (
              <button
                key={car.id}
                onClick={() => setActiveIndex(index)}
                className={`
                  px-4 py-2 rounded-full font-medium text-sm transition-all
                  ${index === activeIndex 
                    ? 'bg-amber-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
                  }
                `}
              >
                {car.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all hover:scale-110"
          >
            <IoChevronForwardOutline className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to see all cars without filtering by type?
          </p>
          <button 
            onClick={() => window.location.href = '/rentals/search'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-105 shadow-lg"
          >
            <IoLocationOutline className="w-5 h-5" />
            Browse All Available Cars
          </button>
        </div>
      </div>
    </section>
  )
}