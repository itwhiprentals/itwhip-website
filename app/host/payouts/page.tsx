// app/host/payouts/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCashOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCalendarOutline,
  IoCalculatorOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Host Payouts | How You Get Paid | ItWhip',
  description: 'Learn how ItWhip host payouts work. Fast direct deposits, transparent fees, and flexible payout schedules. Get paid within 3 business days of trip end.',
  keywords: ['car sharing payouts', 'host earnings payment', 'turo payout alternative', 'car rental host payment', 'when do hosts get paid'],
  openGraph: {
    title: 'Host Payouts | How You Get Paid | ItWhip',
    description: 'Fast, reliable payouts for car sharing hosts. Direct deposit within 3 business days.',
    url: 'https://itwhip.com/host/payouts',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/payouts',
  },
}

export default function PayoutsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-700 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 rounded-full text-emerald-200 text-xs font-medium mb-4">
              <IoCashOutline className="w-4 h-4" />
              Host Resources
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How Payouts Work
            </h1>
            <p className="text-xl text-emerald-100 mb-6">
              Get paid quickly and reliably. Direct deposit to your bank account within 3 business days after each trip ends.
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
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              Payouts
            </li>
          </ol>
        </nav>
      </div>

      {/* Payout Timeline */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Payout Timeline
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-200 dark:bg-emerald-800" />

              {[
                { step: 'Trip Ends', desc: 'Guest returns the car and trip is completed', time: 'Day 0' },
                { step: 'Processing', desc: 'We verify the trip and calculate your earnings', time: '24 hours' },
                { step: 'Payout Initiated', desc: 'Funds sent to your linked bank account', time: '1-2 days' },
                { step: 'Funds Available', desc: 'Money appears in your bank account', time: '2-3 days' }
              ].map((item, i) => (
                <div key={i} className="relative flex gap-4 pb-8 last:pb-0">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center z-10">
                    <span className="text-emerald-600 font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.step}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                    <span className="text-xs text-emerald-600 font-medium">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payout Methods */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Payout Methods
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-emerald-500">
              <div className="flex items-center gap-3 mb-4">
                <IoWalletOutline className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Direct Deposit</h3>
                  <span className="text-xs text-emerald-600 font-medium">Recommended</span>
                </div>
              </div>
              <ul className="space-y-2">
                {['Fastest payout method', '2-3 business days', 'No fees', 'Supports most US banks'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <IoCardOutline className="w-8 h-8 text-gray-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Debit Card</h3>
              </div>
              <ul className="space-y-2">
                {['Instant payouts available', 'Small fee may apply', 'Visa/Mastercard debit cards', 'Available in select regions'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-gray-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Breakdown */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Understanding Your Earnings
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IoCalculatorOutline className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Trip Earnings</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Base rental price + any additional fees (delivery, young driver, etc.)
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IoCashOutline className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Platform Fee</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  15-25% depending on your protection plan (covers payment processing, support, insurance)
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IoWalletOutline className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Your Payout</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trip earnings minus platform fee. Deposited after trip completion.
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
            Start Earning Today
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            List your car and start receiving payouts within days of your first trip.
          </p>
          <Link
            href="/list-your-car"
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            List Your Car
            <IoChevronForwardOutline className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
