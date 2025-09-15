// app/(guest)/rentals/sections/BrowseByTypeSection.tsx
'use client'

import Link from 'next/link'

const carTypes = [
  {
    type: 'economy',
    label: 'Economy',
    price: 'from $45/day',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop'
  },
  {
    type: 'suv',
    label: 'SUV',
    price: 'from $75/day',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop'
  },
  {
    type: 'luxury',
    label: 'Luxury',
    price: 'from $125/day',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop'
  },
  {
    type: 'sports',
    label: 'Sports',
    price: 'from $150/day',
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400&h=300&fit=crop'
  },
  {
    type: 'electric',
    label: 'Electric',
    price: 'from $85/day',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop'
  },
  {
    type: 'convertible',
    label: 'Convertible',
    price: 'from $110/day',
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&h=300&fit=crop'
  }
]

export default function BrowseByTypeSection() {
  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Browse by Type
        </h2>
        
        {/* Horizontal scrolling on mobile, grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {carTypes.map((carType) => (
            <Link
              key={carType.type}
              href={`/rentals/search?type=${carType.type}`}
              className="flex-shrink-0 sm:flex-shrink group"
            >
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all min-w-[140px] sm:min-w-0">
                <div className="h-20 sm:h-24 bg-gray-100 dark:bg-gray-600 overflow-hidden">
                  <img 
                    src={carType.image}
                    alt={carType.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-2 sm:p-3 bg-white dark:bg-gray-700">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {carType.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {carType.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}