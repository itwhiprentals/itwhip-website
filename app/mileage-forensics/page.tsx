// app/mileage-forensics/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoCarOutline,
  IoArrowForwardOutline,
  IoAnalyticsOutline,
  IoLockClosedOutline,
  IoCloudUploadOutline,
  IoCheckmarkCircleOutline,
  IoBusinessOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Mileage Forensics™ | GPS-Verified Trip Tracking Phoenix, Scottsdale | ItWhip Arizona',
  description: 'Fraud-proof mileage tracking for P2P car sharing in Phoenix, Scottsdale, and Tempe. GPS + OBD-II verified trips protect hosts, guests, and insurance rates. Arizona\'s most transparent car sharing platform.',
  keywords: [
    'mileage tracking car sharing',
    'GPS verified trips Phoenix',
    'fraud prevention car rental Arizona',
    'OBD tracking rental car',
    'P2P car sharing protection',
    'Arizona car sharing mileage',
    'car rental mileage verification',
    'trip tracking Phoenix',
    'vehicle tracking Scottsdale'
  ],
  openGraph: {
    title: 'Mileage Forensics™ | GPS-Verified Trip Tracking | ItWhip Arizona',
    description: 'GPS + OBD-II verified trip data. Fraud-proof tracking that protects hosts, guests, and insurers in Phoenix, Scottsdale, and Tempe.',
    url: 'https://itwhip.com/mileage-forensics',
    siteName: 'ItWhip',
    type: 'website',
    images: [
      {
        url: 'https://itwhip.com/og/mileage-forensics.png',
        width: 1200,
        height: 630,
        alt: 'ItWhip Mileage Forensics - GPS-Verified Trip Tracking'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mileage Forensics™ | ItWhip Arizona',
    description: 'GPS + OBD-II verified trip data. Fraud-proof tracking for P2P car sharing.',
  },
  alternates: {
    canonical: 'https://itwhip.com/mileage-forensics',
  },
}

export default function MileageForensicsPage() {
  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Mileage Forensics™?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mileage Forensics™ is ItWhip\'s proprietary GPS + OBD-II trip verification system. It tracks every mile driven during rentals with forensic-grade accuracy, eliminating disputes and protecting hosts, guests, and insurance rates.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does GPS trip tracking work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every trip is tracked with precise GPS coordinates and verified against OBD-II odometer data. Trip start/end locations, routes taken, and exact mileage are recorded and stored for 6+ years per Arizona law.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does Mileage Forensics™ prevent fraud?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. By capturing verified trip data from multiple sources (GPS + OBD-II), Mileage Forensics™ eliminates odometer tampering, false mileage claims, and unauthorized usage. Anomaly detection flags suspicious patterns automatically.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is Mileage Forensics™ compliant with Arizona law?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Mileage Forensics™ exceeds all record-keeping requirements under Arizona\'s P2P car sharing legislation (A.R.S. § 28-9601–9613). Trip data is retained for 6+ years and available for insurance claims and audits.'
        }
      }
    ]
  }

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Mileage Forensics™ - GPS-Verified Trip Tracking for P2P Car Sharing',
    description: 'Fraud-proof mileage tracking for peer-to-peer car sharing in Arizona. GPS + OBD-II verified trips protect hosts, guests, and insurance rates.',
    author: {
      '@type': 'Organization',
      name: 'ItWhip'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ItWhip',
      url: 'https://itwhip.com'
    },
    datePublished: '2025-01-01',
    dateModified: '2025-11-27',
    mainEntityOfPage: 'https://itwhip.com/mileage-forensics'
  }

  const features = [
    {
      icon: IoLocationOutline,
      title: 'GPS-Verified Trips',
      description: 'Every trip tracked with precise GPS coordinates. Know exactly where your vehicle travels with route mapping.',
      stat: '99.9%',
      statLabel: 'accuracy'
    },
    {
      icon: IoSpeedometerOutline,
      title: 'OBD-II Integration',
      description: 'Direct vehicle data capture for accurate odometer readings. No manual entry errors or tampering possible.',
      stat: 'Real-time',
      statLabel: 'sync'
    },
    {
      icon: IoTimeOutline,
      title: 'Live Monitoring',
      description: 'Real-time trip status updates. See when rentals start, end, and everything in between.',
      stat: '24/7',
      statLabel: 'tracking'
    },
    {
      icon: IoDocumentTextOutline,
      title: 'Insurance Reports',
      description: 'Verified usage data for claims. Insurers trust our forensic-grade documentation for faster processing.',
      stat: '6+ years',
      statLabel: 'retention'
    },
    {
      icon: IoAlertCircleOutline,
      title: 'Anomaly Detection',
      description: 'AI-powered flagging of unusual patterns. Catch unauthorized usage, speeding, or route deviations instantly.',
      stat: 'Instant',
      statLabel: 'alerts'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Dispute Resolution',
      description: 'Objective data eliminates he-said-she-said. Facts settle disputes instantly with timestamped evidence.',
      stat: '100%',
      statLabel: 'verifiable'
    }
  ]

  const benefits = [
    { 
      label: 'For Hosts', 
      icon: IoCarOutline,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      items: ['Protect your vehicle value', 'Verify guest compliance', 'Lower insurance rates', 'Audit-ready records'] 
    },
    { 
      label: 'For Guests', 
      icon: IoCheckmarkCircleOutline,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      items: ['Clear trip documentation', 'No false damage claims', 'Transparent billing', 'Peace of mind'] 
    },
    { 
      label: 'For Insurers', 
      icon: IoBusinessOutline,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      items: ['Verified usage data', 'Fraud prevention', 'Accurate risk assessment', 'Faster claims processing'] 
    }
  ]

  const howItWorks = [
    { step: '1', title: 'Trip Starts', description: 'GPS + OBD-II capture starting location, odometer, and timestamp' },
    { step: '2', title: 'Route Tracked', description: 'Continuous monitoring records path, speed, and stops' },
    { step: '3', title: 'Trip Ends', description: 'Final readings verified and compared against booking terms' },
    { step: '4', title: 'Report Generated', description: 'Forensic-grade report available for host, guest, and insurers' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* JSON-LD Schema */}
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 py-16 sm:py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 border border-white rounded-full" />
            <div className="absolute bottom-10 left-10 w-60 h-60 border border-white rounded-full" />
            <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-white rounded-full" />
          </div>
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <IoSpeedometerOutline className="w-4 h-4 text-purple-200" />
              <span className="text-sm font-medium text-white/90">Proprietary Technology</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Mileage Forensics™
            </h1>
            
            <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              GPS + OBD-II verified trip data that eliminates disputes and protects insurance rates in Phoenix, Scottsdale, and Tempe. 100% fraud-proof tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/list-your-car"
                className="w-full sm:w-auto px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                List Your Car
                <IoArrowForwardOutline className="w-4 h-4" />
              </Link>
              <Link 
                href="/insurance-guide"
                className="w-full sm:w-auto px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/30 hover:bg-white/20 transition-colors"
              >
                Insurance Guide
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                <div className="text-xs sm:text-sm text-purple-200">Trips Tracked</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-white">6+ yrs</div>
                <div className="text-xs sm:text-sm text-purple-200">Data Retention</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">0</div>
                <div className="text-xs sm:text-sm text-purple-200">Fraud Cases</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Timeline */}
        <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How It Works
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Four steps to forensic-grade trip verification
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {howItWorks.map((item, idx) => (
                <div key={idx} className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                  {idx < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-2 w-4 text-purple-300 dark:text-purple-700">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Forensic-Grade Features
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Every feature designed to protect hosts, guests, and insurers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{feature.stat}</span>
                        <span className="text-xs text-gray-500">{feature.statLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Who Benefits
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Transparent data that protects everyone in the transaction
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benefits.map((group, idx) => (
                <div key={idx} className={`${group.bg} rounded-lg p-5 border border-gray-200 dark:border-gray-800`}>
                  <div className="flex items-center gap-2 mb-4">
                    <group.icon className={`w-5 h-5 ${group.color}`} />
                    <h3 className={`text-base font-bold ${group.color}`}>{group.label}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {group.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="py-10 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <IoLockClosedOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Enterprise-Grade Security
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  All trip data is encrypted at rest and in transit. Access is role-based—hosts see their vehicles, guests see their trips, 
                  and insurers receive only claim-relevant data. SOC 2 compliant infrastructure ensures your data stays protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-10 bg-amber-50 dark:bg-amber-900/20 border-y border-amber-200 dark:border-amber-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                <IoDocumentTextOutline className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-amber-900 dark:text-amber-300 mb-2">
                  Arizona P2P Compliant (A.R.S. § 28-9601–9613)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Mileage Forensics™ exceeds all record-keeping requirements under Arizona's peer-to-peer car sharing legislation. 
                  Trip data is retained for 6+ years per A.R.S. § 28-9605, available for insurance claims, audits, and legal proceedings.
                </p>
                <Link 
                  href="/legal"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
                >
                  View full Arizona law text
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ESG Integration */}
        <section className="py-10 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                <IoAnalyticsOutline className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                  Powers ESG Dashboard
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Mileage Forensics™ data feeds directly into our ESG scoring system. Accurate trip miles enable precise carbon calculations, 
                  verified sustainability reporting, and real environmental impact tracking for corporate compliance.
                </p>
                <Link 
                  href="/esg-dashboard"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                >
                  Explore ESG Dashboard
                  <IoArrowForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related Content */}
        <section className="py-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Related Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link 
                href="/esg-dashboard"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Feature</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">ESG Dashboard →</p>
              </Link>
              <Link 
                href="/insurance-guide"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Guide</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Insurance Guide →</p>
              </Link>
              <Link 
                href="/host-protection"
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
              >
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Protection</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Host Protection →</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoSpeedometerOutline className="w-12 h-12 text-purple-200 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to List with Confidence?
            </h2>
            <p className="text-base text-purple-100 mb-6 max-w-xl mx-auto">
              Every rental on ItWhip includes Mileage Forensics™ protection at no extra cost. Your vehicle, your data, your peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/list-your-car"
                className="w-full sm:w-auto px-8 py-3 bg-white text-purple-700 rounded-lg font-bold hover:bg-purple-50 transition-colors shadow-lg"
              >
                List Your Car →
              </Link>
              <Link 
                href="/host-benefits"
                className="w-full sm:w-auto px-8 py-3 bg-transparent text-white rounded-lg font-semibold border-2 border-white/50 hover:bg-white/10 transition-colors"
              >
                View Host Benefits
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}