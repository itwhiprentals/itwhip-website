// app/support/modify-reservation/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoCreateOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Modify a Reservation | Support | ItWhip',
  description: 'Learn how to change dates, times, or cancel your ItWhip car rental reservation.',
}

export default async function ModifyReservationPage() {
  const t = await getTranslations('SupportModifyReservation')

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
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbModifyReservation')}</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoCreateOutline className="w-6 h-6 text-orange-600" />
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
            {/* How to Modify */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoCalendarOutline className="w-5 h-5 text-orange-500" />
                {t('howToModifyTitle')}
              </h2>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">1.</span>
                  {t('howToModifyStep1')}
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">2.</span>
                  {t('howToModifyStep2')}
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">3.</span>
                  {t('howToModifyStep3')}
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">4.</span>
                  {t('howToModifyStep4')}
                </li>
              </ol>
            </div>

            {/* What Can Be Modified */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5 text-orange-500" />
                {t('whatCanBeModifiedTitle')}
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>{t('whatCanBeModifiedItem1')}</li>
                <li>{t('whatCanBeModifiedItem2')}</li>
                <li>{t('whatCanBeModifiedItem3')}</li>
                <li>{t('whatCanBeModifiedItem4')}</li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
                {t('importantNotesTitle')}
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>{t('importantNotesItem1')}</li>
                <li>{t('importantNotesItem2')}</li>
                <li>{t('importantNotesItem3')}</li>
                <li>{t('importantNotesItem4Before')}<Link href="/cancellation-policy" className="text-orange-600 hover:underline">{t('importantNotesItem4Link')}</Link></li>
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('goToMyTrips')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
