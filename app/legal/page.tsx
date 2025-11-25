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
  IoCodeSlashOutline,
  IoConstructOutline,
  IoDocumentsOutline
} from 'react-icons/io5'

export default function LegalPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  
  const toggleSection = (sectionId: string) => {
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
      content: `1.1 PEER-TO-PEER CAR SHARING PLATFORM

ItWhip Technologies, Inc. ("ItWhip," "we," "us," or "our") operates as a peer-to-peer car sharing program as defined under Arizona Revised Statutes § 28-9601:

"Peer-to-peer car sharing program" means a business platform that connects vehicle owners with drivers to enable the sharing of vehicles for financial consideration.

Platform Services:
• Technology marketplace connecting vehicle owners ("Hosts") with renters ("Guests")
• We do not own, operate, or control vehicles listed on our platform
• All vehicles are owned and managed by independent third parties ("Shared Vehicle Owners")
• We facilitate transactions through car sharing program agreements

Hotel Transportation Services:
• Partnership with hotels to provide transportation as an amenity
• Pre-arranged vehicle access for hotel guests
• Integrated billing through hotel partnerships
• White-label transportation solutions

1.2 NOT A RENTAL CAR COMPANY

IMPORTANT DISTINCTION: ItWhip is NOT a traditional car rental company or rental car agent as defined in A.R.S. § 20-331. We do not:
• Own or maintain a fleet of vehicles
• Employ drivers (all Hosts are independent vehicle owners)
• Control vehicle pricing (set by Hosts)
• Guarantee vehicle availability or condition
• Act as a transportation common carrier
• Enter into "rental agreements" as defined in A.R.S. § 20-331

1.3 REGULATORY CLASSIFICATION

Under Arizona Revised Statutes Title 28, Chapter 31, Article 1:
• Classified as a peer-to-peer car sharing program under A.R.S. § 28-9601
• Subject to insurance requirements under A.R.S. § 28-9602
• Subject to disclosure requirements under A.R.S. § 28-9609
• Subject to safety recall requirements under A.R.S. § 28-9612
• Compliant with Arizona Transaction Privilege Tax requirements
• NOT subject to rental car company regulations under A.R.S. § 28-5810
• NOT subject to surcharges under A.R.S. § 5-839 or § 48-4234 for individual-owned shared vehicles

1.4 INSURABLE INTEREST (A.R.S. § 28-9608)

Pursuant to Arizona law, ItWhip has an insurable interest in shared vehicles during the car sharing period and may purchase and maintain motor vehicle insurance policies covering:
• Liabilities assumed by ItWhip under car sharing program agreements
• Any liability of the shared vehicle owner
• Damage or loss to the shared vehicle
• Any liability of the shared vehicle driver

1.5 VICARIOUS LIABILITY EXEMPTION (A.R.S. § 28-9606)

ItWhip and shared vehicle owners are exempt from vicarious liability consistent with 49 United States Code § 30106 and under any state or local law that imposes liability solely based on vehicle ownership.

1.6 HOTEL PARTNERSHIP MODEL

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
      content: `2.1 SHARED VEHICLE DRIVER (GUEST) REQUIREMENTS

Per A.R.S. § 28-9610, ItWhip may only enter into a car sharing program agreement with a driver who:

Driver License Requirements:
• Holds a driver license issued by ADOT authorizing operation of the shared vehicle class; OR
• Is a nonresident who holds a valid driver license from their state/country of residence authorizing operation of the vehicle class AND is at least the same age required of Arizona residents; OR
• Is otherwise specifically authorized by ADOT to drive vehicles of the shared vehicle class

Additional Requirements:
• Minimum age 21 years for standard vehicles
• Minimum age 25 years for luxury, exotic, or specialty vehicles
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

Record Keeping (A.R.S. § 28-9610):
ItWhip maintains records of:
• Name and address of each shared vehicle driver
• Driver license number of the shared vehicle driver
• Date and place of issuance of the driver's license

2.2 SHARED VEHICLE OWNER (HOST) REQUIREMENTS

Legal Requirements:
• Minimum age 18 years
• Legal vehicle owner or authorized agent (registered owner or designee per A.R.S. § 28-9601)
• Valid vehicle registration in Arizona
• Compliance with A.R.S. § 28-4009 (vehicle insurance minimums)

Vehicle Requirements (Arizona Specific):
• 2015 or newer (case-by-case exceptions for specialty vehicles)
• Less than 130,000 miles
• Current Arizona emissions testing (where applicable)
• Valid Arizona safety inspection
• Clean title (no salvage per A.R.S. § 28-2091)
• No unrepaired safety recalls (A.R.S. § 28-9612)

Insurance Requirements (A.R.S. § 28-4009 Minimums):
• $25,000 bodily injury per person
• $50,000 bodily injury per accident
• $15,000 property damage
• Comprehensive and collision coverage recommended

Individual-Owned Shared Vehicle Certification (A.R.S. § 28-9601):
Hosts may certify their vehicle as an "individual-owned shared vehicle" if:
• Transaction privilege tax was paid on purchase in Arizona; OR
• Applicable sales/use tax was paid in the state of purchase; OR
• Arizona use tax was paid for out-of-state purchases

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
      content: `3.1 PLATFORM LIABILITY ASSUMPTION (A.R.S. § 28-9602)

Pursuant to A.R.S. § 28-9602(A), ItWhip assumes the liability of the shared vehicle owner for bodily injury or property damage that occurs to a third party during the car sharing period in an amount stated in the car sharing program agreement, which shall not be less than the minimum coverage required by A.R.S. § 28-4009.

Exceptions to Liability Assumption (A.R.S. § 28-9602(B)):
ItWhip is not liable beyond minimum coverage amounts if:
• The shared vehicle owner makes intentional or fraudulent material misrepresentation or omission before the car sharing period; OR
• The shared vehicle owner acts in concert with a driver who fails to return the vehicle per the agreement

3.2 INSURANCE COVERAGE REQUIREMENTS (A.R.S. § 28-9602)

During Each Car Sharing Period:
ItWhip ensures that the shared vehicle owner and shared vehicle driver are insured under a motor vehicle liability insurance policy providing coverage not less than A.R.S. § 28-4009 minimums ($25,000/$50,000/$15,000) that either:
• Recognizes the vehicle is used through a peer-to-peer car sharing program; OR
• Does not exclude use by a shared vehicle driver

Insurance Sources (A.R.S. § 28-9602(E)):
Required insurance may be satisfied by coverage maintained by:
• The shared vehicle owner; AND/OR
• The shared vehicle driver; AND/OR
• ItWhip (the peer-to-peer car sharing program)

Primary Coverage (A.R.S. § 28-9602(F)):
The insurance required during the car sharing period is PRIMARY.

First-Dollar Coverage (A.R.S. § 28-9602(H)):
If insurance maintained by the owner or driver has lapsed or does not provide required coverage, ItWhip's insurance provides coverage beginning with the FIRST DOLLAR of a claim and ItWhip has a duty to defend.

3.3 PROTECTION PLAN OPTIONS

ItWhip offers contractual protection plans that may include third-party liability protection provided by licensed insurers. ItWhip is not an insurance company.

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

*Third-party liability protection provided through our insurance partner meeting A.R.S. § 28-9602 requirements. Details available upon request. Subject to terms, conditions, and exclusions.

Coverage Territory:
• Arizona, California, Nevada
• Mexico excluded without specific endorsement
• Native American reservations subject to sovereign law

3.4 AUTHORIZED INSURER EXCLUSIONS (A.R.S. § 28-9604)

IMPORTANT: An authorized insurer may exclude any and all coverage under a shared vehicle owner's personal motor vehicle liability insurance policy, including:
• Bodily injury coverage
• Property damage coverage
• Uninsured/underinsured motorist coverage
• Medical payments coverage
• Comprehensive coverage
• Collision coverage

Insurance policies that exclude coverage for vehicles made available for rent, sharing, or hire are NOT invalidated by Arizona's peer-to-peer car sharing laws.

3.5 INSURANCE CLAIMS INDEMNIFICATION (A.R.S. § 28-9607)

A motor vehicle insurer that defends or indemnifies a claim involving a shared vehicle that is excluded under their policy may seek contribution or indemnification from ItWhip's insurer if the claim:
• Is made against the owner or driver for loss/injury during the car sharing period; AND
• Is excluded under the terms of the motor vehicle policy

3.6 EXCLUSIONS

Not Covered:
• Commercial use including rideshare services (Uber, Lyft) without explicit Host authorization and proper commercial insurance
• Racing or speed contests (A.R.S. § 28-708)
• DUI/DWI incidents (A.R.S. § 28-1381)
• International travel into Mexico without endorsement
• Intentional damage or criminal acts
• Wear and tear or mechanical breakdown
• Interior damage (stains, tears, burns, odors)
• Personal belongings left in vehicle

3.7 CLAIMS PROCESS

Arizona Requirements:
• Report within 24 hours per A.R.S. § 28-667
• Police report required for damages over $2,000
• Cooperation with insurance investigation mandatory
• False claims subject to prosecution under A.R.S. § 20-466

Dispute Resolution:
• Arizona Department of Insurance and Financial Institutions: 1-800-325-2548
• Alternative Dispute Resolution per A.R.S. § 12-133

3.8 VEHICLE VALUE LIMITATIONS

Protection plans apply only to vehicles with actual cash value not exceeding $200,000.

Excluded Vehicles (No Protection Available):
• Vehicles valued over $200,000
• Select exotic brands: Ferrari, Lamborghini, Bentley, Rolls-Royce, McLaren, Pagani
• Vehicles over 15 years old (classic car exclusion)
• Modified vehicles affecting safety or performance

For excluded vehicles, Hosts must maintain commercial insurance and Guests must rely on personal insurance or Host's commercial coverage.`
    },
    {
      id: 'disclosures',
      title: '4. REQUIRED DISCLOSURES (A.R.S. § 28-9609)',
      icon: IoDocumentsOutline,
      critical: true,
      content: `4.1 MANDATORY CAR SHARING AGREEMENT DISCLOSURES

Pursuant to A.R.S. § 28-9609, each car sharing program agreement made in Arizona discloses the following to the shared vehicle owner and driver:

DISCLOSURE 1 - INDEMNIFICATION RIGHT:
ItWhip has a right to seek indemnification from the shared vehicle owner or shared vehicle driver for economic loss sustained by ItWhip resulting from a breach of the terms and conditions of the car sharing program agreement.

DISCLOSURE 2 - PERSONAL INSURANCE LIMITATIONS:
A motor vehicle liability insurance policy issued to the shared vehicle owner for the shared vehicle or to the shared vehicle driver DOES NOT provide a defense or indemnification for any claim asserted by ItWhip.

DISCLOSURE 3 - COVERAGE PERIOD LIMITATION:
ItWhip's insurance coverage on the shared vehicle owner and shared vehicle driver is in effect ONLY during each car sharing period. For any use of the shared vehicle by the shared vehicle driver after the car sharing termination time, the shared vehicle driver and shared vehicle owner MIGHT NOT HAVE INSURANCE COVERAGE.

DISCLOSURE 4 - COSTS AND FEES:
The daily rate, fees, and insurance or protection package costs charged to the shared vehicle owner or shared vehicle driver are disclosed before booking confirmation and itemized in the car sharing program agreement.

DISCLOSURE 5 - OWNER'S INSURANCE MAY NOT COVER:
The shared vehicle owner's motor vehicle liability insurance MIGHT NOT provide coverage for a shared vehicle used through a peer-to-peer car sharing program. Personal auto policies may exclude peer-to-peer car sharing use per A.R.S. § 28-9604.

DISCLOSURE 6 - EMERGENCY ASSISTANCE:
Emergency telephone number for roadside assistance and customer service: Contact through the ItWhip app or support@itwhip.com. For emergencies, contact 911 first.

DISCLOSURE 7 - DRIVER INSURANCE REQUIREMENTS:
There may be conditions requiring a person to maintain a personal motor vehicle liability insurance policy with certain minimum applicable coverage limits on a primary basis in order for the person to become a shared vehicle driver. Minimum coverage requirements are disclosed during the booking process.

DISCLOSURE 8 - EXISTING COVERAGE NOTICE:
The shared vehicle owner's or shared vehicle driver's motor vehicle liability insurance MIGHT ALREADY provide the coverage required by Arizona law (A.R.S. § 28-9602). Users should review their personal policies before booking.

4.2 ACKNOWLEDGMENT REQUIRED

By completing a booking on ItWhip, both Hosts and Guests acknowledge they have received and understood these disclosures as required by Arizona law.`
    },
    {
      id: 'lienholder',
      title: '5. LIENHOLDER NOTICE REQUIREMENTS (A.R.S. § 28-9603)',
      icon: IoAlertCircleOutline,
      critical: true,
      content: `5.1 NOTICE TO OWNERS WITH LIENS

Pursuant to A.R.S. § 28-9603, after a vehicle owner registers as a shared vehicle owner on ItWhip and BEFORE the shared vehicle is made available for car sharing, if there is a lien on the shared vehicle, ItWhip notifies the shared vehicle owner of the following:

NOTICE 1 - POTENTIAL CONTRACT VIOLATION:
Using the shared vehicle through a peer-to-peer car sharing program MIGHT VIOLATE the terms of your contract with the lienholder (your lender, leasing company, or financing institution).

NOTICE 2 - PHYSICAL DAMAGE COVERAGE REQUIREMENTS:
Your contract with the lienholder MIGHT IMPOSE SPECIFIC REQUIREMENTS for physical damage coverage that may differ from ItWhip's protection plans.

5.2 HOST ACKNOWLEDGMENT

Before listing a vehicle with an active lien, Hosts must:
• Acknowledge receipt of these notices
• Confirm they have reviewed their financing/lease agreement
• Accept responsibility for any violations of their lienholder agreement
• Ensure adequate physical damage coverage per lienholder requirements

5.3 ITWHIP NOT LIABLE

ItWhip is not responsible for:
• Violations of Host's financing or lease agreements
• Lienholder repossession or contract acceleration
• Gaps between ItWhip protection and lienholder requirements
• Any disputes between Host and their lienholder`
    },
    {
      id: 'safety',
      title: '6. SAFETY RECALL REQUIREMENTS (A.R.S. § 28-9612)',
      icon: IoConstructOutline,
      critical: true,
      content: `6.1 PRE-LISTING VERIFICATION

Pursuant to A.R.S. § 28-9612(A), before a shared vehicle is made available on ItWhip:

Platform Verification:
ItWhip verifies that the shared vehicle does not have any unrepaired safety recalls through NHTSA database checks and requires Host certification.

Host Notification:
ItWhip notifies the shared vehicle owner of all requirements under A.R.S. § 28-9612(B), (C), and (D).

6.2 HOST OBLIGATIONS - BEFORE LISTING

Per A.R.S. § 28-9612(B):
If you have received an actual notice of a safety recall on your vehicle, you MAY NOT make the vehicle available as a shared vehicle on ItWhip until the safety recall repair is completed.

6.3 HOST OBLIGATIONS - DURING LISTING

Per A.R.S. § 28-9612(C):
If you receive a notice of a safety recall while your vehicle is listed on ItWhip, you must:
• Remove the shared vehicle from availability on ItWhip AS SOON AS PRACTICABLE
• NOT make the vehicle available again until the safety recall repair is completed
• Update your vehicle status in the ItWhip platform

6.4 HOST OBLIGATIONS - DURING ACTIVE RENTAL

Per A.R.S. § 28-9612(D):
If you receive a notice of a safety recall while the shared vehicle is in the possession of a shared vehicle driver:
• Notify ItWhip about the safety recall AS SOON AS PRACTICABLE
• Coordinate with ItWhip and the Guest regarding the rental
• Arrange for safety recall repair after the vehicle is returned

6.5 ITWHIP SAFETY MEASURES

To ensure compliance, ItWhip:
• Checks NHTSA recall database before vehicle activation
• Sends recall alerts to Hosts when new recalls are issued
• May automatically deactivate listings for vehicles with open recalls
• Requires Host certification of recall-free status
• Maintains records of recall verification for each shared vehicle`
    },
    {
      id: 'records',
      title: '7. RECORD RETENTION & DATA (A.R.S. § 28-9605)',
      icon: IoServerOutline,
      critical: true,
      content: `7.1 STATUTORY RECORD REQUIREMENTS

Pursuant to A.R.S. § 28-9605, ItWhip collects, verifies, and retains records relating to the use of shared vehicles including:

Required Records:
• Times the shared vehicle was used (start/end of each car sharing period)
• Fees paid by the shared vehicle driver
• Monies received by the shared vehicle owner
• Trip details and locations

Retention Period:
ItWhip retains these records for AT LEAST SIX (6) YEARS as required by Arizona law.

7.2 INFORMATION SHARING FOR CLAIMS

Per A.R.S. § 28-9605, ItWhip provides recorded information ON REQUEST to:
• The shared vehicle owner
• The shared vehicle owner's insurer
• The shared vehicle driver's insurer

Purpose: To facilitate claim coverage investigation.

7.3 ADDITIONAL DATA RETENTION

Beyond statutory requirements, ItWhip also retains:
• Account data: 7 years per IRS requirements
• Communications: 2 years
• Marketing preferences: Until withdrawn
• Safety and incident reports: 7 years

7.4 DATA ACCESS RIGHTS

Users may request access to their personal data. ItWhip responds to data access requests within 45 days as required by applicable privacy laws.`
    },
    {
      id: 'equipment',
      title: '8. EQUIPMENT RESPONSIBILITY (A.R.S. § 28-9611)',
      icon: IoCarOutline,
      content: `8.1 PLATFORM EQUIPMENT

Pursuant to A.R.S. § 28-9611, ItWhip has sole responsibility for any equipment put in or on a shared vehicle to monitor or facilitate the shared vehicle transaction, including:

• GPS tracking devices
• Telematics equipment
• Lock boxes or key safes
• Smart access devices
• Cameras or dashcams installed by ItWhip

8.2 INDEMNIFICATION

ItWhip agrees to indemnify and hold harmless the shared vehicle owner for any damage to or theft of ItWhip-installed equipment during the car sharing period, PROVIDED the shared vehicle owner did not cause the damage or theft.

8.3 RECOVERY FROM DRIVER

ItWhip may seek indemnity from the shared vehicle driver for any loss or damage to equipment that occurs during the car sharing period.

8.4 HOST-INSTALLED EQUIPMENT

Equipment installed by the Host (such as personal dashcams or tracking devices) remains the Host's responsibility. ItWhip is not liable for damage to Host-installed equipment.`
    },
    {
      id: 'hotel',
      title: '9. HOTEL PARTNERSHIP FRAMEWORK',
      icon: IoBusinessOutline,
      content: `9.1 HOTEL TRANSPORTATION SERVICES

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

9.2 ESG COMMITMENT FOR HOTELS

Environmental Benefits:
• Reduced parking infrastructure needs
• Lower carbon footprint vs individual car ownership
• Electric/hybrid vehicle priority placement
• Carbon offset programs available

Social Impact:
• ADA-compliant vehicle options
• Local economic support through Host network
• Reduced traffic congestion
• Community employment opportunities

Governance:
• Transparent reporting on transportation metrics
• Quarterly ESG impact reports for partners
• Sustainable transportation certifications
• LEED points contribution for hotels

9.3 HOTEL LIABILITY FRAMEWORK

Hotel Responsibilities:
• Guest verification and booking code issuance
• Payment guarantee for authorized bookings
• Compliance with hospitality regulations
• Guest communication and support

ItWhip Responsibilities:
• Vehicle availability and quality standards
• Insurance coverage during transportation per A.R.S. § 28-9602
• Platform maintenance and support
• Compliance with peer-to-peer car sharing laws

Indemnification:
• Mutual indemnification for respective services
• Hotels not liable for peer-to-peer rentals
• ItWhip not liable for hotel operations
• Cross-liability insurance maintained`
    },
    {
      id: 'privacy',
      title: '10. DATA PRIVACY & PROTECTION',
      icon: IoLockClosedOutline,
      critical: true,
      content: `10.1 DATA COLLECTION COMPLIANCE

Federal Requirements:
• CCPA compliance for California residents
• COPPA compliance (users under 13 prohibited)
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

10.2 DATA SHARING

With Third Parties:
• Identity verification providers
• Background check services
• Payment processing: Stripe (PCI-DSS compliant)
• Insurance carriers: As required for claims per A.R.S. § 28-9605
• Law enforcement: Per valid subpoena or warrant only

With Hotels:
• Guest verification status
• Trip completion confirmations
• Billing information as authorized
• Aggregated usage statistics only

10.3 USER RIGHTS

Rights Under Law:
• Access personal data (response within 45 days)
• Correct inaccurate information
• Delete account and associated data (subject to 6-year retention requirement per A.R.S. § 28-9605)
• Opt-out of marketing communications
• Data portability upon request

10.4 SECURITY MEASURES

Technical Safeguards:
• AES-256 encryption at rest
• TLS 1.3 encryption in transit
• Multi-factor authentication available
• Regular penetration testing

Administrative Safeguards:
• Employee background checks
• Confidentiality agreements
• Role-based access controls
• Regular security training
• Incident response procedures per A.R.S. § 18-552`
    },
    {
      id: 'payment',
      title: '11. PAYMENT TERMS & FINANCIAL OBLIGATIONS',
      icon: IoWalletOutline,
      content: `11.1 PRICING STRUCTURE

Platform Fees:
• Host commission: 15-20% of rental revenue
• Guest service fee: Included in displayed price
• Payment processing: 2.9% + $0.30 per transaction
• No hidden fees - all costs shown upfront per A.R.S. § 28-9609(4)

Arizona Transaction Privilege Tax:
• State rate: 5.6%
• Maricopa County: Additional 0.7%
• Phoenix city tax: Additional 2.3%
• Total TPT: Varies by location (typically 8.6-10.1%)
• Tax remittance handled by ItWhip

11.2 PAYMENT PROCESSING

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

11.3 HOST PAYOUTS

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

11.4 REFUND POLICY

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
      title: '12. PROHIBITED USES & CONDUCT',
      icon: IoWarningOutline,
      critical: true,
      content: `12.1 VEHICLE USE RESTRICTIONS

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

12.2 PLATFORM CONDUCT

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

12.3 CONSEQUENCES

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
      title: '13. DISPUTE RESOLUTION & ARBITRATION',
      icon: IoAlertCircleOutline,
      critical: true,
      content: `13.1 MANDATORY BINDING ARBITRATION

Agreement to Arbitrate:
• ALL DISPUTES SUBJECT TO BINDING ARBITRATION
• Waiver of right to jury trial
• Waiver of right to participate in class actions
• Individual claims only

Arbitration Process:
• Governed by Federal Arbitration Act (9 U.S.C. §1 et seq.)
• Administered by American Arbitration Association (AAA)
• Location: Phoenix, Arizona (or phone/video if under $10,000)
• ItWhip pays filing fees over $250
• Each party bears own attorney fees

13.2 CLASS ACTION WAIVER

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

13.3 EXCEPTIONS TO ARBITRATION

May be brought in court:
• Small claims (under $3,500 in Arizona)
• Injunctive relief for IP violations
• Collections of unpaid fees
• Emergency injunctive relief

13.4 GOVERNING LAW

Applicable Law:
• Governed by Arizona state law
• Federal law where applicable
• Arizona peer-to-peer car sharing laws (A.R.S. § 28-9601 et seq.)
• Conflicts of law rules excluded
• UN Convention on Contracts excluded

Venue for Non-Arbitrable Claims:
• Maricopa County Superior Court
• U.S. District Court for Arizona (federal claims)

13.5 LIMITATION PERIOD

Time to File Claims:
• Contract claims: 6 years (A.R.S. § 12-548)
• Personal injury: 2 years (A.R.S. § 12-542)
• Property damage: 2 years (A.R.S. § 12-542)
• Consumer fraud: 1 year (A.R.S. § 12-541)
• All other claims: 1 year from occurrence`
    },
    {
      id: 'termination',
      title: '14. ACCOUNT TERMINATION & SUSPENSION',
      icon: IoKeyOutline,
      content: `14.1 TERMINATION BY USER

Voluntary Termination:
• Request via email to support@itwhip.com
• Complete all active bookings first
• Pay all outstanding amounts
• Data retained per A.R.S. § 28-9605 (6 years minimum)
• No refund of unused credits

Effect of Termination:
• Future bookings cancelled
• Host listings deactivated
• Payout of remaining balance
• Reviews remain visible
• 90-day cool-down before new account

14.2 TERMINATION BY ITWHIP

Immediate Termination Causes:
• Fraud or identity theft
• Safety violations
• Criminal activity
• False insurance claims
• Circumventing fees
• Multiple policy violations
• Listing vehicle with unrepaired safety recall

Progressive Discipline:
• First violation: Warning
• Second violation: 7-day suspension
• Third violation: 30-day suspension
• Fourth violation: Permanent ban

14.3 SUSPENSION PENDING INVESTIGATION

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

14.4 POST-TERMINATION OBLIGATIONS

Surviving Obligations:
• Payment of fees owed
• Insurance claims cooperation
• Confidentiality provisions
• Arbitration agreement
• Indemnification obligations
• Data retention per A.R.S. § 28-9605`
    },
    {
      id: 'misc',
      title: '15. MISCELLANEOUS LEGAL PROVISIONS',
      icon: IoLayersOutline,
      content: `15.1 ENTIRE AGREEMENT

Integration Clause:
• These Terms constitute entire agreement
• Supersedes all prior agreements
• Incorporates Privacy Policy by reference
• Incorporates Insurance Terms by reference
• Incorporates A.R.S. § 28-9609 disclosures

15.2 SEVERABILITY

If any provision invalid:
• Remaining provisions continue
• Invalid provision reformed minimally
• Intent preserved where possible
• Court reformation permitted

15.3 FORCE MAJEURE

Excused Performance for:
• Natural disasters (A.R.S. § 26-301 emergency)
• Pandemic or epidemic
• War or terrorism
• Government orders
• Internet/infrastructure failure
• Labor disputes
• Other events beyond control

15.4 ASSIGNMENT

Your Rights:
• Not assignable without consent
• No third-party beneficiaries
• Binding on heirs/successors

ItWhip Rights:
• May assign freely
• May delegate operations
• Successors bound by terms

15.5 NOTICES

Legal Notices to ItWhip:
• Email: support@itwhip.com
• Response within 2-4 business hours (7am-9pm MST)
• Physical address provided upon request
• Certified mail for legal service

User Notices:
• Email to registered address
• Platform notifications
• SMS to verified number

15.6 MODIFICATION OF TERMS

Changes to Terms:
• 30 days advance notice for material changes
• Email notification to users
• Continued use constitutes acceptance
• Right to terminate if disagree

15.7 REGULATORY COMPLIANCE

ItWhip Maintains Compliance With:
• Arizona Corporation Commission
• Arizona Department of Transportation
• Arizona Department of Revenue
• Arizona Department of Insurance and Financial Institutions
• Arizona peer-to-peer car sharing laws (A.R.S. § 28-9601 et seq.)
• City of Phoenix business licensing
• Maricopa County regulations
• Federal Trade Commission (FTC)
• Federal DOT where applicable

15.8 CONTACT INFORMATION

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
      <Header />
      
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
                Last Updated: November 25, 2025 • Governed by Arizona Law (A.R.S. Title 28, Chapter 31)
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
                    Peer-to-Peer Car Sharing Platform
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                    ItWhip operates as a peer-to-peer car sharing program under Arizona Revised Statutes 
                    § 28-9601 et seq. We connect vehicle owners ("Hosts") with renters ("Guests") and 
                    partner with hotels to provide sustainable transportation solutions. We are not a 
                    rental car company.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statutory Compliance Banner */}
        <section className="py-2 sm:py-3">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-green-900 dark:text-green-300 mb-1">
                    Arizona Statutory Compliance
                  </h2>
                  <p className="text-xs sm:text-sm text-green-800 dark:text-green-400">
                    This Legal Framework complies with Arizona's peer-to-peer car sharing laws including 
                    A.R.S. § 28-9602 (Insurance), § 28-9605 (Records), § 28-9609 (Disclosures), and 
                    § 28-9612 (Safety Recalls).
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

        {/* Statutory References */}
        <section className="py-4 sm:py-6 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
              Arizona P2P Car Sharing Statutes Referenced
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div>• A.R.S. § 28-9601 - Definitions</div>
              <div>• A.R.S. § 28-9602 - Insurance Requirements</div>
              <div>• A.R.S. § 28-9603 - Lienholder Notice</div>
              <div>• A.R.S. § 28-9604 - Insurer Exclusions</div>
              <div>• A.R.S. § 28-9605 - Record Retention</div>
              <div>• A.R.S. § 28-9606 - Vicarious Liability Exemption</div>
              <div>• A.R.S. § 28-9607 - Claims Indemnification</div>
              <div>• A.R.S. § 28-9608 - Insurable Interest</div>
              <div>• A.R.S. § 28-9609 - Required Disclosures</div>
              <div>• A.R.S. § 28-9610 - Driver Requirements</div>
              <div>• A.R.S. § 28-9611 - Equipment Responsibility</div>
              <div>• A.R.S. § 28-9612 - Safety Recalls</div>
              <div>• A.R.S. § 28-9613 - Individual-Owned Vehicles</div>
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
                <p>Emergency: For accidents or urgent safety issues, contact 911 first</p>
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
                Privacy Policy, and all disclosures required by A.R.S. § 28-9609. These documents are governed 
                by Arizona state law and federal regulations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <a href="/terms" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  View Terms of Service →
                </a>
                <a href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  View Privacy Policy →
                </a>
                <a href="/insurance" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  View Insurance Guide →
                </a>
                <a href="/contact" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}