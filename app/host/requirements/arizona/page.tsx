'use client'
// app/host/requirements/arizona/page.tsx
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoLocationOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export default function ArizonaRequirementsPage() {
  const t = useTranslations('HostRequirements')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-700 via-red-600 to-orange-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/30 rounded-full text-orange-200 text-xs font-medium mb-4">
              <IoLocationOutline className="w-4 h-4" />
              {t('heroBadge')}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t('heroTitle')}
            </h1>
            <p className="text-xl text-orange-100 mb-6">
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
            <li className="flex items-center gap-1.5">
              <Link href="/host-requirements" className="hover:text-amber-600">{t('breadcrumbRequirements')}</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              {t('breadcrumbArizona')}
            </li>
          </ol>
        </nav>
      </div>

      {/* Vehicle Requirements */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoCarOutline className="w-6 h-6 text-orange-600" />
            {t('vehicleRequirementsTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('eligibleVehiclesTitle')}</h3>
              <ul className="space-y-3">
                {[
                  t('eligibleItem0'),
                  t('eligibleItem1'),
                  t('eligibleItem2'),
                  t('eligibleItem3'),
                  t('eligibleItem4'),
                  t('eligibleItem5')
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('notEligibleTitle')}</h3>
              <ul className="space-y-3">
                {[
                  t('notEligibleItem0'),
                  t('notEligibleItem1'),
                  t('notEligibleItem2'),
                  t('notEligibleItem3'),
                  t('notEligibleItem4'),
                  t('notEligibleItem5')
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoAlertCircleOutline className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoDocumentTextOutline className="w-6 h-6 text-orange-600" />
            {t('requiredDocumentationTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: t('vehicleDocumentsTitle'),
                items: [t('vehicleDocumentsItem0'), t('vehicleDocumentsItem1'), t('vehicleDocumentsItem2')]
              },
              {
                title: t('personalDocumentsTitle'),
                items: [t('personalDocumentsItem0'), t('personalDocumentsItem1'), t('personalDocumentsItem2')]
              },
              {
                title: t('accountVerificationTitle'),
                items: [t('accountVerificationItem0'), t('accountVerificationItem1'), t('accountVerificationItem2')]
              }
            ].map((category, i) => (
              <div key={i} className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Arizona Specific */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-orange-600" />
            {t('arizonaSpecificTitle')}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('insuranceRequirementsTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {t('insuranceRequirementsDescription')}
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('insuranceCoverageItem0')}</li>
                  <li>{t('insuranceCoverageItem1')}</li>
                  <li>{t('insuranceCoverageItem2')}</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  {t('insuranceCoverageNote')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('emissionsTestingTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {t('emissionsTestingDescription')}
                </p>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 mt-4">{t('registrationTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {t('registrationDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('ctaDescription')}
          </p>
          <Link
            href="/list-your-car"
            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
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
