// app/host-dashboard/HostDashboardContent.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { 
  IoCarOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoCashOutline,
  IoBusinessOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline
} from 'react-icons/io5'

export default function HostDashboardContent() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', formData)
    // TODO: Implement actual authentication
    alert('Dashboard access coming soon! Please check your email for onboarding instructions.')
  }

  const features = [
    {
      icon: IoCashOutline,
      title: 'Track Earnings',
      description: 'Real-time revenue tracking and analytics'
    },
    {
      icon: IoCarOutline,
      title: 'Manage Vehicles',
      description: 'Update listings, availability, and pricing'
    },
    {
      icon: IoBusinessOutline,
      title: 'Booking Calendar',
      description: 'View and manage all your bookings'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Performance Metrics',
      description: 'Monitor ratings and response times'
    }
  ]

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

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left Side - Login Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                    <IoCarOutline className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Host Dashboard
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isLogin ? 'Sign in to manage your vehicles' : 'Create your host account'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="host@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <IoLockClosedOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <IoEyeOffOutline className="w-5 h-5" />
                        ) : (
                          <IoEyeOutline className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          Remember me
                        </span>
                      </label>
                      <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
                  >
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <IoArrowForwardOutline className="w-5 h-5 ml-2" />
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-1 text-green-600 hover:text-green-700 font-medium"
                    >
                      {isLogin ? 'Apply as Host' : 'Sign In'}
                    </button>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 text-center">
                    New hosts must be approved before accessing the dashboard.
                    <Link href="/list-your-car" className="text-green-600 hover:text-green-700 ml-1">
                      Submit your vehicle first →
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Info */}
            <div className="order-1 lg:order-2 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Manage Your Fleet with
                  <span className="block text-green-600 mt-2">Powerful Tools</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Access everything you need to succeed as a host in one centralized dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Dashboard Features
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                      <li className="flex items-center">
                        <IoCheckmarkCircle className="w-3 h-3 mr-1.5" />
                        Real-time booking notifications
                      </li>
                      <li className="flex items-center">
                        <IoCheckmarkCircle className="w-3 h-3 mr-1.5" />
                        Instant payout tracking
                      </li>
                      <li className="flex items-center">
                        <IoCheckmarkCircle className="w-3 h-3 mr-1.5" />
                        Performance analytics
                      </li>
                      <li className="flex items-center">
                        <IoCheckmarkCircle className="w-3 h-3 mr-1.5" />
                        Guest communication hub
                      </li>
                      <li className="flex items-center">
                        <IoCheckmarkCircle className="w-3 h-3 mr-1.5" />
                        Tax document center
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                  <strong>Earn More with Data</strong>
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Our dashboard provides insights to optimize pricing, improve ratings, and maximize earnings.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/host-requirements" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Host Requirements
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/host-earnings" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Earnings Calculator
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/list-your-car" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                List Your Vehicle
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}