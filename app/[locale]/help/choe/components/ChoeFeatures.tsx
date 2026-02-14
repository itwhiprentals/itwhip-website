// app/help/choe/components/ChoeFeatures.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { features } from '../data/features'
import { IoChevronDownOutline } from 'react-icons/io5'

// Arizona desert warm color palette
const warmAccents = [
  '#e87040', // sunset orange
  '#ff7f50', // coral
  '#d4a574', // desert gold
  '#c94c24', // terracotta
  '#e87040',
  '#ff7f50',
  '#d4a574',
  '#c94c24',
]

export function ChoeFeatures() {
  const t = useTranslations('HelpChoe')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section className="pt-0 pb-10 sm:pb-14 bg-gray-50 dark:bg-[#0f0f0f] relative border-t border-gray-300 dark:border-[#222]">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Image src="/images/choe-logo.png" alt="Choé" width={300} height={87} className="h-[90px] w-auto mx-auto -mb-5" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
            {t('featuresTitle')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8]">
            {t('featuresSubtitle')}
          </p>
        </div>

        {/* Features Grid - Expandable cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const accentColor = warmAccents[index % warmAccents.length]
            const isExpanded = expandedId === feature.id

            return (
              <div
                key={feature.id}
                className="group bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#e87040]/10 dark:hover:shadow-[#e87040]/5 choe-animate-in overflow-hidden"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <button
                  onClick={() => toggleExpand(feature.id)}
                  className="w-full p-5 sm:p-6 text-left"
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${accentColor}15` }}
                    >
                      <feature.icon
                        className="w-7 h-7"
                        style={{ color: accentColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {t(feature.titleKey)}
                        </h3>
                        <IoChevronDownOutline
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#a8a8a8] leading-relaxed">
                        {t(feature.descKey)}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Expandable details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-200 dark:border-[#333]">
                    <div className="pt-4 pl-[4.75rem]">
                      <p className="text-sm text-gray-500 dark:text-[#888] leading-relaxed">
                        {t(feature.detailsKey)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
