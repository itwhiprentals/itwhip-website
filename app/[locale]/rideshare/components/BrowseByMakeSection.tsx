// app/rideshare/components/BrowseByMakeSection.tsx
'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { IoCarSportOutline } from 'react-icons/io5'

// 6 Dedicated Rideshare Makes with official logos
const rideshareFleetMakes = [
  {
    name: 'Toyota',
    slug: 'toyota',
    badgeKey: 'badgeIndustryStandard',
    price: '$299',
    logo: '/logos/makes/toyota.png',
    logoClass: 'h-14 sm:h-16 max-w-[100px] sm:max-w-[120px]',
  },
  {
    name: 'Honda',
    slug: 'honda',
    badgeKey: 'badgeDriversChoice',
    price: '$289',
    logo: '/logos/makes/honda.png',
    logoClass: 'h-16 sm:h-20 max-w-[110px] sm:max-w-[140px]',
  },
  {
    name: 'Hyundai',
    slug: 'hyundai',
    badgeKey: 'badgeBestValue',
    price: '$269',
    logo: '/logos/makes/hyundai.png',
    logoClass: 'h-[34px] sm:h-[38px] max-w-[60px] sm:max-w-[72px]',
  },
  {
    name: 'Kia',
    slug: 'kia',
    badgeKey: 'badgeMostAffordable',
    price: '$249',
    logo: '/logos/makes/kia.png',
    logoClass: 'h-10 sm:h-12 max-w-[80px] sm:max-w-[90px]',
  },
  {
    name: 'Nissan',
    slug: 'nissan',
    badgeKey: 'badgeFleetProven',
    price: '$259',
    logo: '/logos/makes/nissan.png',
    logoClass: 'h-[47px] sm:h-[62px] max-w-[85px] sm:max-w-[109px]',
  },
  {
    name: 'Chevrolet',
    slug: 'chevrolet',
    badgeKey: 'badgeAmericanMade',
    price: '$269',
    logo: '/logos/makes/chevrolet.png',
    logoClass: 'h-[53px] sm:h-[61px] max-w-[95px] sm:max-w-[114px]',
  }
]

export default function BrowseByMakeSection() {
  const t = useTranslations('Rideshare')

  return (
    <section className="py-5 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-center mb-5">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-5 py-2.5 shadow-md border border-gray-200 dark:border-gray-600">
            <IoCarSportOutline className="w-5 h-5 text-orange-500" />
            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              {t('fleetSectionTitle')}
            </span>
          </div>
        </div>

        {/* Makes Grid - Logo style cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {rideshareFleetMakes.map((make) => (
            <Link
              key={make.name}
              href={`/rideshare/makes/${make.slug}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 text-center p-2 sm:p-3">
                {/* Badge */}
                <span className="inline-block text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-orange-500 text-white rounded font-medium mb-2">
                  {t(make.badgeKey)}
                </span>
                {/* Logo */}
                <div className="h-14 sm:h-16 flex items-center justify-center mb-1 mx-1">
                  <img
                    src={make.logo}
                    alt={`${make.name} logo`}
                    className={`${make.logoClass} w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-lg`}
                  />
                </div>
                {/* Price */}
                <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 font-semibold">
                  {t('priceFrom', { price: make.price })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
