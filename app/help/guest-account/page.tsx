// app/help/guest-account/page.tsx
// Comprehensive guide to ItWhip Guest Accounts
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoPersonOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoIdCardOutline,
  IoDocumentTextOutline,
  IoGiftOutline,
  IoStarOutline,
  IoHelpCircleOutline,
  IoSparklesOutline,
  IoCardOutline,
  IoRocketOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Guest Account Benefits | Book Cars on ItWhip | ItWhip',
  description: 'Learn about ItWhip Guest Accounts - how to book cars, verification process, booking history, credits, bonuses, and all the benefits of having a guest account.',
  keywords: [
    'itwhip guest account',
    'car rental account',
    'booking benefits',
    'rental credits',
    'peer to peer car rental',
    'arizona car rental'
  ],
  openGraph: {
    title: 'Guest Account Benefits | ItWhip',
    description: 'Everything you need to know about ItWhip Guest Accounts - book cars, earn credits, and enjoy seamless rentals.',
    url: 'https://itwhip.com/help/guest-account',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/help/guest-account',
  },
}

const bookingSteps = [
  {
    step: 1,
    icon: IoCarSportOutline,
    title: 'Find Your Perfect Car',
    description: 'Browse our selection of vehicles in Arizona. Filter by location, dates, car type, and features to find exactly what you need.',
    details: ['Search by city or neighborhood', 'Filter by price, type, features', 'View detailed car photos and specs']
  },
  {
    step: 2,
    icon: IoIdCardOutline,
    title: 'Verify Your Identity',
    description: 'Upload your driver\'s license for quick verification. No account needed upfront - we create it automatically from your license info.',
    details: ['Upload DL front and back', 'Verification in seconds', 'Account created automatically']
  },
  {
    step: 3,
    icon: IoCardOutline,
    title: 'Secure Your Booking',
    description: 'Add your payment method. Your card is saved securely but won\'t be charged until the host approves your booking.',
    details: ['No upfront charges', 'Secure Stripe processing', 'Host reviews your request']
  },
  {
    step: 4,
    icon: IoCheckmarkCircle,
    title: 'Get Approved & Drive',
    description: 'Once the host approves and you complete onboarding, you\'re ready to pick up your car and hit the road!',
    details: ['Host approval notification', 'Complete Stripe verification', 'Coordinate pickup with host']
  }
]

const accountBenefits = [
  {
    icon: IoTimeOutline,
    title: 'Booking History',
    description: 'View all your past and upcoming trips in one place. Access receipts, trip details, and rebook your favorite cars with one click.'
  },
  {
    icon: IoWalletOutline,
    title: 'Digital Wallet',
    description: 'Manage your credits, bonuses, and deposit wallet. Apply balances to future bookings for instant savings.'
  },
  {
    icon: IoRocketOutline,
    title: 'Instant Bookings',
    description: 'Once verified, book eligible cars instantly without waiting for host approval. Skip the wait and secure your ride.'
  },
  {
    icon: IoStarOutline,
    title: 'Reviews & Ratings',
    description: 'Build your reputation as a trusted guest. Good reviews unlock better cars and exclusive deals from hosts.'
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Verified Status',
    description: 'Complete verification once, use it forever. No need to re-verify for every booking - hosts trust verified guests.'
  },
  {
    icon: IoDocumentTextOutline,
    title: 'Saved Documents',
    description: 'Store your driver\'s license and insurance on file. Upload once and breeze through future bookings.'
  }
]

const creditsBonuses = [
  {
    icon: IoGiftOutline,
    title: 'Welcome Bonus',
    color: 'emerald',
    description: 'New guests receive a welcome bonus on their first booking. Credits applied automatically at checkout.'
  },
  {
    icon: IoSparklesOutline,
    title: 'Referral Credits',
    color: 'blue',
    description: 'Invite friends to ItWhip. When they complete their first trip, you both earn credits toward future rentals.'
  },
  {
    icon: IoWalletOutline,
    title: 'Deposit Wallet',
    color: 'amber',
    description: 'Security deposits from completed trips roll into your deposit wallet. Use them to reduce or eliminate deposits on future bookings.'
  }
]

const verificationLevels = [
  {
    level: 'Quick Verification',
    timing: 'During Booking',
    description: 'Upload your driver\'s license for instant verification to complete your booking. This creates your account automatically.',
    icon: IoIdCardOutline
  },
  {
    level: 'Full Verification',
    timing: 'After Booking (Onboarding)',
    description: 'Complete Stripe Identity verification with selfie matching. This unlocks instant bookings and builds trust with hosts.',
    icon: IoShieldCheckmarkOutline
  }
]

