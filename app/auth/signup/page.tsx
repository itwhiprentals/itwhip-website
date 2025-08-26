// app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { 
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoPhonePortraitOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoCarSportOutline,
  IoRocketOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function SignupPage() {
  const router = useRouter()
  
  // Header state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }
  
  const handleSearchClick = () => {
    // Already on auth page
  }
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    const strengthLevels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Weak', color: 'text-red-500' },
      { strength: 2, text: 'Fair', color: 'text-orange-500' },
      { strength: 3, text: 'Good', color: 'text-yellow-500' },
      { strength: 4, text: 'Strong', color: 'text-green-500' },
      { strength: 5, text: 'Very Strong', color: 'text-green-600' }
    ]
    
    return strengthLevels[strength]
  }
  
  const passwordStrength = getPasswordStrength(formData.password)
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }
      
      // Success! Redirect to dashboard
      router.push('/dashboard')
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />
      
      {/* Main Content - Adjusted for header */}
      <div className="pt-14 md:pt-16"> {/* Padding for fixed header */}
        {/* Security Banner */}
        <div className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2 text-xs">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600" />
              <span className="text-green-800 dark:text-green-400">
                Secured by 13-layer JWT authentication
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex min-h-[calc(100vh-96px)]"> {/* Adjusted height */}
          {/* Left Side - Signup Form */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              {/* Welcome Message */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Create your account
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Get started with zero surge pricing, forever
                </p>
              </div>
              
              {/* Benefits */}
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 mb-6 border border-purple-200 dark:border-purple-800">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800 dark:text-purple-300">No surge pricing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800 dark:text-purple-300">3 min pickups</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800 dark:text-purple-300">Luxury vehicles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800 dark:text-purple-300">$25 free credit</span>
                  </div>
                </div>
              </div>
              
              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                
                {/* Phone (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <IoPhonePortraitOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="At least 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <IoEyeOffOutline className="w-5 h-5" />
                      ) : (
                        <IoEyeOutline className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                      Password strength: {passwordStrength.text}
                    </p>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <IoEyeOffOutline className="w-5 h-5" />
                      ) : (
                        <IoEyeOutline className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Terms */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-700">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-purple-600 hover:text-purple-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <IoRocketOutline className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
                
                {/* Already have account */}
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
          
          {/* Right Side - Marketing */}
          <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 items-center justify-center">
            <div className="max-w-md text-white">
              <IoCarSportOutline className="w-16 h-16 mb-6" />
              <h2 className="text-3xl font-bold mb-6">
                Start Riding in Minutes
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <IoSparklesOutline className="w-6 h-6 text-purple-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Premium Vehicles Only</h3>
                    <p className="text-purple-100 text-sm">
                      Tesla, Mercedes, BMW - luxury is our standard, not an upgrade
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Military-Grade Security</h3>
                    <p className="text-purple-100 text-sm">
                      13 layers of security, blockchain audit trail, zero breaches since inception
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <IoRocketOutline className="w-6 h-6 text-purple-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">3-Minute Pickups</h3>
                    <p className="text-purple-100 text-sm">
                      Our AI predicts demand, positioning drivers before you even book
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="font-semibold mb-4">Platform Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">487+</div>
                    <div className="text-xs text-purple-200">Partner Hotels</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2.5M+</div>
                    <div className="text-xs text-purple-200">Rides Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">4.9★</div>
                    <div className="text-xs text-purple-200">Average Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">0%</div>
                    <div className="text-xs text-purple-200">Surge Pricing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simple Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span>© 2025 ItWhip Technologies</span>
                <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300">Terms</Link>
                <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300">Privacy</Link>
                <Link href="/contact" className="hover:text-slate-700 dark:hover:text-slate-300">Contact</Link>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                <span>Secured Platform • </span>
                <Link href="/security/certification" className="hover:text-slate-700 dark:hover:text-slate-300 underline">
                  TU-1-A Certified
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}