// app/(guest)/rentals/sections/FeaturedCarsSection.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IoArrowForwardOutline, IoCarOutline, IoFlashOutline, IoStarOutline } from 'react-icons/io5'

// Debug the import
import CarCard from '../components/browse/CarCard'
console.log('CarCard import:', typeof CarCard, CarCard)

export default function FeaturedCarsSection() {
  const [featuredCars, setFeaturedCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedCars()
  }, [])

  const fetchFeaturedCars = async () => {
    try {
      const response = await fetch('/api/rentals/search?sortBy=recommended&limit=6')
      const data = await response.json()
      
      let cars = data?.results || data?.cars || data?.data?.cars || data?.data || []
      
      setFeaturedCars(cars.slice(0, 6))
    } catch (error) {
      console.error('Error fetching featured cars:', error)
      setFeaturedCars([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || featuredCars.length === 0) {
    return null
  }

  // For now, render without CarCard to isolate the issue
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Featured Cars (Debug Mode - CarCard type: {typeof CarCard})
        </h2>
      </div>
    </section>
  )
}