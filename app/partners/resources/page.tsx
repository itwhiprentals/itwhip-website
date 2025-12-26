// app/partners/resources/page.tsx
// Partner Resources Page

import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoBookOutline,
  IoVideocamOutline,
  IoHelpCircleOutline,
  IoArrowForward
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Partner Resources | Fleet Partner Program | ItWhip',
  description: 'Access guides, documentation, and resources for ItWhip fleet partners.',
}

const resources = [
  {
    icon: IoDocumentTextOutline,
    title: 'Partner Onboarding Guide',
    description: 'Step-by-step instructions for setting up your partner account and listing vehicles.',
    type: 'PDF Guide',
    link: '#'
  },
  {
    icon: IoBookOutline,
    title: 'Fleet Management Best Practices',
    description: 'Tips and strategies for managing your fleet efficiently on the ItWhip platform.',
    type: 'Article',
    link: '#'
  },
  {
    icon: IoVideocamOutline,
    title: 'Dashboard Tutorial',
    description: 'Video walkthrough of the partner dashboard features and analytics.',
    type: 'Video',
    link: '#'
  },
  {
    icon: IoDocumentTextOutline,
    title: 'Insurance Requirements',
    description: 'Detailed breakdown of commercial insurance requirements for fleet partners.',
    type: 'PDF Guide',
    link: '#'
  },
  {
    icon: IoDownloadOutline,
    title: 'Vehicle Photo Guidelines',
    description: 'How to take professional photos that convert browsers into bookers.',
    type: 'PDF Guide',
    link: '#'
  },
  {
    icon: IoBookOutline,
    title: 'Pricing Strategy Guide',
    description: 'Optimize your daily, weekly, and monthly rates for maximum revenue.',
    type: 'Article',
    link: '#'
  }
]

const faqs = [
  {
    question: 'How are commissions calculated?',
    answer: 'Commissions are calculated as a percentage of each booking\'s total rental amount, excluding taxes and fees. Your rate depends on your fleet size tier: 25% (1-9 vehicles), 20% (10-49), 15% (50-99), or 10% (100+).'
  },
  {
    question: 'When do I get paid?',
    answer: 'Standard partners receive weekly payouts every Monday via Stripe Direct Deposit. Platinum and Diamond tier partners can request bi-weekly or custom payout schedules.'
  },
  {
    question: 'How do I add vehicles to my fleet?',
    answer: 'Log into your partner dashboard, go to Fleet Management, and click "Add Vehicle." Gold tier and above partners can use bulk upload via CSV.'
  },
  {
    question: 'What insurance do I need?',
    answer: 'Fleet partners must maintain commercial auto insurance with minimum coverage of $100,000/$300,000 liability and comprehensive/collision. We verify insurance certificates during onboarding.'
  }
]

export default function PartnerResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoBookOutline className="w-12 h-12 mx-auto mb-4 text-orange-400" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Partner Resources
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to succeed as an ItWhip fleet partner.
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Guides & Documentation
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.link}
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <resource.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                        {resource.type}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <IoHelpCircleOutline className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5"
                >
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-12 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Need More Help?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our partner support team is here to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact?subject=Partner%20Support"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                Contact Support <IoArrowForward className="w-4 h-4" />
              </Link>
              <Link
                href="/partner/login"
                className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Partner Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
