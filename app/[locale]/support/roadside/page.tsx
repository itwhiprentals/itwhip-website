// app/support/roadside/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoCarOutline,
  IoCallOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Roadside Assistance | Support | ItWhip',
  description: 'Get 24/7 roadside assistance for your ItWhip rental. Flat tires, dead batteries, lockouts, and towing covered.',
}

const serviceKeys = [
  { titleKey: 'serviceFlatTireTitle', descKey: 'serviceFlatTireDesc' },
  { titleKey: 'serviceJumpStartTitle', descKey: 'serviceJumpStartDesc' },
  { titleKey: 'serviceLockoutTitle', descKey: 'serviceLockoutDesc' },
  { titleKey: 'serviceFuelDeliveryTitle', descKey: 'serviceFuelDeliveryDesc' },
  { titleKey: 'serviceTowingTitle', descKey: 'serviceTowingDesc' }
] as const

export default async function RoadsidePage() {
  const t = await getTranslations('SupportRoadside')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-orange-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  {t('breadcrumbHome')}
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-orange-600">{t('breadcrumbSupport')}</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbRoadsideAssistance')}</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoCarOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Emergency Contact */}
            <div className="bg-orange-500 text-white rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <IoCallOutline className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-orange-100 text-sm">{t('emergencyLabel')}</p>
                  <p className="text-2xl font-bold">{t('emergencyPhone')}</p>
                  <p className="text-orange-100 text-sm mt-1">{t('emergencyTripIdNote')}</p>
                </div>
              </div>
            </div>

            {/* How to Get Help */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('howToRequestTitle')}
              </h2>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">1.</span>
                  {t('step1')}
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">2.</span>
                  {t('step2')}
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">3.</span>
                  {t('step3')}
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">4.</span>
                  {t('step4')}
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">5.</span>
                  {t('step5')}
                </li>
              </ol>
            </div>

            {/* Services Covered */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('whatsCoveredTitle')}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {serviceKeys.map((service) => (
                  <div key={service.titleKey} className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t(service.titleKey)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t(service.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <IoTimeOutline className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{t('responseTimeTitle')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('responseTimeValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
