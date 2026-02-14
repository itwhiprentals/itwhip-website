// app/help/choe/components/ChoeCommerce.tsx
'use client'

import { useTranslations } from 'next-intl'
import {
  IoCarSportOutline,
  IoBedOutline,
  IoCartOutline,
  IoBasketOutline,
  IoHomeOutline,
  IoLaptopOutline,
  IoSparklesOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

export function ChoeCommerce() {
  const t = useTranslations('HelpChoe')

  const verticals = [
    {
      icon: IoCarSportOutline,
      labelKey: 'commerceVertical1Label' as const,
      exampleKey: 'commerceVertical1Example' as const,
      status: 'live'
    },
    {
      icon: IoBedOutline,
      labelKey: 'commerceVertical2Label' as const,
      exampleKey: 'commerceVertical2Example' as const,
      status: 'coming'
    },
    {
      icon: IoCartOutline,
      labelKey: 'commerceVertical3Label' as const,
      exampleKey: 'commerceVertical3Example' as const,
      status: 'future'
    },
    {
      icon: IoBasketOutline,
      labelKey: 'commerceVertical4Label' as const,
      exampleKey: 'commerceVertical4Example' as const,
      status: 'future'
    },
    {
      icon: IoHomeOutline,
      labelKey: 'commerceVertical5Label' as const,
      exampleKey: 'commerceVertical5Example' as const,
      status: 'future'
    },
    {
      icon: IoLaptopOutline,
      labelKey: 'commerceVertical6Label' as const,
      exampleKey: 'commerceVertical6Example' as const,
      status: 'future'
    }
  ]

  const pipelineStepKeys = [
    { labelKey: 'commercePipeline1' as const, color: '#e87040' },
    { labelKey: 'commercePipeline2' as const, color: '#ff7f50' },
    { labelKey: 'commercePipeline3' as const, color: '#d4a574' },
    { labelKey: 'commercePipeline4' as const, color: '#c94c24' },
    { labelKey: 'commercePipeline5' as const, color: '#e87040' },
    { labelKey: 'commercePipeline6' as const, color: '#27ca3f' }
  ]

  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative overflow-hidden border-t border-gray-300 dark:border-[#222]">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#e87040]/5 dark:bg-[#e87040]/8 rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-[#d4a574] text-xs font-bold uppercase tracking-wider">
            <IoSparklesOutline className="w-4 h-4" />
            {t('commerceBadge')}
          </span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t('commerceTitle')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto">
            {t('commerceSubtitle')}
          </p>
        </div>

        {/* Pipeline visualization - 6 step cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {pipelineStepKeys.map((step, index) => (
            <div
              key={step.labelKey}
              className="relative bg-white dark:bg-[#1a1a1a] rounded-lg p-4 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all text-center"
            >
              {/* Step number badge */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-3"
                style={{ backgroundColor: step.color }}
              >
                {index + 1}
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-[#a8a8a8]">
                {t(step.labelKey)}
              </p>
              {/* Connector arrow */}
              {index < pipelineStepKeys.length - 1 && (
                <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 hidden lg:block">
                  <IoArrowForwardOutline className="w-4 h-4 text-gray-300 dark:text-[#444]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Verticals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.map((vertical, index) => (
            <div
              key={vertical.labelKey}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-5 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all choe-animate-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#e87040]/10 group-hover:scale-110 transition-transform">
                  <vertical.icon className="w-6 h-6 text-[#e87040]" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                    vertical.status === 'live'
                      ? 'bg-[#27ca3f]/15 text-[#27ca3f]'
                      : vertical.status === 'coming'
                        ? 'bg-[#d4a574]/15 text-[#d4a574]'
                        : 'bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-[#666]'
                  }`}
                >
                  {vertical.status === 'live' ? t('commerceStatusLive') : vertical.status === 'coming' ? t('commerceStatusComing') : t('commerceStatusFuture')}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {t(vertical.labelKey)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#666] font-mono">
                {t(vertical.exampleKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="mt-10 text-center">
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] italic">
            {t('commerceTagline')}
          </p>
        </div>
      </div>
    </section>
  )
}
