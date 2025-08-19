// app/terms/page.tsx

import { Metadata } from 'next'
import Link from 'next/link'
import { 
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Terms of Service - ItWhip | Luxury Hotel Transportation Platform',
  description: 'Terms of Service for ItWhip luxury transportation services. Exclusive rides for premium hotel guests in Phoenix and Scottsdale.',
  keywords: 'ItWhip terms, transportation terms of service, hotel ride terms, Phoenix luxury rides terms',
  openGraph: {
    title: 'Terms of Service - ItWhip',
    description: 'Terms and conditions for using ItWhip luxury transportation services.',
    url: 'https://itwhip.com/terms',
    siteName: 'ItWhip',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://itwhip.com/terms',
  },
}

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using ItWhip services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.

ItWhip is an exclusive transportation service available only to guests of participating hotels ("Partner Hotels"). Use of the Service requires a valid booking code from a Partner Hotel.`
    },
    {
      title: '2. Eligibility and Booking Requirements',
      content: `To use ItWhip services, you must:

• Be at least 18 years of age
• Have a valid reservation at a Partner Hotel
• Possess a valid booking code issued by the Partner Hotel
• Have a valid payment method on file with the Partner Hotel
• Accept responsibility for all charges incurred

The Service is not available to the general public and requires active hotel guest status at a Partner Hotel.`
    },
    {
      title: '3. Service Description',
      content: `ItWhip provides luxury transportation services exclusively for Partner Hotel guests. Services include:

• Point-to-point transportation in luxury vehicles
• Professional, licensed, and insured drivers
• Fixed-rate pricing with no surge charges
• Direct billing to hotel room (where available)
• 24/7 availability in service areas

Service availability, vehicle types, and features may vary by location and Partner Hotel.`
    },
    {
      title: '4. Pricing and Payment',
      content: `All rides are charged at fixed rates as displayed in the app at the time of booking. Prices include:

• Base fare for the requested route
• All applicable taxes and fees
• Standard gratuity (20%)
• Airport fees where applicable

Additional charges may apply for:
• Extra stops (beyond origin and destination)
• Extended wait time (beyond 15 minutes)
• Cancellations (see Cancellation Policy)
• Special requests or premium services

Payment is processed through your Partner Hotel or directly via the payment method on file.`
    },
    {
      title: '5. Cancellation Policy',
      content: `Rides may be cancelled up to 5 minutes after booking without charge. After 5 minutes:

• Standard rides: $10 cancellation fee
• Luxury/Premium rides: $25 cancellation fee
• Airport rides: $35 cancellation fee if driver has departed

No-show fees apply if you fail to appear within 15 minutes of the scheduled pickup time.`
    },
    {
      title: '6. Code of Conduct',
      content: `Users agree to:

• Treat drivers and vehicles with respect
• Wear seatbelts at all times
• Refrain from smoking, vaping, or drug use in vehicles
• Maintain appropriate behavior and language
• Not transport illegal substances or weapons
• Not exceed vehicle capacity limits
• Clean up any mess or damage caused

Violation of these rules may result in immediate termination of service and additional charges.`
    },
    {
      title: '7. Liability and Insurance',
      content: `ItWhip maintains comprehensive insurance coverage for all rides. However, ItWhip's liability is limited to:

• Direct damages caused by our negligence
• The maximum extent permitted by law
• The amount of insurance coverage available

ItWhip is not liable for:
• Items left in vehicles
• Delays due to traffic or weather
• Consequential or indirect damages
• Acts of God or force majeure events`
    },
    {
      title: '8. Privacy and Data Use',
      content: `By using the Service, you consent to the collection and use of your information as described in our Privacy Policy. We collect:

• Booking and ride history
• Location data during rides
• Communication with drivers and support
• Payment and billing information

This data is used to provide services, ensure safety, and improve the platform. We do not sell personal data to third parties.`
    },
    {
      title: '9. Intellectual Property',
      content: `All content, features, and functionality of the ItWhip platform are owned by ItWhip Technologies, Inc. and are protected by international copyright, trademark, and other intellectual property laws.

You may not:
• Copy, modify, or distribute our software
• Use our trademarks without permission
• Reverse engineer our technology
• Scrape or data mine our platform`
    },
    {
      title: '10. Dispute Resolution',
      content: `Any disputes arising from these Terms or the Service shall be:

• First attempted to be resolved through good faith negotiation
• If unresolved, submitted to binding arbitration in Phoenix, Arizona
• Governed by the laws of Arizona, United States
• Subject to individual claims only (no class actions)

You have 30 days from the date of a dispute to initiate resolution procedures.`
    },
    {
      title: '11. Modifications to Service and Terms',
      content: `ItWhip reserves the right to:

• Modify or discontinue the Service at any time
• Update these Terms with 30 days notice
• Change pricing with reasonable notice
• Alter service areas and availability

Continued use of the Service after changes constitutes acceptance of modified Terms.`
    },
    {
      title: '12. Contact Information',
      content: `For questions about these Terms, please contact:

ItWhip Technologies, Inc.
2390 E Camelback Rd
Phoenix, AZ 85016

Email: legal@itwhip.com
Phone: (480) 555-0100

Last Updated: January 15, 2025
Effective Date: January 1, 2025`
    }
  ]

  return (
    <>
      {/* JSON-LD Schema for Terms of Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Terms and conditions for using ItWhip luxury transportation services",
            "url": "https://itwhip.com/terms",
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
              "url": "https://itwhip.com"
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
                <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">Terms of Service</span>
              </Link>
              
              <Link href="/" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-amber-700 transition">
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                <IoShieldCheckmarkOutline className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Terms of Service
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Last Updated: January 15, 2025 • Effective Date: January 1, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <IoInformationCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-amber-900 dark:text-amber-300 mb-2">
                    Important: Exclusive Service for Hotel Guests
                  </h2>
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    ItWhip is an exclusive transportation service available only to guests of participating 
                    Partner Hotels. A valid booking code from your hotel reservation is required to access 
                    our services. This is not a public transportation service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-6 sm:py-8 lg:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {sections.map((section, idx) => (
                  <div key={idx} className="border-b border-gray-200 dark:border-gray-800 last:border-0 pb-6 sm:pb-8 last:pb-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      {section.title}
                    </h2>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Agreement Section */}
        <section className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                By Using ItWhip, You Agree to These Terms
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                Your use of our services constitutes acceptance of these Terms of Service and our Privacy Policy. 
                If you do not agree with these terms, please do not use our services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium text-sm sm:text-base">
                  View Privacy Policy →
                </Link>
                <Link href="/contact" className="text-amber-600 hover:text-amber-700 font-medium text-sm sm:text-base">
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. All rights reserved.</p>
              <p className="mt-2">2390 E Camelback Rd, Phoenix, AZ 85016</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
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