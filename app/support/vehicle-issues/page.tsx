// app/support/vehicle-issues/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoConstructOutline,
  IoCallOutline,
  IoCameraOutline,
  IoAlertCircleOutline,
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Vehicle Issues During Your Trip | Support | ItWhip',
  description: 'Having problems with your rental car? Learn what to do if you experience vehicle issues during your ItWhip rental.',
}

const issues = [
  {
    title: 'Flat Tire',
    description: 'Pull over safely. Check if the vehicle has a spare. Contact roadside assistance if you need help changing it.',
    urgent: false
  },
  {
    title: 'Dead Battery',
    description: 'Contact roadside assistance for a jump start. Do not attempt to jump the car yourself unless you know how.',
    urgent: false
  },
  {
    title: 'Check Engine Light',
    description: 'If the car is running normally, you can continue to a safe location. Contact the host and report the issue.',
    urgent: false
  },
  {
    title: 'Strange Noises',
    description: 'Pull over and assess. Contact the host to describe the noise. Do not continue driving if it seems unsafe.',
    urgent: true
  },
  {
    title: 'Accident',
    description: 'Ensure everyone is safe. Call 911 if needed. Document everything and contact ItWhip support immediately.',
    urgent: true
  }
]

export default function VehicleIssuesPage() {
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">Vehicle Issues</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoConstructOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Vehicle Issues
                </h1>
                <p className="text-gray-600 dark:text-gray-400">What to do if something goes wrong</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Emergency Banner */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <IoAlertCircleOutline className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">Emergency?</p>
                  <p className="text-sm text-red-700 dark:text-red-300">If you're in immediate danger, call 911 first.</p>
                </div>
              </div>
            </div>

            {/* First Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                First Steps for Any Issue
              </h2>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">1.</span>
                  Pull over to a safe location if you're driving
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">2.</span>
                  Take photos/videos of the issue
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">3.</span>
                  Contact the host through the ItWhip app
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-500">4.</span>
                  If you can't reach the host, contact ItWhip support
                </li>
              </ol>
            </div>

            {/* Common Issues */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Common Issues</h2>
              {issues.map((issue) => (
                <div
                  key={issue.title}
                  className={`rounded-lg p-5 border ${
                    issue.urgent
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    {issue.title}
                    {issue.urgent && (
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        Urgent
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/support/roadside"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Roadside Assistance
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
