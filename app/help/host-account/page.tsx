// app/help/host-account/page.tsx
// Comprehensive guide to ItWhip Host Accounts

import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoDocumentTextOutline,
  IoStarOutline,
  IoHelpCircleOutline,
  IoSparklesOutline,
  IoCardOutline,
  IoTrendingUpOutline,
  IoLockClosedOutline,
  IoServerOutline,
  IoAnalyticsOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoSettingsOutline,
  IoTimeOutline,
  IoLeafOutline,
  IoCashOutline,
  IoCarOutline,
  IoBusinessOutline,
  IoLinkOutline,
  IoDownloadOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoSwapHorizontalOutline,
  IoPersonOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Host Account Benefits | Earn With Your Car | ItWhip',
  description: 'Learn about ItWhip Host Accounts - how to list your car, manage bookings, earn up to 90%, track earnings, and access your professional dashboard.',
  keywords: [
    'itwhip host account',
    'car rental host',
    'peer to peer car sharing host',
    'list your car',
    'arizona car rental host'
  ],
  openGraph: {
    title: 'Host Account Benefits | ItWhip',
    description: 'Everything you need to know about hosting on ItWhip - list your car and earn up to 90%.',
    url: 'https://itwhip.com/help/host-account',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/help/host-account',
  },
}

const gettingStartedSteps = [
  {
    step: 1,
    icon: IoDocumentTextOutline,
    title: 'Create Your Host Account',
    description: 'Sign up with your email and complete identity verification. We verify all hosts for safety.',
    details: ['Email & phone verification', 'Identity verification via Stripe', 'Background check completed']
  },
  {
    step: 2,
    icon: IoCarOutline,
    title: 'List Your Vehicle',
    description: 'Add your car details, upload photos, set your daily rate, and choose your availability.',
    details: ['Upload 12+ high-quality photos', 'Set competitive daily pricing', 'Choose pickup location']
  },
  {
    step: 3,
    icon: IoCardOutline,
    title: 'Connect Stripe Payouts',
    description: 'Link your bank account through Stripe Connect to receive fast, secure payments.',
    details: ['Secure Stripe Connect setup', 'Direct deposit to your bank', 'Choose payout schedule']
  },
  {
    step: 4,
    icon: IoCheckmarkCircle,
    title: 'Start Earning',
    description: 'Once approved, your car goes live. Accept booking requests and watch your earnings grow!',
    details: ['Receive booking requests', 'Manage your calendar', 'Get paid in 48 hours']
  }
]

const dashboardFeatures = [
  {
    icon: IoAnalyticsOutline,
    title: 'Revenue Analytics',
    description: 'Track your earnings with detailed charts, monthly summaries, and payout history. See exactly how much you\'re making.'
  },
  {
    icon: IoCalendarOutline,
    title: 'Booking Calendar',
    description: 'View and manage all bookings in a visual calendar. Block dates, see upcoming trips, and avoid double-bookings.'
  },
  {
    icon: IoCarSportOutline,
    title: 'Fleet Management',
    description: 'Add, edit, and manage multiple vehicles. View each car\'s performance, utilization, and earnings individually.'
  },
  {
    icon: IoPeopleOutline,
    title: 'Guest Management',
    description: 'View guest profiles, booking history, and reviews. Communicate directly with renters through our messaging system.'
  },
  {
    icon: IoLocationOutline,
    title: 'Vehicle Tracking',
    description: 'Optional GPS tracking for your fleet. Monitor vehicle location, set geofences, and enable remote features.'
  },
  {
    icon: IoSettingsOutline,
    title: 'Account Settings',
    description: 'Manage your profile, company details, banking info, notifications, and privacy preferences all in one place.'
  }
]

const commissionTiers = [
  {
    tier: 'STANDARD',
    hostKeeps: '75%',
    vehicles: '1-9 vehicles',
    color: 'gray',
    description: 'Perfect for getting started with your first car.'
  },
  {
    tier: 'GOLD',
    hostKeeps: '80%',
    vehicles: '10-49 vehicles',
    color: 'amber',
    popular: true,
    description: 'Growing your fleet unlocks better rates.'
  },
  {
    tier: 'PLATINUM',
    hostKeeps: '85%',
    vehicles: '50-99 vehicles',
    color: 'purple',
    description: 'Serious fleet operators with premium benefits.'
  },
  {
    tier: 'DIAMOND',
    hostKeeps: '90%',
    vehicles: '100+ vehicles',
    color: 'emerald',
    description: 'Maximum earnings for our largest partners.'
  }
]

