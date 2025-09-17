'use client'

import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoBusinessOutline,
  IoCarOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoMailOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoAlertCircleOutline,
  IoKeyOutline,
  IoLayersOutline,
  IoServerOutline,
  IoCodeSlashOutline
} from 'react-icons/io5'

export default function LegalPage() {
  const [expandedSections, setExpandedSections] = useState({})
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'platform',
      title: '1. PLATFORM CLASSIFICATION & BUSINESS MODEL',
      icon: IoBusinessOutline,
      critical: true,
      content: `1.1 DUAL SERVICE PLATFORM

ItWhip Technologies, Inc. ("ItWhip," "we," "us," or "our") operates as a technology platform providing:

Peer-to-Peer Car Sharing Services:
• Technology marketplace connecting vehicle owners ("Hosts") with renters ("Guests")
• We do not own, operate, or control vehicles listed on our platform
• All vehicles are owned and managed by independent third parties
• We facilitate transactions but are not a party to rental agreements

Hotel Transportation Services:
• Partnership with hotels to provide transportation as an amenity
• Pre-arranged vehicle access for hotel guests
• Integrated billing through hotel partnerships
• White-label transportation solutions

1.2 NOT A RENTAL CAR COMPANY

IMPORTANT DISTINCTION: ItWhip is NOT a traditional car rental company. We do not:
• Own or maintain a fleet of vehicles
• Employ drivers (all drivers are independent contractors)
• Control vehicle pricing (set by Hosts)
• Guarantee vehicle availability or condition
• Act as a transportation common carrier

1.3 REGULATORY CLASSIFICATION

Under Arizona Revised Statutes:
• Classified as a peer-to-peer car sharing program under A.R.S. § 28-9601
• Not subject to rental car company regulations under A.R.S. § 28-2161
• Compliant with Arizona Transaction Privilege Tax requirements
• Registered as technology services provider, not transportation provider

1.4 HOTEL PARTNERSHIP MODEL

For Partner Hotels:
• ItWhip provides technology infrastructure for transportation amenities
• Hotels may subsidize or include transportation in guest packages
• Billing may be direct to hotel or guest, per partnership agreement
• Service availability limited to registered hotel guests with valid booking codes`
    },
    {
      id: 'eligibility',
      title: '2. USER ELIGIBILITY & VERIFICATION',
      icon: IoCheckmarkCircle,
      critical: true,
      content: `2.1 GUEST REQUIREMENTS (CAR RENTALS)

Minimum Age Requirements:
• 21 years for standard vehicles (A.R.S. § 28-3151 compliant)
• 25 years for luxury, exotic, or specialty vehicles
• Valid driver's license held for minimum 1 year

Driving Record Requirements:
• Maximum 2 moving violations in past 3 years
• Maximum 1 at-fault accident in past 3 years
• No major violations in past 7 years:
  - DUI/DWI (A.R.S. § 28-1381)
  - Reckless driving (A.R.S. § 28-693)
  - Driving on suspended/revoked license (A.R.S. § 28-3473)
  - Fleeing law enforcement (A.R.S. § 28-622.01)

Verification Process:
• Identity verification per USA PATRIOT Act requirements
• SSN verification for U.S. residents
• Background check through approved third-party provider
• Motor Vehicle Record (MVR) check with consent

2.2 HOST REQUIREMENTS

Legal Requirements:
• Minimum age 18 years
• Legal vehicle owner or authorized agent
• Valid vehicle registration in Arizona
• Compliance with A.R.S. § 28-4009 (vehicle insurance)

Vehicle Requirements (Arizona Specific):
• 2015 or newer (case-by-case exceptions for specialty vehicles)
• Less than 130,000 miles
• Current Arizona emissions testing (where applicable)
• Valid Arizona safety inspection
• Clean title (no salvage per A.R.S. § 28-2091)

Insurance Requirements:
• Minimum liability coverage per A.R.S. § 28-4009:
  - $25,000 bodily injury per person
  - $50,000 bodily injury per accident
  - $15,000 property damage
• Comprehensive and collision recommended

2.3 HOTEL GUEST REQUIREMENTS

For hotel transportation services:
• Valid hotel reservation and booking code
• Age 18+ with valid ID
• Acceptance of hotel's terms and conditions
• Credit card on file with hotel or ItWhip`
    },
    {
      id: 'insurance',
      title: '3. INSURANCE, LIABILITY & PROTECTION',
      icon: IoShieldCheckmarkOutline,
      critical: true,
      content: `3.1 INSURANCE COVERAGE STRUCTURE

Protection Plan Structure:
ItWhip is not an insurance company and does not provide insurance. Protection plans made available through our platform are contractual agreements that may include third-party liability protection provided by licensed insurers.

Primary Coverage - Host Personal Auto Insurance:
• Host's personal auto insurance is PRIMARY
• Must meet Arizona minimum requirements (A.R.S. § 28-4009)
• Host must notify insurer of peer-to-peer use if required by policy

Platform Protection Plans - Guest Options:
Physical damage protection is a contractual agreement, not insurance. We provide reimbursement for eligible damages subject to deductibles and terms.

BASIC Protection (Included):
• Deductible: $3,000
• Contractual reimbursement up to actual cash value
• Maximum vehicle value: $200,000
• Third-party liability protection included*

STANDARD Protection ($25/day):
• Deductible: $1,000
• Contractual reimbursement up to actual cash value
• Maximum vehicle value: $200,000
• Roadside assistance included
• Glass damage: $0 deductible

PREMIUM Protection ($45/day):
• Deductible: $500
• Contractual reimbursement up to agreed value
• Maximum vehicle value: $200,000
• Loss of use reimbursement: Up to 30 days
• Diminished value protection: Up to $2,500

*Third-party liability protection provided through our insurance partner. Details available upon request. Subject to terms, conditions, and exclusions.

Coverage Territory:
• Arizona, California, Nevada
• Mexico excluded without specific endorsement
• Native American reservations subject to sovereign law

3.2 ARIZONA SPECIFIC REQUIREMENTS

Compliance with A.R.S. § 28-9606:
• Insurance disclosures provided before booking
• Guest acknowledgment of coverage required
• Host insurance verification every 6 months
• Proof of financial responsibility maintained

Self-Insurance Option (A.R.S. § 28-4007):
• Available for fleet operators with 25+ vehicles
• $40,000 security deposit required
• Subject to ADOT approval

3.3 EXCLUSIONS

Not Covered:
• Commercial use including rideshare services (Uber, Lyft) without explicit Host authorization and proper commercial insurance
• Racing or speed contests (A.R.S. § 28-708)
• DUI/DWI incidents (A.R.S. § 28-1381)
• International travel into Mexico without endorsement
• Intentional damage or criminal acts
• Wear and tear or mechanical breakdown
• Interior damage (stains, tears, burns, odors)
• Personal belongings left in vehicle

3.4 CLAIMS PROCESS

Arizona Requirements:
• Report within 24 hours per A.R.S. § 28-667
• Police report required for damages over $2,000
• Cooperation with insurance investigation mandatory
• False claims subject to prosecution under A.R.S. § 20-466

Dispute Resolution:
• Arizona Department of Insurance and Financial Institutions complaints: 1-800-325-2548
• Alternative Dispute Resolution per A.R.S. § 12-133

3.5 VEHICLE VALUE LIMITATIONS

Protection plans apply only to vehicles with actual cash value not exceeding $200,000.

Excluded Vehicles (No Protection Available):
• Vehicles valued over $200,000
• Exotic brands regardless of value: Ferrari, Lamborghini, Bentley, Rolls-Royce, McLaren, Pagani, Maserati
• Vehicles over 15 years old (classic car exclusion)
• Modified or tuned vehicles affecting safety or performance

For excluded vehicles, Hosts must maintain commercial insurance and Guests must rely on personal insurance or Host's commercial coverage.`
    },
    {
      id: 'hotel',
      title: '4. HOTEL PARTNERSHIP FRAMEWORK',
      icon: IoBusinessOutline,
      content: `4.1 HOTEL TRANSPORTATION SERVICES

Service Model:
• White-label transportation solution for partner hotels
• Vehicles sourced from peer-to-peer inventory or dedicated fleet
• Seamless integration with hotel booking systems
• Custom branding available for premium partners

Billing Options:
• Direct billing to hotel master account
• Guest charge with hotel room billing
• Split billing (hotel subsidy + guest payment)
• Prepaid packages included in room rate

4.2 ESG COMMITMENT FOR HOTELS

Environmental Benefits:
• Reduced parking infrastructure needs
• Lower carbon footprint vs individual car ownership
• Electric/hybrid vehicle priority placement
• Carbon offset programs available

Social Impact:
• ADA-compliant vehicle options
• Local economic support through Host network
• Reduced traffic congestion
• Community driver employment opportunities

Governance:
• Transparent reporting on transportation metrics
• Quarterly ESG impact reports for partners
• Sustainable transportation certifications
• LEED points contribution for hotels

4.3 HOTEL LIABILITY FRAMEWORK

Hotel Responsibilities:
• Guest verification and booking code issuance
• Payment guarantee for authorized bookings
• Compliance with hospitality regulations
• Guest communication and support

ItWhip Responsibilities:
• Vehicle availability and quality standards
• Insurance coverage during transportation
• Driver vetting (where applicable)
• Technology platform maintenance

Indemnification:
• Mutual indemnification for respective services
• Hotels not liable for peer-to-peer rentals
• ItWhip not liable for hotel operations
• Cross-liability insurance maintained`
    },
    {
      id: 'privacy',
      title: '5. DATA PRIVACY & PROTECTION',
      icon: IoLockClosedOutline,
      critical: true,
      content: `5.1 DATA COLLECTION COMPLIANCE

Federal Requirements:
• CCPA compliance for California residents
• COPPA compliance for users under 13 (prohibited)
• CAN-SPAM Act compliance for marketing emails
• FCRA compliance for background checks

Arizona Privacy Laws:
• A.R.S. § 18-552 (Personal data breach notification)
• A.R.S. § 44-7501 (Data security requirements)
• Breach notification without unreasonable delay

Data Collected:
• Personal identification (name, DOB, DL#, SSN last 4)
• Financial information (payment cards, bank accounts)
• Location data (during active rentals only)
• Vehicle telematics (if Host-enabled)
• Communication records

5.2 DATA SHARING

With Third Parties:
• Identity verification: Jumio, Onfido
• Background checks: Checkr
• Payment processing: Stripe (PCI-DSS compliant)
• Insurance carriers: As required for claims
• Law enforcement: Per valid subpoena or warrant only

With Hotels:
• Guest verification status
• Trip completion confirmations
• Billing information as authorized
• Aggregated usage statistics only

5.3 USER RIGHTS

Rights Under Law:
• Access personal data (response within 45 days)
• Correct inaccurate information
• Delete account and associated data
• Opt-out of marketing communications
• Data portability upon request

Retention Periods:
• Account data: 7 years per IRS requirements
• Trip records: 3 years per insurance requirements
• Communications: 2 years
• Marketing preferences: Until withdrawn

5.4 SECURITY MEASURES

Technical Safeguards:
• AES-256 encryption at rest
• TLS 1.3 encryption in transit
• Multi-factor authentication available
• Regular penetration testing
• SOC 2 Type II certification in process

Administrative Safeguards:
• Employee background checks
• Confidentiality agreements
• Role-based access controls
• Regular security training
• Incident response procedures per A.R.S. § 18-552`
    },
    {
      id: 'payment',
      title: '6. PAYMENT TERMS & FINANCIAL OBLIGATIONS',
      icon: IoWalletOutline,
      content: `6.1 PRICING STRUCTURE

Platform Fees:
• Host commission: 15-20% of rental revenue
• Guest service fee: Included in displayed price
• Payment processing: 2.9% + $0.30 per transaction
• No hidden fees - all costs shown upfront

Arizona Transaction Privilege Tax:
• State rate: 5.6%
• Maricopa County: Additional 0.7%
• Phoenix city tax: Additional 2.3%
• Total TPT: Varies by location (typically 8.6-10.1%)
• Tax remittance handled by ItWhip

6.2 PAYMENT PROCESSING

Accepted Payment Methods:
• Credit cards (Visa, Mastercard, Amex, Discover)
• Debit cards (with Visa/MC logo)
• Digital wallets (Apple Pay, Google Pay)
• ACH transfers for Host payouts
• Hotel master billing (partner hotels only)

Security Deposits:
• Economy vehicles: $250-500
• Standard vehicles: $500-1,000
• Luxury vehicles: $1,000-3,000
• Exotic vehicles: $3,000-5,000
• Hold duration: Released within 7-14 business days

6.3 HOST PAYOUTS

Payment Schedule:
• Trip completion + 24 hour review period
• ACH transfer initiated within 48-72 hours
• Faster payments available (1.5% fee)
• Minimum payout threshold: $50

Tax Obligations:
• Form 1099-K issued for earnings over $600/year
• Hosts responsible for income tax reporting
• ItWhip provides annual earnings summary
• Quarterly estimated tax payments recommended

6.4 REFUND POLICY

Cancellation Refunds:
• 72+ hours before: 100% refund
• 24-72 hours: 75% refund
• 12-24 hours: 50% refund
• Less than 12 hours: No refund

Dispute Resolution:
• Initial review within 48 hours
• Investigation period: 7-10 business days
• Chargeback defense provided
• Arbitration for amounts over $1,000`
    },
    {
      id: 'prohibited',
      title: '7. PROHIBITED USES & CONDUCT',
      icon: IoWarningOutline,
      critical: true,
      content: `7.1 VEHICLE USE RESTRICTIONS

Prohibited Uses (Criminal Penalties Apply):
• Commercial use including rideshare services (Uber, Lyft) without explicit Host authorization and proper commercial insurance
• Racing or speed contests (A.R.S. § 28-708 - Class 1 misdemeanor)
• Transporting illegal substances (federal and state penalties)
• Human trafficking (A.R.S. § 13-1307 - Class 2 felony)
• Fleeing law enforcement (A.R.S. § 28-622.01 - Class 5 felony)
• Driving while impaired (A.R.S. § 28-1381 - minimum jail time)

Geographic Restrictions:
• Mexico travel prohibited without specific endorsement
• Native American reservations (sovereign law applies)
• Military installations (federal restrictions)
• International borders (CBP regulations apply)

7.2 PLATFORM CONDUCT

Account Violations:
• Multiple accounts or false identity (fraud)
• Circumventing platform fees (breach of contract)
• Harassment or discrimination (violates civil rights laws)
• Fake reviews (FTC violations possible)
• Data scraping (CFAA violations)

Arizona Specific Violations:
• Age discrimination (A.R.S. § 41-1463)
• Disability discrimination (ADA compliance required)
• Racial profiling (A.R.S. § 41-1402)
• Price gouging during emergencies (A.R.S. § 44-1522)

7.3 CONSEQUENCES

Penalties Include:
• Immediate account termination
• Forfeiture of security deposit
• Criminal prosecution referral
• Civil liability for damages
• Permanent platform ban
• Credit reporting (for amounts over $100)
• Collection agency referral

Reporting Obligations:
• Suspected crimes reported to law enforcement
• Insurance fraud reported to NICB
• Financial crimes reported to FinCEN
• Child endangerment reported to CPS`
    },
    {
      id: 'dispute',
      title: '8. DISPUTE RESOLUTION & ARBITRATION',
      icon: IoAlertCircleOutline,
      critical: true,
      content: `8.1 MANDATORY BINDING ARBITRATION

Agreement to Arbitrate:
• ALL DISPUTES SUBJECT TO BINDING ARBITRATION
• Waiver of right to jury trial
• Waiver of right to participate in class actions
• Individual claims only

Arbitration Process:
• Governed by Federal Arbitration Act (9 U.S.C. §1 et seq.)
• Administered by American Arbitration Association (AAA) under Consumer Arbitration Rules
• Location: Phoenix, Arizona (or phone/video if under $10,000)
• ItWhip pays filing fees over $250
• Each party bears own attorney fees

8.2 CLASS ACTION WAIVER

YOU EXPRESSLY WAIVE ANY RIGHT TO:
• Class action lawsuits
• Class-wide arbitrations
• Representative actions
• Private attorney general actions
• Consolidated proceedings

If class action waiver deemed unenforceable:
• Entire arbitration agreement becomes void
• Disputes proceed in state court
• Venue: Maricopa County Superior Court

8.3 EXCEPTIONS TO ARBITRATION

May be brought in court:
• Small claims (under $3,500 in Arizona)
• Injunctive relief for IP violations
• Collections of unpaid fees
• Emergency injunctive relief

8.4 GOVERNING LAW

Applicable Law:
• Governed by Arizona state law
• Federal law where applicable
• Conflicts of law rules excluded
• UN Convention on Contracts excluded

Venue for Non-Arbitrable Claims:
• Maricopa County Superior Court
• U.S. District Court for Arizona (federal claims)
• Phoenix Municipal Court (traffic violations)

8.5 LIMITATION PERIOD

Time to File Claims:
• Contract claims: 6 years (A.R.S. § 12-548)
• Personal injury: 2 years (A.R.S. § 12-542)
• Property damage: 2 years (A.R.S. § 12-542)
• Consumer fraud: 1 year (A.R.S. § 12-541)
• All other claims: 1 year from occurrence`
    },
    {
      id: 'termination',
      title: '9. ACCOUNT TERMINATION & SUSPENSION',
      icon: IoKeyOutline,
      content: `9.1 TERMINATION BY USER

Voluntary Termination:
• Request via email to support@itwhip.com
• Complete all active bookings first
• Pay all outstanding amounts
• Data deletion per privacy policy
• No refund of unused credits

Effect of Termination:
• Future bookings cancelled
• Host listings deactivated
• Payout of remaining balance
• Reviews remain visible
• 90-day cool-down before new account

9.2 TERMINATION BY ITWHIP

Immediate Termination Causes:
• Fraud or identity theft
• Safety violations
• Criminal activity
• False insurance claims
• Circumventing fees
• Multiple policy violations

Progressive Discipline:
• First violation: Warning
• Second violation: 7-day suspension
• Third violation: 30-day suspension
• Fourth violation: Permanent ban

9.3 SUSPENSION PENDING INVESTIGATION

Reasons for Suspension:
• Accident investigation
• Insurance claim review
• Criminal allegations
• Payment disputes
• User complaints
• Regulatory inquiry

Due Process Rights:
• Written notice of suspension
• Opportunity to respond within 10 days
• Review by management
• Appeal process available
• Final decision within 30 days

9.4 POST-TERMINATION OBLIGATIONS

Surviving Obligations:
• Payment of fees owed
• Insurance claims cooperation
• Confidentiality provisions
• Arbitration agreement
• Indemnification obligations
• Data retention per law`
    },
    {
      id: 'misc',
      title: '10. MISCELLANEOUS LEGAL PROVISIONS',
      icon: IoLayersOutline,
      content: `10.1 ENTIRE AGREEMENT

Integration Clause:
• These Terms constitute entire agreement
• Supersedes all prior agreements
• Incorporates Privacy Policy by reference
• Incorporates Insurance Terms by reference

10.2 SEVERABILITY

If any provision invalid:
• Remaining provisions continue
• Invalid provision reformed minimally
• Intent preserved where possible
• Court reformation permitted

10.3 FORCE MAJEURE

Excused Performance for:
• Natural disasters (A.R.S. § 26-301 emergency)
• Pandemic or epidemic
• War or terrorism
• Government orders
• Internet/infrastructure failure
• Labor disputes
• Other events beyond control

10.4 ASSIGNMENT

Your Rights:
• Not assignable without consent
• No third-party beneficiaries
• Binding on heirs/successors

ItWhip Rights:
• May assign freely
• May delegate operations
• Successors bound by terms

10.5 NOTICES

Legal Notices to ItWhip:
• Email: support@itwhip.com
• Response within 2-4 business hours (7am-9pm MST)
• Physical address provided upon request
• Certified mail for legal service

User Notices:
• Email to registered address
• Platform notifications
• SMS to verified number

10.6 MODIFICATION OF TERMS

Changes to Terms:
• 30 days advance notice for material changes
• Email notification to users
• Continued use constitutes acceptance
• Right to terminate if disagree

10.7 REGULATORY COMPLIANCE

ItWhip Maintains Compliance With:
• Arizona Corporation Commission
• Arizona Department of Transportation
• Arizona Department of Revenue
• Arizona Department of Insurance and Financial Institutions
• City of Phoenix business licensing
• Maricopa County regulations
• Federal Trade Commission (FTC) for consumer protection
• Federal DOT where applicable

10.8 CONTACT INFORMATION

ItWhip Technologies, Inc.
Email: support@itwhip.com
Support Hours: 7:00 AM - 9:00 PM MST, 7 days
Response Time: 2-4 hours typical

For Legal Process:
Registered Agent provided upon valid request
Service of process per Arizona Rules of Civil Procedure`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - Using your existing component */}
      <Header />
      
      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-3">
                <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Legal Framework
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Last Updated: January 15, 2025 • Governing Law: Arizona
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-3 sm:py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <IoInformationCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Hybrid Platform Model
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                    ItWhip operates as both a peer-to-peer car sharing marketplace and a hotel transportation 
                    amenity provider. We facilitate vehicle rentals between independent parties while also 
                    partnering with hotels to provide sustainable transportation solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Content */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id} className={section.critical ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <section.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${section.critical ? 'text-red-600' : 'text-amber-600'}`} />
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-left">
                          {section.title}
                        </h2>
                        {section.critical && (
                          <span className="text-xs text-red-600 font-bold">CRITICAL</span>
                        )}
                      </div>
                      {expandedSections[section.id] ? (
                        <IoChevronUpOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      ) : (
                        <IoChevronDownOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSections[section.id] && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-6 sm:py-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoMailOutline className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-600" />
                Legal Contact Information
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>ItWhip Technologies, Inc.</strong></p>
                <p>Email: support@itwhip.com</p>
                <p>Support Response Time: Within 2-4 hours during business hours</p>
                <p>Business Hours: Monday - Sunday, 7:00 AM - 9:00 PM MST</p>
                <p>Emergency: For accidents or urgent safety issues, contact local authorities first</p>
                <p className="italic text-xs mt-2">
                  Registered Agent and physical address provided upon valid legal request
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Agreement Section */}
        <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2">
                By Using ItWhip, You Agree to These Legal Terms
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
                Your use of our services constitutes acceptance of this Legal Framework, our Terms of Service, 
                and our Privacy Policy. These documents are governed by Arizona state law and federal regulations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <a href="/terms" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  View Terms of Service →
                </a>
                <a href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  View Privacy Policy →
                </a>
                <a href="/contact" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer - Using your existing component */}
      <Footer />
    </div>
  )
}