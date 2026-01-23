// app/help/identity-verification/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import IDScannerAnimation from '@/app/components/IDScannerAnimation'
import {
  IoShieldCheckmarkOutline,
  IoIdCardOutline,
  IoPersonOutline,
  IoCameraOutline,
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoLockClosedOutline,
  IoHelpCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Identity Verification | How Stripe Identity Works | ItWhip',
  description: 'Learn how ItWhip verifies your identity using Stripe Identity. Secure document verification with driver\'s license and selfie matching for safe rentals.',
  keywords: [
    'identity verification',
    'stripe identity',
    'id verification',
    'driver license verification',
    'selfie verification',
    'itwhip verification'
  ],
  openGraph: {
    title: 'Identity Verification | ItWhip',
    description: 'Learn how ItWhip verifies your identity using Stripe Identity for secure, trusted rentals.',
    url: 'https://itwhip.com/help/identity-verification',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/help/identity-verification',
  },
}

const verificationSteps = [
  {
    step: 1,
    icon: IoIdCardOutline,
    title: 'Upload Your ID',
    description: 'Take a clear photo of your government-issued ID (driver\'s license or passport). Make sure all text is readable and the entire document is visible.',
    tips: ['Use good lighting', 'Avoid glare or shadows', 'Show all 4 corners']
  },
  {
    step: 2,
    icon: IoCameraOutline,
    title: 'Take a Selfie',
    description: 'Capture a live selfie for facial matching. Our system compares your face to the photo on your ID to confirm your identity.',
    tips: ['Face the camera directly', 'Remove glasses/hats', 'Neutral expression']
  },
  {
    step: 3,
    icon: IoCheckmarkCircle,
    title: 'Automatic Verification',
    description: 'Stripe\'s AI-powered system verifies your documents instantly. Most verifications complete within seconds, though some may require manual review.',
    tips: ['Usually instant', 'May take up to 24 hours', 'We\'ll notify you by email']
  }
]

const acceptedDocuments = [
  { name: 'Driver\'s License', description: 'US state-issued driver\'s license (front required)' },
  { name: 'State ID', description: 'US state-issued identification card' },
  { name: 'Passport', description: 'US or international passport (photo page)' },
  { name: 'Passport Card', description: 'US passport card' }
]

const benefits = [
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Secure Platform',
    description: 'Verified users create a safer community for hosts and guests'
  },
  {
    icon: IoLockClosedOutline,
    title: 'Data Protection',
    description: 'Your documents are processed by Stripe, never stored on our servers'
  },
  {
    icon: IoPersonOutline,
    title: 'Trusted Rentals',
    description: 'Hosts know they\'re renting to real, verified individuals'
  }
]

const faqs = [
  {
    question: 'Why do I need to verify my identity?',
    answer: 'Identity verification protects both guests and hosts. It ensures that everyone on the platform is who they say they are, reducing fraud and creating a trusted community.'
  },
  {
    question: 'Is my information secure?',
    answer: 'Yes. Identity verification is powered by Stripe, a PCI-compliant payment processor. Your ID photos are encrypted during transmission and processed securely. ItWhip does not store your ID images.'
  },
  {
    question: 'How long does verification take?',
    answer: 'Most verifications complete within seconds. In rare cases requiring manual review, it may take up to 24 hours. You\'ll receive an email notification when verification is complete.'
  },
  {
    question: 'What if my verification fails?',
    answer: 'Common reasons include blurry photos, expired documents, or mismatched information. You can retry with clearer photos. If issues persist, contact support@itwhip.com for assistance.'
  },
  {
    question: 'Do I need to verify again for each rental?',
    answer: 'No. Once verified, your identity status remains active for all future bookings. You may be asked to re-verify if your ID expires or if there are security concerns.'
  },
  {
    question: 'Can international users verify?',
    answer: 'Yes. Stripe Identity supports passports and ID cards from most countries. International users should use their passport for best results.'
  }
]

export default function IdentityVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-orange-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/support" className="hover:text-orange-600">Help</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">Identity Verification</li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Identity Verification
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Powered by Stripe Identity</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                ItWhip uses <strong>Stripe Identity</strong> to verify all users before they can book a vehicle.
                This secure, industry-standard verification process compares your government-issued ID with
                a live selfie to confirm you are who you say you are. It protects our community of hosts
                and guests by ensuring every rental is with a verified individual.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive ID Scanner Animation */}
        <IDScannerAnimation />

        {/* How It Works */}
        <section className="pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCameraOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                How Verification Works
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Three simple steps to verify your identity</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {verificationSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center relative">
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                          {step.step}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {step.tips.map((tip) => (
                          <span
                            key={tip}
                            className="text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                          >
                            {tip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accepted Documents */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoIdCardOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                Accepted Documents
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Government-issued IDs we accept for verification</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {acceptedDocuments.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{doc.name}</span>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <IoWarningOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">Important</p>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                    Your ID must be valid (not expired) and the name must match your ItWhip account.
                    For rentals, you must also have a valid driver&apos;s license.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why We Verify */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                Why We Verify Identity
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Building trust and safety in our community</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IoHelpCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7 sm:pl-8">Common questions about identity verification</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    <span className="pr-2">{faq.question}</span>
                    <IoChevronForwardOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Stripe Badge */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Identity verification powered by</p>
              <a
                href="https://stripe.com/identity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/stripe-identity-badge.png"
                  alt="Stripe Identity"
                  className="h-24 sm:h-32 md:h-40 mx-auto dark:brightness-0 dark:invert"
                />
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Stripe Identity uses advanced AI and machine learning to verify identities quickly
                and securely, trusted by thousands of businesses worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to get verified?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Complete verification in your account to start booking vehicles.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Get Started
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
