// app/integrations/IntegrationsContent.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { 
  IoCheckmarkCircle,
  IoServerOutline,
  IoCloudOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoGlobeOutline,
  IoLayersOutline,
  IoCodeSlashOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoAirplaneOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoInfiniteOutline,
  IoArrowForwardOutline,
  IoConstructOutline,
  IoTimerOutline,
  IoDocumentTextOutline,
  IoHomeOutline,
  IoAppsOutline
} from 'react-icons/io5'

export default function IntegrationsContent() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }

  const categories = [
    { id: 'all', name: 'All Integrations', count: 35 },
    { id: 'fleet', name: 'Fleet Management', count: 6 },
    { id: 'payment', name: 'Payment Processors', count: 8 },
    { id: 'insurance', name: 'Insurance & Verification', count: 6 },
    { id: 'crm', name: 'CRM & Marketing', count: 8 },
    { id: 'analytics', name: 'Analytics', count: 7 }
  ]

  const integrations = {
    fleet: [
      { name: 'Fleetio', status: 'active', description: 'Fleet Management Software', users: '1,200+ hosts' },
      { name: 'Verizon Connect', status: 'active', description: 'GPS & Fleet Tracking', users: '890+ hosts' },
      { name: 'Samsara', status: 'active', description: 'Vehicle Telematics', users: '650+ hosts' },
      { name: 'Bouncie', status: 'active', description: 'GPS Vehicle Tracking', users: '420+ hosts' },
      { name: 'Zubie', status: 'active', description: 'Connected Car Platform', users: '380+ hosts' },
      { name: 'Geotab', status: 'coming', description: 'Fleet Telematics', users: 'Coming Q1 2025' }
    ],
    payment: [
      { name: 'Stripe', status: 'active', description: 'Payment Processing', users: 'All hosts' },
      { name: 'Square', status: 'active', description: 'Payment Solutions', users: 'All hosts' },
      { name: 'Adyen', status: 'active', description: 'Payment Platform', users: 'Enterprise only' },
      { name: 'PayPal', status: 'active', description: 'Digital Payments', users: 'All hosts' },
      { name: 'Authorize.net', status: 'active', description: 'Payment Gateway', users: 'US hosts' },
      { name: 'Worldpay', status: 'active', description: 'Global Payments', users: 'International' },
      { name: 'Plaid', status: 'active', description: 'Bank Verification', users: 'All hosts' },
      { name: 'Dwolla', status: 'coming', description: 'ACH Payments', users: 'Coming Q1 2025' }
    ],
    insurance: [
      { name: 'Checkr', status: 'active', description: 'Background Checks', users: 'All renters' },
      { name: 'Verisk', status: 'active', description: 'Insurance Analytics', users: 'Enterprise only' },
      { name: 'LexisNexis', status: 'active', description: 'Driver Record Verification', users: 'All renters' },
      { name: 'Clearcover', status: 'active', description: 'Insurance API', users: '540+ hosts' },
      { name: 'Branch', status: 'active', description: 'Embedded Insurance', users: '320+ hosts' },
      { name: 'Safely', status: 'coming', description: 'Rental Insurance', users: 'Coming Q2 2025' }
    ],
    crm: [
      { name: 'Salesforce', status: 'active', description: 'CRM Platform', users: 'Enterprise only' },
      { name: 'HubSpot', status: 'active', description: 'Marketing & Sales', users: '1,200+ hosts' },
      { name: 'Intercom', status: 'active', description: 'Customer Messaging', users: '890+ hosts' },
      { name: 'Zendesk', status: 'active', description: 'Customer Support', users: '760+ hosts' },
      { name: 'Mailchimp', status: 'active', description: 'Email Marketing', users: '540+ hosts' },
      { name: 'Klaviyo', status: 'active', description: 'Marketing Automation', users: '420+ hosts' },
      { name: 'Freshdesk', status: 'coming', description: 'Help Desk', users: 'Coming Q1 2025' },
      { name: 'Braze', status: 'coming', description: 'Customer Engagement', users: 'Coming Q2 2025' }
    ],
    analytics: [
      { name: 'Google Analytics', status: 'active', description: 'Web Analytics', users: 'All hosts' },
      { name: 'Mixpanel', status: 'active', description: 'Product Analytics', users: 'Premium only' },
      { name: 'Segment', status: 'active', description: 'Customer Data Platform', users: 'Enterprise only' },
      { name: 'Heap', status: 'active', description: 'Digital Insights', users: '340+ hosts' },
      { name: 'Amplitude', status: 'active', description: 'Product Intelligence', users: '290+ hosts' },
      { name: 'Looker', status: 'active', description: 'Business Intelligence', users: 'Enterprise only' },
      { name: 'Tableau', status: 'coming', description: 'Data Visualization', users: 'Coming Q2 2025' }
    ]
  }

  const filteredIntegrations = selectedCategory === 'all' 
    ? Object.values(integrations).flat()
    : integrations[selectedCategory as keyof typeof integrations] || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main Header Component with Full Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Section - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <IoLayersOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Integration Partners
                </h1>
              </div>
              <span className="hidden sm:inline-block text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 mt-1 ml-7 sm:ml-8">
                35 Active Integrations
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                SDK Docs
              </Link>
              <Link href="/api" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                API Reference
              </Link>
              <Link href="/support" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Support
              </Link>
              <Link 
                href="/portal/login"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Partner Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/sdk" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoDocumentTextOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">SDK Docs</span>
              </Link>
              <Link 
                href="/api" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCodeSlashOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">API</span>
              </Link>
              <Link 
                href="/support" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Support</span>
              </Link>
              <Link 
                href="/portal/login"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoBusinessOutline className="w-4 h-4 flex-shrink-0" />
                <span>Partner Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters - Fixed below headers */}
      <div className="fixed top-[146px] md:top-[112px] left-0 right-0 z-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === category.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-sm font-medium">{category.name}</span>
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[226px] md:mt-[168px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                  35 Active Integrations • 6 More Coming Soon
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Seamlessly Integrated with Your
                <span className="block text-amber-600">Existing Technology Stack</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                Connect with industry-leading fleet management, payment processors, and insurance platforms.
                Our P2P car rental platform works with the tools you already use.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">487</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Hosts</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">2.5M+</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">API Calls Daily</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">99.97%</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Uptime SLA</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">&lt;200ms</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredIntegrations.map((integration, idx) => (
                <div
                  key={idx}
                  className={`bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border transition hover:shadow-lg ${
                    integration.status === 'active'
                      ? 'border-gray-200 dark:border-gray-700 hover:border-amber-400'
                      : 'border-gray-300 dark:border-gray-600 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                      <IoServerOutline className="w-5 h-5 text-white" />
                    </div>
                    {integration.status === 'active' ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {integration.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {integration.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {integration.users}
                    </span>
                    {integration.status === 'active' && (
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Integrations */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Enterprise-Grade Integrations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Trusted by car rental hosts and fleet managers across Arizona
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {['Stripe', 'Checkr', 'Fleetio', 'HubSpot', 'Samsara', 'Plaid'].map((partner) => (
                <div key={partner} className="flex items-center justify-center">
                  <div className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition">
                    <div className="h-12 flex items-center justify-center">
                      <span className="text-xl font-bold">{partner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Process */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Integration in 24 Hours
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our team handles the entire integration process. No technical expertise required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                  <IoCodeSlashOutline className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Connect API</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provide your API credentials and we handle the connection
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                  <IoConstructOutline className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Configure Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set your pricing, service areas, and vehicle preferences
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                  <IoRocketOutline className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Go Live</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start listing vehicles and earning revenue immediately
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Integrate?
            </h2>
            <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
              Join 487 hosts already connecting renters with vehicles across Arizona.
              Integration takes less than 24 hours with zero technical work required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/portal/login"
                className="px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg"
              >
                Access Portal
              </Link>
              <Link
                href="/sdk"
                className="px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4 sm:mb-0">
                <span>© 2024 ItWhip Technologies</span>
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  <span>SOC 2 Certified</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <IoInfiniteOutline className="w-4 h-4" />
                  <span>99.97% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}