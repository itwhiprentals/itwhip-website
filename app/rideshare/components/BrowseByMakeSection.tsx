// app/rideshare/components/BrowseByMakeSection.tsx
'use client'

import Link from 'next/link'
import { IoCarSportOutline } from 'react-icons/io5'

// 6 Dedicated Rideshare Makes with Unsplash images (WebP optimized)
const rideshareFleetMakes = [
  {
    name: 'Toyota',
    slug: 'toyota',
    badge: 'Industry Standard',
    price: 'from $299/week',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&fm=webp&q=80', // Toyota Prius
  },
  {
    name: 'Honda',
    slug: 'honda',
    badge: "Driver's Choice",
    price: 'from $289/week',
    image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=400&h=300&fit=crop&fm=webp&q=80', // Honda Accord
  },
  {
    name: 'Hyundai',
    slug: 'hyundai',
    badge: 'Best Value',
    price: 'from $269/week',
    image: 'https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=400&h=300&fit=crop&fm=webp&q=80', // Hyundai
  },
  {
    name: 'Kia',
    slug: 'kia',
    badge: 'Most Affordable',
    price: 'from $249/week',
    image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400&h=300&fit=crop&fm=webp&q=80', // Kia
  },
  {
    name: 'Nissan',
    slug: 'nissan',
    badge: 'Fleet Proven',
    price: 'from $259/week',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop&fm=webp&q=80', // Nissan
  },
  {
    name: 'Chevrolet',
    slug: 'chevrolet',
    badge: 'American Made',
    price: 'from $269/week',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&fm=webp&q=80', // Chevrolet
  }
]

export default function BrowseByMakeSection() {
  return (
    <section className="py-5 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Centered between nav and cards */}
        <div className="flex items-center justify-center mb-5">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-5 py-2.5 shadow-md border border-gray-200 dark:border-gray-600">
            <IoCarSportOutline className="w-5 h-5 text-orange-500" />
            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Our Dedicated Rideshare Fleet
            </span>
          </div>
        </div>

        {/* Makes Grid - Same style as Browse by Type */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {rideshareFleetMakes.map((make) => (
            <Link
              key={make.name}
              href={`/rideshare?make=${make.slug}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200">
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-600 overflow-hidden relative">
                  <img
                    src={make.image}
                    alt={`${make.name} vehicles`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge Overlay */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-orange-500 text-white rounded font-medium shadow-sm">
                      {make.badge}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-2 sm:p-3 bg-white dark:bg-gray-700">
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {make.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 font-medium">
                    {make.price}
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
