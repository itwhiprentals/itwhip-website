// app/esg-dashboard/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoLeafOutline,
  IoAnalyticsOutline,
  IoCheckmarkCircle,
  IoCarOutline,
  IoFlashOutline,
  IoWaterOutline,
  IoGlobeOutline,
  IoTrendingUpOutline,
  IoRibbonOutline,
  IoArrowForwardOutline,
  IoSpeedometerOutline,
  IoStarOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'ESG Car Rental Arizona | Sustainable Car Sharing Phoenix | ItWhip',
  description: 'Arizona\'s first ESG-focused car rental platform. Track carbon savings, rent eco-friendly vehicles, and earn sustainability badges. Electric vehicles, hybrid cars, and green transportation in Phoenix, Scottsdale, Tempe.',
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
    images: [
      {
        url: 'https://itwhip.com/og-esg-dashboard.jpg',
        width: 1200,
        height: 630,
        alt: 'ItWhip ESG Car Rental Dashboard - Sustainable Car Sharing in Arizona'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESG Car Rental Arizona | ItWhip',
    description: 'Track your environmental impact with every rental. Arizona\'s sustainable P2P car sharing platform.',
  },
  alternates: {
    canonical: 'https://itwhip.com/esg-dashboard',
  },
}

export default function ESGDashboardPage() {
  const impactMetrics = [
    {
      icon: IoLeafOutline,
      title: 'Carbon Footprint',
      description: 'Track CO2 emissions saved by sharing vehicles instead of individual ownership.',
      stat: 'Avg 2.4 tons/year saved'
    },
    {
      icon: IoCarOutline,
      title: 'Vehicle Utilization',
      description: 'Maximize the use of existing vehicles instead of manufacturing new ones.',
      stat: '3x higher utilization'
    },
    {
      icon: IoFlashOutline,
      title: 'EV Priority',
      description: 'Electric vehicles get premium placement and earn bonus ESG points.',
      stat: '+25 ESG points for EVs'
    },
    {
      icon: IoWaterOutline,
      title: 'Resource Efficiency',
      description: 'Fewer cars on the road means less resource consumption overall.',
      stat: '40% less parking needed'
    }
  ]

  const scoreFactors = [
    { factor: 'Electric/Hybrid Vehicle', points: '+25', description: 'Zero or low emissions' },
    { factor: 'Fuel Efficiency (35+ MPG)', points: '+15', description: 'Above average efficiency' },
    { factor: 'Regular Maintenance', points: '+20', description: 'Well-maintained vehicles pollute less' },
    { factor: 'High Utilization Rate', points: '+15', description: 'More sharing = more impact' },
    { factor: 'Clean Interior (No Smoking)', points: '+10', description: 'Healthier for guests' },
    { factor: 'Local Host', points: '+10', description: 'Reduces transport emissions' },
    { factor: 'Newer Vehicle (2020+)', points: '+5', description: 'Better emissions standards' }
  ]

  const tiers = [
    { name: 'Bronze', range: '0-49', color: 'text-amber-700', bg: 'bg-amber-100' },
    { name: 'Silver', range: '50-74', color: 'text-gray-600', bg: 'bg-gray-200' },
    { name: 'Gold', range: '75-89', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Platinum', range: '90-100', color: 'text-emerald-600', bg: 'bg-emerald-100' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <IoLeafOutline className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">ESG Car Rental Arizona</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Sustainable Car Sharing in Phoenix
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Arizona's first ESG-focused P2P car rental. Track your environmental impact, rent eco-friendly vehicles, and earn sustainability badges.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/list-your-car"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                List Your Car →
              </Link>
              <Link 
                href="/host-benefits"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-green-600 rounded-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition"
              >
                View All Benefits
              </Link>
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
              How Car Sharing Helps the Environment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {impactMetrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <metric.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {metric.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {metric.description}
                      </p>
                      <span className="text-sm font-bold text-green-600">{metric.stat}</span>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
              How Your ESG Score is Calculated
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Your ESG Impact Score (0-100) reflects your vehicle's environmental and social contribution.
            </p>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Factor</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Points</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Why It Matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {scoreFactors.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.factor}</td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-green-600">{item.points}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Score Tiers */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
              ESG Score Tiers
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tiers.map((tier, idx) => (
                <div key={idx} className={`${tier.bg} dark:bg-gray-800 rounded-xl p-6 text-center`}>
                  <IoRibbonOutline className={`w-10 h-10 ${tier.color} mx-auto mb-3`} />
                  <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tier.range} points</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Higher ESG scores get priority placement in search results and featured listings.
            </p>
          </div>
        </section>

        {/* Integration with Mileage Forensics */}
        <section className="py-12 bg-purple-50 dark:bg-purple-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <IoSpeedometerOutline className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-2">
                  Powered by Mileage Forensics™
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ESG scores are verified using our GPS + OBD-II tracking system. Real trip data ensures accurate 
                  carbon calculations and prevents greenwashing. Every mile is accounted for.
                </p>
                <Link 
                  href="/mileage-forensics"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-purple-700 dark:text-purple-400 font-medium hover:underline"
                >
                  How Mileage Forensics works
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-green-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Make an Impact While You Earn
            </h2>
            <p className="text-lg text-green-100 mb-6">
              List your car and track your environmental contribution in real-time.
            </p>
            <Link 
              href="/list-your-car"
              className="inline-block px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition shadow-lg"
            >
              List Your Car →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}