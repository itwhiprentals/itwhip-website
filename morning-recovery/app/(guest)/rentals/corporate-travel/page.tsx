// app/(guest)/rentals/corporate-travel/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import prisma from '@/app/lib/database/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import {
  IoBusinessOutline,
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoStatsChartOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoReceiptOutline,
  IoFlashOutline,
  IoHelpCircleOutline,
  IoLeafOutline,
  IoRocketOutline,
  IoCashOutline,
  IoLocationOutline
} from 'react-icons/io5'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Corporate Car Rentals Phoenix | Business Travel | ItWhip',
  description: 'Corporate car rentals in Phoenix for business travelers. Premium vehicles, expense receipts, volume discounts, ESG reporting. Serving Fortune 500 companies.',
  keywords: ['corporate car rental phoenix', 'business travel rentals', 'company car rental', 'executive car rental', 'corporate fleet phoenix'],
  openGraph: {
    title: 'Corporate Car Rentals Phoenix | Business Travel | ItWhip',
    description: 'Streamlined corporate travel. Premium vehicles, simplified billing, ESG compliance.',
    url: 'https://itwhip.com/rentals/corporate-travel',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/corporate-travel',
  },
}

function transformCarForCompactCard(car: any) {
  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    seats: car.seats || 5,
    city: car.city,
    rating: car.rating ? Number(car.rating) : null,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto
    } : null
  }
}

