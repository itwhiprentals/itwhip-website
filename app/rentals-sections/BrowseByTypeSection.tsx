// app/rentals-sections/BrowseByTypeSection.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

const carTypes = [
  {
    type: 'sedan',
    label: 'Sedan',
    price: 'from $35/day',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=400&fit=crop'
  },
  {
    type: 'suv',
    label: 'SUV',
    price: 'from $45/day',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop'
  },
  {
    type: 'luxury',
    label: 'Luxury',
    price: 'from $100/day',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop'
  },
  {
    type: 'sports',
    label: 'Sports',
    price: 'from $150/day',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop'
  },
  {
    type: 'electric',
    label: 'Electric',
    price: 'from $80/day',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop'
  },
  {
    type: 'truck',
    label: 'Truck',
    price: 'from $60/day',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400&h=400&fit=crop'
  }
]

// Popular makes with available inventory - ordered by popularity/count
const carMakes = [
  { name: 'BMW', slug: 'bmw', country: 'Germany', price: 'from $90/day' },
  { name: 'Mercedes-Benz', slug: 'mercedes', country: 'Germany', price: 'from $100/day' },
  { name: 'Porsche', slug: 'porsche', country: 'Germany', price: 'from $200/day' },
  { name: 'Bentley', slug: 'bentley', country: 'UK', price: 'from $800/day' },
  { name: 'Tesla', slug: 'tesla', country: 'USA', price: 'from $80/day' },
  { name: 'Lamborghini', slug: 'lamborghini', country: 'Italy', price: 'from $800/day' },
  { name: 'Ferrari', slug: 'ferrari', country: 'Italy', price: 'from $1000/day' },
  { name: 'Land Rover', slug: 'land-rover', country: 'UK', price: 'from $150/day' },
  { name: 'Cadillac', slug: 'cadillac', country: 'USA', price: 'from $90/day' },
  { name: 'Dodge', slug: 'dodge', country: 'USA', price: 'from $80/day' },
  { name: 'Lexus', slug: 'lexus', country: 'Japan', price: 'from $80/day' },
  { name: 'Audi', slug: 'audi', country: 'Germany', price: 'from $85/day' },
]

export default function BrowseByTypeSection() {
  const [activeTab, setActiveTab] = useState<'type' | 'make'>('type')

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toggle Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('type')}
              className={`text-lg sm:text-2xl font-bold transition-colors ${
                activeTab === 'type'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Browse by Type
            </button>
            <span className="text-gray-300 dark:text-gray-600 text-lg sm:text-2xl font-light mx-1 sm:mx-2">|</span>
            <button
              onClick={() => setActiveTab('make')}
              className={`text-lg sm:text-2xl font-bold transition-colors ${
                activeTab === 'make'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Browse by Make
            </button>
          </div>
        </div>

        {/* Type Grid */}
        {activeTab === 'type' && (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {carTypes.map((carType) => (
              <Link
                key={carType.type}
                href={`/rentals/types/${carType.type}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-600 overflow-hidden">
                    <img
                      src={carType.image}
                      alt={carType.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 sm:p-3 bg-white dark:bg-gray-700">
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {carType.label}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {carType.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Make Grid */}
        {activeTab === 'make' && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {carMakes.map((make) => (
              <Link
                key={make.slug}
                href={`/rentals/makes/${make.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-500 transition-all p-3 sm:p-4 text-center">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {make.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {make.country}
                  </p>
                  <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                    {make.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
