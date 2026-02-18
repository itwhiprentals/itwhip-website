// app/support/verification/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoPersonOutline,
  IoIdCardOutline,
  IoPhonePortraitOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
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
    title: t('supportVerificationTitle'),
    description: t('supportVerificationDescription'),
  }
}

const verificationSteps = [
  {
    icon: IoPhonePortraitOutline,
    titleKey: 'phoneVerificationTitle' as const,
    descKey: 'phoneVerificationDesc' as const,
    timeKey: 'phoneVerificationTime' as const
  },
  {
    icon: IoPersonOutline,
    titleKey: 'identityVerificationTitle' as const,
    descKey: 'identityVerificationDesc' as const,
    timeKey: 'identityVerificationTime' as const
  },
  {
    icon: IoIdCardOutline,
    titleKey: 'driversLicenseTitle' as const,
    descKey: 'driversLicenseDesc' as const,
    timeKey: 'driversLicenseTime' as const
  }
]

const requirementKeys = [
  'requirement1' as const,
  'requirement2' as const,
  'requirement3' as const,
  'requirement4' as const,
  'requirement5' as const
]

export default async function VerificationPage() {
  const t = await getTranslations('SupportVerification')

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
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbAccountVerification')}</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoPersonOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('pageTitle')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{t('pageSubtitle')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Verification Steps */}
            <div className="space-y-4">
              {verificationSteps.map((step) => (
                <div
                  key={step.titleKey}
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t(step.titleKey)}</h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <IoTimeOutline className="w-3 h-3" />
                          {t(step.timeKey)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t(step.descKey)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('renterRequirementsTitle')}
              </h2>
              <ul className="space-y-2">
                {requirementKeys.map((reqKey) => (
                  <li key={reqKey} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {t(reqKey)}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('goToMyAccount')}
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
