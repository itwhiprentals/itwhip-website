'use client'
// app/host/tax-benefits/page.tsx
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoReceiptOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoCalculatorOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export default function TaxBenefitsPage() {
  const t = useTranslations('HostTaxBenefits')

  const deductionCategories = [
    {
      icon: IoCarOutline,
      titleKey: 'deductionDepreciationTitle' as const,
      descriptionKey: 'deductionDepreciationDescription' as const,
      itemKeys: ['deductionDepreciationItem0', 'deductionDepreciationItem1', 'deductionDepreciationItem2'] as const
    },
    {
      icon: IoCalculatorOutline,
      titleKey: 'deductionMileageTitle' as const,
      descriptionKey: 'deductionMileageDescription' as const,
      itemKeys: ['deductionMileageItem0', 'deductionMileageItem1', 'deductionMileageItem2'] as const
    },
    {
      icon: IoDocumentTextOutline,
      titleKey: 'deductionInsuranceTitle' as const,
      descriptionKey: 'deductionInsuranceDescription' as const,
      itemKeys: ['deductionInsuranceItem0', 'deductionInsuranceItem1', 'deductionInsuranceItem2'] as const
    },
    {
      icon: IoReceiptOutline,
      titleKey: 'deductionMaintenanceTitle' as const,
      descriptionKey: 'deductionMaintenanceDescription' as const,
      itemKeys: ['deductionMaintenanceItem0', 'deductionMaintenanceItem1', 'deductionMaintenanceItem2'] as const
    }
  ]

  const recordKeepingTips = [
    {
      titleKey: 'recordKeepingTrackTitle' as const,
      descriptionKey: 'recordKeepingTrackDescription' as const
    },
    {
      titleKey: 'recordKeepingSaveTitle' as const,
      descriptionKey: 'recordKeepingSaveDescription' as const
    },
    {
      titleKey: 'recordKeepingSoftwareTitle' as const,
      descriptionKey: 'recordKeepingSoftwareDescription' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 via-emerald-700 to-green-800 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/30 rounded-full text-green-200 text-xs font-medium mb-4">
              <IoReceiptOutline className="w-4 h-4" />
              {t('heroBadge')}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t('heroTitle')}
            </h1>
            <p className="text-xl text-green-100 mb-6">
              {t('heroDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                <IoHomeOutline className="w-3.5 h-3.5" />
                {t('breadcrumbHome')}
              </Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/list-your-car" className="hover:text-amber-600">{t('breadcrumbHost')}</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              {t('breadcrumbTaxBenefits')}
            </li>
          </ol>
        </nav>
      </div>

      {/* Disclaimer */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
            <IoAlertCircleOutline className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>{t('disclaimerStrong')}</strong> {t('disclaimerText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deduction Categories */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('deductionsHeading')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {deductionCategories.map((category, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(category.titleKey)}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t(category.descriptionKey)}
                </p>
                <ul className="space-y-2">
                  {category.itemKeys.map((itemKey, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {t(itemKey)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Record Keeping */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('recordKeepingHeading')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recordKeepingTips.map((tip, i) => (
              <div key={i} className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(tip.titleKey)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(tip.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('ctaHeading')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('ctaDescription')}
          </p>
          <Link
            href="/list-your-car"
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('ctaButton')}
            <IoChevronForwardOutline className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
