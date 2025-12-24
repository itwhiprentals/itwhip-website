'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoBusinessOutline,
  IoCarOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoLockClosedOutline,
  IoWarningOutline,
  IoHandLeftOutline,
  IoScaleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

export default function PlatformAgreementPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'overview',
      title: '1. PLATFORM OVERVIEW',
      icon: IoBusinessOutline,
      content: `This Platform Agreement ("Agreement") governs your use of the ItWhip peer-to-peer car sharing marketplace. By using our platform, you agree to these terms.

ItWhip Technologies, Inc. ("ItWhip") operates a technology platform that connects vehicle owners ("Hosts") with individuals seeking to rent vehicles ("Guests"). We facilitate transactions but do not own or operate any vehicles listed on our platform.

KEY PLATFORM CHARACTERISTICS:
• ItWhip is a marketplace facilitator, not a rental car company
• All vehicles are independently owned and operated by Hosts
• We provide technology, payment processing, and support services
• Insurance coverage is provided through our partner programs
• We verify identities and facilitate trust between parties`
    },
    {
      id: 'user-responsibilities',
      title: '2. USER RESPONSIBILITIES',
      icon: IoCheckmarkCircle,
      content: `2.1 HOST RESPONSIBILITIES

As a Host on ItWhip, you agree to:
• Maintain your vehicle in safe, roadworthy condition
• Provide accurate vehicle descriptions and photos
• Keep insurance coverage current and compliant
• Respond to booking requests within 24 hours
• Complete pre-trip and post-trip inspections
• Report any incidents or damage promptly
• Comply with all local laws and regulations

2.2 GUEST RESPONSIBILITIES

As a Guest on ItWhip, you agree to:
• Meet all eligibility and verification requirements
• Use vehicles only for lawful purposes
• Return vehicles on time and in original condition
• Report any accidents or damage immediately
• Not allow unauthorized drivers to operate the vehicle
• Follow all mileage and geographic restrictions
• Pay for fuel, tolls, and any incurred charges`
    },
    {
      id: 'booking-terms',
      title: '3. BOOKING TERMS',
      icon: IoTimerOutline,
      content: `3.1 BOOKING PROCESS

All bookings are subject to:
• Host approval (unless Instant Book is enabled)
• Payment authorization and security deposit hold
• Successful identity and driving record verification
• Vehicle availability at time of confirmation

3.2 CANCELLATION POLICY

Standard Cancellation Terms:
• Free cancellation up to 24 hours before trip start
• 50% refund for cancellations 12-24 hours before
• No refund for cancellations less than 12 hours before
• Host cancellations may result in penalties and account review

3.3 TRIP MODIFICATIONS

• Extensions require Host approval and availability
• Early returns may be subject to minimum booking fees
• Location changes must be agreed upon by both parties
• Rate changes may apply for modifications`
    },
    {
      id: 'payments',
      title: '4. PAYMENTS AND FEES',
      icon: IoWalletOutline,
      content: `4.1 GUEST PAYMENTS

Guests are responsible for:
• Daily rental rate set by Host
• Service fees (percentage of booking total)
• Security deposit (refundable if no damage/violations)
• Young driver surcharge (if applicable)
• Additional driver fees
• Mileage overage charges
• Fuel replacement costs
• Cleaning fees (if vehicle returned dirty)
• Toll charges and parking violations

4.2 HOST EARNINGS

Hosts receive:
• 40-90% of rental rate based on insurance tier
• Payment within 3 business days of trip completion
• Direct deposit to linked bank account

4.3 SECURITY DEPOSITS

• Standard deposit: $250-$500 (varies by vehicle)
• Luxury/Exotic vehicles: $1,000-$5,000
• Deposits are authorization holds, not charges
• Released within 3-5 business days if no claims`
    },
    {
      id: 'insurance',
      title: '5. INSURANCE AND PROTECTION',
      icon: IoShieldCheckmarkOutline,
      content: `5.1 COVERAGE TIERS

ItWhip offers tiered protection:

BASIC (Platform Insurance):
• $50,000 liability coverage
• $35,000 property damage
• Guest pays 40% of rental to Host

STANDARD (P2P Insurance):
• $100,000 liability coverage
• $50,000 property damage
• Guest pays 75% of rental to Host

PREMIUM (Commercial Insurance):
• $1,000,000 liability coverage
• $100,000 property damage
• Guest pays 90% of rental to Host

5.2 EXCLUSIONS

Coverage does NOT apply to:
• Intentional damage or misuse
• Driving under influence of drugs/alcohol
• Unauthorized drivers
• Off-road or track use
• Commercial use without disclosure
• Violation of geographic restrictions`
    },
    {
      id: 'liability',
      title: '6. LIABILITY AND DISPUTES',
      icon: IoScaleOutline,
      content: `6.1 LIMITATION OF LIABILITY

ItWhip's liability is limited to:
• The amount of fees paid to ItWhip in the 12 months preceding any claim
• We are not liable for actions of Hosts or Guests
• We are not liable for vehicle defects or accidents
• We are not liable for personal belongings left in vehicles

6.2 DISPUTE RESOLUTION

Disputes between Hosts and Guests:
• First, attempt resolution through ItWhip Support
• Unresolved disputes may be escalated to arbitration
• Class action waiver applies to all users
• Small claims court remains available

6.3 DAMAGE CLAIMS

Process for damage claims:
• Report within 24 hours of trip end
• Provide photos and documentation
• ItWhip reviews and makes determination
• Appeals may be submitted within 7 days`
    },
    {
      id: 'prohibited',
      title: '7. PROHIBITED ACTIVITIES',
      icon: IoWarningOutline,
      content: `The following are strictly prohibited:

VEHICLE USE PROHIBITIONS:
• Street racing or speed competitions
• Rideshare or delivery services (without disclosure)
• Transporting illegal substances
• Towing or pushing other vehicles
• Off-road driving (unless specifically authorized)
• International travel (without prior approval)
• Subleasing or re-renting the vehicle

PLATFORM PROHIBITIONS:
• Creating fake accounts or listings
• Circumventing the platform for bookings
• Harassment of other users
• Posting false or misleading information
• Manipulation of reviews or ratings
• Unauthorized data collection

VIOLATIONS MAY RESULT IN:
• Immediate account suspension
• Forfeiture of security deposit
• Legal action where applicable
• Permanent platform ban`
    },
    {
      id: 'termination',
      title: '8. ACCOUNT TERMINATION',
      icon: IoHandLeftOutline,
      content: `8.1 VOLUNTARY TERMINATION

You may close your account at any time:
• Complete all active bookings first
• Outstanding balances must be settled
• Request account deletion through Settings

8.2 INVOLUNTARY TERMINATION

ItWhip may suspend or terminate accounts for:
• Violation of this Agreement
• Fraudulent activity
• Safety concerns
• Multiple negative reviews
• Failure to maintain insurance (Hosts)
• Criminal activity

8.3 EFFECT OF TERMINATION

Upon termination:
• Access to platform is immediately revoked
• Pending payouts will be processed
• Outstanding charges remain due
• Reviews and data may be retained`
    },
    {
      id: 'privacy',
      title: '9. PRIVACY AND DATA',
      icon: IoLockClosedOutline,
      content: `9.1 DATA COLLECTION

We collect and process:
• Identity verification information
• Driving history and records
• Payment and billing information
• Location data during active trips
• Communications between users
• Device and usage analytics

9.2 DATA SHARING

Your information may be shared with:
• The other party in a booking (limited info)
• Insurance providers for claims
• Law enforcement when legally required
• Service providers who assist our operations

9.3 YOUR RIGHTS

You have the right to:
• Access your personal data
• Request correction of inaccurate data
• Request deletion (subject to legal requirements)
• Opt out of marketing communications
• Export your data

See our Privacy Policy for complete details.`
    },
    {
      id: 'updates',
      title: '10. AGREEMENT UPDATES',
      icon: IoDocumentTextOutline,
      content: `10.1 MODIFICATIONS

ItWhip may modify this Agreement at any time:
• Material changes will be communicated via email
• Continued use constitutes acceptance
• You may terminate if you disagree with changes

10.2 GOVERNING LAW

This Agreement is governed by:
• Laws of the State of Arizona
• Federal Arbitration Act for arbitration provisions
• Venue in Maricopa County, Arizona

10.3 CONTACT

For questions about this Agreement:
• Email: info@itwhip.com
• Mail: ItWhip Technologies, Inc., Phoenix, AZ

Last Updated: December 2024`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
              <IoDocumentTextOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Legal Document</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Agreement
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              This agreement governs your use of the ItWhip peer-to-peer car sharing marketplace.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Last Updated: December 2024 | Effective: December 1, 2024
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <IoWarningOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Notice</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  By using ItWhip, you agree to this Platform Agreement, our Terms of Service, and Privacy Policy.
                  Please read all documents carefully before using our services. If you do not agree with any terms,
                  do not use the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSections[section.id]

              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-left">
                        {section.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                    ) : (
                      <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {section.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-10 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Questions About This Agreement?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Contact our legal team for clarification on any terms.
            </p>
            <a
              href="mailto:info@itwhip.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              Contact Legal Team
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
