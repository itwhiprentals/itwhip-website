// app/(guest)/rentals/sections/BrowseByTypeSection.tsx
'use client'

import Link from 'next/link'

const carTypes = [
  {
    type: 'economy',
    label: 'Economy',
    price: 'from $45/day',
    image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=400&fit=crop' // SUV image moved to Economy
  },
  {
    type: 'suv',
    label: 'SUV', 
    price: 'from $75/day',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=400&fit=crop' // Ford Explorer/SUV
  },
  {
    type: 'luxury',
    label: 'Luxury',
    price: 'from $125/day',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop' // Luxury sedan (unchanged)
  },
  {
    type: 'sports',
    label: 'Sports',
    price: 'from $150/day',
    image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&h=400&fit=crop' // Convertible image moved to Sports
  },
  {
    type: 'electric',
    label: 'Electric',
    price: 'from $85/day',
    image: 'https://images.unsplash.com/photo-1561580125-028ee3bd62eb?w=400&h=400&fit=crop' // Tesla Model 3 side view
  },
  {
    type: 'convertible',
    label: 'Convertible',
    price: 'from $110/day',
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=400&fit=crop' // Sports car image moved to Convertible
  }
]

export default function BrowseByTypeSection() {
  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Browse by Type
        </h2>
        
        {/* Grid on all screen sizes - 3 cols on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {carTypes.map((carType) => (
            <Link
              key={carType.type}
              href={`/rentals/search?type=${carType.type}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
                {/* Square aspect ratio container */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-600 overflow-hidden">
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
      </div>
    </section>
  )
}