const protectionFeatures = [
  {
    icon: IoShieldCheckmarkOutline,
    title: '$1M Liability Coverage',
    description: 'Every trip includes $1M liability insurance, protecting you from accidents and third-party claims.'
  },
  {
    icon: IoAnalyticsOutline,
    title: 'Mileage Forensics™',
    description: 'Our proprietary system tracks odometer readings between trips to verify usage and detect fraud patterns.'
  },
  {
    icon: IoDocumentTextOutline,
    title: 'Guest Verification',
    description: 'All guests complete identity verification and background checks before they can book your vehicle.'
  },
  {
    icon: IoTimeOutline,
    title: '24/7 Roadside Support',
    description: 'Guests have access to roadside assistance, minimizing disruption and protecting your vehicle.'
  }
]

const faqs = [
  {
    question: 'How much can I earn?',
    answer: 'Earnings depend on your vehicle, pricing, and availability. Economy cars average $600-1,000/month, standard vehicles $1,000-1,800/month, and luxury $2,000-4,000/month based on 15-20 rental days. Higher tiers (more vehicles) mean you keep more of each rental.'
  },
  {
    question: 'When do I get paid?',
    answer: 'Payouts are processed within 48 hours of trip completion - the fastest in the industry. Funds go directly to your linked bank account via Stripe. You can choose daily, weekly, biweekly, or monthly payout schedules.'
  },
  {
    question: 'What cars qualify?',
    answer: 'Vehicles must be 2015 or newer with under 130,000 miles and a clean title (no salvage/rebuilt). Your car must pass our safety verification and be registered in Arizona.'
  },
  {
    question: 'How do commission tiers work?',
    answer: 'Your earnings percentage depends on your fleet size: Standard (75%) for 1-9 vehicles, Gold (80%) for 10-49 vehicles, Platinum (85%) for 50-99 vehicles, and Diamond (90%) for 100+ vehicles. Grow your fleet to earn more per rental.'
  },
  {
    question: 'What if my car is damaged?',
    answer: 'Report damage within 24 hours through your dashboard with photos. Our FNOL (First Notice of Loss) system captures all information needed. Claims are typically resolved within 48-72 hours. $1M liability coverage is included on all bookings.'
  },
  {
    question: 'Can I set my own prices?',
    answer: 'Absolutely! You control your daily rate, weekly/monthly discounts, and special event pricing. Our smart pricing tool suggests competitive rates based on your market, but final pricing is always up to you.'
  },
  {
    question: 'How do I handle vehicle pickup?',
    answer: 'You choose: meet the guest in person, use a lockbox for contactless pickup, or enable remote unlock if you have connected vehicle features. Many hosts prefer the personal touch for first-time guests.'
  },
  {
    question: 'What if I need to cancel a booking?',
    answer: 'Host cancellations affect your ranking and may result in penalties. If you must cancel, do so as early as possible. Keep your calendar updated to avoid conflicts. Emergency cancellations are handled case-by-case.'
  }
]