const faqs = [
  {
    question: 'Do I need an account to book a car?',
    answer: 'No! You can start booking as a guest. When you verify your identity during booking, we automatically create your account using your driver\'s license information. No signup forms needed.'
  },
  {
    question: 'When is my card charged?',
    answer: 'Your card is authorized (held) when you submit your booking, but NOT charged until the host approves your request. If declined, the authorization is released and you\'re never charged.'
  },
  {
    question: 'What happens after I book?',
    answer: 'After booking, you\'ll receive an email confirmation. The host reviews your request (usually within hours). Once approved, you\'ll complete onboarding (Stripe verification) and coordinate pickup details with the host.'
  },
  {
    question: 'How do credits and bonuses work?',
    answer: 'Credits and bonuses are automatically applied to eligible bookings at checkout. You can view your balances in your account dashboard. Credits typically cover rental costs, while deposit wallet funds reduce your security deposit.'
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, cancellation policies vary by host. Free cancellation is typically available up to 24-48 hours before pickup. Check the specific car\'s cancellation policy before booking.'
  },
  {
    question: 'What documents do I need?',
    answer: 'You need a valid driver\'s license (not expired). For booking, upload your DL front and back. During onboarding, you\'ll complete Stripe Identity verification which includes a selfie. Having your own auto insurance can reduce your deposit by 50%.'
  },
  {
    question: 'How is ItWhip different from traditional rentals?',
    answer: 'ItWhip is a peer-to-peer platform where local hosts share their personal vehicles. This means more variety, better prices, and a personal touch. Unlike big rental companies, you\'re renting from real people in your community.'
  },
  {
    question: 'What if something goes wrong during my trip?',
    answer: 'ItWhip provides 24/7 support for all trips. Every booking includes insurance coverage. In case of accidents, breakdowns, or issues, contact us immediately and we\'ll help coordinate with the host and insurance.'
  }
]

export default function GuestAccountPage() {
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
                <Link href="/support" className="hover:text-orange-600">Help</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">Guest Account</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <IoPersonOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Your Guest Account
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Everything you need to know about booking on ItWhip</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to <strong>ItWhip</strong> - Arizona&apos;s premier peer-to-peer car sharing platform.
                Your guest account is your gateway to renting unique vehicles from local hosts.
                Whether you&apos;re booking your first car or your fiftieth, your account keeps everything
                organized: bookings, verification status, credits, and more.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 sm:p-4 text-center border border-orange-200 dark:border-orange-800">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">Free</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Account Creation</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 sm:p-4 text-center border border-emerald-200 dark:border-emerald-800">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">Instant</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Verification</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center border border-blue-200 dark:border-blue-800">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* How Booking Works */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                How Booking Works
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">From search to keys in your hand</p>
            </div>

            <div className="space-y-4">
              {bookingSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center relative">
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                          {step.step}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {step.details.map((detail) => (
                          <span
                            key={detail}
                            className="text-[10px] sm:text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-gray-200 dark:border-gray-600"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Important Note */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <IoSparklesOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">No Account? No Problem!</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You don&apos;t need to create an account first. Just start booking - when you verify your driver&apos;s license,
                    we automatically create your account using your license information. It&apos;s that simple!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Benefits */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoStarOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                Account Benefits
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Why having an ItWhip account makes renting easier</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accountBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Process */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                Verification Process
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Two-step verification for security and convenience</p>
            </div>

            <div className="space-y-4">
              {verificationLevels.map((level, index) => (
                <div
                  key={level.level}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 ${index === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'} rounded-lg flex items-center justify-center`}>
                        <level.icon className={`w-6 h-6 ${index === 0 ? 'text-blue-600' : 'text-green-600'}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{level.level}</h3>
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                          index === 0
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                          {level.timing}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/help/identity-verification"
                className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Learn more about identity verification
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Credits & Bonuses */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                Credits & Bonuses
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Save money on every booking</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {creditsBonuses.map((item) => (
                <div
                  key={item.title}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border-2 ${
                    item.color === 'emerald' ? 'border-emerald-200 dark:border-emerald-800' :
                    item.color === 'blue' ? 'border-blue-200 dark:border-blue-800' :
                    'border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className={`w-12 h-12 ${
                    item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  } rounded-lg flex items-center justify-center mb-3`}>
                    <item.icon className={`w-6 h-6 ${
                      item.color === 'emerald' ? 'text-emerald-600' :
                      item.color === 'blue' ? 'text-blue-600' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-4 sm:p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <IoGiftOutline className="w-6 h-6" />
                <h3 className="font-bold text-lg">Pro Tip: Upload Your Insurance</h3>
              </div>
              <p className="text-sm opacity-90">
                Have your own auto insurance? Upload it to your account and get <strong>50% off your security deposit</strong> on every booking.
                That&apos;s money back in your pocket!
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoHelpCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Common questions about guest accounts</p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    <span className="pr-2">{faq.question}</span>
                    <IoChevronForwardOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Start Renting?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Find the perfect car for your next trip in Arizona.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/rentals/search"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Browse Cars
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
