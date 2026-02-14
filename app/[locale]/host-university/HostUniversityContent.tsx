'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Link } from '@/i18n/navigation'
import {
  IoSchoolOutline,
  IoCarOutline,
  IoCameraOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoPlayCircleOutline,
  IoDocumentTextOutline,
  IoTrendingUpOutline,
  IoSpeedometerOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoWarningOutline,
  IoThumbsUpOutline
} from 'react-icons/io5'

export default function HostUniversityContent() {
  const t = useTranslations('HostUniversity')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeModule, setActiveModule] = useState('getting-started')

  const modules = [
    {
      id: 'getting-started',
      titleKey: 'moduleGettingStartedTitle',
      icon: IoCarOutline,
      lessons: [
        { titleKey: 'lessonCreateAccount', durationKey: 'duration5min', completed: false },
        { titleKey: 'lessonListFirstVehicle', durationKey: 'duration10min', completed: false },
        { titleKey: 'lessonSetupCalendar', durationKey: 'duration5min', completed: false },
        { titleKey: 'lessonInsuranceTiers', durationKey: 'duration8min', completed: false }
      ]
    },
    {
      id: 'pricing',
      titleKey: 'modulePricingTitle',
      icon: IoCashOutline,
      lessons: [
        { titleKey: 'lessonCompetitivePricing', durationKey: 'duration7min', completed: false },
        { titleKey: 'lessonDynamicPricing', durationKey: 'duration6min', completed: false },
        { titleKey: 'lessonWeeklyMonthly', durationKey: 'duration5min', completed: false },
        { titleKey: 'lessonMaxEarnings', durationKey: 'duration4min', completed: false }
      ]
    },
    {
      id: 'photos',
      titleKey: 'modulePhotosTitle',
      icon: IoCameraOutline,
      lessons: [
        { titleKey: 'lessonEquipment', durationKey: 'duration8min', completed: false },
        { titleKey: 'lesson12Shots', durationKey: 'duration10min', completed: false },
        { titleKey: 'lessonInterior', durationKey: 'duration6min', completed: false },
        { titleKey: 'lessonEditing', durationKey: 'duration5min', completed: false }
      ]
    },
    {
      id: 'guest-experience',
      titleKey: 'moduleGuestExpTitle',
      icon: IoPeopleOutline,
      lessons: [
        { titleKey: 'lessonCommunication', durationKey: 'duration6min', completed: false },
        { titleKey: 'lessonHandoff', durationKey: 'duration8min', completed: false },
        { titleKey: 'lessonIssues', durationKey: 'duration7min', completed: false },
        { titleKey: 'lesson5Star', durationKey: 'duration5min', completed: false }
      ]
    },
    {
      id: 'protection',
      titleKey: 'moduleProtectionTitle',
      icon: IoShieldCheckmarkOutline,
      lessons: [
        { titleKey: 'lessonInsuranceOptions', durationKey: 'duration10min', completed: false },
        { titleKey: 'lessonInspections', durationKey: 'duration8min', completed: false },
        { titleKey: 'lessonMileageForensics', durationKey: 'duration6min', completed: false },
        { titleKey: 'lessonDamageClaims', durationKey: 'duration7min', completed: false }
      ]
    }
  ]

  const quickTips = [
    {
      icon: IoCameraOutline,
      titleKey: 'tipPhotosTitle',
      descriptionKey: 'tipPhotosDesc'
    },
    {
      icon: IoCalendarOutline,
      titleKey: 'tipCalendarTitle',
      descriptionKey: 'tipCalendarDesc'
    },
    {
      icon: IoTimeOutline,
      titleKey: 'tipResponseTitle',
      descriptionKey: 'tipResponseDesc'
    },
    {
      icon: IoStarOutline,
      titleKey: 'tipFirstImpTitle',
      descriptionKey: 'tipFirstImpDesc'
    },
    {
      icon: IoTrendingUpOutline,
      titleKey: 'tipPriceDynTitle',
      descriptionKey: 'tipPriceDynDesc'
    },
    {
      icon: IoSpeedometerOutline,
      titleKey: 'tipUnlimitedTitle',
      descriptionKey: 'tipUnlimitedDesc'
    }
  ]

  const activeModuleData = modules.find(m => m.id === activeModule)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-500 to-orange-500 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-4">
                  <IoSchoolOutline className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{t('badge')}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  {t('heroTitle')}
                </h1>
                <p className="text-xl text-amber-100 mb-6 max-w-xl">
                  {t('heroSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/host/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                  >
                    <IoCarOutline className="w-5 h-5" />
                    {t('startHosting')}
                  </Link>
                  <Link
                    href="/list-your-car"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors border border-amber-400"
                  >
                    {t('listYourCar')}
                    <IoArrowForwardOutline className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                <IoSchoolOutline className="w-32 h-32 text-white/50" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('proTipsTitle')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickTips.map((tip, index) => {
                const Icon = tip.icon
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(tip.titleKey)}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t(tip.descriptionKey)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Learning Modules */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('learningModulesTitle')}
            </h2>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Module List */}
              <div className="space-y-3">
                {modules.map((module) => {
                  const Icon = module.icon
                  const isActive = module.id === activeModule

                  return (
                    <button
                      key={module.id}
                      onClick={() => setActiveModule(module.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${
                        isActive
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-900/30'
                      }`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{t(module.titleKey)}</div>
                        <div className={`text-xs ${isActive ? 'text-amber-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {t('lessonsCount', { count: module.lessons.length })}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Module Content */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {activeModuleData ? t(activeModuleData.titleKey) : ''}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activeModuleData ? t('lessonsCount', { count: activeModuleData.lessons.length }) : ''}
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {activeModuleData?.lessons.map((lesson, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <IoPlayCircleOutline className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{t(lesson.titleKey)}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t(lesson.durationKey)}</p>
                          </div>
                        </div>
                        {lesson.completed ? (
                          <IoCheckmarkCircle className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <IoArrowForwardOutline className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator Preview */}
        <section className="py-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('earningsTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t('earningsSubtitle')}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">$125</div>
                    <div className="text-sm text-gray-500">{t('avgDailyRate')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">18</div>
                    <div className="text-sm text-gray-500">{t('daysBookedMo')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">90%</div>
                    <div className="text-sm text-gray-500">{t('yourShare')}</div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">{t('estimatedMonthly')}</div>
                  <div className="text-sm text-gray-500 mt-1">{t('estimatedEarningsNote')}</div>
                </div>
              </div>
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 mt-6 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                {t('tryFullCalculator')}
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Helpful Resources */}
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t('resourcesTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/help/host-account" className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors group">
                <IoDocumentTextOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">{t('resourceHostGuideTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('resourceHostGuideDesc')}</p>
              </Link>
              <Link href="/host-protection" className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors group">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">{t('resourceProtectionTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('resourceProtectionDesc')}</p>
              </Link>
              <Link href="/insurance-guide" className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors group">
                <IoCashOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">{t('resourceInsuranceTitle')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('resourceInsuranceDesc')}</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-500 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {t('ctaTitle')}
              </h2>
              <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                {t('ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/host/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                >
                  <IoCarOutline className="w-5 h-5" />
                  {t('becomeHost')}
                </Link>
                <Link
                  href="/help/host-account"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors border border-amber-400"
                >
                  {t('hostAccountGuide')}
                  <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
