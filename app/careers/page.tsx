// app/careers/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoRocketOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoHeartOutline,
  IoSchoolOutline,
  IoMedicalOutline,
  IoHomeOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoSparklesOutline,
  IoCarOutline,
  IoCodeSlashOutline,
  IoBusinessOutline,
  IoMailOutline,
  IoNewspaperOutline,
  IoRefreshOutline
} from 'react-icons/io5'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: string
  salaryRange?: string
  description?: string
  applicantCount: number
  isFeatured?: boolean
  createdAt: string
}

interface JobFilters {
  departments: Array<{ name: string; count: number }>
  locations: Array<{ name: string; count: number }>
  totalJobs: number
}

export default function CareersPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [filters, setFilters] = useState<JobFilters>({ departments: [], locations: [], totalJobs: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Fetch jobs from database
  useEffect(() => {
    fetchJobs()
  }, [selectedDepartment, selectedLocation])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedDepartment) params.append('department', selectedDepartment)
      if (selectedLocation) params.append('location', selectedLocation)
      
      const response = await fetch(`/api/careers${params.toString() ? `?${params}` : ''}`)
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.jobs || [])
        setFilters(data.filters || { departments: [], locations: [], totalJobs: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group jobs by department
  const groupedJobs = jobs.reduce((acc, job) => {
    if (!acc[job.department]) {
      acc[job.department] = {
        icon: getDepartmentIcon(job.department),
        color: getDepartmentColor(job.department),
        positions: []
      }
    }
    acc[job.department].positions.push(job)
    return acc
  }, {} as Record<string, any>)

  function getDepartmentIcon(dept: string) {
    switch(dept) {
      case 'Engineering': return IoCodeSlashOutline
      case 'Operations': return IoCarOutline
      case 'Sales': return IoBusinessOutline
      case 'Customer Success':
      case 'Support': return IoPeopleOutline
      default: return IoBriefcaseOutline
    }
  }

  function getDepartmentColor(dept: string) {
    switch(dept) {
      case 'Engineering': return 'blue'
      case 'Operations': return 'green'
      case 'Sales': return 'amber'
      case 'Customer Success':
      case 'Support': return 'purple'
      default: return 'gray'
    }
  }

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
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoRocketOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Careers at ItWhip
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                {filters.totalJobs} Open Positions
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={fetchJobs}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors"
              >
                <IoRefreshOutline className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
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

      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 sm:mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
                  We're Hiring - {filters.totalJobs} Open Positions
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

        {/* Filters */}
        {filters.departments.length > 0 && (
          <section className="py-4 bg-white dark:bg-black border-y border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
                
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Departments</option>
                  {filters.departments.map(dept => (
                    <option key={dept.name} value={dept.name}>
                      {dept.name} ({dept.count})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Locations</option>
                  {filters.locations.map(loc => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} ({loc.count})
                    </option>
                  ))}
                </select>

                {(selectedDepartment || selectedLocation) && (
                  <button
                    onClick={() => {
                      setSelectedDepartment('')
                      setSelectedLocation('')
                    }}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Open Positions */}
        <section id="positions" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Open Positions
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Find your next role in our Phoenix or Scottsdale offices, or work remotely
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <IoRefreshOutline className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading positions...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">No open positions at the moment. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedJobs).map(([department, data]) => {
                  const DeptIcon = data.icon
                  return (
                    <div key={department}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-10 h-10 bg-${data.color}-100 dark:bg-${data.color}-900/20 rounded-lg flex items-center justify-center`}>
                          <DeptIcon className={`w-5 h-5 text-${data.color}-600`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {department}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({data.positions.length} opening{data.positions.length !== 1 ? 's' : ''})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {data.positions.map((job: JobPosting) => (
                          <Link
                            key={job.id}
                            href={`/careers/${job.id}`}
                            className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 hover:shadow-lg transition cursor-pointer border border-gray-200 dark:border-gray-800 block"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex-1 mb-4 sm:mb-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {job.title}
                                  </h4>
                                  {job.isFeatured && (
                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded font-medium">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center">
                                    <IoLocationOutline className="w-4 h-4 mr-1" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center">
                                    <IoBriefcaseOutline className="w-4 h-4 mr-1" />
                                    {job.type.replace('_', ' ')}
                                  </span>
                                  {job.applicantCount > 0 && (
                                    <span className="flex items-center">
                                      <IoPeopleOutline className="w-4 h-4 mr-1" />
                                      {job.applicantCount} applicants
                                    </span>
                                  )}
                                </div>
                                {job.salaryRange && (
                                  <p className="text-sm font-medium text-green-600 mt-2">
                                    {job.salaryRange}
                                  </p>
                                )}
                              </div>
                              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-sm">
                                <span>View Details</span>
                                <IoArrowForwardOutline className="w-4 h-4" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Don't See Your Role */}
            <div className="mt-12 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 sm:p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Don't See Your Perfect Role?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We're always looking for exceptional talent. Send us your resume and tell us how you can contribute.
              </p>
              <a href="mailto:info@itwhip.com" className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                <IoMailOutline className="w-5 h-5" />
                <span>Send Your Resume</span>
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-12 sm:py-16 bg-white dark:bg-black">
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
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
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

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}