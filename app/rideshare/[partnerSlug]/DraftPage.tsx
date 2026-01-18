// app/rideshare/[partnerSlug]/DraftPage.tsx
// Shown when a partner slug exists but the page is not yet published

import Link from 'next/link'
import { IoConstructOutline, IoCarSportOutline, IoSearchOutline, IoTimeOutline } from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

interface DraftPageProps {
  hostName: string
  missingRequirements: {
    needsApproval: boolean
    needsActivation: boolean
    needsCars: boolean
    needsService: boolean
  }
}

export default function DraftPage({ hostName, missingRequirements }: DraftPageProps) {
  // Get first name only
  const firstName = hostName.split(' ')[0]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 sm:pt-20 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoConstructOutline className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {firstName}&apos;s Page is Coming Soon
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This partner is setting up their fleet page. Check back soon to browse their vehicles.
            </p>

            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <IoTimeOutline className="w-4 h-4" />
                <span>Setup in progress</span>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${!missingRequirements.needsApproval ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span className={!missingRequirements.needsApproval ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                    Account verification
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${!missingRequirements.needsCars ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span className={!missingRequirements.needsCars ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                    Vehicle listings
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${!missingRequirements.needsService ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span className={!missingRequirements.needsService ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                    Services configured
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              {/* Primary CTA - Browse Rideshare */}
              <Link
                href="/rideshare"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                <IoCarSportOutline className="w-5 h-5" />
                Browse Active Partners
              </Link>

              {/* Secondary CTA - Search */}
              <Link
                href="/rentals"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <IoSearchOutline className="w-5 h-5" />
                Search All Vehicles
              </Link>
            </div>

            {/* Host CTA */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Want to list your vehicles on ItWhip?
              </p>
              <Link
                href="/partner"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                Become a Partner Host →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
