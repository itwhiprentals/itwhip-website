// app/partners/apply/success/page.tsx
// Partner Application Success Page

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCheckmarkCircle,
  IoMailOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoArrowForward
} from 'react-icons/io5'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('partnersApplySuccessTitle'),
    description: t('partnersApplySuccessDescription'),
  }
}

const nextSteps = [
  {
    icon: IoDocumentTextOutline,
    title: 'Document Review',
    description: 'Our team will verify your business license, insurance, and other documents.',
    time: 'Usually same day'
  },
  {
    icon: IoMailOutline,
    title: 'Confirmation Email',
    description: 'You\'ll receive an email with your application status and login credentials.',
    time: '24-48 hours'
  },
  {
    icon: IoTimeOutline,
    title: 'Account Activation',
    description: 'Once approved, you can immediately start adding vehicles to your fleet.',
    time: 'Instant after approval'
  }
]

export default function PartnerApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <IoCheckmarkCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Thank you for applying to the ItWhip Fleet Partner Program.
            Our team will review your application and get back to you within 24-48 hours.
          </p>
        </div>

        {/* Confirmation Box */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <IoMailOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">
                Check Your Email
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                We've sent a confirmation email with your application details and reference number.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            What Happens Next
          </h2>

          <div className="space-y-6">
            {nextSteps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex-1 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {index + 1}. {step.title}
                    </h3>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* While You Wait */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            While You Wait
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-orange-500">1.</span>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Gather vehicle information</strong> - VINs, registration documents, and high-quality photos
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500">2.</span>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Set competitive pricing</strong> - Research rideshare rental rates in your area
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500">3.</span>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Prepare pickup locations</strong> - Decide where guests can pick up vehicles
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Have Questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our fleet partnership team is here to help you get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:partners@itwhip.com"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <IoMailOutline className="w-5 h-5" />
              Email Partners Team
            </a>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View FAQ
              <IoArrowForward className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
          >
            Return to Homepage
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
