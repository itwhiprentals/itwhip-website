// app/(guest)/rentals/sections/BrowseByTypeSection.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const CAR_TYPES = [
  { type: 'sedan', price: '$35', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=210&h=158&fit=crop&fm=webp&q=60' },
  { type: 'suv', price: '$45', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=210&h=158&fit=crop&fm=webp&q=60' },
  { type: 'luxury', price: '$100', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=210&h=158&fit=crop&fm=webp&q=60' },
  { type: 'sports', price: '$150', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=210&h=158&fit=crop&fm=webp&q=60' },
  { type: 'electric', price: '$80', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=210&h=158&fit=crop&fm=webp&q=60' },
  { type: 'truck', price: '$60', image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=210&h=158&fit=crop&fm=webp&q=60' }
] as const

export default function BrowseByTypeSection() {
  const t = useTranslations('RentalsHome')

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          {t('browseByType')}
        </h2>

        {/* Horizontal scrolling on mobile, grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {CAR_TYPES.map((carType) => (
            <Link
              key={carType.type}
              href={`/rentals?type=${carType.type}`}
              className="flex-shrink-0 sm:flex-shrink group"
            >
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all min-w-[140px] sm:min-w-0">
                <div className="h-20 sm:h-24 bg-gray-100 dark:bg-gray-600 overflow-hidden">
                  <img
                    src={carType.image}
                    alt={t(carType.type)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-2 sm:p-3 bg-white dark:bg-gray-700">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {t(carType.type)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('fromPrice', { price: carType.price })}
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