export default function HostAccountPage() {
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">Host Account</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <IoBusinessOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Your Host Account
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Everything you need to know about hosting on ItWhip</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to <strong>ItWhip Hosting</strong> - turn your car into a revenue generator.
                Your host account gives you access to a professional dashboard with everything you need:
                fleet management, booking calendar, revenue analytics, guest communication, and more.
                Earn up to 90% of each rental based on your fleet size.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 sm:p-4 text-center border border-emerald-200 dark:border-emerald-800">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">90%</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Max Earnings</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 sm:p-4 text-center border border-amber-200 dark:border-amber-800">
                <div className="text-xl sm:text-2xl font-bold text-amber-600">48hr</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Payouts</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center border border-blue-200 dark:border-blue-800">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">$1M</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Coverage</div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started Steps */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCarSportOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Getting Started
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">From signup to your first booking</p>
            </div>

            <div className="space-y-4">
              {gettingStartedSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center relative">
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                        <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
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

            <div className="mt-6 text-center">
              <Link
                href="/host/signup"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Start Hosting Now
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Features */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoSettingsOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Your Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Professional tools to manage your business</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Tiers */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoTrendingUpOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Commission Tiers
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Larger fleets earn more per rental</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commissionTiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`relative rounded-lg p-4 border shadow-sm ${
                    tier.color === 'emerald'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400'
                      : tier.color === 'amber'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400'
                      : tier.color === 'purple'
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      POPULAR
                    </div>
                  )}
                  <div className={`text-xs font-bold mb-1 ${
                    tier.color === 'emerald' ? 'text-emerald-600'
                    : tier.color === 'amber' ? 'text-amber-600'
                    : tier.color === 'purple' ? 'text-purple-600'
                    : 'text-gray-600'
                  }`}>
                    {tier.tier}
                  </div>
                  <div className={`text-2xl font-black mb-0.5 ${
                    tier.color === 'emerald' ? 'text-emerald-600'
                    : tier.color === 'amber' ? 'text-amber-600'
                    : tier.color === 'purple' ? 'text-purple-600'
                    : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {tier.hostKeeps}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">You Keep</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {tier.vehicles}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-800 dark:text-green-300 text-center">
                <strong>$1M liability coverage</strong> included on all tiers. Your tier is based on total vehicles in your fleet.
              </p>
            </div>
          </div>
        </section>

        {/* Protection & Insurance */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Host Protection
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Your car and business are protected</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {protectionFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/host-protection"
                className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                View full host protection details
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Payouts & Banking */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCashOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Payouts & Banking
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Get paid fast with secure Stripe payouts</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoCardOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Powered by Stripe Connect</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Industry-leading payment infrastructure. Secure, reliable, and trusted by millions of businesses worldwide.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoTimeOutline className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">48-Hour Payouts</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Fastest in the industry. Get paid within 48 hours of trip completion via direct deposit.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCalendarOutline className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Flexible Schedules</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Choose daily, weekly, biweekly, or monthly payouts. Change your schedule anytime in settings.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoDocumentTextOutline className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Tax Documentation</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Automated 1099 forms for tax season. Track all earnings and deductions in your dashboard.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoLockClosedOutline className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Bank-Level Security</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    PCI-DSS compliant. Your banking details are encrypted and stored securely by Stripe, not ItWhip.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ESG & Sustainability */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoLeafOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                ESG & Sustainability
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Track your environmental impact</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoLeafOutline className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">ESG Score Dashboard</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Every vehicle on ItWhip gets an ESG (Environmental, Social, Governance) impact score.
                    Track your fleet&apos;s carbon footprint, earn sustainability badges, and attract eco-conscious guests.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      CSRD Compliant
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Carbon Tracking
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Sustainability Badges
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Linking */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoLinkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Account Linking
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Connect your host and guest accounts</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoSwapHorizontalOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Switch Between Host & Guest</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Link your host account with a guest account to seamlessly switch roles.
                    Use the role switcher in the header to toggle between your host dashboard (for managing your fleet) and guest profile (for booking cars).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <IoPersonOutline className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">One Identity</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Since one driver&apos;s license equals one person, you can only link one guest account to your host profile and vice versa.
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCarSportOutline className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">Want to Book a Car?</h4>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Hosts cannot book cars with their host account.</strong> You need a linked guest account (under the same identity) to rent vehicles.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How to link:</strong> Go to your Host Profile → Settings → Account Linking, enter your guest account&apos;s email, and verify with a code.
                  You can also unlink accounts from this page if needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Export & Account Deletion */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Your Data & Privacy Rights
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Export your data or delete your account anytime</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Download My Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IoDownloadOutline className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">Download My Data</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Export a PDF containing all your host account information:
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 ml-13 mb-4">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Host profile information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Vehicle listings & details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Complete booking history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Earnings & payout records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Banking details (masked)</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Find this in: <strong>Profile → Settings → Download My Data</strong>
                </p>
              </div>

              {/* Delete Account */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IoTrashOutline className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">Delete Account</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete your host account if you no longer need it.
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800 mb-4">
                  <div className="flex items-start gap-2">
                    <IoWarningOutline className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200">30-Day Grace Period</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Your account is scheduled for deletion, not immediately removed. Changed your mind? Log in within 30 days to cancel.
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Host profile & personal info deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Vehicle listings removed from platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Booking & earnings history cleared</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Banking & payout details purged</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Find this in: <strong>Profile → Settings → Danger Zone</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoHelpCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Common questions about hosting</p>
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
              Ready to Start Earning?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              List your car and join Arizona&apos;s fastest-growing car sharing community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/host/signup"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Become a Host
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/host-university"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Host University
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
