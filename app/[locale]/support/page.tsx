// app/support/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
import {
  IoHelpCircleOutline,
  IoCarOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCallOutline,
  IoMailOutline,
  IoChatbubblesOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoPersonOutline,
  IoWarningOutline,
  IoCardOutline,
  IoTimeOutline,
  IoKeyOutline,
  IoConstructOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('supportTitle'),
    description: t('supportDescription'),
    openGraph: {
      title: t('supportOgTitle'),
      description: t('supportOgDescription'),
      url: 'https://itwhip.com/support',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/support',
    },
  }
}

const SUPPORT_CATEGORIES = [
  {
    icon: IoCarOutline,
    titleKey: 'categoryBookingTitle',
    descriptionKey: 'categoryBookingDescription',
    links: [
      { labelKey: 'categoryBookingLink1', href: '/support/booking' },
      { labelKey: 'categoryBookingLink2', href: '/support/modify-reservation' },
      { labelKey: 'categoryBookingLink3', href: '/cancellation-policy' },
    ]
  },
  {
    icon: IoShieldCheckmarkOutline,
    titleKey: 'categoryInsuranceTitle',
    descriptionKey: 'categoryInsuranceDescription',
    links: [
      { labelKey: 'categoryInsuranceLink1', href: '/support/insurance-coverage' },
      { labelKey: 'categoryInsuranceLink2', href: '/support/damage-process' },
      { labelKey: 'categoryInsuranceLink3', href: '/support/claims' },
    ]
  },
  {
    icon: IoPersonOutline,
    titleKey: 'categoryAccountTitle',
    descriptionKey: 'categoryAccountDescription',
    links: [
      { labelKey: 'categoryAccountLink1', href: '/support/verification' },
      { labelKey: 'categoryAccountLink2', href: '/support/payments' },
      { labelKey: 'categoryAccountLink3', href: '/portal/dashboard' },
    ]
  },
  {
    icon: IoKeyOutline,
    titleKey: 'categoryTripTitle',
    descriptionKey: 'categoryTripDescription',
    links: [
      { labelKey: 'categoryTripLink1', href: '/support/vehicle-issues' },
      { labelKey: 'categoryTripLink2', href: '/support/roadside' },
      { labelKey: 'categoryTripLink3', href: '/support/extend-rental' },
    ]
  },
  {
    icon: IoCarSportOutline,
    titleKey: 'categoryRideshareTitle',
    descriptionKey: 'categoryRideshareDescription',
    links: [
      { labelKey: 'categoryRideshareLink1', href: '/rideshare' },
      { labelKey: 'categoryRideshareLink2', href: '/support/insurance' },
      { labelKey: 'categoryRideshareLink3', href: '/partners/apply' },
    ]
  }
]

const FAQ_KEYS = [
  {
    questionKey: 'faqQuestion1',
    answerTextKey: 'faqAnswerText1',
    answerLink: { href: '/insurance-guide', labelKey: 'faqAnswerLink1' },
    answerBeforeLink: 'faqAnswer1Before',
    answerAfterLink: 'faqAnswer1After',
  },
  {
    questionKey: 'faqQuestion2',
    answerTextKey: 'faqAnswerText2',
    answerLink: { href: '/support/insurance-coverage', labelKey: 'faqAnswerLink2' },
    answerBeforeLink: 'faqAnswer2Before',
    answerAfterLink: 'faqAnswer2After',
  },
  {
    questionKey: 'faqQuestion3',
    answerTextKey: 'faqAnswerText3',
    answerLink: { href: '/support/verification', labelKey: 'faqAnswerLink3' },
    answerBeforeLink: 'faqAnswer3Before',
    answerAfterLink: 'faqAnswer3After',
  },
  {
    questionKey: 'faqQuestion4',
    answerTextKey: 'faqAnswerText4',
    answerLink: { href: '/support/booking', labelKey: 'faqAnswerLink4' },
    answerBeforeLink: 'faqAnswer4Before',
    answerAfterLink: 'faqAnswer4After',
  },
  {
    questionKey: 'faqQuestion5',
    answerTextKey: 'faqAnswerText5',
    answerLink: { href: '/support/damage-process', labelKey: 'faqAnswerLink5' },
    answerBeforeLink: 'faqAnswer5Before',
    answerAfterLink: 'faqAnswer5After',
  },
  {
    questionKey: 'faqQuestion6',
    answerTextKey: 'faqAnswerText6',
    answerLink: { href: '/cancellation-policy', labelKey: 'faqAnswerLink6' },
    answerBeforeLink: 'faqAnswer6Before',
    answerAfterLink: 'faqAnswer6After',
  },
  {
    questionKey: 'faqQuestion7',
    answerTextKey: 'faqAnswerText7',
    answerLink: { href: '/support/payments', labelKey: 'faqAnswerLink7' },
    answerBeforeLink: 'faqAnswer7Before',
    answerAfterLink: 'faqAnswer7After',
  },
  {
    questionKey: 'faqQuestion8',
    answerTextKey: 'faqAnswerText8',
    answerLink: null,
    answerBeforeLink: 'faqAnswer8Before',
    answerAfterLink: null,
  },
]

