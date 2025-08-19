// app/careers/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoRocketOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoHeartOutline,
  IoSchoolOutline,
  IoMedicalOutline,
  IoHomeOutline,
  IoFitnessOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoSparklesOutline,
  IoCarOutline,
  IoCodeSlashOutline,
  IoBusinessOutline,
  IoCallOutline,
  IoMailOutline,
  IoInformationCircleOutline,
  IoNewspaperOutline
} from 'react-icons/io5'

export default function CareersPage() {
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

  const openPositions = [
    {
      category: 'Engineering',
      icon: IoCodeSlashOutline,
      color: 'blue',
      positions: [
        {
          title: 'Senior Full Stack Engineer',
          location: 'Phoenix, AZ / Remote',
          type: 'Full-time',
          department: 'Engineering',
          experience: '5+ years',
          salary: '$140k - $180k + equity'
        },
        {
          title: 'Mobile App Developer (React Native)',
          location: 'Phoenix, AZ / Hybrid',
          type: 'Full-time',
          department: 'Engineering',
          experience: '3+ years',
          salary: '$120k - $150k + equity'
        },
        {
          title: 'DevOps Engineer',
          location: 'Remote',
          type: 'Full-time',
          department: 'Engineering',
          experience: '4+ years',
          salary: '$130k - $160k + equity'
        }
      ]
    },
    {
      category: 'Operations',
      icon: IoCarOutline,
      color: 'green',
      positions: [
        {
          title: 'Driver Operations Manager',
          location: 'Phoenix, AZ',
          type: 'Full-time',
          department: 'Operations',
          experience: '3+ years',
          salary: '$75k - $95k + equity'
        },
        {
          title: 'Fleet Coordinator',
          location: 'Scottsdale, AZ',
          type: 'Full-time',
          department: 'Operations',
          experience: '2+ years',
          salary: '$55k - $70k'
        },
        {
          title: 'Quality Assurance Specialist',
          location: 'Phoenix, AZ',
          type: 'Full-time',
          department: 'Operations',
          experience: '2+ years',
          salary: '$50k - $65k'
        }
      ]
    },
    {
      category: 'Sales & Partnerships',
      icon: IoBusinessOutline,
      color: 'amber',
      positions: [
        {
          title: 'Hotel Partnership Manager',
          location: 'Phoenix, AZ',
          type: 'Full-time',
          department: 'Sales',
          experience: '5+ years hospitality',
          salary: '$90k - $120k + commission'
        },
        {
          title: 'Business Development Representative',
          location: 'Phoenix, AZ',
          type: 'Full-time',
          department: 'Sales',
          experience: '2+ years',
          salary: '$55k - $70k + commission'
        }
      ]
    },
    {
      category: 'Customer Success',
      icon: IoPeopleOutline,
      color: 'purple',
      positions: [
        {
          title: 'Customer Success Manager',
          location: 'Phoenix, AZ / Remote',
          type: 'Full-time',
          department: 'Customer Success',
          experience: '3+ years',
          salary: '$65k - $85k'
        },
        {
          title: 'Support Team Lead (Night Shift)',
          location: 'Phoenix, AZ',
          type: 'Full-time',
          department: 'Support',
          experience: '2+ years',
          salary: '$45k - $60k + shift differential'
        }
      ]
    }
  ]

  const benefits = [
    {
      icon: IoMedicalOutline,
      title: 'Health & Wellness',
      items: ['100% covered health insurance', 'Dental and vision', 'Mental health support', 'Gym membership']
    },
    {
      icon: IoRocketOutline,
      title: 'Growth & Equity',
      items: ['Stock options for all', 'Career development budget', 'Conference attendance', 'Internal mobility']
    },
    {
      icon: IoHomeOutline,
      title: 'Work-Life Balance',
      items: ['Flexible work hours', 'Remote options available', 'Unlimited PTO', 'Paid parental leave']
    },
    {
      icon: IoHeartOutline,
      title: 'Perks & Culture',
      items: ['Free ItWhip rides', 'Team events & offsites', 'Catered lunches', 'Modern Phoenix office']
    }
  ]

  const values = [
    {
      title: 'Customer Obsessed',
      description: 'Every decision starts with "how does this help our riders and hotel partners?"'
    },
    {
      title: 'Move Fast',
      description: 'We ship quickly, learn from feedback, and iterate. Perfect is the enemy of good.'
    },
    {
      title: 'Own the Outcome',
      description: 'We take responsibility for our work and its impact on the business.'
    },
    {
      title: 'Transparent Always',
      description: 'We share information openly, give direct feedback, and communicate honestly.'
    }
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
              <IoRocketOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Careers at ItWhip
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                11 Open Positions
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                About Us
              </Link>
              <Link href="/culture" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Culture
              </Link>
              <Link href="/benefits" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Benefits
              </Link>
              <a 
                href="#positions"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                View Open Roles
              </a>
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
                href="/about" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">About</span>
              </Link>
              <a 
                href="#culture" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoHeartOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Culture</span>
              </a>
              <a 
                href="#benefits" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoMedicalOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Benefits</span>
              </a>
              <a 
                href="#positions"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoBriefcaseOutline className="w-4 h-4 flex-shrink-0" />
                <span>Open Roles</span>
              </a>
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
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 sm:mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
                  We're Hiring - 11 Open Positions
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Join the Transportation Revolution
                <span className="block text-amber-600 mt-2">Build the Future with Us</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                We're transforming how luxury hotels provide transportation. Join our mission to eliminate 
                surge pricing and deliver exceptional experiences to hotel guests across America.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <a href="#positions" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition shadow-lg">
                  Explore Open Positions
                </a>
                <a href="#culture" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
                  Learn About Our Culture
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why ItWhip Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Why Join ItWhip?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Be part of a fast-growing startup that's actually making money and solving real problems
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                  <IoTrendingUpOutline className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rapid Growth</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  487 hotel partners and growing 30% monthly
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                  <IoSparklesOutline className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real Impact</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Saving riders millions in surge pricing daily
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                  <IoPeopleOutline className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Great Team</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ex-Uber, Google, and Marriott talent
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                  <IoRocketOutline className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Funded & Stable</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Series A funded, 3+ years runway
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="positions" className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Open Positions
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Find your next role in our Phoenix or Scottsdale offices, or work remotely
              </p>
            </div>

            <div className="space-y-8">
              {openPositions.map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 bg-${category.color}-100 dark:bg-${category.color}-900/20 rounded-lg flex items-center justify-center`}>
                      <category.icon className={`w-5 h-5 text-${category.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.category}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({category.positions.length} openings)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {category.positions.map((position, pidx) => (
                      <div key={pidx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6 hover:shadow-lg transition cursor-pointer border border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 mb-4 sm:mb-0">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {position.title}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <IoLocationOutline className="w-4 h-4 mr-1" />
                                {position.location}
                              </span>
                              <span className="flex items-center">
                                <IoBriefcaseOutline className="w-4 h-4 mr-1" />
                                {position.type}
                              </span>
                              <span className="flex items-center">
                                <IoTimeOutline className="w-4 h-4 mr-1" />
                                {position.experience}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-green-600 mt-2">
                              {position.salary}
                            </p>
                          </div>
                          <a href={`mailto:careers@itwhip.com?subject=Application: ${position.title}`} className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-sm">
                            <span>Apply Now</span>
                            <IoArrowForwardOutline className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Don't See Your Role */}
            <div className="mt-12 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 sm:p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Don't See Your Perfect Role?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We're always looking for exceptional talent. Send us your resume and tell us how you can contribute.
              </p>
              <a href="mailto:careers@itwhip.com" className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                <IoMailOutline className="w-5 h-5" />
                <span>Send Your Resume</span>
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Benefits & Perks
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We take care of our team so they can take care of our customers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {benefit.items.map((item, iidx) => (
                      <li key={iidx} className="flex items-start">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Culture & Values */}
        <section id="culture" className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Our Culture & Values
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                What drives us every day
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((value, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
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

        {/* Drivers Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Become a Driver Partner
            </h2>
            <p className="text-base sm:text-lg text-amber-100 mb-8">
              Earn more with luxury vehicles. No surge pricing games. Professional clientele.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/drive" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg">
                Apply to Drive
              </Link>
              <Link href="/driver-requirements" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition">
                View Requirements
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. All rights reserved.</p>
              <p className="mt-2">Equal Opportunity Employer</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/about" className="hover:text-gray-700 dark:hover:text-gray-300">About</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}