'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
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
  IoCheckmarkCircle,
  IoBusinessOutline,
  IoCarOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFingerPrintOutline,
  IoServerOutline,
  IoAnalyticsOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoTimerOutline,
  IoCloudOutline,
  IoKeyOutline
} from 'react-icons/io5'

export default function PrivacyPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'introduction',
      title: '1. INTRODUCTION AND SCOPE',
      icon: IoInformationCircleOutline,
      content: `1.1 ABOUT THIS PRIVACY POLICY

This Privacy Policy describes how ItWhip Technologies, Inc. ("ItWhip," "we," "us," or "our") collects, uses, shares, and protects personal information when you use our peer-to-peer car sharing platform and related services (collectively, the "Services"). This Policy applies to all users of our platform, including:

• Guests - Individuals who rent vehicles through our platform
• Hosts - Vehicle owners who list their cars for rental
• Visitors - Anyone who browses our website or mobile applications
• Business Partners - Corporate accounts and fleet managers
• Prospective Users - Individuals in the verification process

By accessing or using our Services, you acknowledge that you have read, understood, and agree to our data collection, use, and sharing practices as described in this Privacy Policy.

1.2 PLATFORM DESCRIPTION

ItWhip operates a technology platform that facilitates peer-to-peer car sharing between independent vehicle owners and renters. We are not a car rental company and do not own the vehicles listed on our platform. Our role is to:

• Provide the technology infrastructure for bookings
• Process payments between parties
• Verify user identities and driving eligibility
• Facilitate protection plan coverage during rental periods
• Enable communication between Hosts and Guests
• Ensure platform safety and security

1.3 DATA CONTROLLER INFORMATION

ItWhip Technologies, Inc. is the data controller responsible for your personal information. For privacy-related inquiries or to exercise your rights, contact us at:

Email: info@itwhip.com
Response Time: Within 2-4 hours during business hours (7:00 AM - 9:00 PM MST)
Mailing Address: Provided upon request for legal notices

1.4 UPDATES TO THIS POLICY

We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or business operations. We will notify you of material changes through:

• Email notification to your registered address
• In-app notifications for mobile users
• Prominent notice on our website
• Update to the "Last Modified" date

Continued use of our Services after updates constitutes acceptance of the revised Policy. We encourage you to review this Policy regularly.`
    },
    {
      id: 'collection',
      title: '2. INFORMATION WE COLLECT',
      icon: IoPhonePortraitOutline,
      content: `2.1 INFORMATION YOU PROVIDE DIRECTLY

Account Registration Information:
• Full legal name and preferred display name
• Email address and phone number
• Date of birth (for age verification)
• Residential address
• Profile photo (optional for Guests, recommended for Hosts)
• Password and security questions

Identity Verification (All Users):
• Government-issued ID (driver's license, passport, state ID)
• Selfie for facial recognition matching
• Driver's license details including:
  - License number and state of issuance
  - Expiration date
  - License class and endorsements
  - Driving history authorization

For Hosts - Additional Information:
• Vehicle registration documents
• Vehicle identification number (VIN)
• Proof of insurance documentation
• Bank account or payment information for payouts
• Tax identification number (SSN or EIN)
• Business entity information (if applicable)
• Vehicle photos from multiple angles
• Maintenance records (optional)

For Guests - Additional Information:
• Additional driver information (if applicable)
• Emergency contact details
• Employer information (for business accounts)
• International driver permit (if applicable)

2.2 INFORMATION COLLECTED AUTOMATICALLY

Device and Technical Information:
• IP address and approximate location
• Device type, operating system, and version
• Browser type and language settings
• Mobile device identifiers (IDFA, Android ID)
• Screen resolution and device settings
• Network connection type and speed
• App version and installation ID

Usage and Analytics Data:
• Pages viewed and features used
• Search queries and filters applied
• Click-through rates and navigation paths
• Session duration and frequency
• Booking patterns and preferences
• Error logs and performance data
• Interaction with customer support

Location Information:
• Device location (with permission) for:
  - Finding nearby vehicles
  - Navigation to pickup locations
  - Verifying trip start/end points
  - Emergency assistance
  - Fraud prevention
• Location data during active rentals
• Frequently visited locations (anonymized)

2.3 INFORMATION FROM THIRD PARTIES

Verification Services:
• Identity verification results from our service providers
• Driving record checks from DMV databases
• Criminal background check results (where permitted)
• Credit check information (soft pull, does not affect credit score)
• Insurance verification status
• Social media profiles (if you choose to connect)

Payment Providers:
• Transaction success/failure status
• Payment method verification
• Fraud risk scores
• Chargeback and dispute information

Protection Plan Partners:
• Claims history (with consent)
• Coverage verification
• Risk assessment data
• Incident reports

Other Sources:
• Publicly available information
• Marketing partners (with consent)
• Referral program participants
• Reviews and ratings from users
• Vehicle history reports (for Hosts)

2.4 SENSITIVE INFORMATION

We limit collection of sensitive data to what is necessary for our Services:

• Biometric data (facial recognition for identity verification only)
• Precise location (only during active rentals and with permission)
• Government identifiers (driver's license, SSN for tax reporting)
• Financial account information (encrypted and tokenized)

We do not intentionally collect:
• Health or medical information (except as related to driving ability)
• Race, ethnicity, or religious beliefs
• Political opinions or affiliations
• Sexual orientation or gender identity
• Genetic or biometric data beyond verification needs`
    },
    {
      id: 'use',
      title: '3. HOW WE USE YOUR INFORMATION',
      icon: IoBusinessOutline,
      content: `3.1 PRIMARY USES

Service Delivery and Operations:
• Create and manage user accounts
• Facilitate vehicle bookings and rentals
• Process payments and disbursements
• Verify identity and driving eligibility
• Match Guests with appropriate vehicles
• Enable Host-Guest communication
• Calculate pricing and fees
• Manage cancellations and modifications
• Process protection plan claims

Safety and Security:
• Verify user identities and backgrounds
• Prevent fraud and financial crimes
• Investigate safety incidents
• Respond to emergencies (including sharing location with emergency services)
• Monitor for prohibited activities
• Enforce our Terms of Service
• Protect users from harm
• Maintain platform integrity

Trust and Verification:
• Build user trust through verification badges
• Display ratings and reviews
• Create host performance metrics
• Track guest reliability scores
• Verify insurance coverage
• Validate vehicle ownership
• Confirm maintenance compliance

3.2 COMMUNICATIONS

Transactional Communications (Cannot Opt-Out):
• Booking confirmations and updates
• Payment receipts and invoices
• Security alerts and warnings
• Legal notices and policy updates
• Safety recalls affecting booked vehicles
• Verification status updates
• Account security notifications
• Tax documents (1099s for Hosts)

Service Communications (Limited Opt-Out):
• Trip reminders and logistics
• Host-Guest messaging
• Review and rating requests
• Incomplete booking reminders
• Account activity summaries
• Platform maintenance notices
• Feature updates and tips

Marketing Communications (Can Opt-Out):
• Promotional offers and discounts
• New feature announcements
• Partner offers and benefits
• Referral program invitations
• Survey and research requests
• Event invitations
• Newsletter subscriptions

3.3 PERSONALIZATION AND IMPROVEMENT

Platform Enhancement:
• Improve search algorithms and recommendations
• Develop new features based on usage patterns
• Optimize pricing strategies
• Enhance user interface and experience
• Fix bugs and technical issues
• Conduct A/B testing
• Analyze market trends
• Improve customer support

Personalized Experience:
• Remember your preferences and settings
• Suggest vehicles based on past rentals
• Customize search results
• Provide relevant promotions
• Tailor content to your location
• Pre-fill forms with saved information
• Maintain favorite lists

3.4 LEGAL AND COMPLIANCE

Regulatory Requirements:
• Comply with know-your-customer (KYC) regulations
• Report earnings to tax authorities
• Respond to legal process and law enforcement requests
• Investigate violations of our policies
• Protect intellectual property rights
• Comply with consumer protection laws
• Maintain records as legally required
• Process data subject requests

Business Purposes:
• Conduct internal audits
• Manage risk and insurance requirements
• Merger, acquisition, or sale preparations
• Corporate reporting and analytics
• Investor relations (anonymized data)
• Regulatory compliance reporting`
    },
    {
      id: 'sharing',
      title: '4. HOW WE SHARE YOUR INFORMATION',
      icon: IoGlobeOutline,
      content: `4.1 SHARING BETWEEN USERS

Information Shared with Hosts (when you book):
• Your first name and last initial
• Profile photo (if provided)
• Age range (not exact date of birth)
• Verification status badges
• City and state of residence
• Number of trips completed
• Average rating
• Booking details (dates, times, purpose if business)
• Special requests or requirements
• Approximate pickup location (exact address after confirmation)

Information Shared with Guests (about Hosts):
• Host name and profile photo
• Response rate and time
• Number of trips hosted
• Average rating and reviews
• Vehicle details and photos
• Availability calendar
• Host rules and guidelines
• Approximate vehicle location
• Verification badges
• Business information (if applicable)

Post-Booking Information Exchange:
• Phone numbers (masked through our platform)
• Exact pickup/return addresses
• Real-time location during delivery (if applicable)
• Emergency contact information (in case of incident)
• Protection plan claim details (if necessary)

4.2 SERVICE PROVIDERS

We share information with carefully selected vendors who help us operate:

Payment Processing:
• Payment card networks and processors
• Bank and financial institutions
• Payment fraud detection services
• Chargeback management services
• Tax calculation and remittance services

Verification and Screening:
• Identity verification providers
• Background check companies
• Driving record verification services
• Document authentication services
• Facial recognition technology providers

Protection Plans and Risk Management:
• Insurance partners and underwriters
• Claims administrators
• Risk assessment providers
• Incident response teams
• Emergency roadside assistance

Technology Infrastructure:
• Cloud hosting providers
• Content delivery networks
• Analytics services
• Communication platforms (email, SMS, push)
• Customer support tools
• Mapping and navigation services

Marketing and Analytics:
• Advertising platforms (anonymized data)
• Email marketing services
• Analytics providers
• Survey and feedback platforms
• Affiliate partners

4.3 LEGAL DISCLOSURES

We may disclose your information when required by law or to protect rights and safety:

Legal Process:
• Court orders and subpoenas
• Search warrants
• Discovery requests in litigation
• Government agency requests
• Regulatory investigations
• Tax authority requirements

Safety and Protection:
• Prevent imminent physical harm
• Investigate suspected fraud
• Protect against liability
• Enforce our Terms of Service
• Protect our rights and property
• Emergency situations requiring disclosure

4.4 BUSINESS TRANSFERS

In the event of a business transaction, your information may be transferred:
• Mergers or acquisitions
• Sale of company assets
• Bankruptcy or reorganization
• Corporate restructuring
• Due diligence processes (under confidentiality)

4.5 AGGREGATED AND ANONYMIZED DATA

We share non-identifiable information for:
• Industry reports and research
• Marketing and promotional materials
• Investor presentations
• Public policy advocacy
• Academic research partnerships
• Urban planning initiatives
• Environmental impact studies

This data cannot be used to identify individual users and includes:
• Usage statistics and trends
• Demographic distributions
• Geographic heat maps
• Popular vehicle types
• Rental duration patterns
• Seasonal demand fluctuations`
    },
    {
      id: 'security',
      title: '5. DATA SECURITY AND RETENTION',
      icon: IoShieldCheckmarkOutline,
      content: `5.1 SECURITY MEASURES

Technical Safeguards:
• Industry-standard encryption for data in transit
• Encryption for data at rest
• Tokenization of sensitive payment information
• Multi-factor authentication options
• Regular security assessments
• Security testing by third parties
• Intrusion detection and prevention systems
• DDoS protection and mitigation
• Secure coding practices and review
• Regular security patches and updates

Administrative Controls:
• Role-based access controls
• Principle of least privilege
• Regular security training for employees
• Background checks for employees
• Confidentiality agreements
• Security incident response team
• Regular security audits
• Vendor security assessments
• Data processing agreements with partners

Physical Security:
• Secured data center facilities
• Monitoring and surveillance systems
• Access controls
• Redundant power and cooling systems
• Geographic distribution of data
• Regular backups and disaster recovery
• Business continuity planning

Note: While we implement comprehensive security measures, no method of transmission or storage is 100% secure. We continuously work to protect your information but cannot guarantee absolute security.

5.2 DATA RETENTION

We retain your information for as long as necessary to provide our Services and comply with legal obligations:

Active Account Information:
• Profile data: Duration of account plus 7 years
• Booking history: 7 years (tax and legal requirements)
• Payment records: 7 years (financial regulations)
• Communications: 3 years
• Search history: 1 year
• Location data: 90 days after trip completion

Verification Documents:
• Government IDs: 1 year after verification or account closure
• Selfies: 1 year after verification
• Insurance documents: Duration of coverage plus 1 year
• Vehicle registration: Duration of listing plus 1 year

After Account Closure:
• 30-day grace period for reactivation
• Essential records retained for legal compliance (7 years)
• Anonymization of remaining data
• Deletion of unnecessary personal information
• Retention of aggregated analytics data

Legal Holds:
• Extended retention when required by legal process
• Suspension of deletion during investigations
• Compliance with litigation holds
• Regulatory audit requirements

5.3 DATA BREACH RESPONSE

In the event of a security incident:

Immediate Response:
• Contain and assess the breach
• Engage forensic security experts
• Notify law enforcement if appropriate
• Preserve evidence for investigation

User Notification:
• Notify affected users as required by law
• Provide details of compromised information
• Offer identity protection services if appropriate
• Provide guidance on protective measures
• Regular updates on investigation progress

Remediation:
• Strengthen security measures
• Implement additional safeguards
• Conduct thorough investigation
• Provide transparency report
• Take appropriate corrective actions

5.4 YOUR SECURITY RESPONSIBILITIES

Help protect your account by:
• Using strong, unique passwords
• Enabling two-factor authentication
• Keeping login credentials confidential
• Logging out of shared devices
• Reporting suspicious activity immediately
• Keeping your contact information current
• Reviewing account activity regularly
• Being cautious of phishing attempts
• Verifying communications are from ItWhip
• Using secure networks when accessing your account`
    },
    {
      id: 'rights',
      title: '6. YOUR PRIVACY RIGHTS',
      icon: IoKeyOutline,
      content: `6.1 ACCESS AND PORTABILITY

You have the right to:

Access Your Information:
• Request a copy of all personal data we hold about you
• Receive information about how we process your data
• Know the categories of data collected
• Understand the purposes of processing
• Learn about third parties we share with
• Get copies of specific documents or records

Data Portability:
• Receive your data in a structured, commonly used format (JSON/CSV)
• Transfer your data directly to another service (where technically feasible)
• Export your booking history
• Download your reviews and ratings
• Access your earnings reports (Hosts)
• Retrieve your communication history

How to Request Access:
• Submit request via info@itwhip.com
• Verify your identity for security
• Receive response within 30 days
• No fee for first request annually
• Reasonable fee for excessive requests

6.2 CORRECTION AND ACCURACY

Update Your Information:
• Correct inaccurate personal data
• Complete incomplete information
• Update outdated details
• Clarify ambiguous data
• Add supplementary information

Methods to Update:
• Self-service through account settings
• Contact customer support
• Submit documentation for verification changes
• Request manual review of automated decisions

We will:
• Process updates within 30 days
• Notify third parties of corrections (where required)
• Maintain audit trail of changes
• Confirm completion of updates

6.3 DELETION AND ERASURE

Right to Delete:
• Request deletion of your personal information
• "Right to be forgotten" under applicable laws
• Remove unnecessary data
• Cancel your account permanently

Exceptions to Deletion:
• Legal obligations requiring retention
• Completion of pending transactions
• Detection of security incidents
• Protection of legal rights
• Internal uses consistent with expectations
• Freedom of expression
• Public interest or scientific research

Deletion Process:
• Submit request with identity verification
• 30-day review period
• Confirmation of deletion
• Retention of anonymized data
• No recovery after deletion

6.4 RESTRICTION AND OBJECTION

Restrict Processing:
• Contest accuracy while we verify
• Processing is unlawful but you oppose deletion
• We no longer need data but you need it for legal claims
• You've objected pending verification of legitimate grounds

Object to Processing:
• Direct marketing communications
• Profiling and automated decision-making
• Processing based on legitimate interests
• Research and statistical purposes
• Sale or sharing of personal information

6.5 CONSENT MANAGEMENT

Control Your Consent:
• Withdraw consent at any time
• Manage cookie preferences
• Control location sharing
• Opt-out of marketing
• Manage data sharing preferences
• Control biometric data usage

Impact of Withdrawal:
• May affect service functionality
• Cannot withdraw from necessary processing
• Historical processing remains valid
• Some features may become unavailable

6.6 AUTOMATED DECISION-MAKING

You have rights regarding automated processing:

Transparency:
• Know when decisions are automated
• Understand the logic involved
• Learn about significance and consequences
• Request human review

Human Intervention:
• Request manual review of automated decisions
• Express your point of view
• Contest automated decisions
• Obtain explanation of decisions

Automated Decisions We Make:
• Pricing algorithms
• Risk assessment scores
• Verification determinations
• Search result rankings
• Fraud detection
• Eligibility determinations

6.7 CALIFORNIA PRIVACY RIGHTS (CCPA)

California residents have additional rights:

Right to Know:
• Categories of personal information collected
• Sources of personal information
• Business purposes for collection
• Categories of third parties we share with
• Specific pieces of information held

Right to Delete:
• Request deletion with exceptions
• Verify identity for security
• Household data deletion options

Right to Opt-Out:
• Opt-out of "sale" of personal information
• We do not sell personal information
• Control sharing for cross-context advertising

Right to Non-Discrimination:
• No denial of services
• No different prices or rates
• No different quality levels
• No retaliation for exercising rights

6.8 EUROPEAN PRIVACY RIGHTS (GDPR)

EU/EEA/UK residents have enhanced rights:

Legal Basis for Processing:
• Consent (which you can withdraw)
• Contract performance
• Legal obligations
• Vital interests
• Public task
• Legitimate interests

Additional Rights:
• Lodge complaint with supervisory authority
• Withdraw consent without affecting prior processing
• Object to processing for direct marketing
• Not be subject to solely automated decisions
• Data portability in machine-readable format

Cross-Border Transfers:
• Standard contractual clauses
• Adequacy decisions
• Appropriate safeguards
• Your explicit consent

6.9 HOW TO EXERCISE YOUR RIGHTS

Submit Requests:
• Email: info@itwhip.com
• Subject line: "Privacy Rights Request"
• Include: Full name, account email, specific request
• Verification: Government ID may be required
• Response time: Within 30 days (45 days for complex requests)

Authorized Agents:
• Power of attorney required
• Written permission needed
• Agent identity verification
• Direct verification with you may be required

Appeals Process:
• Dispute our response within 30 days
• Escalation to privacy team
• Independent review available
• Regulatory complaint rights`
    },
    {
      id: 'cookies',
      title: '7. COOKIES AND TRACKING TECHNOLOGIES',
      icon: IoAnalyticsOutline,
      content: `7.1 WHAT ARE COOKIES

Cookies are small text files placed on your device when you visit our website or use our apps. They help us:
• Remember your preferences and settings
• Keep you signed in securely
• Understand how you use our Services
• Improve your experience
• Deliver relevant advertising
• Prevent fraud and abuse

Types of Cookies We Use:

Essential Cookies (Cannot Disable):
• Authentication and security
• Load balancing and performance
• Legal compliance
• Fraud prevention
• Core functionality

Functional Cookies:
• Language preferences
• Location settings
• Search preferences
• Form autofill
• Accessibility options

Analytics Cookies:
• Usage patterns and trends
• Feature adoption metrics
• Performance monitoring
• Error tracking
• Conversion tracking

Advertising Cookies:
• Interest-based advertising
• Retargeting campaigns
• Attribution tracking
• Frequency capping
• Campaign effectiveness

7.2 OTHER TRACKING TECHNOLOGIES

Web Beacons/Pixels:
• Email open rates
• Page view tracking
• Conversion tracking
• Ad impression counting

Local Storage:
• Offline functionality
• Performance optimization
• User preferences
• Session management

Mobile Identifiers:
• App analytics
• Push notification tokens
• Device fingerprinting (fraud prevention)
• Crash reporting

SDKs and APIs:
• Third-party integrations
• Payment processing
• Maps and navigation
• Social media sharing

7.3 YOUR CHOICES

Cookie Management:
• Browser settings to block/delete cookies
• Cookie preference center on our website
• Mobile device settings
• Do Not Track signals (honored where applicable)

Opt-Out Options:
• Google Analytics: tools.google.com/dlpage/gaoptout
• Facebook: facebook.com/settings/ads
• Network Advertising Initiative: optout.networkadvertising.org
• Digital Advertising Alliance: aboutads.info/choices

Impact of Disabling Cookies:
• May need to sign in repeatedly
• Preferences won't be saved
• Some features may not work properly
• Less personalized experience

7.4 THIRD-PARTY COOKIES

Our Partners Who Set Cookies:
• Payment processors (fraud prevention)
• Analytics providers (usage insights)
• Advertising networks (relevant ads)
• Social media platforms (sharing features)
• Customer support tools (chat functionality)
• Security services (bot detection)

We do not control third-party cookies. Please review their privacy policies:
• Stripe (payments)
• Google Analytics
• Facebook/Meta
• Cloudflare (security)

7.5 COOKIE POLICY UPDATES

We may update our cookie practices. Changes will be reflected in:
• Cookie preference center
• This Privacy Policy
• Cookie banner notifications
• Email updates for material changes`
    },
    {
      id: 'communications',
      title: '8. COMMUNICATIONS PREFERENCES',
      icon: IoMailOutline,
      content: `8.1 TYPES OF COMMUNICATIONS

Essential Communications (Cannot Opt-Out):
These are necessary for providing our Services and ensuring safety:

Account & Security:
• Welcome and account activation
• Password reset instructions
• Security alerts and breach notifications
• Account suspension or termination notices
• Two-factor authentication codes
• Suspicious activity warnings
• Identity verification requests
• Terms of Service updates
• Privacy Policy changes

Transactional Messages:
• Booking confirmations and modifications
• Cancellation confirmations
• Payment receipts and invoices
• Refund notifications
• Host payout confirmations
• Tax documents (W-9, 1099-K)
• Legal notices and summons
• Protection plan documents and claims

Safety Communications:
• Vehicle recall notices
• Emergency notifications
• Safety issue reports
• Platform security updates
• Fraud warnings
• Weather or disaster alerts affecting bookings

8.2 OPTIONAL COMMUNICATIONS

Service-Related (Partial Opt-Out):
Helpful but not essential communications:

Booking Journey:
• Trip reminders (24 hours before)
• Check-in instructions
• Return reminders
• Review and rating invitations
• Rebooking suggestions for cancellations
• Incomplete booking reminders

Platform Updates:
• New features and improvements
• Maintenance schedules
• App update recommendations
• Policy changes (advance notice)
• Service expansions to new areas

Educational Content:
• Tips for new users
• Best practices guides
• Safety reminders
• Seasonal driving tips
• Protection plan information

Marketing Communications (Full Opt-Out):
Promotional content you can unsubscribe from:

Promotions & Offers:
• Discount codes and special offers
• Seasonal promotions
• Referral program invitations
• Loyalty program benefits
• Early access opportunities
• Partner offers

Content & Engagement:
• Newsletter subscriptions
• Blog post notifications
• Event invitations
• Survey requests
• Case studies and success stories
• Community highlights

Personalized Recommendations:
• Suggested vehicles based on history
• Price drop alerts
• New listings matching preferences
• Host spotlights
• Destination guides

8.3 COMMUNICATION CHANNELS

Email:
• Primary method for important notices
• HTML and plain text options
• Unsubscribe link in marketing emails
• Preference center access
• Frequency management options

SMS/Text Messages:
• Opt-in required
• Transactional alerts only by default
• Marketing texts with explicit consent
• Standard message rates apply
• Reply STOP to opt-out

Push Notifications:
• App-based alerts
• Device-level control
• Customizable by notification type
• Real-time booking updates
• Emergency communications

In-App Messages:
• Platform announcements
• Feature tours
• Contextual help
• Promotional banners
• System messages

Support Communications:
• Quick response support via email
• Typical response within 2-4 hours
• Message-based support system
• No unsolicited phone calls
• Emergency support available

8.4 MANAGING PREFERENCES

Preference Center:
• Accessible from account settings
• Granular control by message type
• Channel preferences (email, SMS, push)
• Frequency settings
• Language preferences
• Time zone settings

Quick Actions:
• Unsubscribe links in emails
• SMS opt-out commands
• Push notification toggles
• Do Not Disturb modes
• Snooze options

Global Opt-Out:
• Marketing communications killswitch
• Retains essential communications
• Can be reversed anytime
• Applies across all channels

8.5 HOST-GUEST MESSAGING

Platform Messaging:
• Encrypted communications
• Monitored for safety (automated systems)
• Archived for dispute resolution
• Auto-translation available
• File and photo sharing
• Read receipts optional

Phone/Text Communications:
• Numbers masked through platform
• Available during active bookings
• Emergency bypass available
• Communication guidelines enforced

Communication Guidelines:
• Professional conduct expected
• No off-platform transaction attempts
• No spam or marketing
• Respectful language required
• Response time tracking

8.6 COMMUNICATION RETENTION

Message Storage:
• Active booking messages: 3 years
• Support conversations: 2 years  
• Marketing preferences: Indefinite
• Opt-out records: Permanent
• SMS history: 1 year

Access Your Communications:
• Download message history
• Export email records
• Review support tickets
• See notification history`
    },
    {
      id: 'international',
      title: '9. INTERNATIONAL DATA TRANSFERS',
      icon: IoGlobeOutline,
      content: `9.1 CROSS-BORDER TRANSFERS

Our services operate globally and your information may be transferred internationally:

Data Locations:
• Primary servers: United States (Arizona)
• Backup facilities: Multiple US regions
• CDN nodes: Global distribution
• Support centers: US-based
• Processing partners: Various countries

Legal Frameworks:
• Standard Contractual Clauses (EU/UK approved)
• APEC Cross-Border Privacy Rules
• Privacy Shield principles (where applicable)
• Adequacy decisions
• Appropriate safeguards per GDPR
• Your explicit consent where required

9.2 REGIONAL PRIVACY LAWS

United States:
• State-specific laws (California, Colorado, Virginia, etc.)
• Sectoral regulations (FCRA, GLBA)
• Federal Trade Commission oversight
• Industry standards compliance

European Union/EEA/UK:
• General Data Protection Regulation (GDPR)
• UK Data Protection Act
• ePrivacy Directive
• National implementations

Canada:
• Personal Information Protection and Electronic Documents Act (PIPEDA)
• Provincial privacy laws
• Anti-spam legislation (CASL)

Other Jurisdictions:
• Australia Privacy Act
• Brazil's LGPD
• Japan's APPI
• Regional frameworks as applicable

9.3 DATA LOCALIZATION

Certain data remains in specific regions:
• Payment processing in user's country
• Government ID verification locally
• Tax records in jurisdiction
• Some backup data regionalized

9.4 TRANSFER SAFEGUARDS

We protect international transfers through:
• Encryption in transit and at rest
• Access controls and monitoring
• Contractual obligations
• Regular audits
• Incident response procedures
• Vendor assessments
• Privacy by design principles

9.5 YOUR RIGHTS REGARDING TRANSFERS

You can:
• Request information about transfers
• Withdraw consent (may limit services)
• Lodge complaints with authorities
• Request specific safeguards
• Access transfer agreements (redacted)
• Choose data residency (where available)`
    },
    {
      id: 'children',
      title: '10. CHILDREN AND MINORS',
      icon: IoPersonOutline,
      content: `10.1 AGE REQUIREMENTS

Our Services are not intended for children:
• Minimum age to use platform: 18 years old
• Minimum age to rent (Guest): 21 years old
• Minimum age for luxury/exotic vehicles: 25 years old
• No accounts for minors permitted
• Age verification required for all users

10.2 INFORMATION ABOUT CHILDREN

We do not knowingly collect information from children under 18:
• No targeted marketing to minors
• No features designed for children
• No parental consent mechanisms
• Immediate deletion if discovered

If you believe a child has provided information:
• Contact us immediately at info@itwhip.com
• Provide relevant details
• We will investigate promptly
• Account will be terminated
• Data will be deleted

10.3 PARENTAL RIGHTS

If you are a parent or guardian:
• You may request deletion of child's data
• No parental access to minor accounts
• We will verify parental authority
• Cooperation with law enforcement
• Education about online safety

10.4 TEEN DRIVER ADDITIONS

For authorized additional drivers 18-20 (where permitted):
• Primary renter must be 21+
• Parental consent may be required
• Additional verification needed
• Higher insurance requirements
• Limited vehicle selection
• Enhanced monitoring

10.5 FAMILY ACCOUNTS

We do not offer:
• Family sharing plans
• Minor sub-accounts
• Parental controls
• Child safety seats (Host provided)
• Youth programs`
    },
    {
      id: 'california',
      title: '11. CALIFORNIA PRIVACY RIGHTS',
      icon: IoLocationOutline,
      content: `11.1 CALIFORNIA CONSUMER PRIVACY ACT (CCPA/CPRA)

California residents have specific rights under state law:

Categories of Information We Collect:
• Identifiers (name, email, address, IP address)
• Government identifiers (driver's license, SSN for taxes)
• Commercial information (transaction history, preferences)
• Biometric information (facial recognition for verification)
• Internet activity (browsing, search history)
• Geolocation data (device location, trip routes)
• Audio/visual (profile photos, verification images)
• Professional information (employment for business accounts)
• Education information (student discounts if applicable)
• Inferences (preferences, characteristics, behaviors)

Sources of Information:
• Directly from you
• Automatically from your devices
• Third-party verification services
• Public records
• Social media (if connected)
• Other users (reviews, ratings)
• Business partners

Purposes for Collection:
• Providing rental services
• Identity verification
• Safety and security
• Payment processing
• Legal compliance
• Marketing (with consent)
• Platform improvement
• Fraud prevention

11.2 YOUR CCPA RIGHTS

Right to Know:
• Request disclosure of collected information
• Two requests per 12-month period
• 45-day response time (extendable to 90 days)
• Free of charge
• Verification required for security

Right to Delete:
• Request deletion of personal information
• Exceptions for legal/business requirements
• Verification required
• Household deletion available
• Confirmation of deletion provided

Right to Opt-Out:
• We do not "sell" personal information
• Opt-out of sharing for cross-context advertising
• Do Not Sell/Share My Info option
• Recognized automated opt-out signals
• No account required to opt-out

Right to Correct:
• Fix inaccurate personal information
• Provide documentation if needed
• Commercially reasonable efforts
• Notice to third parties where feasible

Right to Limit:
• Limit use of sensitive personal information
• Basic services still available
• Certain uses always permitted
• Preference signals recognized

Right to Non-Discrimination:
• No denial of goods or services
• No different prices or rates
• No different quality level
• No retaliation for exercising rights
• Financial incentives disclosed

11.3 FINANCIAL INCENTIVES

We may offer programs that could be deemed financial incentives:

Referral Programs:
• Rewards for successful referrals
• Value based on customer acquisition cost
• Terms clearly disclosed
• Opt-in required
• Can withdraw anytime

Loyalty Benefits:
• Discounts for frequent users
• Early access to features
• Exclusive promotions
• Value reasonably related to data value

Data Value:
• Calculated based on operational costs
• Includes verification expenses
• Platform maintenance allocation
• Reasonable profit margin
• Transparent methodology

11.4 AUTHORIZED AGENTS

You may designate an agent to make requests:
• Written authorization required
• Power of attorney accepted
• Agent identity verification
• Direct verification with you
• Business entities as agents allowed

11.5 CONTACT FOR CALIFORNIA RIGHTS

Submit requests:
• Email: info@itwhip.com
• Subject: "California Privacy Rights"
• Include: Full name, email, specific request
• Verification: Government ID required
• Response: Within 45 days

11.6 METRICS (PREVIOUS YEAR)

Requests Received:
• Know requests: [To be updated]
• Delete requests: [To be updated]
• Opt-out requests: [To be updated]
• Median response time: [To be updated]
• Requests denied: [To be updated]

This section updated annually.`
    },
    {
      id: 'changes',
      title: '12. CHANGES TO THIS POLICY',
      icon: IoTimerOutline,
      content: `12.1 WHEN WE UPDATE

We may update this Privacy Policy:
• Changes in law or regulations
• New features or services
• Business model evolution
• Technology improvements
• User feedback integration
• Security enhancements
• Partnership changes
• Corporate transactions

12.2 NOTIFICATION PROCESS

Material Changes:
• 30 days advance notice
• Email to registered address
• Prominent website banner
• In-app notification
• Push notification (if enabled)
• Blog post explanation
• Comparison tool showing changes

Minor Changes:
• Updated "Last Modified" date
• Change log maintained
• Available in account settings
• No advance notice required

12.3 YOUR CHOICES

When we update the Policy:
• Review changes carefully
• Accept to continue using Services
• Opt-out of specific changes (where possible)
• Download previous version
• Export your data
• Close account if disagreeable

12.4 EFFECTIVE DATES

Implementation Timeline:
• Notice provided: Upon publication
• Review period: 30 days for material changes
• Effective date: As stated in notice
• Grandfathering: Case-by-case basis
• Retroactive application: Never without consent

12.5 VERSION HISTORY

We maintain records of:
• All previous versions
• Change summaries
• Effective date ranges
• Reason for changes
• User notification records

Access previous versions:
• Account settings archive
• Email info@itwhip.com
• Legal documentation portal

12.6 QUESTIONS ABOUT CHANGES

If you have concerns about updates:
• Contact privacy team before effective date
• Request clarification
• Provide feedback
• Suggest alternatives
• Escalate significant concerns

Response commitment:
• Acknowledge within 24 hours
• Substantive response within 3 business days
• Escalation path available
• Consider user input for future updates`
    },
    {
      id: 'contact',
      title: '13. CONTACT INFORMATION',
      icon: IoMailOutline,
      content: `13.1 PRIVACY TEAM CONTACT

For privacy-related inquiries:

Primary Contact:
Email: info@itwhip.com
Response Time: 2-4 hours during business hours
Business Hours: 7:00 AM - 9:00 PM MST, Daily
Language Support: English (other languages via translation)

Types of Inquiries:
• Privacy rights requests
• Data access and portability
• Correction and deletion
• Opt-out requests
• Policy clarifications
• Complaint submission
• Security concerns
• International transfers
• Cookie preferences
• Marketing preferences

13.2 DATA PROTECTION OFFICER

While not formally required, privacy leadership includes:
• Privacy program oversight
• Policy development and updates
• Training and awareness
• Incident response coordination
• Regulatory compliance
• Stakeholder engagement

Contact through main privacy email for escalation.

13.3 SUPPORT CHANNELS

General Support:
• In-app messaging
• Email support system
• Help center articles
• Community forums
• Video tutorials
• FAQ database

Privacy-Specific Support:
• Dedicated privacy inbox
• Priority response queue
• Specialized training for agents
• Escalation procedures
• Legal team involvement when needed

Quick Response Support:
• Email-based assistance
• Typical response within 2-4 hours
• Message center available 7 days/week
• No unsolicited phone calls
• Emergency support for urgent issues

13.4 PHYSICAL ADDRESS

Mailing Address:
• Provided upon request for legal notices
• Not a consumer service location
• Document service only
• No walk-in support

Registered Agent:
• Available for legal process
• State-specific addresses
• Updated annually

13.5 REGULATORY CONTACTS

Supervisory Authorities:

United States:
• Federal Trade Commission (FTC)
• State Attorneys General
• Department of Motor Vehicles
• Consumer Protection Agencies

California:
• California Privacy Protection Agency
• Attorney General's Office

Europe (for EU residents):
• Local Data Protection Authority
• European Data Protection Board

We cooperate with all regulatory inquiries and investigations.

13.6 RESPONSE COMMITMENTS

Our service standards:
• Initial acknowledgment: 24 hours
• Substantive response: 3-5 business days
• Complex requests: Up to 30 days
• Appeals process: Available
• Escalation path: Defined
• Language support: Translation available
• Accessibility: Alternative formats on request

13.7 FEEDBACK AND SUGGESTIONS

We welcome your input:
• Privacy program improvements
• Policy clarity suggestions
• Feature requests
• User experience feedback
• Transparency reports
• Best practice recommendations

Submit feedback to info@itwhip.com with subject "Privacy Feedback"

Your input helps us improve our privacy practices and better serve our community.`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-3">
                <IoLockClosedOutline className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Privacy Policy
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
                    Your Privacy Matters
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                    ItWhip operates a peer-to-peer car sharing platform. We collect only what's necessary to facilitate 
                    safe rentals between vehicle owners and renters. We never sell your personal data and are committed 
                    to protecting your privacy through comprehensive security measures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Commitments */}
        <section className="py-3 sm:py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-green-900 dark:text-green-300 mb-2">
                    Our Privacy Commitments
                  </h2>
                  <ul className="text-xs sm:text-sm text-green-800 dark:text-green-400 space-y-1">
                    <li>• We never sell your personal information to third parties</li>
                    <li>• Your data is encrypted using industry-standard security</li>
                    <li>• You can request deletion of your data at any time</li>
                    <li>• We share only what's necessary for bookings and safety</li>
                    <li>• Full compliance with GDPR, CCPA, and other privacy regulations</li>
                    <li>• Transparent about what we collect and why</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Sections */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
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

        {/* Contact Section */}
        <section className="py-6 sm:py-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoMailOutline className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-600" />
                Questions About Your Privacy?
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Privacy Team Contact:</strong></p>
                <p>Email: info@itwhip.com</p>
                <p>Response Time: Within 2-4 hours during business hours</p>
                <p>Business Hours: Monday - Sunday, 7:00 AM - 9:00 PM MST</p>
                <p className="pt-2">For privacy rights requests, data access, corrections, deletions, or any privacy concerns.</p>
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
                By Using ItWhip, You Acknowledge This Policy
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
                Your use of our Services indicates that you have read and understood how we collect, use, and 
                protect your information as described in this Privacy Policy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <a href="/terms" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  View Terms of Service →
                </a>
                <a href="/contact" className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm">
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}