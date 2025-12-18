'use client'

import { useState, useEffect } from 'react'
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
  name: string
  status: ServiceStatus
  icon: React.ElementType
  description: string
}

export default function StatusPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const services: Service[] = [
    { name: 'Website & App', status: 'operational', icon: IoGlobeOutline, description: 'Main website and web application' },
    { name: 'Mobile Apps', status: 'operational', icon: IoPhonePortraitOutline, description: 'iOS and Android applications' },
    { name: 'Booking System', status: 'operational', icon: IoCarOutline, description: 'Vehicle search and reservations' },
    { name: 'Payment Processing', status: 'operational', icon: IoCardOutline, description: 'Credit cards, deposits, and payouts' },
    { name: 'Identity Verification', status: 'operational', icon: IoShieldCheckmarkOutline, description: 'Driver license and background checks' },
    { name: 'Notifications', status: 'operational', icon: IoNotificationsOutline, description: 'Email, SMS, and push notifications' },
    { name: 'API Services', status: 'operational', icon: IoServerOutline, description: 'Partner integrations and data APIs' },
    { name: 'Cloud Infrastructure', status: 'operational', icon: IoCloudOutline, description: 'Hosting and data storage' }
  ]

  const statusConfig = {
    operational: {
      label: 'Operational',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: IoCheckmarkCircle
    },
    degraded: {
      label: 'Degraded Performance',
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      icon: IoAlertCircleOutline
    },
    outage: {
      label: 'Service Outage',
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      icon: IoCloseCircleOutline
    },
    maintenance: {
      label: 'Under Maintenance',
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
              {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {allOperational
                ? 'ItWhip services are running normally.'
                : 'We are currently experiencing issues with some services.'}
            </p>
            <div className="flex items-center justify-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5" />
                <span className="text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                disabled={isRefreshing}
              >
                <IoRefreshOutline className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Service Status</h2>
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
                        <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${status.textColor}`}>
                        {status.label}
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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Status Legend</h3>
            <div className="flex flex-wrap gap-6">
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Incidents</h2>
            {recentIncidents.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoCheckmarkCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Recent Incidents</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All services have been running smoothly for the past 90 days.
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
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Subscribe to Updates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when we have service disruptions or planned maintenance.
                  </p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Uptime Stats */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Uptime History</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">99.98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last 30 days</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">99.95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last 90 days</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">99.90%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">All time</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