export default async function CorporateTravelPage() {
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      carType: { in: ['LUXURY', 'SEDAN', 'SUV'] }
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      seats: true,
      dailyRate: true,
      city: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true }
      }
    },
    orderBy: [
      { rating: 'desc' },
      { totalTrips: 'desc' }
    ],
    take: 24
  })

  const totalCars = cars.length
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => Number(c.dailyRate))) : 65
  const maxPrice = cars.length > 0 ? Math.max(...cars.map(c => Number(c.dailyRate))) : 350

  const problems = [
    {
      icon: IoReceiptOutline,
      title: 'Invoice Chaos',
      description: 'Multiple vendors, separate invoices for transport',
      solution: 'Single consolidated invoice monthly'
    },
    {
      icon: IoTrendingUpOutline,
      title: 'No Control Over Surge',
      description: 'Employees paying 3x rates during conferences',
      solution: 'Fixed rates with no surge pricing ever'
    },
    {
      icon: IoLeafOutline,
      title: 'ESG Tracking Gap',
      description: 'Ground transport emissions rarely tracked',
      solution: 'Automated CSRD-compliant reporting'
    },
    {
      icon: IoLocationOutline,
      title: 'Zero Visibility',
      description: 'No idea where employees are during travel',
      solution: 'Real-time dashboard for all bookings'
    }
  ]

  const features = [
    {
      icon: IoWalletOutline,
      title: 'Volume Discounts',
      description: '5-20% off based on booking frequency'
    },
    {
      icon: IoDocumentTextOutline,
      title: 'Centralized Billing',
      description: 'One monthly invoice for all bookings'
    },
    {
      icon: IoStatsChartOutline,
      title: 'Expense Reports',
      description: 'Detailed receipts for accounting'
    },
    {
      icon: IoPeopleOutline,
      title: 'Account Manager',
      description: 'Dedicated support for your team'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: '$1M Insurance',
      description: 'Full coverage on every trip'
    },
    {
      icon: IoFlashOutline,
      title: 'Instant Booking',
      description: 'Same-day pickup available'
    }
  ]

  const plans = [
    {
      name: 'Starter',
      price: '$4,500',
      period: '/month',
      users: '25-100 employees',
      features: [
        'Rate extension to transportation',
        'Basic ESG reporting',
        'Single consolidated invoice',
        'Standard vehicle options',
        'Email support'
      ],
      savings: 'Save ~$15K/month',
      popular: false
    },
    {
      name: 'Business',
      price: '$15,000',
      period: '/month',
      users: '100-500 employees',
      features: [
        'Everything in Starter',
        'Full managed travel services',
        'Advanced ESG analytics',
        'Executive vehicle options',
        'Dedicated account manager',
        '24/7 phone support'
      ],
      savings: 'Save ~$75K/month',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      users: '500+ employees',
      features: [
        'Everything in Business',
        'Custom rate negotiations',
        'International coverage',
        'VIP & board member services',
        'On-site support team'
      ],
      savings: 'Save $1M+ annually',
      popular: false
    }
  ]

  const faqs = [
    {
      question: 'How do corporate accounts work?',
      answer: 'Apply for a corporate account and we\'ll set up centralized billing, volume discounts, and a dedicated account manager. All employee bookings go to one monthly invoice.'
    },
    {
      question: 'What discounts are available for businesses?',
      answer: 'Volume discounts range from 5-20% depending on booking frequency. We also offer special rates for long-term assignments and executive travel.'
    },
    {
      question: 'Can employees book directly?',
      answer: 'Yes! Employees can book through their corporate account with approved payment methods. Managers can set booking policies and spending limits.'
    },
    {
      question: 'How does ESG/CSRD compliance work?',
      answer: 'We automatically capture every mile, calculate Scope 3 emissions, and generate CSRD-compliant reports monthly. No manual data entry needed.'
    },
    {
      question: 'What\'s the implementation timeline?',
      answer: 'Week 1: Rate entry and setup. Week 2: Integration testing. Week 3: Pilot group. Week 4: Full rollout. Most clients see savings from day one.'
    }
  ]

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Corporate Car Rentals Phoenix',
        description: 'Corporate travel program with volume discounts, centralized billing, and ESG compliance.',
        provider: {
          '@type': 'Organization',
          name: 'ItWhip'
        },
        areaServed: {
          '@type': 'City',
          name: 'Phoenix'
        },
        offers: {
          '@type': 'Offer',
          price: minPrice,
          priceCurrency: 'USD',
          priceValidUntil
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://itwhip.com/rentals/corporate-travel#faq',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    ]
  }

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-6 sm:pt-8 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-4">
                  <IoBusinessOutline className="w-4 h-4" />
                  Corporate Travel Program
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
                  <span className="text-amber-400">Corporate</span> Car Rentals in <span className="text-amber-400">Phoenix</span>
                </h1>

                <p className="text-lg text-gray-300 mb-6">
                  Streamlined corporate travel for companies of all sizes. Premium vehicles,
                  simplified billing, volume discounts, and automated ESG reporting.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <IoCarOutline className="w-5 h-5 text-amber-400" />
                    <span><strong>{totalCars}</strong> vehicles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoCashOutline className="w-5 h-5 text-emerald-400" />
                    <span>${minPrice}-${maxPrice}/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-400" />
                    <span>$1M insurance</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/corporate"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    <IoRocketOutline className="w-5 h-5" />
                    Full Corporate Portal
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                  <a
                    href="#available-cars"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                  >
                    <IoCarOutline className="w-5 h-5" />
                    Browse Vehicles
                  </a>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <IoStatsChartOutline className="w-5 h-5 text-amber-400" />
                  Why Companies Choose <span className="text-amber-400">ItWhip</span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">35%</div>
                    <div className="text-xs text-gray-400">Avg. Cost Savings</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">100%</div>
                    <div className="text-xs text-gray-400">Booking Compliance</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">$0</div>
                    <div className="text-xs text-gray-400">Surge Pricing</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">1</div>
                    <div className="text-xs text-gray-400">Invoice Monthly</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link
                    href="/corporate"
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1"
                  >
                    Calculate your ROI
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/rentals" className="hover:text-amber-600">
                  Rentals
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Corporate Travel
              </li>
            </ol>
          </nav>
        </div>

        {/* Problems We Solve */}
        <section className="py-8 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoTrendingUpOutline className="w-6 h-6 text-amber-600" />
              Problems We Solve for Corporate Travel
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {problems.map((problem, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <problem.icon className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{problem.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{problem.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <IoCheckmarkCircleOutline className="w-4 h-4" />
                    {problem.solution}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm"
              >
                See our complete solution overview
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Corporate Account Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                  <feature.icon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Cars */}
        <section id="available-cars" className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Premium Vehicles for Business
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Luxury, sedans & SUVs perfect for corporate travel
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                {totalCars} available
              </span>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {cars.slice(0, 15).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Cars Currently Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Check back soon or browse all available cars.
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                >
                  Browse All Cars
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}

            {cars.length > 15 && (
              <div className="mt-6 text-center">
                <Link
                  href="/rentals/search?type=LUXURY,SEDAN,SUV"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {totalCars} vehicles
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Pricing Overview */}
        <section className="py-10 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Corporate Plans
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Flexible pricing for companies of all sizes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-6 border ${
                    plan.popular
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="text-center mb-3">
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{plan.users}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">{plan.savings}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                View Full Pricing & Calculate ROI
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-600" />
              Corporate Travel FAQs
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                    {faq.question}
                    <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                View all FAQs on our Corporate Portal
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your Corporate Travel?
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Join companies saving 35% on average. Set up in 4 weeks or less.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoBusinessOutline className="w-5 h-5" />
                Visit Corporate Portal
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg border-2 border-white hover:bg-amber-700 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Related Options */}
        <section className="py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Other Rental Options
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { slug: 'long-term', label: 'Long-Term' },
                { slug: 'airport-delivery', label: 'Airport Delivery' },
                { slug: 'hotel-delivery', label: 'Hotel Delivery' },
                { slug: 'business', label: 'Business' }
              ].map(item => (
                <Link
                  key={item.slug}
                  href={`/rentals/${item.slug}`}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm font-medium border border-gray-200 dark:border-gray-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
