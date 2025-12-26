// app/support/claims/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoCameraOutline,
  IoCallOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'File a Claim | Support | ItWhip',
  description: 'Learn how to file an insurance claim for damage, theft, or accidents during your ItWhip rental.',
}

const steps = [
  {
    icon: IoCameraOutline,
    title: 'Document Everything',
    description: 'Take photos and videos of any damage from multiple angles. Include the surrounding area and any other vehicles involved.'
  },
  {
    icon: IoCallOutline,
    title: 'Contact Authorities if Needed',
    description: 'For accidents, theft, or vandalism, file a police report. Get the report number for your claim.'
  },
  {
    icon: IoDocumentTextOutline,
    title: 'Report Through the App',
    description: 'Open the ItWhip app, go to your trip, and select "Report an Issue." Upload photos and describe what happened.'
  },
  {
    icon: IoTimeOutline,
    title: 'Wait for Review',
    description: 'Our claims team will review your submission within 24-48 hours and contact you with next steps.'
  }
]

export default function ClaimsPage() {
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">File a Claim</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoDocumentTextOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  File a Claim
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Report damage, theft, or accidents</p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* What to Include */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What to Include in Your Claim
              </h2>
              <ul className="space-y-2">
                {[
                  'Clear photos of all damage',
                  'Date, time, and location of incident',
                  'Description of what happened',
                  'Police report number (if applicable)',
                  'Contact info of other parties involved',
                  'Witness information (if available)'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/support/damage-process"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Damage Process
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
