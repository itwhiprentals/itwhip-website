// app/host/fleet-owners/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoCarOutline,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoAnalyticsOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCashOutline,
  IoSettingsOutline,
  IoLeafOutline,
  IoSpeedometerOutline,
  IoDocumentTextOutline,
  IoFlashOutline,
  IoLayersOutline,
  IoLockClosedOutline,
  IoRocketOutline,
  IoBriefcaseOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoWarningOutline,
  IoCheckmarkDoneOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Enterprise Fleet Management Platform | Fleet Owners | ItWhip',
  description: 'Enterprise-grade fleet management with Mileage Forensics™, ESG reporting, and insurance intelligence. Manage 5+ vehicles with dedicated support, bulk tools, and carrier-integrated compliance.',
  keywords: [
    'enterprise fleet management',
    'fleet owner car sharing',
    'commercial fleet rental',
    'mileage forensics',
    'ESG fleet reporting',
    'insurance intelligence platform',
    'phoenix fleet rental',
    'fleet compliance management',
    'P2P fleet platform'
  ],
  openGraph: {
    title: 'Enterprise Fleet Management Platform | ItWhip',
    description: 'The only platform where your fleet data becomes your competitive advantage. Mileage Forensics™, ESG reporting, and insurance intelligence built-in.',
    url: 'https://itwhip.com/host/fleet-owners',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/fleet-owners',
  },
}

