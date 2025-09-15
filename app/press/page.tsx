// app/press/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoNewspaperOutline,
  IoEyeOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoArrowForwardOutline,
  IoCalendarOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoTrendingUpOutline,
  IoGlobeOutline,
  IoRocketOutline,
  IoLockClosedOutline,
  IoChatbubbleOutline,
  IoMailOutline
} from 'react-icons/io5'

export default function PressPage() {
  const router = useRouter()
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [email, setEmail] = useState('')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Your request for exclusive blog access has been submitted. We\'ll review your application within 48 hours.')
    setShowSubscribeModal(false)
    setEmail('')
  }

  const blogPosts = [
    // 2025 Posts
    {
      date: 'August 15, 2025',
      title: 'Why We\'re Opening Our Platform to Everyone',
      excerpt: 'After 6 years of serving hotels exclusively through GDS, we\'re launching our super app for all travelers.',
      author: 'Michael Chen',
      views: '2.8K',
      comments: 47,
      category: 'Announcement'
    },
    {
      date: 'May 3, 2025',
      title: 'The Super App That Changes Everything',
      excerpt: 'Combining rides, rentals, and hotel bookings in one seamless platform.',
      author: 'Sarah Johnson',
      views: '5.2K',
      comments: 89,
      category: 'Product'
    },
    {
      date: 'January 20, 2025',
      title: 'From B2B to Everyone: Our Public Launch Journey',
      excerpt: 'How we\'re transitioning from behind-the-scenes GDS operations to a consumer-facing platform.',
      author: 'David Martinez',
      views: '8.7K',
      comments: 156,
      category: 'Company'
    },
    // 2024 Posts
    {
      date: 'October 8, 2024',
      title: '2 Million Trips: Scaling Our Infrastructure',
      excerpt: 'Technical challenges and solutions in handling exponential growth.',
      author: 'Emily Rodriguez',
      views: '3.4K',
      comments: 62,
      category: 'Technology'
    },
    {
      date: 'June 15, 2024',
      title: 'Introducing Our Revolutionary Three-Tier Host System',
      excerpt: 'How hosts can now keep 100% of their earnings while we innovate the business model.',
      author: 'Michael Chen',
      views: '12.3K',
      comments: 234,
      category: 'Product'
    },
    {
      date: 'March 1, 2024',
      title: 'Why Arizona Hotels Trust Our Platform',
      excerpt: '400+ hotel partnerships and counting: The secret to our success.',
      author: 'Lisa Thompson',
      views: '6.8K',
      comments: 91,
      category: 'Partnerships'
    },
    // 2023 Posts
    {
      date: 'November 22, 2023',
      title: 'Building the Future: Our Super App Vision',
      excerpt: 'Why we\'re investing in a unified platform for all transportation needs.',
      author: 'David Martinez',
      views: '4.5K',
      comments: 78,
      category: 'Vision'
    },
    {
      date: 'July 5, 2023',
      title: 'The Technology Behind 1 Million Seamless Trips',
      excerpt: 'Our tech stack and the innovations that power reliable transportation.',
      author: 'James Wilson',
      views: '9.1K',
      comments: 145,
      category: 'Technology'
    },
    {
      date: 'February 10, 2023',
      title: 'GDS Integration: A Game Changer for Hotels',
      excerpt: 'How Amadeus integration transformed hotel transportation booking.',
      author: 'Sarah Johnson',
      views: '7.3K',
      comments: 112,
      category: 'Integration'
    },
    // 2022 Posts
    {
      date: 'September 18, 2022',
      title: 'Solving the Airport Transfer Problem at Scale',
      excerpt: 'How we achieved 4-minute average pickup times at Sky Harbor.',
      author: 'Michael Chen',
      views: '5.6K',
      comments: 93,
      category: 'Operations'
    },
    {
      date: 'April 3, 2022',
      title: 'The Hidden Cost of Poor Hotel Transportation',
      excerpt: 'Industry research on guest satisfaction and transport reliability.',
      author: 'Lisa Thompson',
      views: '11.2K',
      comments: 187,
      category: 'Research'
    },
    // 2021 Posts
    {
      date: 'November 15, 2021',
      title: 'How We Achieved Amadeus Certification',
      excerpt: 'The rigorous process of becoming a certified GDS transport provider.',
      author: 'David Martinez',
      views: '8.9K',
      comments: 134,
      category: 'Technology'
    },
    {
      date: 'June 28, 2021',
      title: 'Reaching 100 Hotel Partnerships: Lessons Learned',
      excerpt: 'Scaling from startup to trusted transportation infrastructure.',
      author: 'Sarah Johnson',
      views: '6.2K',
      comments: 98,
      category: 'Growth'
    },
    {
      date: 'January 5, 2021',
      title: 'The Post-Pandemic Transportation Revolution',
      excerpt: 'How COVID-19 accelerated the need for reliable, safe transport.',
      author: 'Michael Chen',
      views: '14.7K',
      comments: 256,
      category: 'Industry'
    },
    // 2020 Posts
    {
      date: 'September 10, 2020',
      title: 'Building Arizona\'s First Integrated Transport Platform',
      excerpt: 'Our mission to connect every hotel with reliable luxury transportation.',
      author: 'James Wilson',
      views: '4.3K',
      comments: 71,
      category: 'Company'
    },
    {
      date: 'March 15, 2020',
      title: 'Why Phoenix Hotels Need Better Transport Solutions',
      excerpt: 'Market research revealing the $50M opportunity in hotel transportation.',
      author: 'Emily Rodriguez',
      views: '7.8K',
      comments: 124,
      category: 'Research'
    },
    // 2019 Posts
    {
      date: 'December 1, 2019',
      title: 'Revolutionizing Hotel Ground Transportation Through GDS',
      excerpt: 'Our founding vision: Making luxury transport bookable like flights.',
      author: 'David Martinez',
      views: '3.1K',
      comments: 52,
      category: 'Vision'
    }
  ]

  const recentPosts = blogPosts.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoNewspaperOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Blog & Insights
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setShowSubscribeModal(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Industry Insights & Updates
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6">
                Six years of revolutionizing hotel transportation, now bringing our expertise to everyone
              </p>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                  FEATURED
                </span>
                <span className="text-xs opacity-90">August 15, 2025</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                From Private to Public: The ItWhip Evolution
              </h2>
              <p className="text-blue-100 mb-6 max-w-3xl">
                After six years of operating behind the scenes as a GDS-integrated transportation provider for hotels, 
                we're excited to announce our public launch. Our new super app combines everything we've learned into 
                one seamless platform for all travelers.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <span className="text-sm">By Michael Chen, CEO</span>
                  <span className="flex items-center text-sm">
                    <IoEyeOutline className="w-4 h-4 mr-1" />
                    15.2K views
                  </span>
                  <span className="flex items-center text-sm">
                    <IoChatbubbleOutline className="w-4 h-4 mr-1" />
                    342 comments
                  </span>
                </div>
                <button 
                  onClick={() => setShowSubscribeModal(true)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                About ItWhip
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Founded in 2019, ItWhip began as a specialized GDS integration partner, quietly revolutionizing 
                  hotel ground transportation through seamless backend systems. For six years, we've powered 
                  transportation for over 500 hotels across Arizona, completing 2.5 million trips without most 
                  travelers even knowing our name.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our deep integration with Amadeus GDS allowed hotels to book ground transportation as easily as 
                  flights, while our network of 450+ professional drivers ensured reliable, luxury service. This 
                  B2B focus gave us unparalleled insights into what travelers really need.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Now in 2025, we're taking everything we've learned and launching our super app - bringing our 
                  proven transportation infrastructure directly to consumers. It's not just another ride app; it's 
                  six years of expertise in one seamless platform.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Founded</div>
                  <div className="text-lg font-bold">2019</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Hotel Partners</div>
                  <div className="text-lg font-bold">500+</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Total Trips</div>
                  <div className="text-lg font-bold">2.5M+</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Drivers</div>
                  <div className="text-lg font-bold">450+</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">GDS Since</div>
                  <div className="text-lg font-bold">2020</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Public Launch</div>
                  <div className="text-lg font-bold">2025</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Blog Posts */}
        <section className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recent Articles
              </h2>
              <button 
                onClick={() => setShowSubscribeModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Articles →
              </button>
            </div>

            <div className="space-y-4">
              {recentPosts.map((post, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs text-gray-500">
                          <IoCalendarOutline className="inline w-3 h-3 mr-1" />
                          {post.date}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded">
                          {post.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <IoPersonOutline className="w-3 h-3 mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <IoEyeOutline className="w-3 h-3 mr-1" />
                          {post.views} views
                        </span>
                        <span className="flex items-center">
                          <IoChatbubbleOutline className="w-3 h-3 mr-1" />
                          {post.comments} comments
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowSubscribeModal(true)}
                      className="ml-4 text-blue-600 hover:text-blue-700"
                    >
                      <IoArrowForwardOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setShowSubscribeModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Access Full Blog Archive
              </button>
              <p className="text-xs text-gray-500 mt-2">
                17 articles from 2019-2025 • Exclusive access required
              </p>
            </div>
          </div>
        </section>

        {/* Subscribe CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IoLockClosedOutline className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Exclusive Industry Insights
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our blog contains proprietary research, technical documentation, and strategic insights 
              developed over six years of GDS operations. Access is limited to verified industry professionals.
            </p>
            <button 
              onClick={() => setShowSubscribeModal(true)}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg"
            >
              Request Access
            </button>
            <p className="text-xs text-blue-200 mt-4">
              Applications reviewed within 48 hours
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2019-2025 ItWhip Technologies, Inc. All rights reserved.</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/about" className="hover:text-gray-700 dark:hover:text-gray-300">About</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
                <Link href="/careers" className="hover:text-gray-700 dark:hover:text-gray-300">Careers</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <IoLockClosedOutline className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Request Exclusive Access
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our blog contains proprietary insights from 6 years of GDS operations. 
                Access is reserved for verified industry professionals and partners.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Professional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="your@company.com"
                  required
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Note:</strong> We verify all applications. Hotel partners and industry 
                  professionals receive priority access. Personal email addresses may experience delays.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubscribeModal(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Submit Request
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              By requesting access, you agree to our terms and confidentiality requirements.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}