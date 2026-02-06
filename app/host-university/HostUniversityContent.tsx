'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeModule, setActiveModule] = useState('getting-started')

  const modules = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: IoCarOutline,
      lessons: [
        { title: 'Creating Your Host Account', duration: '5 min', completed: false },
        { title: 'Listing Your First Vehicle', duration: '10 min', completed: false },
        { title: 'Setting Up Your Calendar', duration: '5 min', completed: false },
        { title: 'Understanding Insurance Tiers', duration: '8 min', completed: false }
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing Strategy',
      icon: IoCashOutline,
      lessons: [
        { title: 'Competitive Pricing Analysis', duration: '7 min', completed: false },
        { title: 'Dynamic Pricing for Events', duration: '6 min', completed: false },
        { title: 'Weekly & Monthly Discounts', duration: '5 min', completed: false },
        { title: 'Maximizing Earnings Calculator', duration: '4 min', completed: false }
      ]
    },
    {
      id: 'photos',
      title: 'Photo Excellence',
      icon: IoCameraOutline,
      lessons: [
        { title: 'Equipment & Lighting Setup', duration: '8 min', completed: false },
        { title: 'The 12 Essential Shots', duration: '10 min', completed: false },
        { title: 'Interior Photography Tips', duration: '6 min', completed: false },
        { title: 'Editing for Maximum Impact', duration: '5 min', completed: false }
      ]
    },
    {
      id: 'guest-experience',
      title: 'Guest Experience',
      icon: IoPeopleOutline,
      lessons: [
        { title: 'Communication Best Practices', duration: '6 min', completed: false },
        { title: 'Vehicle Handoff Process', duration: '8 min', completed: false },
        { title: 'Handling Issues & Disputes', duration: '7 min', completed: false },
        { title: 'Getting 5-Star Reviews', duration: '5 min', completed: false }
      ]
    },
    {
      id: 'protection',
      title: 'Protection & Safety',
      icon: IoShieldCheckmarkOutline,
      lessons: [
        { title: 'Insurance Options Explained', duration: '10 min', completed: false },
        { title: 'Pre & Post Trip Inspections', duration: '8 min', completed: false },
        { title: 'Mileage Forensics Overview', duration: '6 min', completed: false },
        { title: 'Filing Damage Claims', duration: '7 min', completed: false }
      ]
    }
  ]

  const quickTips = [
    {
      icon: IoCameraOutline,
      title: 'Photos Matter Most',
      description: 'Listings with 12+ high-quality photos get 3x more bookings. Natural lighting is your best friend.'
    },
    {
      icon: IoCalendarOutline,
      title: 'Keep Calendar Updated',
      description: 'Block unavailable dates promptly. Cancellations hurt your ranking and can result in penalties.'
    },
    {
      icon: IoTimeOutline,
      title: 'Response Time Counts',
      description: 'Respond to booking requests within 1 hour to maximize your acceptance rate and search ranking.'
    },
    {
      icon: IoStarOutline,
      title: 'First Impressions',
      description: 'A clean, freshly detailed car with a welcome note sets the tone for 5-star reviews.'
    },
    {
      icon: IoTrendingUpOutline,
      title: 'Price Dynamically',
      description: 'Raise prices 1.5-2x during major events like Barrett-Jackson, Spring Training, and NASCAR.'
    },
    {
      icon: IoSpeedometerOutline,
      title: 'Unlimited Miles = More Bookings',
      description: 'Guests prefer unlimited mileage. If you limit miles, price accordingly.'
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
                  <span className="text-sm font-medium text-white">Host Education</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  Host University
                </h1>
                <p className="text-xl text-amber-100 mb-6 max-w-xl">
                  Master the art of car sharing. Learn pricing strategies, photography tips, and guest management to maximize your earnings.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/host/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                  >
                    <IoCarOutline className="w-5 h-5" />
                    Start Hosting
                  </Link>
                  <Link
                    href="/list-your-car"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors border border-amber-400"
                  >
                    List Your Car
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
              Pro Tips for Success
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickTips.map((tip, index) => {
                const Icon = tip.icon
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
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
              Learning Modules
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
                        <div className="font-medium">{module.title}</div>
                        <div className={`text-xs ${isActive ? 'text-amber-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {module.lessons.length} lessons
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
                      {activeModuleData?.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activeModuleData?.lessons.length} lessons
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
                            <h4 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration}</p>
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
                See Your Earning Potential
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Top hosts in Phoenix earn $1,500-$3,000+ per month per vehicle. Use our calculator to estimate your earnings.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">$125</div>
                    <div className="text-sm text-gray-500">Avg Daily Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">18</div>
                    <div className="text-sm text-gray-500">Days Booked/Mo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">90%</div>
                    <div className="text-sm text-gray-500">Your Share</div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">$2,025/month</div>
                  <div className="text-sm text-gray-500 mt-1">Estimated earnings (with Premium tier)</div>
                </div>
              </div>
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 mt-6 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                Try the Full Calculator
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Helpful Resources */}
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Helpful Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/help/host-account" className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors group">
                <IoDocumentTextOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">Host Account Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Everything about your host dashboard, tiers, payouts, and protection.</p>
              </Link>
              <Link href="/host-protection" className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors group">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">Host Protection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">$1M liability coverage, Mileage Forensics, and claims process.</p>
              </Link>
              <Link href="/insurance-guide" className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-500 transition-colors group">
                <IoCashOutline className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">Insurance Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Understanding coverage options and how to maximize your protection.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-500 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                Join hundreds of Arizona hosts earning extra income with their vehicles. Listing takes just 10 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/host/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                >
                  <IoCarOutline className="w-5 h-5" />
                  Become a Host
                </Link>
                <Link
                  href="/help/host-account"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors border border-amber-400"
                >
                  Host Account Guide
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
