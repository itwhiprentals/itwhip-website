// app/support/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoHelpCircleOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCallOutline,
  IoMailOutline,
  IoChatbubblesOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoPersonOutline,
  IoWarningOutline,
  IoCardOutline,
  IoTimeOutline,
  IoKeyOutline,
  IoConstructOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Support Center | Help & FAQs | ItWhip',
  description: 'Get help with your ItWhip car rental. Find answers to FAQs, contact support, learn about our damage process, insurance, and policies.',
  keywords: [
    'itwhip support',
    'car rental help',
    'rental car faq',
    'damage claim',
    'insurance coverage',
    'contact itwhip'
  ],
  openGraph: {
    title: 'Support Center | ItWhip',
    description: 'Get help with your ItWhip car rental. FAQs, damage claims, insurance info, and 24/7 support.',
    url: 'https://itwhip.com/support',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/support',
  },
}

const SUPPORT_CATEGORIES = [
  {
    icon: IoCarOutline,
    title: 'Booking & Rentals',
    description: 'How to book, modify, or cancel your rental',
    links: [
      { label: 'How to book a car', href: '#booking' },
      { label: 'Modify a reservation', href: '#modify' },
      { label: 'Cancellation policy', href: '/cancellation-policy' },
    ]
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Insurance & Protection',
    description: 'Coverage options and claims process',
    links: [
      { label: 'Insurance coverage explained', href: '#insurance' },
      { label: 'Damage process', href: '/support/damage-process' },
      { label: 'File a claim', href: '#claims' },
    ]
  },
  {
    icon: IoPersonOutline,
    title: 'Account & Verification',
    description: 'Profile setup, verification, and payments',
    links: [
      { label: 'Account verification', href: '#verification' },
      { label: 'Payment methods', href: '#payments' },
      { label: 'Update profile', href: '/portal/dashboard' },
    ]
  },
  {
    icon: IoKeyOutline,
    title: 'During Your Trip',
    description: 'Help during your rental period',
    links: [
      { label: 'Vehicle issues', href: '#vehicle-issues' },
      { label: 'Roadside assistance', href: '#roadside' },
      { label: 'Extend your rental', href: '#extend' },
    ]
  }
]

const FAQS = [
  {
    question: 'How does ItWhip work?',
    answer: 'ItWhip is a peer-to-peer car rental platform. Local car owners list their vehicles, and you can rent directly from them. All rentals include $1M liability insurance, and our platform handles payments, verification, and support.'
  },
  {
    question: 'What insurance is included?',
    answer: 'Every ItWhip rental includes $1M liability coverage. Hosts can also offer additional comprehensive and collision protection. You can bring your own insurance for a 50% security deposit discount.'
  },
  {
    question: 'What are the requirements to rent?',
    answer: 'You must be 21+ years old (25+ for some vehicles), have a valid driver\'s license, clean driving record, and a verified payment method. International licenses are accepted with proper documentation.'
  },
  {
    question: 'How does pickup/delivery work?',
    answer: 'Many hosts offer free delivery to airports, hotels, and homes. During booking, you\'ll coordinate the pickup location with your host. Some hosts require you to pick up at their location.'
  },
  {
    question: 'What if there\'s damage to the vehicle?',
    answer: 'Report any damage immediately through the app. Take photos before and after your trip. Our damage process protects both guests and hosts with fair resolution. See our detailed damage process page.'
  },
  {
    question: 'How do I cancel a reservation?',
    answer: 'You can cancel through the app or website. Refund amounts depend on when you cancel - full refund up to 24 hours before, partial refund within 24 hours. See our cancellation policy for details.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover). Debit cards are accepted for verified users. We do not accept cash, prepaid cards, or PayPal at this time.'
  },
  {
    question: 'Is there a mileage limit?',
    answer: 'Mileage limits vary by host and are clearly shown on each listing. Most offer 150-250 miles per day. Additional miles are charged at the rate specified in the listing.'
  }
]

export default function SupportPage() {
  // JSON-LD for FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-500 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                How can we help?
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Find answers to common questions or get in touch with our support team.
              </p>

              {/* Quick Contact */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:support@itwhip.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <IoMailOutline className="w-5 h-5" />
                  support@itwhip.com
                </a>
                <a
                  href="tel:+14805550100"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <IoCallOutline className="w-5 h-5" />
                  (480) 555-0100
                </a>
              </div>
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
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Support
              </li>
            </ol>
          </nav>
        </div>

        {/* Support Categories */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Browse by Topic
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SUPPORT_CATEGORIES.map((category) => (
                <div
                  key={category.title}
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <category.icon className="w-8 h-8 text-amber-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {category.description}
                  </p>
                  <ul className="space-y-1">
                    {category.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                          {link.label}
                          <IoChevronForwardOutline className="w-3 h-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-6 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Popular Help Topics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/support/damage-process"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoWarningOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    Damage Process
                  </span>
                  <p className="text-xs text-gray-500">Report & resolve</p>
                </div>
              </Link>
              <Link
                href="/cancellation-policy"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoTimeOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    Cancellation
                  </span>
                  <p className="text-xs text-gray-500">Refund policy</p>
                </div>
              </Link>
              <Link
                href="/insurance-guide"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoShieldCheckmarkOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    Insurance Guide
                  </span>
                  <p className="text-xs text-gray-500">Coverage details</p>
                </div>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
              >
                <IoChatbubblesOutline className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600">
                    Contact Us
                  </span>
                  <p className="text-xs text-gray-500">Get in touch</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoHelpCircleOutline className="w-6 h-6 text-amber-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Still need help?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our support team is available 24/7 to assist you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                <IoMailOutline className="w-5 h-5" />
                Contact Support
              </Link>
              <a
                href="tel:+14805550100"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
              >
                <IoCallOutline className="w-5 h-5" />
                Call (480) 555-0100
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
