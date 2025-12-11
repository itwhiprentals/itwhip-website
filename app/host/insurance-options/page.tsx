// app/host/insurance-options/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCarOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Host Insurance Options | Protection Plans | ItWhip',
  description: 'Choose your protection level on ItWhip. Basic, Standard, and Premium plans with varying coverage levels and host fees. All include $1M liability.',
  keywords: ['car sharing insurance', 'host protection plan', 'turo insurance alternative', 'car rental host insurance', 'vehicle protection plan'],
  openGraph: {
    title: 'Host Insurance Options | ItWhip',
    description: 'Compare host protection plans and choose the right coverage for your car sharing business.',
    url: 'https://itwhip.com/host/insurance-options',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/insurance-options',
  },
}

export default function InsuranceOptionsPage() {
  const plans = [
    {
      name: 'Basic',
      fee: '15%',
      deductible: '$2,500',
      color: 'gray',
      description: 'Essential coverage for experienced hosts comfortable with higher deductibles.',
      features: [
        '$1M liability coverage',
        'Physical damage protection',
        'Roadside assistance',
        '24/7 support',
        '$2,500 deductible',
        'Lowest platform fee'
      ],
      ideal: 'Budget-conscious hosts with newer vehicles'
    },
    {
      name: 'Standard',
      fee: '20%',
      deductible: '$1,000',
      color: 'blue',
      popular: true,
      description: 'Balanced protection with moderate deductible. Most popular choice.',
      features: [
        '$1M liability coverage',
        'Physical damage protection',
        'Roadside assistance',
        '24/7 support',
        '$1,000 deductible',
        'Priority claim processing'
      ],
      ideal: 'Most hosts - balanced protection and earnings'
    },
    {
      name: 'Premium',
      fee: '25%',
      deductible: '$250',
      color: 'purple',
      description: 'Maximum protection with lowest deductible. Peace of mind for high-value vehicles.',
      features: [
        '$1M liability coverage',
        'Physical damage protection',
        'Roadside assistance',
        '24/7 priority support',
        '$250 deductible',
        'Wear & tear coverage',
        'Key replacement coverage'
      ],
      ideal: 'Luxury/exotic cars, risk-averse hosts'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-800 via-indigo-700 to-purple-800 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/30 rounded-full text-purple-200 text-xs font-medium mb-4">
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              Host Protection
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Insurance & Protection Options
            </h1>
            <p className="text-xl text-purple-100 mb-6">
              Choose the protection level that fits your needs. All plans include $1M liability coverage during active rentals.
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
              Insurance Options
            </li>
          </ol>
        </nav>
      </div>

      {/* Plans Comparison */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Compare Protection Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 ${
                  plan.popular
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.fee}</span>
                    <span className="text-gray-500">platform fee</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Deductible: <strong>{plan.deductible}</strong>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <IoCheckmarkCircleOutline className={`w-5 h-5 flex-shrink-0 ${
                          plan.color === 'purple' ? 'text-purple-500' :
                          plan.color === 'blue' ? 'text-blue-500' : 'text-gray-500'
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                    <strong className="text-gray-900 dark:text-white">Ideal for:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{plan.ideal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How Protection Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">During a Trip</h3>
              <ul className="space-y-3">
                {[
                  'Your personal insurance is NOT used during rentals',
                  'ItWhip\'s $1M commercial policy is primary coverage',
                  'Guests are covered as drivers under our policy',
                  'Protection applies from pickup to return'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Filing a Claim</h3>
              <ul className="space-y-3">
                {[
                  'Report damage through the app within 24 hours',
                  'Upload photos documenting the damage',
                  'Our team reviews and processes the claim',
                  'Deductible is collected from the guest\'s deposit',
                  'Approved repairs are paid directly to shop'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 flex gap-4">
            <IoAlertCircleOutline className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Important: Personal Insurance</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                You should maintain your own personal auto insurance on your vehicle. While ItWhip coverage is primary during rentals, your personal policy provides coverage when the car is not being rented. Some personal insurers restrict car sharing - check with your provider to ensure compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Protected and Ready to Earn
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            List your car with confidence. Choose your protection plan during signup.
          </p>
          <Link
            href="/list-your-car"
            className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
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
