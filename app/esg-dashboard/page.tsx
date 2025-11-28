// app/esg-dashboard/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoLeafOutline,
  IoCarOutline,
  IoFlashOutline,
  IoWaterOutline,
  IoRibbonOutline,
  IoArrowForwardOutline,
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoDocumentTextOutline,
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoStarOutline
} from 'react-icons/io5'

// FAQ Schema
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is ESG car rental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ESG car rental tracks Environmental (carbon emissions, fuel efficiency), Social (safety features, accessibility), and Governance (compliance, transparency) impact of vehicle rentals. ItWhip is Arizona\'s first P2P platform to offer comprehensive ESG scoring and reporting.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I improve my ESG score on ItWhip?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'List electric or hybrid vehicles (+25 points), maintain regular service records (+20 points), achieve high fuel efficiency of 35+ MPG (+15 points), maintain a clean non-smoking interior (+10 points), and keep your vehicle well-utilized through frequent rentals (+15 points).'
      }
    },
    {
      '@type': 'Question',
      name: 'What are the ESG score tiers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ItWhip has four ESG tiers: Bronze (0-49 points), Silver (50-74 points), Gold (75-89 points), and Platinum (90-100 points). Vehicles scoring 85+ earn the Eco Elite badge and receive priority placement in search results.'
      }
    },
    {
      '@type': 'Question',
      name: 'Does ItWhip support corporate ESG compliance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, ItWhip provides CSRD (EU Corporate Sustainability Reporting Directive) and SEC climate disclosure compliant reporting. Corporate accounts receive quarterly ESG reports and per-booking carbon certificates for sustainability documentation.'
      }
    }
  ]
}

// Article Schema
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'ESG Car Rental Arizona - Sustainable Car Sharing in Phoenix',
  description: 'Arizona\'s first ESG-focused car rental platform. Track carbon savings, rent eco-friendly vehicles, and earn sustainability badges.',
  author: { '@type': 'Organization', name: 'ItWhip' },
  publisher: { '@type': 'Organization', name: 'ItWhip', url: 'https://itwhip.com' },
  datePublished: '2025-01-01',
  dateModified: '2025-11-28',
  mainEntityOfPage: 'https://itwhip.com/esg-dashboard'
}

