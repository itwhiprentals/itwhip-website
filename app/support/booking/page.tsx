// app/support/booking/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarOutline,
  IoSearchOutline,
  IoCalendarOutline,
  IoCardOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'How to Book a Car | Support | ItWhip',
  description: 'Learn how to book a rental car on ItWhip. Step-by-step guide for searching, selecting, and confirming your car rental.',
}

const steps = [
  {
    icon: IoSearchOutline,
    title: 'Search for a Car',
    description: 'Enter your location, dates, and times. Browse available vehicles in your area with filters for car type, price, and features.'
  },
  {
    icon: IoCarOutline,
    title: 'Select Your Vehicle',
    description: 'Review vehicle details, photos, host ratings, and included mileage. Check the pickup location and any special requirements.'
  },
  {
    icon: IoCalendarOutline,
    title: 'Choose Your Dates',
    description: 'Confirm your pickup and return dates and times. Most hosts offer flexible scheduling and free delivery options.'
  },
  {
    icon: IoCardOutline,
    title: 'Complete Your Booking',
    description: 'Enter your payment information and accept the rental agreement. Your card will be charged once the host confirms.'
  },
  {
    icon: IoCheckmarkCircle,
    title: 'Get Confirmation',
    description: 'Receive instant confirmation with host contact info. Coordinate pickup details directly with your host.'
  }
]

export default function BookingGuidePage() {
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">How to Book</li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <IoCarOutline className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  How to Book a Car
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Step-by-step booking guide</p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
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
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Searching
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
