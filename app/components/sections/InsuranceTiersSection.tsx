// app/components/sections/InsuranceTiersSection.tsx
// Compact insurance tiers display for home page
'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircle,
  IoArrowForwardOutline
} from 'react-icons/io5'

export default function InsuranceTiersSection() {
  const t = useTranslations('Home')

  return (
    <section className="py-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            {t('insuranceLabel')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {t('insuranceHeading')}
          </h2>
        </div>

        {/* Compact horizontal layout */}
        <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-3 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          {/* 90% Commercial */}
          <div className="snap-center flex-shrink-0 w-[200px] sm:w-[220px] md:w-auto bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-4 border border-emerald-300 dark:border-emerald-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{t('insurance90Pct')}</span>
              <span className="text-xs font-medium bg-emerald-700 text-white px-2 py-0.5 rounded">{t('insurancePremium')}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('insuranceCommercial')}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('insuranceCommercialDesc')}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <IoCheckmarkCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{t('insuranceCommercialPolicyPrimary')}</span>
              </div>
              <div className="flex items-center gap-1">
                <IoCheckmarkCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{t('insuranceCommercialHighestEarnings')}</span>
              </div>
            </div>
          </div>

          {/* 75% P2P */}
          <div className="snap-center flex-shrink-0 w-[200px] sm:w-[220px] md:w-auto bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 border border-amber-300 dark:border-amber-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{t('insurance75Pct')}</span>
              <span className="text-xs font-medium bg-amber-700 text-white px-2 py-0.5 rounded">{t('insuranceStandard')}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('insuranceP2P')}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('insuranceP2PDesc')}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <IoCheckmarkCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{t('insuranceP2PPolicyPrimary')}</span>
              </div>
              <div className="flex items-center gap-1">
                <IoCheckmarkCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{t('insuranceP2PLowerCosts')}</span>
              </div>
            </div>
          </div>

          {/* 40% Platform */}
          <div className="snap-center flex-shrink-0 w-[200px] sm:w-[220px] md:w-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-black text-gray-600 dark:text-gray-400">{t('insurance40Pct')}</span>
              <span className="text-xs font-medium bg-gray-500 text-white px-2 py-0.5 rounded">{t('insuranceBasic')}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t('insurancePlatform')}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('insurancePlatformDesc')}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <IoCheckmarkCircle className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{t('insurancePlatformNoInsurance')}</span>
              </div>
              <div className="flex items-center gap-1">
                <IoCheckmarkCircle className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{t('insurancePlatformZeroBarrier')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact CTA */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('insuranceCta')}{' '}
            <Link
              href="/host/insurance-options"
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium hover:underline"
            >
              {t('insuranceFullGuide')}
              <IoArrowForwardOutline className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
