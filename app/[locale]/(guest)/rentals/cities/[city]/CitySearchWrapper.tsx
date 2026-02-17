// app/(guest)/rentals/cities/[city]/CitySearchWrapper.tsx
'use client'

import { useState, useEffect, useMemo, ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  IoArrowBackOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoCarSportOutline
} from 'react-icons/io5'

interface CitySearchWrapperProps {
  cityName: string
  totalCars: number
  children: ReactNode
  searchableContent: {
    sectionId: string
    searchTerms: string[]
  }[]
}

export default function CitySearchWrapper({ 
  cityName, 
  totalCars,
  children,
  searchableContent 
}: CitySearchWrapperProps) {
  const t = useTranslations('RentalCity')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [placeholderText, setPlaceholderText] = useState(t('searchPlaceholder0', { city: cityName }))
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set())

  // Rotating placeholder text
  useEffect(() => {
    const placeholders = Array.from({ length: 7 }, (_, i) =>
      t(`searchPlaceholder${i}` as any, { city: cityName })
    )
    
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % placeholders.length
      setPlaceholderText(placeholders[index])
    }, 10000) // Change every 10 seconds
    
    return () => clearInterval(interval)
  }, [cityName])

  // Filter sections based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHiddenSections(new Set())
      return
    }

    const query = searchQuery.toLowerCase()
    const newHiddenSections = new Set<string>()

    searchableContent.forEach(section => {
      const matches = section.searchTerms.some(term => 
        term.toLowerCase().includes(query)
      )
      if (!matches) {
        newHiddenSections.add(section.sectionId)
      }
    })

    setHiddenSections(newHiddenSections)
  }, [searchQuery, searchableContent])

  const visibleCount = searchableContent.length - hiddenSections.size

  return (
    <>
      {/* Search Header Section */}
      <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link 
              href="/rentals/cities" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              {t('allCities')}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{cityName}</span>
          </nav>

          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholderText}
                className="w-full pl-12 pr-12 py-3 sm:py-4 text-base sm:text-lg bg-gray-50 dark:bg-gray-700 border border-emerald-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <IoCloseOutline className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
            
            {/* Results Count */}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {searchQuery ? (
                <span>{t('searchResultsInfo', { sections: visibleCount, total: totalCars, city: cityName })}</span>
              ) : (
                <span>{t('carsAvailable', { count: totalCars })}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtered Content */}
      {visibleCount === 0 ? (
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto px-4">
            <IoCarSportOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('noSearchResults')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('noSearchDescription')}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {t('clearSearch')}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'contents' }}>
          {children}
        </div>
      )}

      {/* CSS to hide filtered sections */}
      <style jsx global>{`
        ${Array.from(hiddenSections).map(id => `
          #${id} { display: none !important; }
        `).join('')}
      `}</style>
    </>
  )
}