export const metadata: Metadata = {
  title: 'ESG Car Rental Arizona | Sustainable Car Sharing Phoenix, Scottsdale, Tempe | ItWhip',
  description: 'Arizona\'s first ESG-focused car rental platform. Track carbon savings, rent eco-friendly vehicles in Phoenix, Scottsdale, and Tempe. Electric vehicles, hybrid cars, sustainability badges, and CSRD-compliant reporting for corporate travel.',
  keywords: [
    'ESG car rental Arizona',
    'ESG car rental Arizona 2025',
    'sustainable car rental Phoenix',
    'eco-friendly car sharing Arizona',
    'green car rental Phoenix',
    'electric vehicle rental Arizona',
    'carbon neutral car rental',
    'sustainable transportation Phoenix',
    'hybrid car rental Scottsdale',
    'environmental car sharing',
    'green mobility Arizona'
  ],
  openGraph: {
    title: 'ESG Car Rental Arizona | Sustainable Car Sharing',
    description: 'Arizona\'s first ESG-focused P2P car rental. Track your carbon savings, rent EVs, earn sustainability badges.',
    url: 'https://itwhip.com/esg-dashboard',
    siteName: 'ItWhip',
    type: 'website',
    images: [{ url: 'https://itwhip.com/og/esg-dashboard.png', width: 1200, height: 630, alt: 'ItWhip ESG Car Rental Dashboard' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESG Car Rental Arizona | ItWhip',
    description: 'Track your environmental impact with every rental. Arizona\'s sustainable P2P car sharing platform.',
  },
  alternates: { canonical: 'https://itwhip.com/esg-dashboard' },
}

export default function ESGDashboardPage() {
  const impactMetrics = [
    { icon: IoLeafOutline, title: 'Carbon Footprint Tracking', description: 'Track CO2 emissions saved by sharing vehicles instead of individual ownership. Every trip calculates real environmental impact.', stat: '2.4 tons', statLabel: 'avg saved/year' },
    { icon: IoCarOutline, title: 'Vehicle Utilization', description: 'Maximize the use of existing vehicles instead of manufacturing new ones. Shared cars reduce overall production demand.', stat: '3x', statLabel: 'higher utilization' },
    { icon: IoFlashOutline, title: 'EV Priority Placement', description: 'Electric vehicles get premium search placement and earn bonus ESG points. Incentivizing clean energy transportation.', stat: '+25', statLabel: 'ESG points for EVs' },
    { icon: IoWaterOutline, title: 'Resource Efficiency', description: 'Fewer cars on the road means less resource consumption, reduced parking needs, and lower urban congestion.', stat: '40%', statLabel: 'less parking needed' }
  ]

  const scoreFactors = [
    { factor: 'Electric/Hybrid Vehicle', points: '+25', description: 'Zero or low emissions', icon: IoFlashOutline },
    { factor: 'Fuel Efficiency (35+ MPG)', points: '+15', description: 'Above average efficiency', icon: IoTrendingUpOutline },
    { factor: 'Regular Maintenance', points: '+20', description: 'Well-maintained vehicles pollute less', icon: IoShieldCheckmarkOutline },
    { factor: 'High Utilization Rate', points: '+15', description: 'More sharing = more impact', icon: IoCarOutline },
    { factor: 'Clean Interior (No Smoking)', points: '+10', description: 'Healthier for guests', icon: IoCheckmarkCircleOutline },
    { factor: 'Local Host', points: '+10', description: 'Reduces transport emissions', icon: IoBusinessOutline },
    { factor: 'Newer Vehicle (2020+)', points: '+5', description: 'Better emissions standards', icon: IoStarOutline }
  ]

  const tiers = [
    { name: 'Bronze', range: '0-49', color: 'text-amber-700 dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
    { name: 'Silver', range: '50-74', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    { name: 'Gold', range: '75-89', color: 'text-yellow-600 dark:text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
    { name: 'Platinum', range: '90-100', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' }
  ]

  const corporateBenefits = [
    { title: 'CSRD Compliance', description: 'EU Corporate Sustainability Reporting ready' },
    { title: 'SEC Climate Rules', description: 'US disclosure requirements supported' },
    { title: 'Quarterly Reports', description: 'Automated ESG reporting for your fleet' },
    { title: 'Per-Booking Certificates', description: 'Individual trip carbon documentation' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* JSON-LD Structured Data - Google reads from body */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-white rounded-full" />
          </div>
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <IoLeafOutline className="w-4 h-4 text-emerald-200" />
              <span className="text-sm font-medium text-white/90">Arizona's First ESG Car Rental Platform</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              ESG Car Sharing in<br className="hidden sm:block" /> Phoenix, Arizona
            </h1>
            
            <p className="text-base sm:text-lg text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Track your environmental impact with every rental in Phoenix, Scottsdale, and Tempe. Rent eco-friendly vehicles, earn sustainability badges, and contribute to a greener Arizona.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/list-your-car" className="w-full sm:w-auto px-6 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                List Your Car
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
              <Link href="/" className="w-full sm:w-auto px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/30 hover:bg-white/20 transition-colors">
                Browse Green Vehicles
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">85+</div>
                <div className="text-xs sm:text-sm text-emerald-200">Eco Vehicles</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-white">2.4T</div>
                <div className="text-xs sm:text-sm text-emerald-200">CO2 Saved/Year</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                <div className="text-xs sm:text-sm text-emerald-200">Trip Tracking</div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">How Car Sharing Helps the Environment</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Every shared ride reduces the need for new vehicles and lowers overall emissions</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {impactMetrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                      <metric.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{metric.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{metric.description}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{metric.stat}</span>
                        <span className="text-xs text-gray-500">{metric.statLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESG Score Breakdown */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">How Your ESG Score is Calculated</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Your ESG Impact Score (0-100) reflects your vehicle's environmental and social contribution</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Factor</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Points</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Why It Matters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {scoreFactors.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <item.icon className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-gray-800 dark:text-gray-200">{item.factor}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-lg">{item.points}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {scoreFactors.map((item, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.factor}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-lg">{item.points}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Score Tiers */}
        <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">ESG Score Tiers</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Higher scores get priority placement in search results</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tiers.map((tier, idx) => (
                <div key={idx} className={`${tier.bg} ${tier.border} border rounded-lg p-5 text-center hover:scale-105 transition-transform`}>
                  <IoRibbonOutline className={`w-8 h-8 ${tier.color} mx-auto mb-2`} />
                  <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{tier.range} points</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Eco Elite Badge</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Vehicles scoring 85+ earn the "Eco Elite" badge, displayed prominently on listings to help eco-conscious guests find green options.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate ESG Benefits */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <IoBusinessOutline className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">For Corporate Travel</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Enterprise ESG Compliance</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Meet regulatory requirements with verified sustainability data for every business trip</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {corporateBenefits.map((benefit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800 text-center">
                  <IoDocumentTextOutline className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/corporate" className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Learn about corporate accounts
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Integration with Mileage Forensics */}
        <section className="py-10 bg-purple-50 dark:bg-purple-900/20 border-y border-purple-200 dark:border-purple-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                <IoSpeedometerOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">Powered by Mileage Forensics™</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">ESG scores are verified using our proprietary tracking system. Real trip data ensures accurate carbon calculations and prevents greenwashing. Every mile is accounted for and independently verifiable.</p>
                <Link href="/mileage-forensics" className="inline-flex items-center gap-1.5 mt-3 text-sm text-purple-700 dark:text-purple-400 font-medium hover:underline">
                  Learn how Mileage Forensics works
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoLeafOutline className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Make an Impact While You Earn</h2>
            <p className="text-base text-emerald-100 mb-6 max-w-xl mx-auto">List your car and track your environmental contribution in real-time. Join Arizona's greenest car sharing community.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/list-your-car" className="w-full sm:w-auto px-8 py-3 bg-white text-emerald-700 rounded-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg">List Your Car →</Link>
              <Link href="/host-benefits" className="w-full sm:w-auto px-8 py-3 bg-transparent text-white rounded-lg font-semibold border-2 border-white/50 hover:bg-white/10 transition-colors">View Host Benefits</Link>
            </div>
          </div>
        </section>

        {/* Related Content */}
        <section className="py-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Related Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/blog/esg-car-sharing" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Blog</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">ESG Car Sharing Guide →</p>
              </Link>
              <Link href="/blog/p2p-insurance-tiers" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Blog</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">P2P Insurance Tiers Explained →</p>
              </Link>
              <Link href="/insurance-guide" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Guide</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Full Insurance Guide →</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}