// app/about/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoCarSportOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoSparklesOutline,
  IoShieldCheckmarkOutline,
  IoRocketOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoCheckmarkCircle,
  IoStarOutline,
  IoAirplaneOutline,
  IoLocationOutline,
  IoInformationCircleOutline,
  IoMailOutline,
  IoCallOutline
} from 'react-icons/io5'

export default function AboutPage() {
  const router = useRouter()
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const stats = [
    { number: '487+', label: 'Partner Properties', icon: IoBusinessOutline },
    { number: '2.5M+', label: 'Rides Completed', icon: IoCarSportOutline },
    { number: '4.9', label: 'Average Rating', icon: IoStarOutline },
    { number: '< 4min', label: 'Avg Pickup Time', icon: IoRocketOutline }
  ]

  const values = [
    {
      icon: IoShieldCheckmarkOutline,
      title: 'No Surge Pricing',
      description: 'Fixed rates 24/7, regardless of demand. Your airport ride costs the same at 6 AM or during the Super Bowl.'
    },
    {
      icon: IoSparklesOutline,
      title: 'Luxury Standard',
      description: 'Every vehicle is less than 3 years old. Tesla, Mercedes, BMW - luxury is our minimum standard.'
    },
    {
      icon: IoBusinessOutline,
      title: 'Hotel Integration',
      description: 'Seamlessly integrated with premium hotels. Instant booking, room charging, and exclusive member benefits.'
    },
    {
      icon: IoPeopleOutline,
      title: 'Professional Drivers',
      description: 'Background-checked, professionally trained drivers with 4.9+ ratings. Hospitality is our priority.'
    }
  ]

  const team = [
    {
      name: 'Marcus Chen',
      role: 'Chief Executive Officer',
      bio: 'Former VP at Uber, 15 years in transportation technology'
    },
    {
      name: 'Sarah Williams',
      role: 'Chief Technology Officer',
      bio: 'Ex-Google engineer, scaled systems to millions of users'
    },
    {
      name: 'David Rodriguez',
      role: 'VP of Hotel Partnerships',
      bio: '20 years in hospitality, former Marriott executive'
    },
    {
      name: 'Emma Thompson',
      role: 'Head of Driver Operations',
      bio: 'Built driver networks for 3 major ride platforms'
    }
  ]

  const timeline = [
    { year: '2021', event: 'Founded in Phoenix, Arizona' },
    { year: '2022', event: 'First hotel partnership with Four Seasons' },
    { year: '2023', event: 'Expanded to 100+ properties' },
    { year: '2024', event: 'Launched instant ride technology' },
    { year: '2025', event: '487 properties, expanding nationwide' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main Header Component with Full Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Section - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoGlobeOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                About ItWhip
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/careers" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Careers
              </Link>
              <Link href="/press" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Press
              </Link>
              <Link href="/investors" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Investors
              </Link>
              <Link 
                href="/"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/careers" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoPeopleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Careers</span>
              </Link>
              <Link 
                href="/press" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Press</span>
              </Link>
              <Link 
                href="/investors" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoTrendingUpOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Investors</span>
              </Link>
              <Link 
                href="/"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoCarSportOutline className="w-4 h-4 flex-shrink-0" />
                <span>Book Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Transforming Hotel Transportation
                <span className="block text-amber-600 mt-2">One Luxury Ride at a Time</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                ItWhip is the exclusive luxury transportation platform for premium hotel guests. 
                We've eliminated surge pricing, guaranteed luxury vehicles, and created seamless 
                integration with the world's finest hotels.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Our Mission
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4">
                  We believe premium hotel guests deserve transportation that matches their 
                  accommodation standards. No more surge pricing during peak times. No more 
                  wondering if a luxury vehicle will actually show up. No more complicated 
                  expense reports.
                </p>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
                  ItWhip partners directly with hotels to provide instant access to luxury 
                  vehicles at fixed rates. Every ride is an extension of the hotel's hospitality - 
                  professional, reliable, and exceptional.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link href="/how-it-works" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-center">
                    How It Works
                  </Link>
                  <Link href="/hotel-solutions" className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition text-center">
                    For Hotels
                  </Link>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl p-8 sm:p-12">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Why We Started
                </h3>
                <blockquote className="text-gray-700 dark:text-gray-300 italic">
                  "After paying $180 for a surge-priced ride from a Five-Star hotel to the 
                  airport, I realized something was fundamentally broken. Premium hotels 
                  offer world-class everything - except transportation. We built ItWhip to 
                  fix that."
                </blockquote>
                <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  - Marcus Chen, Founder & CEO
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Our Core Values
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Every decision we make is guided by these principles
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                    <value.icon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-12 text-center">
              Our Journey
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 sm:space-x-6">
                  <div className="flex-shrink-0 w-16 sm:w-20 text-right">
                    <span className="text-lg sm:text-xl font-bold text-amber-600">{item.year}</span>
                  </div>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Leadership Team
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Industry veterans committed to transforming hotel transportation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {team.map((member, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-amber-600 mb-2">{member.role}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Currently Serving Phoenix & Scottsdale
            </h2>
            <p className="text-base sm:text-lg text-amber-100 mb-8">
              With plans to expand to major cities nationwide in 2025
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {['Las Vegas', 'Los Angeles', 'Miami', 'New York'].map((city) => (
                <div key={city} className="bg-white/10 backdrop-blur rounded-lg py-3 px-4">
                  <p className="text-white font-medium text-sm">Coming to</p>
                  <p className="text-amber-200 font-bold">{city}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. All rights reserved.</p>
              <p className="mt-2">2390 E Camelback Rd, Phoenix, AZ 85016</p>
              <div className="mt-4 space-x-4">
                <Link href="/careers" className="hover:text-gray-700 dark:hover:text-gray-300">Careers</Link>
                <Link href="/press" className="hover:text-gray-700 dark:hover:text-gray-300">Press</Link>
                <Link href="/investors" className="hover:text-gray-700 dark:hover:text-gray-300">Investors</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}