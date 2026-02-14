// app/support/claims/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoDocumentTextOutline,
  IoCameraOutline,
  IoCallOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'File a Claim | Support | ItWhip',
  description: 'Learn how to file an insurance claim for damage, theft, or accidents during your ItWhip rental.',
}

const steps = [
  {
    icon: IoCameraOutline,
    titleKey: 'stepTitle1',
    descriptionKey: 'stepDescription1'
  },
  {
    icon: IoCallOutline,
    titleKey: 'stepTitle2',
    descriptionKey: 'stepDescription2'
  },
  {
    icon: IoDocumentTextOutline,
    titleKey: 'stepTitle3',
    descriptionKey: 'stepDescription3'
  },
  {
    icon: IoTimeOutline,
    titleKey: 'stepTitle4',
    descriptionKey: 'stepDescription4'
  }
]

const claimIncludeKeys = [
  'claimInclude1',
  'claimInclude2',
  'claimInclude3',
  'claimInclude4',
  'claimInclude5',
  'claimInclude6'
] as const

export default async function ClaimsPage() {
  const t = await getTranslations('SupportClaims')

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
              <li className="text-gray-800 dark:text-gray-200 font-medium">{t('breadcrumbFileAClaim')}</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoDocumentTextOutline className="w-6 h-6 text-orange-600" />
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

        {/* Steps */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.titleKey}
                className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t(step.titleKey)}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t(step.descriptionKey)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* What to Include */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('whatToIncludeTitle')}
              </h2>
              <ul className="space-y-2">
                {claimIncludeKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/support/damage-process"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('viewDamageProcess')}
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
