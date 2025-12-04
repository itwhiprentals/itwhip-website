// app/(guest)/rentals/sections/BrowseByTypeSection.tsx
'use client'

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
              href={`/rentals/types/${carType.type}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
                {/* Shorter aspect ratio for compact cards */}
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
      </div>
    </section>
  )
}