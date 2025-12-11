// app/host/fleet-owners/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarOutline,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoAnalyticsOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCashOutline,
  IoSettingsOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Fleet Owner Program | Multi-Car Hosts | ItWhip',
  description: 'Manage 5+ cars on ItWhip with our Fleet Owner program. Dedicated support, bulk tools, analytics dashboard, and preferred placement. Maximize your fleet earnings.',
  keywords: ['fleet owner car sharing', 'multi car rental business', 'car sharing fleet management', 'phoenix fleet rental', 'turo alternative fleet'],
  openGraph: {
    title: 'Fleet Owner Program | ItWhip',
    description: 'Special program for hosts with 5+ vehicles. Dedicated support, bulk tools, and premium features.',
    url: 'https://itwhip.com/host/fleet-owners',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/fleet-owners',
  },
}

export default function FleetOwnersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 rounded-full text-indigo-200 text-xs font-medium mb-4">
              <IoCarOutline className="w-4 h-4" />
              Fleet Program
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Fleet Owner Program
            </h1>
            <p className="text-xl text-indigo-100 mb-6">
              Special benefits for hosts managing 5 or more vehicles. Dedicated support, bulk management tools, and premium features to maximize your fleet earnings.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/host/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Apply for Fleet Program
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Fleet Team
              </Link>
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
                Home
              </Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/list-your-car" className="hover:text-amber-600">Host</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              Fleet Owners
            </li>
          </ol>
        </nav>
      </div>

      {/* Fleet Benefits */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Fleet Owner Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: IoPersonOutline,
                title: 'Dedicated Account Manager',
                description: 'Personal support from our fleet team. Direct line for questions, issues, and optimization advice.'
              },
              {
                icon: IoSettingsOutline,
                title: 'Bulk Management Tools',
                description: 'Update pricing, availability, and settings across all vehicles at once. Save hours of admin time.'
              },
              {
                icon: IoAnalyticsOutline,
                title: 'Advanced Analytics',
                description: 'Fleet-wide dashboard showing performance, revenue trends, and optimization opportunities.'
              },
              {
                icon: IoTrendingUpOutline,
                title: 'Preferred Placement',
                description: 'Your listings get priority visibility in search results and featured sections.'
              },
              {
                icon: IoCashOutline,
                title: 'Reduced Platform Fees',
                description: 'Volume discounts on platform fees. The more you list, the more you save per booking.'
              },
              {
                icon: IoShieldCheckmarkOutline,
                title: 'Enhanced Protection',
                description: 'Access to premium insurance tiers and damage protection options for your fleet.'
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Fleet Program Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">To Qualify</h3>
              <ul className="space-y-3">
                {[
                  'Minimum 5 active vehicles on the platform',
                  'Maintain 4.5+ average rating',
                  '90%+ response rate to inquiries',
                  'Complete host verification',
                  'Active for 30+ days (new fleets can apply)'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">What We Provide</h3>
              <ul className="space-y-3">
                {[
                  'Onboarding assistance for new vehicles',
                  'Pricing optimization consultation',
                  'Priority customer support',
                  'Early access to new features',
                  'Fleet performance reports'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Scale Your Fleet?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join the Fleet Owner program and unlock premium features, dedicated support, and volume discounts.
          </p>
          <Link
            href="/host/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Now
            <IoChevronForwardOutline className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
