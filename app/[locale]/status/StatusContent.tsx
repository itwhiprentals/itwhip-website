'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoServerOutline,
  IoCardOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoNotificationsOutline,
  IoCloudOutline,
  IoPhonePortraitOutline,
  IoGlobeOutline,
  IoRefreshOutline
} from 'react-icons/io5'

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  nameKey: string
  status: ServiceStatus
  icon: React.ElementType
  descriptionKey: string
}

export default function StatusContent() {
  const t = useTranslations('Status')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const services: Service[] = [
    { nameKey: 'services.websiteApp.name', status: 'operational', icon: IoGlobeOutline, descriptionKey: 'services.websiteApp.description' },
    { nameKey: 'services.mobileApps.name', status: 'operational', icon: IoPhonePortraitOutline, descriptionKey: 'services.mobileApps.description' },
    { nameKey: 'services.bookingSystem.name', status: 'operational', icon: IoCarOutline, descriptionKey: 'services.bookingSystem.description' },
    { nameKey: 'services.paymentProcessing.name', status: 'operational', icon: IoCardOutline, descriptionKey: 'services.paymentProcessing.description' },
    { nameKey: 'services.identityVerification.name', status: 'operational', icon: IoShieldCheckmarkOutline, descriptionKey: 'services.identityVerification.description' },
    { nameKey: 'services.notifications.name', status: 'operational', icon: IoNotificationsOutline, descriptionKey: 'services.notifications.description' },
    { nameKey: 'services.apiServices.name', status: 'operational', icon: IoServerOutline, descriptionKey: 'services.apiServices.description' },
    { nameKey: 'services.cloudInfrastructure.name', status: 'operational', icon: IoCloudOutline, descriptionKey: 'services.cloudInfrastructure.description' }
  ]

  const statusConfig = {
    operational: {
      labelKey: 'statusLabels.operational' as const,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: IoCheckmarkCircle
    },
    degraded: {
      labelKey: 'statusLabels.degraded' as const,
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      icon: IoAlertCircleOutline
    },
    outage: {
      labelKey: 'statusLabels.outage' as const,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      icon: IoCloseCircleOutline
    },
    maintenance: {
      labelKey: 'statusLabels.maintenance' as const,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      icon: IoTimeOutline
    }
  }

  const allOperational = services.every(s => s.status === 'operational')

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  const recentIncidents = [
    // Empty array means no recent incidents
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="pb-16">
        {/* Hero Section */}
        <section className={`pt-24 pb-16 ${allOperational ? 'bg-emerald-500' : 'bg-amber-500'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              {allOperational ? (
                <IoCheckmarkCircle className="w-12 h-12 text-white" />
              ) : (
                <IoAlertCircleOutline className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {allOperational ? t('hero.allOperational') : t('hero.someSystemsDegraded')}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {allOperational
                ? t('hero.servicesRunningNormally')
                : t('hero.experiencingIssues')}
            </p>
            <div className="flex items-center justify-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5" />
                <span className="text-sm">
                  {t('hero.lastUpdated', { time: lastUpdated.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })})}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                disabled={isRefreshing}
              >
                <IoRefreshOutline className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t('hero.refresh')}
              </button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('serviceStatus')}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {services.map((service, index) => {
                const Icon = service.icon
                const status = statusConfig[service.status]
                const StatusIcon = status.icon

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${
                      index !== services.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{t(service.nameKey)}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t(service.descriptionKey)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${status.textColor}`}>
                        {t(status.labelKey)}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Status Legend */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('statusLegend')}</h3>
            <div className="flex flex-wrap gap-6">
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t(config.labelKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('recentIncidents.title')}</h2>
            {recentIncidents.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoCheckmarkCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('recentIncidents.noIncidents')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('recentIncidents.allSmooth')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Incident cards would go here */}
              </div>
            )}
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('subscribe.title')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('subscribe.description')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder={t('subscribe.emailPlaceholder')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors">
                    {t('subscribe.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Uptime Stats */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('uptimeHistory.title')}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">99.98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('uptimeHistory.last30Days')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">99.95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('uptimeHistory.last90Days')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">99.90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('uptimeHistory.allTime')}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