export default function FleetOwnersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 rounded-full text-indigo-200 text-xs font-medium mb-4">
              <IoRocketOutline className="w-4 h-4" />
              Enterprise Fleet Platform
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-yellow-400">Your Fleet Data Is Your</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Competitive Advantage
              </span>
            </h1>
            <p className="text-xl text-indigo-100 mb-6">
              Enterprise-grade fleet management with Mileage Forensics™, ESG reporting, and insurance intelligence. 
              The only platform that turns your vehicle data into verified insights for carriers and stakeholders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/host/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Apply for Fleet Program
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Schedule Fleet Consultation
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <IoShieldCheckmarkOutline className="w-5 h-5" />
                <span>Insurance Carrier Integrated</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <IoLeafOutline className="w-5 h-5" />
                <span>ESG Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <IoSpeedometerOutline className="w-5 h-5" />
                <span>Mileage Forensics™</span>
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
              <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
                <IoHomeOutline className="w-3.5 h-3.5" />
                Home
              </Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/list-your-car" className="hover:text-indigo-600">Host</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              Fleet Owners
            </li>
          </ol>
        </nav>
      </div>

      {/* The 2025 Fleet Challenge */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              The 2025 Fleet Challenge
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Fleet owners are no longer just looking for vehicles—they need a complete mobility ecosystem 
              that solves electrification, compliance, and data complexity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: IoWarningOutline,
                title: 'Regulatory Pressure',
                description: 'EPA Phase 3, California Clean Fleets, ESG reporting requirements—compliance is mandatory.',
                color: 'red'
              },
              {
                icon: IoTrendingUpOutline,
                title: 'Rising Insurance Costs',
                description: 'Premiums increasing 15-20% annually. Carriers demand verified data, not self-reports.',
                color: 'orange'
              },
              {
                icon: IoAnalyticsOutline,
                title: 'Data Overload',
                description: 'Drowning in telematics data but starving for actionable insights and audit-ready reports.',
                color: 'yellow'
              },
              {
                icon: IoFlashOutline,
                title: 'Electrification Complexity',
                description: 'EV transition requires charging infrastructure, energy management, and range planning.',
                color: 'blue'
              }
            ].map((challenge, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  challenge.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  challenge.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  challenge.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <challenge.icon className={`w-6 h-6 ${
                    challenge.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    challenge.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    challenge.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Edge */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-4">
              <IoLayersOutline className="w-4 h-4" />
              What Makes ItWhip Different
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Technology Edge
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're not just a car-sharing platform. We're an insurance intelligence company 
              disguised as a mobility platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mileage Forensics */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-8 border border-indigo-100 dark:border-indigo-800 shadow-sm">
              <div className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <IoSpeedometerOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Mileage Forensics™
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track every mile between rentals. Detect unauthorized usage, verify declarations, 
                and provide insurers with data they can trust.
              </p>
              <ul className="space-y-2">
                {[
                  'Trip 1 ends at 10,000 miles → Trip 2 starts at 11,292 miles',
                  'Gap of 1,292 miles flagged for review',
                  'Automatic compliance scoring',
                  'Insurance-grade audit trail'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Declarations */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-8 border border-green-100 dark:border-green-800 shadow-sm">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <IoDocumentTextOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Usage Declarations
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hosts declare how vehicles are used. We verify it. Insurers trust it.
              </p>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">Rental Only</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">15 mi max gap</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Best insurance rates, 100% business deduction</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">Rental + Personal</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">500 mi max gap</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mixed use, moderate rates</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">Commercial</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">300 mi max gap</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Business operations, logged trips</p>
                </div>
              </div>
            </div>

            {/* ESG Dashboard */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-8 border border-emerald-100 dark:border-emerald-800 shadow-sm">
              <div className="w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center mb-6">
                <IoLeafOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                ESG Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Automatic sustainability reporting for corporate compliance. Track carbon footprint, 
                generate ESG reports, and meet stakeholder requirements.
              </p>
              <ul className="space-y-2">
                {[
                  'Real-time carbon emissions tracking',
                  'Automated ESG report generation',
                  'Corporate travel compliance',
                  'Sustainability scoring per vehicle'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/esg-dashboard"
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-4"
              >
                Learn more about ESG features
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>

            {/* Insurance Intelligence */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8 border border-purple-100 dark:border-purple-800 shadow-sm">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <IoShieldCheckmarkOutline className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Insurance Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Verified data that insurance carriers trust. Reduce premiums, speed up claims, 
                and provide the audit trail carriers demand.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">7 days</div>
                  <div className="text-xs text-gray-500">Claim resolution</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">vs 30+</div>
                  <div className="text-xs text-gray-500">Industry average</div>
                </div>
              </div>
              <Link
                href="/mileage-forensics"
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-4"
              >
                Explore Mileage Forensics
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Tiers */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Insurance Tier System
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your insurance coverage determines your earnings. More coverage = higher revenue share.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                tier: 'Basic',
                percentage: '40%',
                color: 'gray',
                description: 'Platform insurance only',
                features: [
                  'No personal insurance required',
                  'Platform insurance is primary',
                  'Basic coverage included',
                  'Good for getting started'
                ]
              },
              {
                tier: 'Standard',
                percentage: '75%',
                color: 'indigo',
                description: 'P2P insurance added',
                features: [
                  'Your P2P insurance is primary',
                  'Platform insurance is backup',
                  'Higher earnings share',
                  'Most popular choice'
                ],
                popular: true
              },
              {
                tier: 'Premium',
                percentage: '90%',
                color: 'purple',
                description: 'Commercial insurance',
                features: [
                  'Commercial insurance is primary',
                  'Maximum earnings share',
                  'Fleet-grade protection',
                  'Best for professional fleets'
                ]
              }
            ].map((tier, i) => (
              <div
                key={i}
                className={`relative bg-white dark:bg-gray-800 rounded-lg p-6 border-2 shadow-sm hover:shadow-md transition-shadow ${
                  tier.popular
                    ? 'border-indigo-500 dark:border-indigo-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {tier.tier} Tier
                  </h3>
                  <div className="text-4xl font-bold text-indigo-600 mb-1">{tier.percentage}</div>
                  <div className="text-sm text-gray-500">Revenue Share</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tier.description}</p>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Insurance Partners */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-indigo-200 text-xs font-medium mb-4">
                <IoBriefcaseOutline className="w-4 h-4" />
                For Insurance Carriers
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                The Data Carriers Actually Need
              </h2>
              <p className="text-indigo-100 mb-6">
                We provide insurance carriers with verified mileage data, digital audit trails, 
                and fraud detection—not self-reported guesswork.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: 'Verified Mileage',
                    description: 'Every mile tracked forensically, not self-reported'
                  },
                  {
                    title: 'Digital Audit Trail',
                    description: 'Complete history from listing to claim resolution'
                  },
                  {
                    title: 'Fraud Detection',
                    description: 'Automatic flagging of usage anomalies and compliance gaps'
                  },
                  {
                    title: 'Faster Claims',
                    description: 'Resolve claims in 7 days with verified data'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IoCheckmarkDoneOutline className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-indigo-200">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors mt-8"
              >
                Partner With Us
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-lg p-8 border border-white/10">
              <h3 className="text-lg font-semibold mb-6">Insurance Intelligence Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-indigo-200">Claim Resolution Time</span>
                    <span className="font-medium">7 days avg</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[23%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  </div>
                  <div className="text-xs text-indigo-300 mt-1">Industry average: 30+ days</div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-indigo-200">Data Verification Rate</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                  </div>
                  <div className="text-xs text-indigo-300 mt-1">Every mile tracked forensically</div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-indigo-200">Fraud Detection Rate</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                  </div>
                  <div className="text-xs text-indigo-300 mt-1">Automatic anomaly flagging</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Fleet Owner Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: IoPersonOutline,
                title: 'Dedicated Account Manager',
                description: 'Personal support from our fleet team. Direct line for questions, issues, and optimization advice.'
              },
              {
                icon: IoSettingsOutline,
                title: 'Bulk Management Tools',
                description: 'Update pricing, availability, and settings across all vehicles at once. Save hours of admin time.'
              },
              {
                icon: IoStatsChartOutline,
                title: 'Advanced Analytics',
                description: 'Fleet-wide dashboard showing performance, revenue trends, compliance scores, and optimization opportunities.'
              },
              {
                icon: IoTrendingUpOutline,
                title: 'Preferred Placement',
                description: 'Your listings get priority visibility in search results and featured sections.'
              },
              {
                icon: IoCashOutline,
                title: 'Volume Discounts',
                description: 'Reduced platform fees based on fleet size. The more you list, the more you save per booking.'
              },
              {
                icon: IoShieldCheckmarkOutline,
                title: 'Premium Protection',
                description: 'Access to all insurance tiers including commercial coverage for maximum 90% earnings.'
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Tiers */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Fleet Program Tiers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter Fleet',
                vehicles: '5-10',
                features: ['Dedicated support', 'Bulk tools', 'Analytics dashboard', 'Standard placement'],
                color: 'gray'
              },
              {
                name: 'Professional Fleet',
                vehicles: '11-25',
                features: ['Priority support', 'Advanced analytics', 'Preferred placement', '5% fee reduction', 'Quarterly reviews'],
                color: 'indigo',
                popular: true
              },
              {
                name: 'Enterprise Fleet',
                vehicles: '26+',
                features: ['Dedicated account manager', 'Custom integrations', 'Premium placement', '10% fee reduction', 'Monthly strategy calls', 'API access'],
                color: 'purple'
              }
            ].map((tier, i) => (
              <div
                key={i}
                className={`relative rounded-lg p-6 border-2 shadow-sm hover:shadow-md transition-shadow ${
                  tier.popular
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{tier.name}</h3>
                <div className="text-3xl font-bold text-indigo-600 mb-4">{tier.vehicles} <span className="text-base font-normal text-gray-500">vehicles</span></div>
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Fleet Program Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <IoCheckmarkDoneOutline className="w-5 h-5 text-indigo-600" />
                To Qualify
              </h3>
              <ul className="space-y-4">
                {[
                  'Minimum 5 active vehicles on the platform',
                  'Maintain 4.5+ average rating',
                  '90%+ response rate to inquiries',
                  'Complete host verification (ID, insurance)',
                  'Active for 30+ days (new fleets can apply with proof of vehicles)'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <IoRocketOutline className="w-5 h-5 text-indigo-600" />
                What We Provide
              </h3>
              <ul className="space-y-4">
                {[
                  'Onboarding assistance for all vehicles',
                  'Pricing optimization consultation',
                  'Priority customer support (2-hour SLA)',
                  'Early access to new features',
                  'Fleet performance reports (weekly/monthly)',
                  'Insurance tier optimization guidance'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Fleet Operations?
          </h2>
          <p className="text-indigo-100 mb-8">
            Join the Fleet Owner program and unlock enterprise-grade technology, dedicated support, 
            and the insurance intelligence that sets you apart.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/host/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Apply for Fleet Program
              <IoChevronForwardOutline className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}