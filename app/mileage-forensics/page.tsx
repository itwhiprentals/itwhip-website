// app/mileage-forensics/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoAnalyticsOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoCarOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Mileage Forensics™ | GPS-Verified Trip Tracking | ITWhip Arizona',
  description: 'Fraud-proof mileage tracking for P2P car sharing. GPS + OBD-II verified trips protect hosts, guests, and insurance rates. Arizona\'s most transparent car sharing platform.',
  keywords: 'mileage tracking car sharing, GPS verified trips, fraud prevention car rental, OBD tracking rental car, P2P car sharing protection, Arizona car sharing mileage',
  openGraph: {
    title: 'Mileage Forensics™ | ITWhip',
    description: 'GPS + OBD-II verified trip data. Fraud-proof tracking that protects everyone.',
    url: 'https://itwhip.com/mileage-forensics',
    siteName: 'ITWhip',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itwhip.com/mileage-forensics',
  },
}

export default function MileageForensicsPage() {
  const features = [
    {
      icon: IoLocationOutline,
      title: 'GPS-Verified Trips',
      description: 'Every trip tracked with precise GPS coordinates. Know exactly where your vehicle travels.'
    },
    {
      icon: IoSpeedometerOutline,
      title: 'OBD-II Integration',
      description: 'Direct vehicle data capture for accurate odometer readings. No manual entry errors.'
    },
    {
      icon: IoTimeOutline,
      title: 'Real-Time Monitoring',
      description: 'Live trip status updates. See when rentals start, end, and everything in between.'
    },
    {
      icon: IoDocumentTextOutline,
      title: 'Insurance Integrity Reports',
      description: 'Verified usage data for claims. Insurers trust our forensic-grade documentation.'
    },
    {
      icon: IoAlertCircleOutline,
      title: 'Anomaly Detection',
      description: 'Automatic flagging of unusual patterns. Catch issues before they become problems.'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Dispute Resolution',
      description: 'Objective data eliminates he-said-she-said. Facts settle disputes instantly.'
    }
  ]

  const benefits = [
    { label: 'For Hosts', items: ['Protect your vehicle value', 'Verify guest compliance', 'Lower insurance rates', 'Audit-ready records'] },
    { label: 'For Guests', items: ['Clear trip documentation', 'No false damage claims', 'Transparent billing', 'Peace of mind'] },
    { label: 'For Insurers', items: ['Verified usage data', 'Fraud prevention', 'Accurate risk assessment', 'Faster claims processing'] }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <IoSpeedometerOutline className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Proprietary Technology</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Mileage Forensics™
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              GPS + OBD-II verified trip data that eliminates disputes and protects your insurance rates. 100% fraud-proof.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/list-your-car"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                List Your Car →
              </Link>
              <Link 
                href="/insurance-guide"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition"
              >
                Insurance Guide
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
              How Mileage Forensics™ Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <feature.icon className="w-10 h-10 text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
              Who Benefits from Mileage Forensics™
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((group, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-purple-600 mb-4">{group.label}</h3>
                  <ul className="space-y-3">
                    {group.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-12 bg-amber-50 dark:bg-amber-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <IoDocumentTextOutline className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">
                  Arizona P2P Compliant (A.R.S. § 28-9601–9613)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mileage Forensics™ meets all record-keeping requirements under Arizona's peer-to-peer car sharing legislation. 
                  Trip data is retained for 6+ years per A.R.S. § 28-9605, available for insurance claims and audits.
                </p>
                <Link 
                  href="/legal"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
                >
                  Full Arizona law text
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to List with Confidence?
            </h2>
            <p className="text-lg text-purple-100 mb-6">
              Every rental on ITWhip includes Mileage Forensics™ protection at no extra cost.
            </p>
            <Link 
              href="/list-your-car"
              className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
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