// app/host/payouts/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
  IoCalculatorOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoTrendingUpOutline,
  IoDocumentTextOutline,
  IoPhonePortraitOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoCheckmarkDoneOutline,
  IoInformationCircleOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'
import { BsBank2 } from 'react-icons/bs'
import { SiStripe } from 'react-icons/si'

export const metadata: Metadata = {
  title: 'Host Payouts & Earnings | Stripe Connect | ItWhip',
  description: 'Get paid fast with ItWhip. Secure Stripe Connect payouts, instant transfers available, and transparent earnings. Hosts earn up to 90% with direct deposit in 2-3 days.',
  keywords: ['car sharing payouts', 'host earnings payment', 'stripe connect car rental', 'turo payout alternative', 'instant car host payout', 'when do hosts get paid'],
  openGraph: {
    title: 'Host Payouts & Earnings | Stripe Connect | ItWhip',
    description: 'Secure, fast payouts powered by Stripe. Earn up to 90% and get paid within 2-3 business days.',
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
              <span className="text-yellow-400">Get Paid Fast.</span>{' '}
              <span className="text-white">Keep More.</span>
            </h1>
            <p className="text-xl text-emerald-100 mb-6">
              Secure payouts powered by Stripe Connect. Direct deposit to your bank in 2-3 business days,
              or get instant payouts to your debit card. Earn up to 90% of every booking.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                <SiStripe className="w-12 h-5 text-white" />
                <span className="text-sm font-medium">Powered by Stripe</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200 text-sm">
                <IoShieldCheckmarkOutline className="w-5 h-5" />
                Bank-level security
              </div>
              <div className="flex items-center gap-2 text-emerald-200 text-sm">
                <IoFlashOutline className="w-5 h-5" />
                Instant payouts available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-emerald-600 flex items-center gap-1">
                <IoHomeOutline className="w-3.5 h-3.5" />
                Home
              </Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/list-your-car" className="hover:text-emerald-600">Host</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              Payouts & Earnings
            </li>
          </ol>
        </nav>
      </div>

      {/* Stripe Connect Onboarding Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Set Up Your Payout Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Complete Stripe Connect onboarding to start receiving payouts. It takes just 5 minutes
              and your information is protected with bank-level encryption.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Onboarding Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center">
                  <SiStripe className="w-7 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stripe Connect Onboarding</h3>
                  <p className="text-sm text-gray-500">Secure • Fast • Required for payouts</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <IoPersonOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Verify Your Identity</h4>
                      <span className="text-xs text-emerald-600 font-medium">2 min</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Provide your legal name, date of birth, and last 4 digits of SSN</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <IoBusinessOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Add Business Details</h4>
                      <span className="text-xs text-emerald-600 font-medium">1 min</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Individual or business account type, address verification</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <BsBank2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Link Your Bank Account</h4>
                      <span className="text-xs text-emerald-600 font-medium">2 min</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect via Plaid or enter routing/account numbers manually</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                      <IoCheckmarkDoneOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Start Earning</h4>
                      <span className="text-xs text-emerald-600 font-medium">Done!</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Once verified, payouts are automatic after each trip</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/host/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#635BFF] text-white font-semibold rounded-lg hover:bg-[#5851e0] transition-colors"
                >
                  <SiStripe className="w-10 h-4" />
                  Complete Stripe Setup
                  <IoChevronForwardOutline className="w-5 h-5" />
                </Link>
                <p className="text-xs text-gray-500 text-center mt-3">
                  You'll be redirected to Stripe's secure onboarding portal
                </p>
              </div>
            </div>

            {/* Why Stripe */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#635BFF]/10 to-purple-100/50 dark:from-[#635BFF]/20 dark:to-purple-900/20 rounded-lg p-6 border border-[#635BFF]/20">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-[#635BFF]" />
                  Why We Use Stripe
                </h3>
                <ul className="space-y-3">
                  {[
                    'Trusted by millions of businesses including Lyft, DoorDash, and Instacart',
                    'PCI-DSS Level 1 certified - the highest level of payment security',
                    'Your banking details are never stored on ItWhip servers',
                    'Instant payouts available to eligible debit cards',
                    'Automatic 1099-K tax reporting for US hosts'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-[#635BFF] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600 shadow-md">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoInformationCircleOutline className="w-5 h-5 text-emerald-600" />
                  What You'll Need
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Government ID', desc: 'Driver\'s license or passport' },
                    { label: 'SSN (last 4)', desc: 'For identity verification' },
                    { label: 'Bank Account', desc: 'Checking or savings' },
                    { label: 'Home Address', desc: 'For tax documents' }
                  ].map((item, i) => (
                    <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Timeline */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Payout Timeline
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Step 1: Trip Ends */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Trip Ends</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Guest returns the car</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    Day 0
                  </span>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <IoChevronForwardOutline className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoSpeedometerOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Processing</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Trip verified, earnings calculated</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    24 hours
                  </span>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <IoChevronForwardOutline className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Step 3: Payout Sent */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoCashOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Payout Sent</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Funds transferred via Stripe</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    1-2 days
                  </span>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <IoChevronForwardOutline className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Step 4: In Your Bank */}
              <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BsBank2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">In Your Bank</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Money available to spend</p>
                  <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    2-3 days
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <IoFlashOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Instant Payouts Available</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Eligible hosts can get instant payouts to their debit card for a small fee (1.5% or $0.50 minimum).
                    Funds arrive within minutes, 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Breakdown */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Your Earnings, Transparent
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Know exactly what you'll earn before every trip. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Protection Plans - Based on EARNINGS_TIERS in financial-constants.ts */}
            {[
              {
                name: 'Basic',
                fee: '60%',
                earnings: '40%',
                color: 'gray',
                features: ['Platform-provided per-trip insurance', 'No personal insurance required', 'Standard support', 'Great for getting started'],
                best: 'New hosts without insurance'
              },
              {
                name: 'Standard',
                fee: '25%',
                earnings: '75%',
                color: 'emerald',
                popular: true,
                features: ['Bring your own P2P insurance', 'Verified policy upload', 'Priority support', '24/7 roadside assistance'],
                best: 'Hosts with P2P coverage'
              },
              {
                name: 'Premium',
                fee: '10%',
                earnings: '90%',
                color: 'purple',
                features: ['Commercial auto insurance', 'Maximum earnings share', 'Dedicated account manager', 'Expedited claims processing'],
                best: 'Fleet owners with commercial insurance'
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white dark:bg-gray-800 rounded-lg p-6 border-2 shadow-md hover:shadow-lg transition-shadow ${
                  plan.popular
                    ? 'border-emerald-500 dark:border-emerald-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name} Protection</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-emerald-600">{plan.earnings}</span>
                    <span className="text-gray-500 text-sm ml-1">earnings</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.fee} platform fee</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 text-center">
                    Best for: <span className="font-medium text-gray-700 dark:text-gray-300">{plan.best}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Example Calculation */}
          <div className="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 sm:p-8 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <IoCalculatorOutline className="w-5 h-5" />
              Example Earnings Calculation
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <p className="text-white text-sm font-medium">Trip Price</p>
                <p className="text-2xl font-bold">$150</p>
                <p className="text-xs text-white/80">3-day rental</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <p className="text-white text-sm font-medium">Your Earnings (75%)</p>
                <p className="text-2xl font-bold">$112.50</p>
                <p className="text-xs text-white/80">Standard tier (P2P insurance)</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <p className="text-white text-sm font-medium">Platform Fee (25%)</p>
                <p className="text-2xl font-bold">$37.50</p>
                <p className="text-xs text-white/80">Payment processing + support</p>
              </div>
              <div className="bg-white/30 rounded-lg p-4 border border-white/40">
                <p className="text-white text-sm font-medium">Deposited to Bank</p>
                <p className="text-2xl font-bold text-yellow-300">$112.50</p>
                <p className="text-xs text-white/80">In 2-3 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Methods */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Payout Methods
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-emerald-500 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <BsBank2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bank Transfer (ACH)</h3>
                  <span className="text-xs text-emerald-600 font-medium">Recommended • Free</span>
                </div>
              </div>
              <ul className="space-y-2">
                {['2-3 business days', 'No fees ever', 'Works with all US banks', 'Automatic recurring payouts'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <IoFlashOutline className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Instant Payout</h3>
                  <span className="text-xs text-yellow-600 font-medium">Minutes • 1.5% fee</span>
                </div>
              </div>
              <ul className="space-y-2">
                {['Arrives in minutes', 'Available 24/7/365', 'Visa/Mastercard debit cards', 'Min $0.50, max $15 fee'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-yellow-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <IoCalendarOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Scheduled Payouts</h3>
                  <span className="text-xs text-purple-600 font-medium">Weekly/Monthly • Free</span>
                </div>
              </div>
              <ul className="space-y-2">
                {['Batch multiple trips', 'Choose your schedule', 'Easier bookkeeping', 'Same low fees'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Dashboard Preview */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Track Every Dollar
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your host dashboard shows real-time earnings, pending payouts, and complete transaction history.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md overflow-hidden">
            {/* Mock Dashboard Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                <div>
                  <p className="text-emerald-200 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold">$1,247.50</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">Pending</p>
                  <p className="text-2xl font-bold">$385.00</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">This Month</p>
                  <p className="text-2xl font-bold">$3,892.00</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm">All Time</p>
                  <p className="text-2xl font-bold">$24,560.00</p>
                </div>
              </div>
            </div>

            {/* Mock Transaction List */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {[
                  { type: 'Payout', desc: 'Bank transfer to ****4521', amount: '+$385.00', status: 'completed', date: 'Dec 12' },
                  { type: 'Trip Earnings', desc: 'Tesla Model 3 • 3-day rental', amount: '+$240.00', status: 'pending', date: 'Dec 11' },
                  { type: 'Trip Earnings', desc: 'Toyota Camry • 5-day rental', amount: '+$145.00', status: 'pending', date: 'Dec 10' },
                  { type: 'Payout', desc: 'Instant to ****8832', amount: '+$520.00', status: 'completed', date: 'Dec 8' }
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'Payout' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {tx.type === 'Payout' ? (
                          <BsBank2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <IoCashOutline className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{tx.type}</p>
                        <p className="text-xs text-gray-500">{tx.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{tx.amount}</p>
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        {tx.date}
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                          tx.status === 'completed' ? 'bg-emerald-500' : 'bg-yellow-500'
                        }`} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Reporting */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Tax Reporting Made Easy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Stripe automatically generates your 1099-K for US tax reporting. All your earnings,
                deductions, and transaction history are available for download anytime.
              </p>
              <ul className="space-y-3">
                {[
                  'Automatic 1099-K generation (if over $600)',
                  'Download transaction history as CSV',
                  'Track mileage and expenses in-app',
                  'Integration with tax software'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/host/tax-benefits"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mt-6"
              >
                Learn about tax deductions
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <IoDocumentTextOutline className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">2024 Tax Documents</h3>
                  <p className="text-sm text-gray-500">Available January 2025</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">1099-K Form</span>
                  <span className="text-xs text-gray-500">Pending</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Annual Earnings Summary</span>
                  <span className="text-xs text-emerald-600 font-medium">Download</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Transaction History</span>
                  <span className="text-xs text-emerald-600 font-medium">Download</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'When will I receive my first payout?',
                a: 'After completing Stripe onboarding, your first payout will be initiated within 24 hours of your first completed trip. It takes 2-3 business days to arrive in your bank account.'
              },
              {
                q: 'Can I get paid instantly?',
                a: 'Yes! Eligible hosts can request instant payouts to their debit card for a 1.5% fee (minimum $0.50, maximum $15). Funds arrive within minutes, available 24/7.'
              },
              {
                q: 'What if a guest damages my car?',
                a: 'File a claim through your host dashboard. Once approved, damage reimbursements are paid out within 5-7 business days, separate from your regular trip earnings.'
              },
              {
                q: 'Are there any hidden fees?',
                a: 'No hidden fees. The platform fee depends on your insurance tier: 60% for Basic (we provide insurance), 25% for Standard (your P2P insurance), or just 10% for Premium (your commercial insurance). Higher tiers mean more earnings!'
              },
              {
                q: 'How do I update my bank account?',
                a: 'Go to Settings > Payout Methods in your host dashboard. You can add a new bank account or debit card anytime. Verification takes 1-2 business days.'
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-emerald-100 mb-8">
            List your car today and start receiving payouts within days of your first trip.
            Earn up to 90% with fast, secure Stripe payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/list-your-car"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              List Your Car
              <IoChevronForwardOutline className="w-5 h-5" />
            </Link>
            <Link
              href="/host/insurance-options"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500/30 text-white font-semibold rounded-lg hover:bg-emerald-500/40 transition-colors"
            >
              Compare Protection Plans
            </Link>
          </div>
          <p className="text-center text-sm text-emerald-200 mt-4">
            Want to estimate your earnings?{' '}
            <Link href="/host-earnings" className="text-white hover:text-emerald-100 font-medium underline">
              Use our earnings calculator →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
