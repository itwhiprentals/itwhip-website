// app/support/verification/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoPersonOutline,
  IoIdCardOutline,
  IoPhonePortraitOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Account Verification | Support | ItWhip',
  description: 'Learn how to verify your ItWhip account. Complete identity, license, and phone verification to start renting.',
}

const verificationSteps = [
  {
    icon: IoPhonePortraitOutline,
    title: 'Phone Verification',
    description: 'Verify your phone number via SMS code. This helps us keep your account secure.',
    time: 'Instant'
  },
  {
    icon: IoPersonOutline,
    title: 'Identity Verification',
    description: 'Upload a photo of your government-issued ID (passport or state ID). We verify your identity to protect all users.',
    time: '1-2 hours'
  },
  {
    icon: IoIdCardOutline,
    title: 'Driver\'s License',
    description: 'Upload front and back photos of your valid driver\'s license. Must be current and match your profile name.',
    time: '1-2 hours'
  }
]

const requirements = [
  'Must be 21+ years old (25+ for some vehicles)',
  'Valid driver\'s license for at least 2 years',
  'Clean driving record',
  'Valid payment method',
  'International licenses accepted with IDP'
]

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-orange-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-orange-600">Support</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">Account Verification</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoPersonOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Account Verification
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Complete verification to start renting</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Verification Steps */}
            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <IoTimeOutline className="w-3 h-3" />
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Renter Requirements
              </h2>
              <ul className="space-y-2">
                {requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to My Account
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
