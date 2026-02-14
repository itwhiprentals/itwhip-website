'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import {
  IoNewspaperOutline,
  IoMailOutline,
  IoDownloadOutline,
  IoImageOutline,
  IoDocumentTextOutline,
  IoRocketOutline,
  IoCarOutline,
  IoLocationOutline,
  IoLeafOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoArrowForwardOutline,
  IoDesktopOutline
} from 'react-icons/io5'

export default function PressContent() {
  const t = useTranslations('Press')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null)

  const stats = [
    { labelKey: 'statsVehiclesListed', value: '100+', icon: IoCarOutline },
    { labelKey: 'statsArizonaCoverage', value: '18', subtitleKey: 'statsCitiesStatewide', icon: IoLocationOutline },
    { labelKey: 'statsHostEarnings', value: '40-90%', subtitleKey: 'statsBasedOnInsurance', icon: IoTrendingUpOutline },
    { labelKey: 'statsSustainability', value: 'ESG', subtitleKey: 'statsVerifiedFleet', icon: IoLeafOutline }
  ]

  const milestones = [
    {
      dateKey: 'milestoneQ2_2025Date',
      titleKey: 'milestoneQ2_2025Title',
      descriptionKey: 'milestoneQ2_2025Desc'
    },
    {
      dateKey: 'milestoneDec2024Date',
      titleKey: 'milestoneDec2024Title',
      descriptionKey: 'milestoneDec2024Desc'
    },
    {
      dateKey: 'milestoneOct2024Date',
      titleKey: 'milestoneOct2024Title',
      descriptionKey: 'milestoneOct2024Desc'
    },
    {
      dateKey: 'milestoneSep2024Date',
      titleKey: 'milestoneSep2024Title',
      descriptionKey: 'milestoneSep2024Desc'
    },
    {
      dateKey: 'milestone2023Date',
      titleKey: 'milestone2023Title',
      descriptionKey: 'milestone2023Desc'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
                <IoNewspaperOutline className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('badge')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg mb-2">
                      <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    {stat.subtitleKey && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t(stat.subtitleKey)}</div>
                    )}
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t(stat.labelKey)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* About ItWhip */}
        <section className="pt-8 pb-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('aboutTitle')}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('aboutParagraph1')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('aboutParagraph2')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('aboutParagraph3')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Differentiators */}
        <section className="py-6 bg-gray-100 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('differentiatorTitle')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoTrendingUpOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('diffHostEarningsTitle')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('diffHostEarningsDesc')}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('diffMileageForensicsTitle')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('diffMileageForensicsDesc')}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoRocketOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('diffMaxACTitle')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('diffMaxACDesc')}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoLeafOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('diffESGTitle')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('diffESGDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('milestonesTitle')}</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-24 flex-shrink-0 text-right">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{t(milestone.dateKey)}</span>
                  </div>
                  <div className="w-px bg-amber-300 dark:bg-amber-700 relative">
                    <div className="absolute top-0.5 -left-1 w-2 h-2 bg-amber-500 rounded-full" />
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t(milestone.titleKey)}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t(milestone.descriptionKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Assets Section */}
        <section className="py-6 bg-gray-100 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('brandAssetsTitle')}</h2>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Logo Package Card */}
              <div
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setExpandedAsset(expandedAsset === 'logos' ? null : 'logos')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden p-2">
                    <Image
                      src="/press/logos/itwhip-logo-light-mode.png"
                      alt="ItWhip Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain dark:hidden"
                    />
                    <Image
                      src="/press/logos/itwhip-logo-dark-mode.png"
                      alt="ItWhip Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain hidden dark:block"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ZIP
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('logoPackageTitle')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('logoPackageDesc')}</p>
                <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                  <IoDownloadOutline className="w-4 h-4" />
                  {t('viewAndDownload')}
                </span>
              </div>

              {/* Brand Guidelines */}
              <a
                href="/press/itwhip-brand-guidelines.pdf"
                download
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <IoDocumentTextOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    PDF
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('brandGuidelinesTitle')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('brandGuidelinesDesc')}</p>
                <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                  <IoDownloadOutline className="w-4 h-4" />
                  {t('downloadPDF')}
                </span>
              </a>

              {/* Press Kit */}
              <a
                href="/press/itwhip-press-kit.pdf"
                download
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <IoNewspaperOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    PDF
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('pressKitTitle')}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('pressKitDesc')}</p>
                <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                  <IoDownloadOutline className="w-4 h-4" />
                  {t('downloadPDF')}
                </span>
              </a>
            </div>

            {/* Expanded Logo Package Details */}
            {expandedAsset === 'logos' && (
              <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('logoDetailsTitle')}</h3>
                  <button
                    onClick={() => setExpandedAsset(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                {/* Logo Previews */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Light Mode Logo */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{t('forLightBackgrounds')}</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
                      <Image
                        src="/press/logos/itwhip-logo-light-mode.png"
                        alt="ItWhip Logo - Light Mode"
                        width={180}
                        height={50}
                        className="h-10 w-auto"
                      />
                    </div>
                  </div>
                  {/* Dark Mode Logo */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{t('forDarkBackgrounds')}</p>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 flex items-center justify-center">
                      <Image
                        src="/press/logos/itwhip-logo-dark-mode.png"
                        alt="ItWhip Logo - Dark Mode"
                        width={180}
                        height={50}
                        className="h-10 w-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('packageContents')}</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    <li>{t('packageLightLogo')}</li>
                    <li>{t('packageDarkLogo')}</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('pngFormatsIncluded')}</p>
                  <a
                    href="/press/itwhip-logo-package.zip"
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    <IoDownloadOutline className="w-4 h-4" />
                    {t('downloadLogoPackage')}
                  </a>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              {t('customAssetRequest')}
            </p>
          </div>
        </section>

        {/* Screenshots Section */}
        <section className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('screenshotsTitle')}</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Light Mode Screenshot */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="aspect-[9/16] relative">
                  <Image
                    src="/press/screenshots/itwhip-homepage-light-mode.png"
                    alt="ItWhip Homepage - Light Mode"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('screenshotLightTitle')}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('mobileView')}</p>
                  </div>
                  <a
                    href="/press/screenshots/itwhip-homepage-light-mode.png"
                    download
                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium hover:underline"
                  >
                    <IoDownloadOutline className="w-3.5 h-3.5" />
                    {t('download')}
                  </a>
                </div>
              </div>

              {/* Dark Mode Screenshot */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="aspect-[9/16] relative">
                  <Image
                    src="/press/screenshots/itwhip-homepage-dark-mode.png"
                    alt="ItWhip Homepage - Dark Mode"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('screenshotDarkTitle')}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('mobileView')}</p>
                  </div>
                  <a
                    href="/press/screenshots/itwhip-homepage-dark-mode.png"
                    download
                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium hover:underline"
                  >
                    <IoDownloadOutline className="w-3.5 h-3.5" />
                    {t('download')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Press Contact */}
        <section className="py-8 bg-gradient-to-br from-amber-500 to-orange-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">{t('pressInquiriesTitle')}</h2>
            <p className="text-sm text-amber-100 mb-4 max-w-lg mx-auto">
              {t('pressInquiriesDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:info@itwhip.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
              >
                <IoMailOutline className="w-4 h-4" />
                info@itwhip.com
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors border border-amber-400"
              >
                {t('generalContact')}
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
