// app/privacy/page.tsx

import { Metadata } from 'next'
import Link from 'next/link'
import { 
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoEyeOutline,
  IoDocumentTextOutline,
  IoGlobeOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoWarningOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Privacy Policy - ItWhip | Your Data, Protected',
  description: 'Privacy Policy for ItWhip luxury transportation platform. Learn how we protect your data and respect your privacy as a premium hotel guest.',
  keywords: 'ItWhip privacy policy, data protection, hotel guest privacy, transportation app privacy',
  openGraph: {
    title: 'Privacy Policy - ItWhip',
    description: 'How ItWhip protects your privacy and handles your data.',
    url: 'https://itwhip.com/privacy',
    siteName: 'ItWhip',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://itwhip.com/privacy',
  },
}

export default function PrivacyPage() {
  const dataTypes = [
    {
      icon: IoPhonePortraitOutline,
      title: 'Account Information',
      items: ['Name and contact details', 'Hotel reservation details', 'Booking confirmation codes', 'Payment methods']
    },
    {
      icon: IoLocationOutline,
      title: 'Location Data',
      items: ['Pickup and dropoff locations', 'GPS data during rides', 'Hotel property locations', 'Frequently visited places']
    },
    {
      icon: IoDocumentTextOutline,
      title: 'Usage Information',
      items: ['Ride history and preferences', 'App interactions', 'Communication with drivers', 'Service feedback and ratings']
    },
    {
      icon: IoGlobeOutline,
      title: 'Device Information',
      items: ['Device type and OS', 'IP address', 'App version', 'Browser information']
    }
  ]

  const purposes = [
    {
      title: 'Service Delivery',
      description: 'To provide transportation services, process payments, and coordinate with Partner Hotels'
    },
    {
      title: 'Safety & Security',
      description: 'To ensure rider and driver safety, prevent fraud, and maintain service integrity'
    },
    {
      title: 'Communication',
      description: 'To send ride confirmations, updates, and important service notifications'
    },
    {
      title: 'Improvement',
      description: 'To enhance our services, develop new features, and optimize the user experience'
    },
    {
      title: 'Legal Compliance',
      description: 'To comply with applicable laws, regulations, and legal processes'
    }
  ]

  const rights = [
    {
      icon: IoEyeOutline,
      title: 'Access Your Data',
      description: 'Request a copy of all personal information we have about you'
    },
    {
      icon: IoDocumentTextOutline,
      title: 'Correct Information',
      description: 'Update or correct any inaccurate personal data'
    },
    {
      icon: IoWarningOutline,
      title: 'Delete Your Data',
      description: 'Request deletion of your personal information, subject to legal requirements'
    },
    {
      icon: IoMailOutline,
      title: 'Opt-Out',
      description: 'Unsubscribe from marketing communications at any time'
    }
  ]

  return (
    <>
      {/* JSON-LD Schema for Privacy Policy */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "Privacy Policy for ItWhip luxury transportation services",
            "url": "https://itwhip.com/privacy",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "name": "ItWhip",
              "url": "https://itwhip.com"
            },
            "datePublished": "2025-01-01",
            "dateModified": "2025-01-15",
            "publisher": {
              "@type": "Organization",
              "name": "ItWhip Technologies, Inc.",
              "url": "https://itwhip.com",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-480-555-0100",
                "contactType": "customer service",
                "email": "privacy@itwhip.com",
                "areaServed": "US",
                "availableLanguage": "English"
              }
            }
          })
        }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <IoLockClosedOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">Privacy Policy</span>
              </Link>
              
              <Link href="/" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-amber-700 transition">
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <IoShieldCheckmarkOutline className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Your Privacy Matters
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                At ItWhip, we're committed to protecting your privacy and ensuring your personal 
                information is handled with the utmost care and security.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-4">
                Last Updated: January 15, 2025 • Effective Date: January 1, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Key Points Summary */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-300 mb-2">
                    Our Privacy Commitment
                  </h2>
                  <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
                    <li>• We never sell your personal data to third parties</li>
                    <li>• Data shared with Partner Hotels only for service delivery</li>
                    <li>• You can request data deletion at any time</li>
                    <li>• Strong encryption protects all sensitive information</li>
                    <li>• Compliance with GDPR and CCPA regulations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Collection Section */}
        <section className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We collect only the information necessary to provide you with exceptional transportation services
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {dataTypes.map((type, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                      <type.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {type.title}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {type.items.map((item, iidx) => (
                      <li key={iidx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Use Data */}
        <section className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              How We Use Your Information
            </h2>
            
            <div className="space-y-4">
              {purposes.map((purpose, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                      {purpose.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {purpose.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Who We Share Data With
            </h2>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <IoBusinessOutline className="w-5 h-5 text-amber-600 mr-2" />
                    Partner Hotels
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We share ride information with your Partner Hotel for billing, service coordination, 
                    and to enhance your overall guest experience. This includes pickup/dropoff times, 
                    ride costs, and service feedback.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <IoCarSportOutline className="w-5 h-5 text-amber-600 mr-2" />
                    Professional Drivers
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drivers receive only the information necessary to provide service: your name, 
                    pickup/dropoff locations, and any special requests. Phone numbers are masked 
                    through our platform.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-amber-600 mr-2" />
                    Service Providers
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Carefully selected vendors help us with payment processing, data storage, 
                    customer support, and analytics. All are bound by strict confidentiality agreements.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <IoWarningOutline className="w-5 h-5 text-amber-600 mr-2" />
                    Legal Requirements
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We may disclose information if required by law, court order, or to protect 
                    the safety and security of our users and services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Your Privacy Rights
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {rights.map((right, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-3">
                    <right.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                    {right.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {right.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                To exercise any of these rights, please contact our Privacy Team:
              </p>
              <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <a href="mailto:privacy@itwhip.com" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                  privacy@itwhip.com
                </a>
                <span className="hidden sm:inline text-gray-400">•</span>
                <a href="tel:+14805550100" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                  (480) 555-0100
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoLockClosedOutline className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Data Security Measures
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>256-bit SSL encryption for all data transmission</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>PCI DSS compliance for payment processing</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Regular security audits and penetration testing</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Strict access controls and employee training</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Data minimization and retention policies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies Section */}
        <section className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Cookies and Tracking
            </h2>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-900 dark:text-amber-300 mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-400">
                <li>• Remember your preferences and settings</li>
                <li>• Authenticate your account and maintain security</li>
                <li>• Analyze service usage and improve performance</li>
                <li>• Provide personalized experiences</li>
              </ul>
              <p className="text-sm text-amber-900 dark:text-amber-300 mt-4">
                You can control cookies through your browser settings. Note that disabling cookies 
                may affect service functionality.
              </p>
            </div>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Children's Privacy
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                ItWhip services are not intended for children under 18. We do not knowingly collect 
                personal information from minors. If you believe we have inadvertently collected 
                information from a child, please contact us immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Updates Section */}
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Policy Updates
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                We may update this Privacy Policy periodically. We'll notify you of significant 
                changes via email or app notification. Continued use of our services after updates 
                constitutes acceptance of the revised policy.
              </p>
              <div className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <IoInformationCircleOutline className="w-4 h-4" />
                <span>This policy was last updated on January 15, 2025</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 sm:py-12 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Questions About Privacy?
            </h2>
            <p className="text-amber-100 mb-6 text-sm sm:text-base">
              Our Privacy Team is here to help with any concerns or questions
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a href="mailto:privacy@itwhip.com" className="px-6 py-3 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition">
                Email Privacy Team
              </a>
              <a href="tel:+14805550100" className="px-6 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition">
                Call (480) 555-0100
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. All rights reserved.</p>
              <p className="mt-2">2390 E Camelback Rd, Phoenix, AZ 85016</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/about" className="hover:text-gray-700 dark:hover:text-gray-300">About</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
                <Link href="/legal" className="hover:text-gray-700 dark:hover:text-gray-300">Legal</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}