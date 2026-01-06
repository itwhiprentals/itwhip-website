// app/host/requirements/arizona/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoLocationOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Arizona Host Requirements | Car Sharing in AZ | ItWhip',
  description: 'Requirements for hosting your car on ItWhip in Arizona. Vehicle requirements, documentation, insurance, and state-specific regulations for Phoenix hosts.',
  keywords: ['arizona car sharing requirements', 'phoenix host requirements', 'turo arizona requirements', 'car sharing arizona laws', 'list car on turo arizona'],
  openGraph: {
    title: 'Arizona Host Requirements | ItWhip',
    description: 'Everything you need to know about hosting your car in Arizona.',
    url: 'https://itwhip.com/host/requirements/arizona',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/requirements/arizona',
  },
}

export default function ArizonaRequirementsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-700 via-red-600 to-orange-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/30 rounded-full text-orange-200 text-xs font-medium mb-4">
              <IoLocationOutline className="w-4 h-4" />
              Arizona
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Arizona Host Requirements
            </h1>
            <p className="text-xl text-orange-100 mb-6">
              Everything you need to list your car in Arizona. Vehicle requirements, documentation, and state-specific guidelines.
            </p>
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
            <li className="flex items-center gap-1.5">
              <Link href="/host-requirements" className="hover:text-amber-600">Requirements</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              Arizona
            </li>
          </ol>
        </nav>
      </div>

      {/* Vehicle Requirements */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoCarOutline className="w-6 h-6 text-orange-600" />
            Vehicle Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Eligible Vehicles</h3>
              <ul className="space-y-3">
                {[
                  '2010 or newer (15 years old max)',
                  'Under 130,000 miles',
                  'Clean title (no salvage or rebuilt)',
                  'Valid Arizona registration',
                  'Passes safety inspection',
                  'No major mechanical issues'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Not Eligible</h3>
              <ul className="space-y-3">
                {[
                  'Salvage or rebuilt titles',
                  'Commercial vehicles (taxi/rideshare)',
                  'Vehicles with liens (unless approved)',
                  'Motorcycles or ATVs',
                  'RVs over 26 feet',
                  'Vehicles failing emissions'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoAlertCircleOutline className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoDocumentTextOutline className="w-6 h-6 text-orange-600" />
            Required Documentation
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Vehicle Documents',
                items: ['Arizona vehicle registration', 'Vehicle title (or lien holder approval)', 'Current emissions test (if required in your county)']
              },
              {
                title: 'Personal Documents',
                items: ['Valid Arizona driver\'s license', 'Proof of insurance', 'Social Security Number (for payouts)']
              },
              {
                title: 'Account Verification',
                items: ['Phone number verification', 'Email verification', 'Bank account for payouts']
              }
            ].map((category, i) => (
              <div key={i} className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Arizona Specific */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-orange-600" />
            Arizona-Specific Information
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Insurance Requirements</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Arizona requires minimum liability coverage of:
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>$25,000 bodily injury per person</li>
                  <li>$50,000 bodily injury per accident</li>
                  <li>$15,000 property damage</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  ItWhip provides $1M liability coverage during active rentals.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Emissions Testing</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Required in Maricopa County (Phoenix metro) and Pima County (Tucson) for vehicles 6+ years old. Make sure your vehicle has passed its most recent emissions test.
                </p>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 mt-4">Registration</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Vehicle must be registered in Arizona with current tags. Out-of-state vehicles must be registered in AZ within 15 days of establishing residency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to List Your Car in Arizona?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join hundreds of Arizona hosts earning money with their vehicles.
          </p>
          <Link
            href="/list-your-car"
            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Get Started
            <IoChevronForwardOutline className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
