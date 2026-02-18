// app/support/payments/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoCardOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoLockClosedOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('supportPaymentsTitle'),
    description: t('supportPaymentsDescription'),
  }
}

const acceptedKeys = [
  'acceptedVisa',
  'acceptedMastercard',
  'acceptedAmex',
  'acceptedDiscover',
  'acceptedDebit'
] as const

const notAcceptedKeys = [
  'notAcceptedCash',
  'notAcceptedPrepaid',
  'notAcceptedPaypal',
  'notAcceptedCrypto',
  'notAcceptedWire'
] as const

export default async function PaymentsPage() {
  const t = await getTranslations('SupportPayments')

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
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbPaymentMethods')}</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoCardOutline className="w-6 h-6 text-orange-600" />
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
            <div className="grid md:grid-cols-2 gap-4">
              {/* Accepted */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                  {t('acceptedTitle')}
                </h2>
                <ul className="space-y-2">
                  {acceptedKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Accepted */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoCloseCircle className="w-5 h-5 text-red-500" />
                  {t('notAcceptedTitle')}
                </h2>
                <ul className="space-y-2">
                  {notAcceptedKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCloseCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Security Deposit */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('securityDepositsTitle')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('securityDepositsDescription')}
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>{t('depositStandard')}</li>
                <li>{t('depositLuxury')}</li>
                <li>{t('depositByoi')}</li>
              </ul>
            </div>

            {/* Security */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoLockClosedOutline className="w-5 h-5 text-orange-500" />
                {t('paymentSecurityTitle')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('paymentSecurityDescription')}
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('managePaymentMethods')}
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
