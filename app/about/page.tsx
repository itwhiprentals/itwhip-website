'use client'

import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  IoGlobeOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoPeopleOutline,
  IoLeafOutline,
  IoWalletOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoRocketOutline,
  IoMailOutline,
  IoHeartOutline,
  IoLocationOutline
} from 'react-icons/io5'

export default function AboutPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'our-story',
      title: '1. OUR STORY',
      icon: IoBusinessOutline,
      content: `ItWhip is Arizona's first peer-to-peer car sharing marketplace built specifically for the desert environment. We connect vehicle owners (Hosts) with renters (Guests) through a transparent platform that prioritizes trust, fair earnings, and environmental responsibility.

Since our first ride in 2023 in Phoenix, Arizona, our team has focused on building the best car sharing experience for the Southwest. We understand Arizona's unique needs—from the extreme summer heat to the diverse terrain spanning desert valleys to mountain retreats.

Unlike traditional rental companies, ItWhip offers hosts up to 90% of rental earnings based on their insurance tier. Our Mileage Forensics™ system provides complete transparency for every trip, while MaxAC™ certification ensures every vehicle is tested for Arizona's extreme heat.

Today, ItWhip serves 18 cities across Arizona, including Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Sedona, Tucson, and Flagstaff—covering everything, everywhere across the state.

Our platform offers diverse vehicle options: economy cars for daily errands, luxury vehicles for special occasions, SUVs for outdoor adventures, and everything in between. Whether arriving at Phoenix Sky Harbor Airport or exploring Sedona's red rocks, ItWhip has the perfect vehicle for your journey.`
    },
    {
      id: 'mission-values',
      title: '2. OUR MISSION & VALUES',
      icon: IoHeartOutline,
      content: `MISSION STATEMENT

To democratize transportation access by creating a trusted marketplace that empowers vehicle owners to generate income while providing travelers with affordable, quality mobility solutions.

CORE VALUES

Community First:
We believe in the power of community. Every vehicle shared strengthens our local economy, with hosts earning an average of $850 per month in supplemental income. We're not just a platform - we're neighbors helping neighbors.

Trust & Safety:
Your safety is our priority. Every host and guest goes through comprehensive verification, including identity checks and driving record reviews. All trips include up to $1 million in liability protection, giving you peace of mind on every journey.

Transparency:
No hidden fees, no surprises. Our pricing is clear and upfront. Hosts keep 40-90% of rental revenue based on their insurance tier - the most flexible in the industry. Guests see the total cost before booking. We believe honest business is good business.

Sustainability:
Car sharing reduces the need for vehicle ownership and decreases urban congestion. One shared vehicle on ItWhip replaces 9-13 privately owned cars, reducing CO2 emissions by 3.4 tons annually per vehicle. We're committed to a greener Phoenix.

Innovation:
We leverage cutting-edge technology to make car sharing seamless. From instant booking to contactless pickup, embedded insurance to real-time support, we're constantly improving the experience for our community.

Accessibility:
Transportation should be available to everyone. We offer multiple payment options, no credit check requirements for basic rentals, and maintain affordable pricing to ensure our service is accessible to all Phoenix residents and visitors.`
    },
    {
      id: 'how-it-works',
      title: '3. HOW ITWHIP WORKS',
      icon: IoCarOutline,
      content: `FOR GUESTS - RENT WITH CONFIDENCE

Finding Your Perfect Vehicle:
Browse our growing fleet of 100+ vehicles across Arizona, from economical daily drivers to luxury experiences. Each listing includes detailed photos, features, and reviews from previous renters. Our search filters help you find exactly what you need, when you need it.

Simple Booking Process:
1. Create your account and verify your driver's license (takes 3 minutes)
2. Choose your vehicle and rental dates
3. Book instantly or request approval from the host
4. Pick up the vehicle at the agreed location
5. Enjoy your trip with 24/7 support available
6. Return the vehicle and share your experience

Protection Included:
Every rental includes comprehensive protection plans with liability coverage up to $1 million. Choose from multiple deductible options to match your comfort level. Roadside assistance is available 24/7 for peace of mind.

FOR HOSTS - EARN FROM YOUR VEHICLE

List Your Vehicle:
If your car is 2015 or newer with less than 130,000 miles, you can start earning today. Our simple listing process takes just 15 minutes. We'll help you set competitive prices and optimize your listing for maximum bookings.

You're In Control:
Set your own schedule and prices. Approve or decline rental requests. Choose instant booking for qualified renters or review each request individually. Update your availability calendar anytime through our platform.

Industry-Leading Economics:
Keep 40-90% of your rental earnings based on your insurance tier - the most flexible payout structure in the industry. Payments are deposited within 48-72 hours after each trip. We handle all payment processing and provide tax documentation.

Comprehensive Protection:
Your vehicle is protected with physical damage coverage during rentals. Liability insurance up to $1 million is included at no cost to you. Our support team handles any issues that arise, so you can earn passively.

FOR PARTNERS - BUSINESS SOLUTIONS

Corporate Accounts:
Provide employees with flexible transportation options. Reduce fleet management costs and complexity. Access detailed reporting and centralized billing. Customize policies and approval workflows for your organization.

Event & Group Rentals:
Planning a conference, wedding, or group trip? We offer multi-vehicle bookings with dedicated support. From SUVs for family reunions to luxury cars for special events, our fleet covers every occasion.`
    },
    {
      id: 'why-choose-us',
      title: '4. WHY CHOOSE ITWHIP',
      icon: IoTrendingUpOutline,
      content: `LOCAL ADVANTAGE

Phoenix Born and Raised:
We're not a Silicon Valley startup trying to understand Phoenix from afar. We live here, work here, and understand the unique transportation needs of our desert community. From airport runs to weekend getaways to Sedona, we've got you covered.

Supporting Local Economy:
Every rental on ItWhip keeps money in our local economy. Hosts are your neighbors - teachers, healthcare workers, small business owners - earning supplemental income. When you choose ItWhip, you're supporting Phoenix families.

BETTER ECONOMICS

For Guests:
• 25-40% cheaper than traditional car rental
• No airport facility fees (save 10-15%)
• No hidden charges or surprise fees
• Transparent pricing with everything included
• Free cancellation up to 24 hours before

For Hosts:
• Highest host earnings in the industry (80-85% revenue share)
• No annual insurance fees (save $2,000-3,000/year)
• Fast payments (48-72 hours)
• Free professional photography for your listing
• Dedicated host success team

SUPERIOR TECHNOLOGY

Seamless Experience:
Our platform is built on 9 years of enterprise technology experience. Book in 3 minutes, get verified instantly, and manage everything from your phone. Our technology just works, so you can focus on your journey.

Arizona-Specific Features:
Our MaxAC™ certification ensures every vehicle is tested for Arizona's extreme heat. Mileage Forensics™ provides complete transparency for every trip. From Phoenix Sky Harbor Airport pickups to Sedona weekend getaways, we've built features specifically for Arizona travelers.

TRUST & SAFETY

Comprehensive Verification:
• Government ID verification
• Driving record checks
• Criminal background screening (where permitted)
• Real-time fraud detection
• Two-way rating system

Protection Coverage:
• Up to $1 million liability insurance
• Physical damage protection options
• 24/7 roadside assistance
• Emergency support hotline
• Dispute resolution team

ENVIRONMENTAL IMPACT

Reducing Carbon Footprint:
Each shared vehicle on our platform eliminates 9-13 private cars from Phoenix roads. This means less traffic, less pollution, and more parking spaces for everyone. In 2024 alone, we've prevented 2,465 tons of CO2 emissions.

Promoting Sustainable Transportation:
We prioritize electric and hybrid vehicles with premium placement. Currently, 12% of our fleet is electric or hybrid, with a goal to reach 40% by 2027. We're committed to making Phoenix a more sustainable city.`
    },
    {
      id: 'community-impact',
      title: '5. COMMUNITY IMPACT',
      icon: IoPeopleOutline,
      content: `ECONOMIC EMPOWERMENT

Supporting Local Families:
ItWhip has generated over $7.4 million in supplemental income for Arizona families in 2024. Our 725+ hosts earn an average of $850 per month, helping them pay mortgages, save for education, or build emergency funds.

Creating Opportunities:
We've created the equivalent of 340 full-time jobs through our platform. From stay-at-home parents monetizing their second vehicle to retirees supplementing fixed incomes, we're providing flexible earning opportunities for all.

Small Business Support:
Local businesses use ItWhip for flexible fleet solutions without the overhead of ownership. Event planners, real estate agents, and contractors access vehicles on-demand, helping them grow without major capital investments.

SOCIAL RESPONSIBILITY

Accessibility Initiatives:
• Student discount program (15% off all rentals)
• Essential worker appreciation rates
• Senior citizen specialized services
• Veteran host priority program
• Payment plans for longer rentals
• No credit check options available

Community Partnerships:
• ASU Transportation Partnership - providing affordable options for students
• Phoenix Children's Hospital - family transportation assistance program
• Veteran Employment Initiative - priority onboarding for veteran hosts
• Women in Mobility Scholarship - supporting women entering the mobility sector

Transportation Equity:
We operate in all Phoenix neighborhoods, not just affluent areas. This ensures transportation access for underserved communities where traditional rental companies don't operate. Our varied price points mean there's an option for every budget.

ENVIRONMENTAL LEADERSHIP

Measurable Impact:
• 2,465 tons of CO2 prevented in 2024
• 18,000 gallons of fuel saved monthly
• 4-7 parking spaces freed per shared vehicle
• 15% reduction in vehicle miles traveled

Green Initiatives:
• EV/Hybrid priority placement
• Carbon offset program for all corporate travel
• Paperless operations since inception
• Partnership with local environmental organizations
• Educational content on sustainable transportation

Future Commitments:
By 2030, we aim to be carbon neutral in our operations, have 60% electric/hybrid fleet composition, and eliminate 50 million vehicle miles from Phoenix roads. We're not just building a business - we're building a sustainable future for our city.`
    },
    {
      id: 'looking-ahead',
      title: '6. THE ROAD AHEAD',
      icon: IoRocketOutline,
      content: `EXPANSION PLANS

Growing Across Arizona:
Following our success in Phoenix, we're expanding to Tucson and Flagstaff in 2025. Our goal is to provide seamless car sharing across the entire state, making it easy to travel anywhere in Arizona without owning a vehicle.

Regional Growth:
We're planning expansion to neighboring states including Nevada and New Mexico. Las Vegas, Albuquerque, and Santa Fe are next on our roadmap. By 2027, we aim to be the Southwest's leading car sharing platform.

NEW FEATURES COMING SOON

Mobile Apps (Q2 2025):
Native iOS and Android apps with biometric authentication, offline mode, push notifications, and digital key technology for contactless pickup. The future of car sharing in your pocket.

Subscription Services (Q4 2025):
Monthly vehicle subscriptions for frequent renters. Flexible alternatives to traditional leases. Perfect for seasonal residents, long-term visitors, or anyone needing regular transportation without ownership.

Enhanced Integration:
Deeper partnerships with airlines for seamless travel planning. Integration with public transit apps for complete journey planning. Corporate accounts with customized policies and centralized billing.

INNOVATION ROADMAP

Technology Advancement:
• AI-powered pricing optimization
• Predictive maintenance alerts for hosts
• Augmented reality vehicle inspections
• Blockchain-based identity verification
• Voice-activated booking assistant

Service Expansion:
• Luxury and exotic vehicle categories
• Commercial vehicle rentals for businesses
• RV and recreational vehicle sharing
• Specialized vehicles for accessibility needs
• Delivery and logistics solutions

OUR COMMITMENT

To Our Hosts:
We'll continue providing the highest earnings in the industry, improving our technology to make hosting effortless, and supporting you with dedicated success teams. Your success is our success.

To Our Guests:
We're committed to maintaining affordable prices, expanding vehicle selection, and ensuring every rental is safe and seamless. Your trust drives us to be better every day.

To Our Community:
We'll keep investing in Phoenix, creating local jobs, supporting local causes, and building sustainable transportation solutions. This is our home, and we're committed to making it better for everyone.

Join us in revolutionizing transportation in Phoenix and beyond. Whether you're a host, guest, or partner, you're part of something bigger - a movement toward more sustainable, accessible, and community-driven transportation.`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Page Content */}
      <div className="flex-1 mt-14 md:mt-16">
        {/* Page Title */}
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <IoGlobeOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                About ItWhip
              </h1>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                <IoBusinessOutline className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Arizona&apos;s First Desert-Built Car Sharing Platform
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Connecting vehicle owners with travelers since 2023 • Serving all of Arizona • Building sustainable transportation
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-6 sm:py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoCarOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">100+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Vehicles</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoLocationOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">18</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">AZ Cities</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoWalletOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">40-90%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Host Earnings</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">$1M</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Protection</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center shadow-sm">
                <IoLeafOutline className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900 dark:text-white">ESG</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Verified Fleet</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-left">
                          {section.title}
                        </h2>
                      </div>
                      {expandedSections[section.id] ? (
                        <IoChevronUpOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <IoChevronDownOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
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

        {/* Call to Action */}
        <section className="py-8 sm:py-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join Arizona&apos;s Car Sharing Community
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Whether you want to earn from your vehicle, find affordable transportation, or partner with us,
              you&apos;re joining a movement that&apos;s making Arizona more connected and sustainable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/list-your-car"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
              >
                List Your Vehicle
              </a>
              <a
                href="/rentals"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600"
              >
                Browse Rentals
              </a>
              <a
                href="/contact"
                className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition"
              >
                Contact Us
              </a>
            </div>

            {/* Internal Links for SEO */}
            <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-800/30">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">Popular Destinations</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a href="/rentals/cities/phoenix" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">Phoenix</a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a href="/rentals/cities/scottsdale" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">Scottsdale</a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a href="/rentals/cities/tempe" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">Tempe</a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a href="/rentals/airports/phoenix-sky-harbor" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">Sky Harbor Airport</a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a href="/rentals/types/luxury" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">Luxury Cars</a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a href="/rentals/types/suv" className="text-xs text-amber-700 dark:text-amber-400 hover:underline">SUVs</a>
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
                Get in Touch
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>General Inquiries:</strong> info@itwhip.com</p>
                <p><strong>Host Support:</strong> info@itwhip.com</p>
                <p><strong>Partner Inquiries:</strong> info@itwhip.com</p>
                <p><strong>Media Inquiries:</strong> info@itwhip.com</p>
                <p className="pt-2">Response Time: Within 2-4 hours during business hours</p>
                <p>Business Hours: Monday - Sunday, 7:00 AM - 9:00 PM MST</p>
                <p className="pt-2 italic">Based in Phoenix, Arizona • Serving communities across the Southwest</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer - Using existing Footer component */}
      <Footer />
    </div>
  )
}