export default async function SupportPage() {
  const t = await getTranslations('Support')

  // JSON-LD for FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map(faq => ({
      '@type': 'Question',
      name: t(faq.questionKey),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(faq.answerTextKey)
      }
    }))
  }

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="relative text-white pt-24 pb-12 sm:pb-16 mt-16 overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/support-hero.jpg')" }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-orange-400">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-white/90 mb-6">
                {t('heroSubtitle')}
              </p>

              {/* Quick Contact */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:info@itwhip.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <IoMailOutline className="w-5 h-5" />
                  info@itwhip.com
                </a>
                <a
                  href="tel:+14805550100"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <IoCallOutline className="w-5 h-5" />
                  (480) 555-0100
                </a>
              </div>
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                {t('breadcrumbSupport')}
              </li>
            </ol>
          </nav>
        </div>

        {/* Support Categories */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('browseByTopic')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {SUPPORT_CATEGORIES.map((category) => (
                <div
                  key={category.titleKey}
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <category.icon className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t(category.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {t(category.descriptionKey)}
                  </p>
                  <ul className="space-y-1">
                    {category.links.map((link) => (
                      <li key={link.labelKey}>
                        <Link
                          href={link.href}
                          className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                          {t(link.labelKey)}
                          <IoChevronForwardOutline className="w-3 h-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-6 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('popularHelpTopics')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/support/damage-process"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoWarningOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    {t('quickLinkDamageTitle')}
                  </span>
                  <p className="text-xs text-gray-500">{t('quickLinkDamageSubtitle')}</p>
                </div>
              </Link>
              <Link
                href="/cancellation-policy"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoTimeOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    {t('quickLinkCancellationTitle')}
                  </span>
                  <p className="text-xs text-gray-500">{t('quickLinkCancellationSubtitle')}</p>
                </div>
              </Link>
              <Link
                href="/insurance-guide"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoShieldCheckmarkOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    {t('quickLinkInsuranceTitle')}
                  </span>
                  <p className="text-xs text-gray-500">{t('quickLinkInsuranceSubtitle')}</p>
                </div>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoChatbubblesOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    {t('quickLinkContactTitle')}
                  </span>
                  <p className="text-xs text-gray-500">{t('quickLinkContactSubtitle')}</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-600" />
              {t('faqTitle')}
            </h2>
            <div className="space-y-3">
              {FAQ_KEYS.map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                    {t(faq.questionKey)}
                    <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answerLink ? (
                      <>
                        {t(faq.answerBeforeLink)}
                        <Link href={faq.answerLink.href} className="text-orange-500 hover:underline">
                          {t(faq.answerLink.labelKey)}
                        </Link>
                        {faq.answerAfterLink ? t(faq.answerAfterLink) : null}
                      </>
                    ) : (
                      t(faq.answerBeforeLink)
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('stillNeedHelp')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('supportAvailable')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                <IoMailOutline className="w-5 h-5" />
                {t('contactSupport')}
              </Link>
              <a
                href="tel:+14805550100"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
              >
                <IoCallOutline className="w-5 h-5" />
                {t('callPhone')}
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
