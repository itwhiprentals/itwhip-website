'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoMailOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoDownloadOutline
} from 'react-icons/io5'

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleGetAppClick = () => {
    console.log('Get app clicked')
  }

  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  const sections = [
    {
      id: 'acceptance',
      title: '1. ACCEPTANCE OF TERMS AND PLATFORM DESCRIPTION',
      icon: IoDocumentTextOutline,
      content: `By accessing or using the ItWhip platform ("Platform"), mobile applications, or any related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use our Services.

ItWhip Technologies, Inc. ("ItWhip," "we," "us," or "our") operates a peer-to-peer car sharing marketplace that connects vehicle owners ("Hosts") with individuals seeking to rent vehicles ("Guests"). We are a technology platform that facilitates transactions between independent parties. We do not own, control, offer, or manage any vehicles listed on our Platform.

IMPORTANT DISCLAIMER: ItWhip is NOT a car rental company. We provide a platform for peer-to-peer car sharing. We do not own or operate any vehicles. All vehicles are owned and managed by independent Hosts. ItWhip acts solely as an intermediary to facilitate bookings between Hosts and Guests.

The Platform may also integrate with third-party rental providers through our partner network, including traditional rental companies accessible via global distribution systems (GDS). When booking through partner providers, additional terms may apply.

By using our Services, you represent that you have the legal capacity to enter into a binding contract and that you are not barred from using the Services under any applicable laws.`
    },
    {
      id: 'eligibility',
      title: '2. ELIGIBILITY AND VERIFICATION REQUIREMENTS',
      icon: IoCheckmarkCircle,
      content: `2.1 GUEST ELIGIBILITY REQUIREMENTS

To rent a vehicle through ItWhip, you must meet ALL of the following criteria:

Age Requirements:
• Minimum age 21 years for standard vehicles
• Minimum age 25 years for luxury, exotic, and specialty vehicles
• Maximum age restrictions may apply for certain vehicle categories
• Drivers under 25 may be subject to young driver surcharges

Driving Record Requirements:
• Valid, unexpired driver's license from your country of residence
• License held for minimum 1 year (2 years for luxury vehicles)
• No more than 2 moving violations in the past 3 years
• No more than 1 at-fault accident in the past 3 years
• No major violations in the past 7 years, including:
  - DUI/DWI or drug-related driving offenses
  - Reckless driving or speed racing
  - Driving with suspended or revoked license
  - Hit and run incidents
  - Vehicular assault or homicide

Verification Requirements:
• Pass identity verification through our third-party provider
• Submit to background check (may include criminal history)
• Provide valid payment method for security deposit
• Agree to facial recognition or biometric verification if required
• Consent to driving record check through DMV or equivalent

2.2 HOST ELIGIBILITY REQUIREMENTS

To list vehicles on ItWhip, Hosts must:
• Be at least 18 years of age
• Be the legal owner or authorized agent of the vehicle
• Provide proof of ownership (title or registration)
• Maintain continuous insurance coverage meeting state minimums
• Have authority to enter into rental agreements
• Complete tax information (W-9 or equivalent)
• Pass Host verification and quality standards
• Maintain minimum 4.0 rating after first 5 trips

2.3 VEHICLE LISTING REQUIREMENTS

All vehicles listed must meet these standards:

Age and Condition:
• Model year 2015 or newer (exceptions case-by-case for classics/specialty)
• Less than 130,000 miles on odometer
• Clean title (no salvage, rebuilt, or branded titles)
• No unrepaired safety recalls
• Current registration and inspection stickers
• Functional safety equipment (airbags, seatbelts, lights)

Documentation Requirements:
• Valid vehicle registration
• Proof of insurance meeting state minimums
• Recent photos (within 30 days) showing all angles
• Accurate vehicle identification number (VIN)
• Maintenance records available upon request

Prohibited Vehicles:
• Commercial vehicles requiring special licenses
• Vehicles with modifications affecting safety
• Vehicles subject to manufacturer buyback
• Vehicles with frame damage history
• Stolen or recovered theft vehicles`
    },
    {
      id: 'booking',
      title: '3. BOOKING PROCESS AND RENTAL AGREEMENTS',
      icon: IoCarOutline,
      content: `3.1 SEARCH AND BOOKING PROCESS

The booking process consists of:

1. Search Phase:
   • Browse available vehicles by location, dates, and features
   • View Host profiles, ratings, and vehicle details
   • Compare pricing including all fees and taxes
   • Check real-time availability calendar

2. Booking Request:
   • Submit driver's license for verification
   • Complete required screening questions
   • Authorize security deposit hold
   • Accept rental agreement terms
   • Choose protection plan level

3. Confirmation:
   • Instant booking (if enabled) or Host approval within 8 hours
   • Receive booking confirmation with trip details
   • Access to Host contact information
   • Pre-trip inspection checklist

3.2 RENTAL AGREEMENT FORMATION

Each booking creates a direct rental agreement between Host and Guest. ItWhip facilitates but is NOT a party to this agreement. The agreement includes:

• Rental period (start/end dates and times)
• Pickup/return locations
• Included mileage (typically 200 miles/day)
• Fuel policy (return at same level)
• Authorized drivers (primary renter only unless added)
• Territorial restrictions (typically within state)
• Prohibited uses and activities
• Damage responsibilities and deductibles

3.3 TRIP MODIFICATIONS

Changes to confirmed bookings:
• Guest-initiated changes require Host approval
• Time extensions subject to availability and additional charges
• Early returns typically non-refundable
• Location changes may incur relocation fees
• Additional drivers must be pre-approved ($15/day)

3.4 VEHICLE DELIVERY OPTIONS

Hosts may offer:
• Standard pickup at Host location (free)
• Airport delivery (typically $35-75 fee)
• Hotel/residence delivery (typically $25-50 fee)
• Contactless pickup via lockbox
• Valet exchange service (premium fee)

Delivery fees are set by Hosts and vary by distance. Guests are responsible for return delivery if different from pickup.`
    },
    {
      id: 'pricing',
      title: '4. PRICING, FEES, AND PAYMENT TERMS',
      icon: IoWalletOutline,
      content: `4.1 RENTAL PRICING STRUCTURE

Daily Rate Components:
• Base daily rate (set by Host)
• ItWhip platform service fee (15-20% of rental)
• State and local taxes (varies by jurisdiction)
• Tourism/rental car taxes where applicable
• Airport fees for airport pickups (10-15%)
• Young driver fee ($25-35/day if under 25)

4.2 PLATFORM FEES BREAKDOWN

Guest Fees:
• Service fee: 15-20% of rental subtotal
• Payment processing: 3% of total transaction
• Trust & safety fee: $5 per trip
• International transaction fee: 2.5% if applicable

Host Fees:
• Commission: 15-20% of rental revenue
• Payment processing: Included in commission
• Premium placement: Optional 5% for featured listings
• Insurance deductible buy-down: Optional $10-20/day

4.3 ADDITIONAL CHARGES

Mileage Overage:
• Included: 200 miles per day standard
• Overage rate: $0.35-0.75 per mile (Host determined)
• Unlimited mileage: Available on select vehicles (+$25/day)

Late Return Penalties:
• Grace period: 30 minutes
• Hourly late fee: $50/hour (up to 3 hours)
• Daily rate applies after 3 hours late
• Abandonment fee: $500 plus recovery costs

Violations and Fines:
• Smoking: $250 minimum
• Pet transport (if prohibited): $150
• Excessive cleaning: $50-250
• Tolls/tickets: Amount plus $25 processing
• Lost key/fob: $100-500 depending on vehicle

4.4 SECURITY DEPOSITS

Deposit amounts by vehicle class:
• Economy/Compact: $250-500
• Standard/Midsize: $500-750
• Luxury/Premium: $1,000-2,500
• Exotic/Specialty: $2,500-5,000

Deposit hold timeline:
• Authorized at booking confirmation
• Released within 3-7 business days after trip
• May take 7-14 days to appear depending on bank

4.5 HOST PAYMENT SCHEDULE

Payout Timeline:
• Trip completion: Funds released after 24 hours
• ACH transfer: 2-3 business days
• Instant payout: Available for 1.5% fee
• Weekly batch: Every Monday for previous week

Payment Methods:
• Direct deposit (ACH) - Standard
• Wire transfer - $25 fee
• PayPal/Venmo - 2.5% fee
• Stripe Connect - Instant availability

Tax Reporting:
• 1099-K issued for earnings over $600/year
• Hosts responsible for all applicable taxes
• ItWhip provides annual earnings summary
• Quarterly tax estimates recommended`
    },
    {
      id: 'cancellation',
      title: '5. CANCELLATION AND REFUND POLICY',
      icon: IoTimerOutline,
      content: `5.1 GUEST CANCELLATION POLICY

CANCELLATION TIMELINE AND REFUNDS:

72+ Hours Before Pickup:
• 100% refund of rental cost
• Full service fee refund if cancelling 7+ days before pickup
• Security deposit never charged
• Protection plan coverage continues until original pickup time
• No impact on your rental history or future booking privileges

24-72 Hours Before Pickup:
• 75% refund of rental cost
• Service fee non-refundable
• Protection plan remains active until pickup time
• Host may offer reschedule option at their discretion
• Priority rebooking assistance available through support

12-24 Hours Before Pickup:
• 50% refund of rental cost
• Service fee and protection plan non-refundable
• May request host consideration for documented emergency
• Support team can mediate special circumstances

Less Than 12 Hours Before Pickup:
• No refund of rental cost
• All fees non-refundable
• May affect future instant booking privileges
• Exceptions only for documented emergencies with protection plan coverage
• Host receives full payout minus platform fee

No-Show Policy:
• No refund plus potential account suspension
• $50 no-show fee may apply
• Negative impact on renter score
• Loss of instant book privileges

5.2 PROTECTION PLAN AND CANCELLATIONS

How Protection Plans Work:
• Coverage continues even after cancellation until original pickup time
• No separate charge - included in protection plan fee
• Part of platform protection, not separate insurance product
• If you rebook or change plans, you're still covered

Covered Special Circumstances (may receive full refund):
• Death or serious illness (documentation required within 14 days)
• Natural disasters affecting pickup/return area
• Government travel restrictions or mandates
• Vehicle mechanical failure (host's fault)
• Jury duty or court subpoena (documentation required)
• Military deployment or emergency duty
• Documented COVID-19 or contagious illness

Not Covered - No Refund:
• Change of plans or schedule conflicts
• Failed verification at pickup
• Invalid, expired, or suspended license discovered
• DUI/DWI discovered during verification
• False information provided during booking
• Credit card declined at pickup
• Weather conditions (unless natural disaster declared)

5.3 HOST CANCELLATION POLICY

When Host Cancels:
• Guest receives 100% refund including all fees
• Protection plan fee fully refunded
• ItWhip provides $50 travel credit for inconvenience
• Priority assistance finding alternative vehicle
• We may cover price difference for comparable replacement
• Host faces penalties and possible suspension

Host Penalties:
• First offense: $50 penalty fee
• Second offense: $100 penalty fee  
• Third offense: Account suspension (30 days)
• Fourth offense: Permanent termination
• Negative impact on Host metrics and search ranking
• Loss of Super Host eligibility for 6 months

Acceptable Host Cancellation Reasons:
• Vehicle mechanical issues (documentation required)
• Emergency safety recalls
• Documented medical emergency
• Natural disasters or government orders
• Previous Guest caused disabling damage
• Accident rendering vehicle unsafe

5.4 HOW TO CANCEL YOUR BOOKING

Steps to Cancel:
1. Open ItWhip app or website and log in
2. Go to "My Trips" in your dashboard
3. Select the booking you want to cancel
4. Click "Modify or Cancel Booking"
5. Review refund amount based on timing
6. Confirm cancellation
7. Receive instant confirmation with refund timeline

Pro Tip: Before cancelling, message your host about rescheduling. Many hosts prefer to modify dates rather than lose the booking entirely.

5.5 REFUND PROCESSING

Processing Timeline by Payment Method:
• Credit/Debit Cards: 5-10 business days
• PayPal: 3-5 business days
• Apple Pay/Google Pay: 3-5 business days
• ItWhip credit: Instant (can use immediately)
• Bank transfers: 7-14 business days

Important Notes:
• Refunds go to original payment method only
• Bank processing times may vary by institution
• Arizona Transaction Privilege Tax refunded per state law
• Security deposits are never charged if cancelled before pickup
• Protection plan coverage continues until pickup time
• Partial refunds may be issued for documented issues

5.6 MODIFICATION VS CANCELLATION

Booking Modifications:
• Contact host through messages to request date changes
• Many hosts are flexible with date modifications
• Changes may incur price differences but avoid cancellation penalties
• Modification requests subject to vehicle availability
• Must be requested at least 24 hours before pickup

5.7 DISPUTE RESOLUTION FOR CANCELLATIONS

If you believe cancellation policy was incorrectly applied:
• Contact support within 7 days of cancellation
• Provide documentation supporting your claim
• Allow 3-5 business days for review
• Appeals reviewed by protection plan team
• Final decisions within 10 business days

5.8 ITWHIP CANCELLATION RIGHTS

ItWhip may cancel bookings for:
• Failed identity or license verification
• Fraudulent activity or payment issues
• Safety concerns or policy violations
• Host/Guest request due to documented emergency
• Force majeure events (war, pandemic, natural disaster)
• Court orders or legal requirements
• Risk assessment flags

When ItWhip cancels:
• Full refund if cancelled for host issues
• Case-by-case review for guest-related cancellations
• No penalties for force majeure cancellations
• Alternative vehicle assistance when possible`
    },
    {
      id: 'insurance',
      title: '6. PROTECTION PLANS AND LIABILITY COVERAGE',
      icon: IoShieldCheckmarkOutline,
      warning: true,
      content: `6.1 IMPORTANT DISCLAIMERS

ItWhip is not an insurance company and does not provide insurance. Protection plans made available through our platform are contractual agreements that may include third-party liability insurance coverage provided by licensed insurers. ItWhip facilitates connections between vehicle owners and renters and provides certain protections as described below.

IMPORTANT: Physical damage protection provided by ItWhip is a contractual agreement, not an insurance policy. We will reimburse eligible damage costs up to the vehicle's actual cash value or $200,000, whichever is less, subject to the deductible and terms of your selected protection plan.

6.2 PROTECTION PLAN COVERAGE

Every trip includes our Standard Protection Plan featuring:
• Up to $1,000,000 in third-party liability protection*
• Physical damage protection with deductible options
• 24/7 roadside assistance
• Trip interruption coverage

*Third-party liability protection is provided under a policy issued to ItWhip by our insurance partner and is subject to terms, conditions, and exclusions. The policy does not provide coverage for damage to a host's vehicle.

Coverage Territory:
• United States (all 50 states)
• Canada (with prior approval)
• Mexico excluded unless specific endorsement

6.3 PHYSICAL DAMAGE PROTECTION OPTIONS

Protection Plan Tiers:

BASIC (Included):
• Deductible: $3,000
• Contractual reimbursement up to actual cash value
• Theft protection included
• Comprehensive event coverage
• Subject to terms and exclusions

STANDARD ($25/day):
• Deductible: $1,000
• Contractual reimbursement up to actual cash value
• Roadside assistance included
• Glass damage: $0 deductible
• Limited interior damage protection

PREMIUM ($45/day):
• Deductible: $500
• Contractual reimbursement up to agreed value
• Loss of use reimbursement: Up to 30 days
• Diminished value protection: Up to $2,500
• Key replacement included

6.4 PROTECTION PLAN LIMITATIONS

Protection plans apply only to vehicles with an actual cash value not exceeding $200,000. Vehicles valued above this amount require special commercial coverage arrangements. Exotic and luxury vehicles may be subject to additional restrictions.

Protection plans DO NOT cover:
• Interior damage (stains, tears, burns, odors)
• Mechanical breakdown or wear and tear
• Damage from off-road driving
• Damage while violating rental agreement terms
• Personal belongings left in vehicle
• Damage occurring in Mexico
• Acts of God beyond normal comprehensive events
• Intentional damage or gross negligence
• DUI/DWI related incidents
• Racing, stunts, or speed contests
• Commercial use without authorization
• Parking tickets or traffic violations

6.5 SECONDARY COVERAGE NOTICE

Protection plans act as secondary coverage. If you have personal auto insurance, any claims will be processed through your personal policy first. Our protection applies only after your personal insurance limits are exhausted or if your personal policy excludes peer-to-peer rentals.

This protection is secondary to any personal insurance you may have. Terms and exclusions apply. See additional incorporated terms about protection plans.

6.6 GUEST ACKNOWLEDGMENT

By booking this vehicle, you acknowledge that:
1. You have verified whether your personal auto insurance covers peer-to-peer rentals
2. You understand the protection plan limitations and deductibles
3. You may be financially responsible for damages not covered by protection plans
4. You are required to report any incident within 24 hours

6.7 CLAIMS PROCESS

In case of incident:
1. Ensure safety - call 911 if needed
2. Document everything - photos, police report
3. Report within 24 hours via app or website
4. Do not admit fault or make agreements
5. Cooperate with investigation
6. Submit required documentation:
   • Police report (if applicable)
   • Photos of damage
   • Witness information
   • Other party insurance info

Claims resolution:
• Initial review: 24-48 hours
• Documentation period: 7 days
• Decision timeline: 14-21 days
• Payment/repair authorization: 3-5 days after approval
• Appeals process: 30 days to dispute

6.8 HOST PROTECTION

Host Protection Plans:
Hosts select from multiple protection tiers. All plans include third-party liability protection up to $750,000. Physical damage reimbursement varies by plan selected, with deductibles ranging from $0 to $2,500.

This is NOT insurance for your vehicle. It is a contractual agreement for reimbursement of eligible damages.

Hosts must maintain:
• State minimum liability coverage
• Comprehensive and collision recommended
• Commercial use endorsement (if required by state)
• Provide proof of insurance quarterly

6.9 CONTACT FOR PROTECTION PLAN QUESTIONS

For protection plan questions or to report an incident:
• Submit a claim at itwhip.com/claims
• Email: info@itwhip.com
• Response time: Within 2 business hours during business days
• Emergency roadside assistance: Available 24/7 through app

For accidents, always call 911 first, then notify ItWhip within 24 hours.

Protection plans are administered by ItWhip. ItWhip is not licensed as an insurance producer, agent, or adjuster. For questions about third-party liability insurance included in protection plans, contact our insurance partner directly.`
    },
    {
      id: 'prohibited',
      title: '7. PROHIBITED USES AND CONDUCT',
      icon: IoWarningOutline,
      content: `7.1 PROHIBITED VEHICLE USES

Vehicles may NOT be used for:

Commercial Activities (without authorization):
• Rideshare services (Uber, Lyft)
• Food or package delivery
• Commercial hauling or towing
• Taxi or chauffeur services
• Any activity requiring commercial license/insurance

Illegal or Unsafe Activities:
• Transporting illegal substances or contraband
• Human trafficking or smuggling
• Fleeing law enforcement
• Committing crimes or illegal acts
• Transporting weapons without proper permits

Driving Restrictions:
• Racing, speed contests, or track events
• Stunt driving or deliberate unsafe operation
• Off-road use (unless specifically permitted)
• Driving on beaches or restricted areas
• Teaching someone to drive
• Driving while impaired or distracted

Vehicle Misuse:
• Exceeding passenger capacity
• Overloading cargo limits
• Towing beyond vehicle capacity
• Removing or disabling safety equipment
• Modifying or altering vehicle
• Subletting or re-renting

Geographic Restrictions:
• International travel without permission
• Entering Mexico without authorization
• Restricted military or government areas
• Natural disaster evacuation zones
• Areas with active travel warnings

7.2 PROHIBITED CONDUCT

Users may not:
• Provide false or misleading information
• Create multiple accounts to circumvent restrictions
• Use others' accounts or payment methods
• Harass, threaten, or discriminate
• Damage property intentionally
• Smoke/vape in vehicles (unless permitted)
• Transport animals (unless permitted)
• Leave vehicle unlocked or keys unattended
• Allow unauthorized drivers
• Violate Host rules or instructions

7.3 PLATFORM MISUSE

Prohibited platform activities:
• Circumventing ItWhip fees or payments
• Conducting transactions outside platform
• Scraping or mining platform data
• Using bots or automated systems
• Posting fake reviews or ratings
• Manipulating search results or rankings
• Sharing confidential user information
• Reverse engineering platform technology
• Violating intellectual property rights
• Engaging in fraudulent activities

7.4 CONSEQUENCES OF VIOLATIONS

Penalties may include:
• Immediate trip termination
• Forfeiture of security deposit
• Additional fines up to $5,000
• Account suspension or termination
• Legal prosecution where applicable
• Liability for all resulting damages
• Collection activities for unpaid amounts
• Negative reports to credit agencies
• Prohibition from future platform use
• Referral to law enforcement`
    },
    {
      id: 'liability',
      title: '8. LIMITATION OF LIABILITY AND DISCLAIMERS',
      icon: IoAlertCircleOutline,
      warning: true,
      content: `8.1 PLATFORM ROLE DISCLAIMER

IMPORTANT DISCLAIMER: ITWHIP IS A TECHNOLOGY PLATFORM THAT FACILITATES PEER-TO-PEER CAR SHARING. WE DO NOT OWN, CONTROL, MANAGE, OR MAINTAIN ANY VEHICLES. WE ARE NOT A PARTY TO THE RENTAL AGREEMENT BETWEEN HOSTS AND GUESTS.

ItWhip does not:
• Guarantee vehicle availability or condition
• Endorse or recommend specific Hosts or Guests
• Control Host or Guest actions
• Inspect vehicles personally
• Provide transportation services
• Act as an insurer or insurance broker
• Guarantee insurance coverage approval
• Control third-party services or providers

8.2 AS-IS SERVICE PROVISION

THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING:
• MERCHANTABILITY OR FITNESS FOR PURPOSE
• ACCURACY OR COMPLETENESS OF INFORMATION
• UNINTERRUPTED OR ERROR-FREE OPERATION
• SECURITY OR DATA PROTECTION
• THIRD-PARTY SERVICES OR CONTENT
• VEHICLE QUALITY OR SAFETY

8.3 LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

ItWhip's aggregate liability shall not exceed the greater of:
• $100 USD, or
• The amount of fees paid by you to ItWhip in the 12 months preceding the claim

ItWhip is NOT liable for:
• Indirect, incidental, or consequential damages
• Lost profits or business opportunities
• Loss of data or information
• Personal injury or property damage
• Emotional distress or mental anguish
• Third-party claims or demands
• Acts or omissions of Hosts or Guests
• Vehicle defects or malfunctions
• Insurance coverage denials
• Force majeure events

8.4 INDEMNIFICATION

You agree to indemnify, defend, and hold harmless ItWhip, its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, and expenses arising from:

• Your use of the Services or Platform
• Your violation of these Terms
• Your violation of any laws or regulations
• Your violation of third-party rights
• Your rental or use of any vehicle
• Disputes between Hosts and Guests
• Your negligence or willful misconduct
• Your unauthorized use of the Platform
• Content you submit to the Platform
• Tax obligations arising from your activities

8.5 ASSUMPTION OF RISK

By using ItWhip, you acknowledge and assume all risks associated with:
• Peer-to-peer car sharing
• Driving or riding in vehicles
• Interacting with other users
• Relying on user-provided information
• Protection plan coverage gaps
• Vehicle mechanical issues
• Accidents or incidents
• Financial losses
• Legal liabilities
• Personal injury or death

8.6 RELEASE OF CLAIMS

You release ItWhip from all claims related to:
• Disputes with other users
• Vehicle condition or safety
• Protection plan coverage disputes
• Accident-related claims
• Quality of services provided
• User-generated content accuracy
• Third-party services or products
• Platform technical issues
• Communication failures
• Booking disputes or cancellations`
    },
    {
      id: 'user-obligations',
      title: '9. USER RESPONSIBILITIES AND OBLIGATIONS',
      icon: IoBusinessOutline,
      content: `9.1 GENERAL USER OBLIGATIONS

All users must:
• Provide accurate, current information
• Maintain account security and confidentiality
• Promptly update any changed information
• Comply with all applicable laws
• Respect other users and their property
• Communicate professionally and respectfully
• Report safety concerns immediately
• Cooperate with investigations
• Pay all fees and charges when due
• Maintain valid contact information

9.2 HOST SPECIFIC OBLIGATIONS

Vehicle Maintenance:
• Perform regular maintenance per manufacturer specs
• Keep current registration and inspection
• Address recalls promptly
• Maintain clean interior and exterior
• Ensure all safety features function
• Replace worn tires and brakes
• Keep maintenance records
• Provide accurate odometer readings

Listing Accuracy:
• Upload current photos (within 30 days)
• Disclose all known issues or defects
• Update availability calendar regularly
• Accurately describe features and amenities
• Set fair, competitive pricing
• Honor confirmed bookings
• Respond to inquiries within 8 hours
• Maintain minimum 4.0 rating

Legal Compliance:
• Maintain required insurance coverage
• Comply with local rental regulations
• Report rental income for taxes
• Obtain necessary permits or licenses
• Follow consumer protection laws
• Maintain required business registrations
• Keep required records (3 years minimum)

9.3 GUEST SPECIFIC OBLIGATIONS

Pre-Trip Requirements:
• Complete identity verification
• Review and accept rental terms
• Perform pre-trip inspection
• Document existing damage
• Verify insurance coverage
• Understand vehicle operations
• Review Host rules and guidelines

During Rental:
• Drive safely and legally at all times
• Follow all traffic laws and regulations
• Maintain vehicle security
• Report issues immediately
• Respect mileage limitations
• Refuel as agreed
• Keep vehicle reasonably clean
• Park in safe, legal locations
• Prevent unauthorized use
• Monitor for maintenance needs

Return Obligations:
• Return on time to agreed location
• Return with agreed fuel level
• Remove all personal belongings
• Clean excessive mess or dirt
• Report any new damage
• Complete post-trip inspection
• Submit trip feedback
• Pay additional charges promptly

9.4 COMMUNICATION STANDARDS

All users must:
• Use platform messaging when possible
• Keep records of important communications
• Respond to messages within 24 hours
• Provide accurate contact information
• Report harassment or inappropriate behavior
• Maintain professional tone
• Avoid discriminatory language
• Respect privacy of others
• Not share personal financial information
• Document agreements in writing

9.5 FINANCIAL RESPONSIBILITIES

Payment Obligations:
• Maintain valid payment method
• Ensure sufficient funds for deposits
• Pay all charges within terms
• Dispute charges properly through platform
• Report payment issues promptly
• Not circumvent platform fees
• Update payment information as needed
• Authorize recurring charges if applicable

Tax Responsibilities:
• Report income as required by law
• Pay applicable taxes timely
• Maintain necessary tax records
• Obtain required tax IDs
• Issue 1099s if required (Hosts)
• Collect and remit sales tax if applicable
• Understand tax implications
• Consult tax professionals as needed`
    },
    {
      id: 'privacy',
      title: '10. PRIVACY, DATA PROTECTION, AND SECURITY',
      icon: IoLockClosedOutline,
      content: `10.1 DATA COLLECTION

Information we collect:

Account Information:
• Name, email, phone number
• Date of birth for age verification
• Driver's license details
• Address for verification
• Payment method information
• Tax identification numbers (Hosts)
• Emergency contact information

Verification Data:
• Government ID images
• Selfie for facial recognition
• Driving record information
• Criminal background check results
• Credit check information (soft pull)
• Insurance verification
• Vehicle registration (Hosts)

Usage Data:
• Search and booking history
• Communication between users
• Location data during trips
• Device and browser information
• IP addresses and session data
• Click-through and page views
• App usage analytics
• Customer service interactions

10.2 DATA USE PURPOSE

We use collected data to:
• Facilitate bookings and payments
• Verify identity and eligibility
• Prevent fraud and ensure safety
• Process protection plan claims
• Provide customer support
• Improve platform features
• Send transactional communications
• Market relevant services (with consent)
• Comply with legal obligations
• Resolve disputes
• Generate anonymized analytics
• Train safety and fraud models

10.3 DATA SHARING

We share data with:

Service Providers:
• Payment processors (Stripe, PayPal)
• Identity verification (Jumio, Onfido)
• Background check providers
• Insurance carriers and adjusters
• Cloud storage providers (AWS)
• Communication services (Twilio, SendGrid)
• Analytics providers (with anonymization)
• Customer support tools

Legal Requirements:
• Law enforcement (with valid request)
• Courts (pursuant to subpoena)
• Regulators (as required by law)
• Emergency situations (imminent harm)
• Legal proceedings (as necessary)

Other Users (limited):
• Name and profile photo
• Ratings and reviews
• Response time and rate
• Vehicle information (Hosts)
• General location (city level)
• Verification badges

10.4 DATA RETENTION

Retention periods:
• Account information: Duration of account plus 7 years
• Transaction records: 7 years (tax requirements)
• Communications: 3 years
• Verification documents: 1 year after verification
• Marketing preferences: Until withdrawn
• Technical logs: 90 days
• Deleted accounts: 30 days (recovery period)

10.5 USER RIGHTS

You have the right to:
• Access your personal data
• Correct inaccurate information
• Delete your account and data
• Port data to another service
• Opt-out of marketing communications
• Object to certain processing
• Restrict processing in some cases
• Withdraw consent where applicable
• File complaints with regulators
• Request human review of automated decisions

10.6 SECURITY MEASURES

We implement:
• Encryption in transit and at rest
• Multi-factor authentication
• Regular security audits
• PCI compliance for payments
• Access controls and monitoring
• Incident response procedures
• Regular security training
• Vulnerability testing
• Data breach notifications
• Secure development practices

For full privacy details, see our Privacy Policy at www.itwhip.com/privacy`
    },
    {
      id: 'disputes',
      title: '11. DISPUTE RESOLUTION AND ARBITRATION',
      icon: IoGlobeOutline,
      content: `11.1 DISPUTE RESOLUTION PROCESS

Initial Resolution (Required First Step):
1. Contact customer support within 30 days
2. Provide detailed description and documentation
3. Allow 10 business days for investigation
4. Participate in resolution attempts
5. Consider mediation if offered

Escalation Process:
1. Request supervisor review if unsatisfied
2. Submit formal written complaint
3. Provide additional documentation
4. Allow 15 business days for review
5. Receive final platform determination

11.2 BINDING ARBITRATION AGREEMENT

BY USING ITWHIP, YOU AGREE TO BINDING ARBITRATION FOR ALL DISPUTES, WAIVING YOUR RIGHT TO COURT TRIAL BY JUDGE OR JURY.

Arbitration Terms:
• Governed by Federal Arbitration Act
• Administered by American Arbitration Association (AAA)
• Consumer Arbitration Rules apply
• Single arbitrator selection
• Location: Phoenix, Arizona or phone/video
• Each party bears own attorney fees
• ItWhip pays arbitration fees over $250
• Decision is final and binding
• Limited court appeal rights
• 1-year limitation period

11.3 CLASS ACTION WAIVER

YOU WAIVE ANY RIGHT TO PARTICIPATE IN CLASS ACTION LAWSUITS AGAINST ITWHIP. ALL DISPUTES MUST BE BROUGHT INDIVIDUALLY.

This means:
• No class or collective actions
• No class-wide arbitrations
• No representative actions
• No private attorney general actions
• No consolidation of claims
• Individual relief only
• No public injunctive relief

11.4 EXCEPTIONS TO ARBITRATION

The following may be brought in court:
• Small claims court matters (under $10,000)
• Intellectual property disputes
• Injunctive relief for violations
• Collections of unpaid fees

11.5 GOVERNING LAW

These Terms are governed by:
• Laws of the State of Arizona
• Without regard to conflict of laws
• Federal law where applicable
• Venue in Maricopa County
• English language controls
• UN Convention on Contracts excluded

11.6 SEVERABILITY

If any provision is found invalid:
• Remaining provisions continue
• Invalid provision modified minimally
• Intent preserved where possible
• No effect on other sections
• Court may reform as needed
• Arbitration provisions severable`
    },
    {
      id: 'termination',
      title: '12. ACCOUNT TERMINATION AND SUSPENSION',
      icon: IoLockClosedOutline,
      content: `12.1 TERMINATION BY USER

You may terminate your account by:
• Submitting request via app/website
• Emailing info@itwhip.com
• Completing all active bookings
• Paying all outstanding amounts
• Removing vehicle listings (Hosts)
• Downloading your data if desired

Effect of termination:
• Active bookings must be completed
• Future bookings cancelled
• No refund of fees paid
• Data retained per retention policy
• Reviews remain visible
• Cannot create new account for 90 days

12.2 TERMINATION BY ITWHIP

We may suspend or terminate accounts for:

Immediate Termination Causes:
• Fraudulent activity or identity theft
• Safety threats to other users
• Criminal activity or arrests
• Severe policy violations
• Court orders or legal requirements
• Providing false information
• Payment fraud or chargebacks
• Harassment or discrimination
• Multiple account creation
• Circumventing platform fees

Progressive Discipline Causes:
• First violation: Warning
• Second violation: 7-day suspension
• Third violation: 30-day suspension
• Fourth violation: Permanent termination

Examples include:
• Late returns or cancellations
• Minor policy violations
• Poor ratings (below 3.0)
• Unresponsive communication
• Listing inaccuracies

12.3 SUSPENSION PENDING INVESTIGATION

Accounts may be suspended during:
• Accident investigations
• Protection plan claims
• Payment disputes
• User complaints
• Verification issues
• Legal proceedings
• Safety concerns
• Background check updates

12.4 APPEAL PROCESS

To appeal termination:
1. Submit written appeal within 30 days
2. Provide supporting documentation
3. Explain circumstances
4. Propose remedial actions
5. Await review (10-15 business days)

Appeals considered for:
• Mistaken identity
• Incorrect information
• Extenuating circumstances
• First-time violations
• Demonstrated remediation
• Technical errors

12.5 EFFECTS OF TERMINATION

Upon termination:
• Loss of platform access
• Cancellation of future bookings
• Forfeiture of promotional credits
• Completion of pending payouts
• Retention of records for legal purposes
• Possible reporting to authorities
• Collection of outstanding amounts
• Enforcement of arbitration clause

12.6 REACTIVATION

Terminated accounts may request reactivation after:
• 90-day waiting period
• Resolution of termination cause
• Payment of outstanding amounts
• New verification process
• Acceptance of updated terms
• Probationary period (6 months)
• Higher security deposits
• Limited features initially`
    },
    {
      id: 'esg',
      title: '13. ENVIRONMENTAL, SOCIAL & GOVERNANCE',
      icon: IoGlobeOutline,
      content: `13.1 ENVIRONMENTAL COMMITMENTS

ItWhip is committed to sustainable transportation:

Vehicle Standards:
• Priority placement for electric and hybrid vehicles
• Fuel efficiency requirements for listing approval
• Encouraging newer, cleaner vehicles (2015+ requirement)
• Supporting alternative fuel vehicles

Carbon Reduction:
• Car sharing reduces individual vehicle ownership
• One shared car replaces 9-13 privately owned vehicles
• Reduced parking infrastructure needs
• Lower urban congestion and emissions

Platform Operations:
• Carbon-neutral data centers and servers
• Paperless transactions and agreements
• Digital verification processes
• Remote-first operations reducing office footprint

13.2 SOCIAL RESPONSIBILITY

Community Impact:
• Supporting local Phoenix economy
• Enabling supplemental income for hosts
• Providing affordable transportation options
• Serving areas with limited public transit

Accessibility:
• Platform designed for WCAG compliance
• Support for users with disabilities
• Adaptive vehicle listings highlighted
• Alternative communication methods available

Fair Access:
• Non-discriminatory policies
• Multiple payment options accepted
• No credit score requirements for guests
• Transparent pricing without hidden fees

Safety First:
• Comprehensive protection plans for all users
• Quick response support
• Regular vehicle safety requirements
• Background checks and verification

13.3 GOVERNANCE PRACTICES

Ethical Operations:
• Transparent fee structure
• Clear terms and conditions
• Fair dispute resolution process
• User privacy protection

Data Governance:
• CCPA and GDPR compliance
• Minimal data collection policy
• User control over personal information
• No selling of user data

Host Protection:
• Fair commission structure (15-20%)
• Fast payment processing (48-72 hours)
• Protection against false claims
• Support for small business hosts

Regulatory Compliance:
• Licensed business operations
• Tax compliance and reporting
• Regulatory compliance
• Consumer protection adherence

13.4 ESG REPORTING

Annual Commitments:
• Publish annual impact report
• Track carbon offset metrics
• Report host earnings impact
• Measure community benefit

Continuous Improvement:
• Regular ESG policy reviews
• Stakeholder feedback integration
• Industry best practice adoption
• Third-party ESG assessments considered

For detailed ESG information and our annual impact report, visit www.itwhip.com/sustainability

By using ItWhip, you support sustainable, community-driven transportation that benefits people and planet.`
    },
    {
      id: 'misc',
      title: '14. MISCELLANEOUS PROVISIONS',
      icon: IoDocumentTextOutline,
      content: `14.1 ENTIRE AGREEMENT

These Terms constitute the entire agreement between you and ItWhip, superseding any prior agreements, representations, or understandings, whether written or oral.

14.2 MODIFICATION OF TERMS

• We may modify these Terms at any time
• Material changes require 30 days notice
• Notice via email or platform notification
• Continued use constitutes acceptance
• Review Terms regularly for updates
• Previous versions available upon request

14.3 ASSIGNMENT

• You may not assign your rights without consent
• ItWhip may assign freely
• Successors and assigns bound
• Change of control permitted
• Notice of assignment provided

14.4 WAIVER

• No waiver unless in writing
• Single waiver not continuing
• Delay not waiver of rights
• Partial exercise not preclusion
• Rights cumulative

14.5 FORCE MAJEURE

Neither party liable for failure due to:
• Natural disasters
• War or terrorism
• Government actions
• Pandemic or epidemic
• Labor disputes
• Infrastructure failures
• Internet disruptions
• Other events beyond control

14.6 NOTICES

Legal notices must be sent to:
ItWhip Technologies, Inc.
Legal Department
info@itwhip.com

User notices sent to:
• Registered email address
• Platform notifications
• SMS to verified number
• Last known address

14.7 RELATIONSHIP OF PARTIES

• Independent contractors, not partners
• No joint venture created
• No employer-employee relationship
• No agency relationship
• Each party bears own costs

14.8 THIRD-PARTY RIGHTS

• No third-party beneficiaries
• Except protection plan provisions
• And indemnified parties
• Platform providers protected
• Service providers included

14.9 INTERPRETATION

• Headings for convenience only
• "Including" means "including without limitation"
• "Or" is inclusive
• Singular includes plural
• No construction against drafter

14.10 SURVIVAL

The following survive termination:
• Arbitration provisions
• Limitation of liability
• Indemnification
• Intellectual property
• Confidentiality
• Payment obligations
• Data retention rights
• Dispute resolution

14.11 ELECTRONIC COMMUNICATIONS

You consent to:
• Electronic delivery of notices
• Electronic signatures binding
• Email as written notice
• Platform messages as notice
• No paper copies required

14.12 SEVERABILITY

If any provision is invalid:
• Remaining provisions enforceable
• Invalid provision modified minimally
• Intent preserved
• No effect on other provisions
• Court reformation permitted`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      <div className="pt-16">
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-3">
                <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Terms of Service
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Last Updated: January 15, 2025 • Effective Date: January 15, 2025
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
                    Important: Peer-to-Peer Car Sharing Platform
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                    ItWhip operates a technology platform connecting vehicle owners with renters. We do not own vehicles 
                    or provide rental services directly. All vehicles are owned and operated by independent Hosts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id} className={section.warning ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <section.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${section.warning ? 'text-red-600' : 'text-amber-600'}`} />
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-left">
                          {section.title}
                        </h2>
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
                Contact Information
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>ItWhip Technologies, Inc.</strong></p>
                <p>Email: info@itwhip.com</p>
                <p>Support Response Time: Within 2-4 hours during business hours</p>
                <p>Business Hours: Monday - Sunday, 7:00 AM - 9:00 PM MST</p>
                <p>Emergency: For accidents or urgent safety issues, contact local authorities first, then notify us immediately</p>
                <p className="italic text-xs mt-2">Physical address provided upon request for legal notices</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}