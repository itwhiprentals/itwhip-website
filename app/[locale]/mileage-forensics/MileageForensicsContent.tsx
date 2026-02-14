'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoCarOutline,
  IoArrowForwardOutline,
  IoAnalyticsOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoBusinessOutline
} from 'react-icons/io5'

const featureKeys = [
  { icon: IoLocationOutline, key: 'gpsVerified' },
  { icon: IoSpeedometerOutline, key: 'obdIntegration' },
  { icon: IoTimeOutline, key: 'liveMonitoring' },
  { icon: IoDocumentTextOutline, key: 'insuranceReports' },
  { icon: IoAlertCircleOutline, key: 'anomalyDetection' },
  { icon: IoShieldCheckmarkOutline, key: 'disputeResolution' }
] as const

const benefitKeys = [
  {
    key: 'hosts',
    icon: IoCarOutline,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    itemKeys: ['protectValue', 'verifyCompliance', 'lowerInsurance', 'auditReady']
  },
  {
    key: 'guests',
    icon: IoCheckmarkCircleOutline,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    itemKeys: ['clearDocs', 'noFalseClaims', 'transparentBilling', 'peaceOfMind']
  },
  {
    key: 'insurers',
    icon: IoBusinessOutline,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    itemKeys: ['verifiedData', 'fraudPrevention', 'riskAssessment', 'fasterClaims']
  }
] as const

const howItWorksKeys = ['tripStarts', 'routeTracked', 'tripEnds', 'reportGenerated'] as const

export default function MileageForensicsContent() {
  const t = useTranslations('MileageForensics')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 py-16 sm:py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 border border-white rounded-full" />
            <div className="absolute bottom-10 left-10 w-60 h-60 border border-white rounded-full" />
            <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-white rounded-full" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <IoSpeedometerOutline className="w-4 h-4 text-purple-200" />
              <span className="text-sm font-medium text-white/90">{t('hero.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/list-your-car"
                className="w-full sm:w-auto px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                {t('hero.listYourCar')}
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/insurance-guide"
                className="w-full sm:w-auto px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/30 hover:bg-white/20 transition-colors"
              >
                {t('hero.insuranceGuide')}
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                <div className="text-xs sm:text-sm text-purple-200">{t('hero.stats.tripsTracked')}</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-white">{t('hero.stats.retentionValue')}</div>
                <div className="text-xs sm:text-sm text-purple-200">{t('hero.stats.dataRetention')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">0</div>
                <div className="text-xs sm:text-sm text-purple-200">{t('hero.stats.fraudCases')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Timeline */}
        <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('howItWorks.title')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {t('howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {howItWorksKeys.map((key, idx) => (
                <div key={idx} className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {t(`howItWorks.steps.${key}.title`)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {t(`howItWorks.steps.${key}.description`)}
                  </p>
                  {idx < howItWorksKeys.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-2 w-4 text-purple-300 dark:text-purple-700">{'\u2192'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('features.title')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureKeys.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {t(`features.items.${feature.key}.title`)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {t(`features.items.${feature.key}.description`)}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{t(`features.items.${feature.key}.stat`)}</span>
                        <span className="text-xs text-gray-500">{t(`features.items.${feature.key}.statLabel`)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('benefits.title')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {t('benefits.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benefitKeys.map((group, idx) => (
                <div key={idx} className={`${group.bg} rounded-lg p-5 border border-gray-200 dark:border-gray-800`}>
                  <div className="flex items-center gap-2 mb-4">
                    <group.icon className={`w-5 h-5 ${group.color}`} />
                    <h3 className={`text-base font-bold ${group.color}`}>{t(`benefits.groups.${group.key}.label`)}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {group.itemKeys.map((itemKey, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t(`benefits.groups.${group.key}.items.${itemKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="py-10 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <IoLockClosedOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('security.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('security.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-10 bg-amber-50 dark:bg-amber-900/20 border-y border-amber-200 dark:border-amber-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                <IoDocumentTextOutline className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-amber-900 dark:text-amber-300 mb-2">
                  {t('compliance.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('compliance.description')}
                </p>
                <Link
                  href="/legal"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
                >
                  {t('compliance.viewLawText')}
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ESG Integration */}
        <section className="py-10 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                <IoAnalyticsOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                  {t('esg.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('esg.description')}
                </p>
                <Link
                  href="/esg-dashboard"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                >
                  {t('esg.exploreLink')}
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related Content */}
        <section className="py-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              {t('related.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/esg-dashboard"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t('related.esg.tag')}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('related.esg.label')}</p>
              </Link>
              <Link
                href="/insurance-guide"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t('related.insurance.tag')}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('related.insurance.label')}</p>
              </Link>
              <Link
                href="/host-protection"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t('related.protection.tag')}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('related.protection.label')}</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoSpeedometerOutline className="w-12 h-12 text-purple-200 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {t('cta.title')}
            </h2>
            <p className="text-base text-purple-100 mb-6 max-w-xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/list-your-car"
                className="w-full sm:w-auto px-8 py-3 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition-colors shadow-lg"
              >
                {t('cta.listYourCar')}
              </Link>
              <Link
                href="/host-benefits"
                className="w-full sm:w-auto px-8 py-3 bg-transparent text-white rounded-lg font-semibold border-2 border-white/50 hover:bg-white/10 transition-colors"
              >
                {t('cta.viewHostBenefits')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
