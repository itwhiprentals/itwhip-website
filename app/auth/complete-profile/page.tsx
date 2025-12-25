// app/auth/complete-profile/page.tsx
'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Header from '@/app/components/Header'
import CarInformationForm, { type CarData } from '@/app/components/host/CarInformationForm'
import {
  IoPhonePortraitOutline,
  IoCheckmarkCircle,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

function CompleteProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get params from query
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const roleHint = searchParams.get('roleHint') || 'guest'
  const mode = searchParams.get('mode') || 'signup'

  // Multi-step wizard state (for hosts)
  const totalSteps = roleHint === 'host' ? 2 : 1
  const [currentStep, setCurrentStep] = useState(1)
  const [carData, setCarData] = useState<CarData>({
    make: '',
    model: '',
    year: '',
    color: '',
    trim: '',
    city: '',
    state: '',
    zipCode: ''
  })
  const [isCarValid, setIsCarValid] = useState(false)

  // Get pending OAuth data from session
  const pendingOAuth = (session?.user as any)?.pendingOAuth
  const isProfileComplete = (session?.user as any)?.isProfileComplete

  // Determine if this is a new user (pending) or existing user
  const isPendingUser = pendingOAuth && !isProfileComplete

  // For login mode with pending user, this means "no account found"
  const isLoginModeNoAccount = mode === 'login' && isPendingUser

  // Track if existing HOST user is trying to access guest without guest profile
  const [isHostWithoutGuestProfile, setIsHostWithoutGuestProfile] = useState(false)
  // Track if user is switching accounts (to prevent redirects during signOut)
  // CRITICAL: Use BOTH useState and useRef - ref is synchronous and prevents race conditions
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false)
  const switchingAccountRef = useRef(false)
  const [checkingProfile, setCheckingProfile] = useState(roleHint === 'guest')

  // Redirect if not authenticated
  useEffect(() => {
    // Don't redirect if user is actively switching accounts
    if (switchingAccountRef.current) {
      return
    }
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Check if existing HOST user is trying to login as GUEST without a guest profile
  // This scenario should be BLOCKED - they must use account linking flow
  useEffect(() => {
    async function checkGuestProfile() {
      try {
        const response = await fetch('/api/guest/profile')
        if (response.status === 404) {
          // HOST user trying to access GUEST without profile
          // BLOCK this - they must use account linking flow
          console.log('[Complete Profile] ⚠️ HOST user trying to access GUEST - blocking (must use account linking)')
          setIsHostWithoutGuestProfile(true)
        }
      } catch (error) {
        console.error('[Complete Profile] Error checking guest profile:', error)
      }
      setCheckingProfile(false)
    }

    // For PENDING users (new signups), skip the check - they don't have profiles yet
    if (isPendingUser) {
      setCheckingProfile(false)
      return
    }

    // For EXISTING users trying to access guest, check if they have a guest profile
    if (status === 'authenticated' && !isPendingUser && roleHint === 'guest') {
      checkGuestProfile()
    } else if (status === 'authenticated') {
      // Not a guest roleHint, no need to check
      setCheckingProfile(false)
    }
  }, [status, isPendingUser, roleHint])

  // If profile is already complete and this is an existing user, redirect
  useEffect(() => {
    // Don't redirect if user is switching accounts
    // CRITICAL: Check ref FIRST (synchronous) before state (async)
    if (switchingAccountRef.current || isSwitchingAccount) {
      console.log('[Complete Profile] Blocking redirect - user is switching accounts')
      return
    }
    if (status === 'authenticated' && isProfileComplete && !isPendingUser && !checkingProfile) {
      // If HOST user trying to access GUEST without profile, don't redirect - show blocking message
      if (isHostWithoutGuestProfile) {
        console.log('[Complete Profile] Showing blocking message for HOST without GUEST profile')
        return
      }
      // User already has complete profile, redirect to dashboard
      router.push(redirectTo)
    }
  }, [status, isProfileComplete, isPendingUser, router, redirectTo, isHostWithoutGuestProfile, checkingProfile, isSwitchingAccount])

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
    setError('')
  }

  const validatePhone = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePhone()) return

    // For hosts at step 1, just validate and proceed to step 2
    if (roleHint === 'host' && currentStep === 1) {
      setCurrentStep(2)
      return
    }

    // For hosts at step 2 or guests at step 1, submit to API
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          roleHint: roleHint,
          ...(roleHint === 'host' && {
            carData: {
              make: carData.make,
              model: carData.model,
              year: carData.year,
              color: carData.color,
              trim: carData.trim || null,
              city: carData.city,
              state: carData.state,
              zipCode: carData.zipCode
            }
          })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save phone number')
      }

      // If this was a new user creation, we got new JWT cookies
      // Force a hard redirect to get fresh session state
      if (data.isNewUser) {
        console.log('[Complete Profile] New user created - doing hard redirect')
        // Small delay to ensure cookies are set
        setTimeout(() => {
          if (roleHint === 'host') {
            // For hosts, redirect to login with pending status (they need approval)
            window.location.href = '/host/login?status=pending'
          } else {
            window.location.href = redirectTo
          }
        }, 100)
      } else {
        // Existing user - update session and redirect normally
        await update()
        if (roleHint === 'host') {
          router.push('/host/dashboard')
        } else {
          router.push(redirectTo)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  if (status === 'loading' || checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Get user info from pendingOAuth or session
  const userName = pendingOAuth?.name || session?.user?.name || 'there'
  const userEmail = pendingOAuth?.email || session?.user?.email
  const userImage = pendingOAuth?.image || session?.user?.image

  // ========================================================================
  // BLOCKING STATE: HOST user trying to access GUEST without profile
  // They must use account linking flow - NO automatic profile creation
  // ========================================================================
  if (isHostWithoutGuestProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="flex items-center justify-center px-4 py-16 pt-24">
          <div className="w-full max-w-md">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <IoAlertCircleOutline className="w-10 h-10 text-yellow-500" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Account Already Exists
                </h1>
                <p className="text-gray-400 mb-4">
                  You are already registered as a <span className="text-blue-400 font-semibold">Host</span> with this email.
                </p>
                <p className="text-gray-400 text-sm">
                  To also use this account as a Guest, please use the <span className="text-white">Account Linking</span> feature from your Host dashboard.
                </p>
              </div>

              {/* User Info */}
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  {userImage ? (
                    <img src={userImage} alt="Profile" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <IoPersonOutline className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{userName}</p>
                    <p className="text-gray-400 text-sm">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/host/dashboard')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Go to Host Dashboard
                </button>
                <button
                  onClick={() => router.push('/host/settings/account-linking')}
                  className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Link a Guest Account
                </button>
                <a
                  href="/auth/login?switching=true"
                  className="block w-full py-2 text-sm text-gray-400 hover:text-white transition-colors text-center"
                >
                  Use a Different Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />

      <div className="flex items-center justify-center px-4 py-16 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
            {/* Icon - Different based on mode */}
            <div className="flex justify-center mb-6">
              {isLoginModeNoAccount ? (
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <IoAlertCircleOutline className="w-10 h-10 text-yellow-500" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <IoCheckmarkCircle className="w-10 h-10 text-green-500" />
                </div>
              )}
            </div>

            {/* Header - Different based on mode */}
            <div className="text-center mb-8">
              {isLoginModeNoAccount ? (
                <>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {roleHint === 'host' ? 'No Host Account Found' : 'No Account Found'}
                  </h1>
                  <p className="text-gray-400">
                    {roleHint === 'host' ? (
                      <>
                        No host account exists with <span className="text-white">{userEmail}</span>. Would you like to become a host?
                      </>
                    ) : (
                      <>
                        No account exists with <span className="text-white">{userEmail}</span>. Would you like to create one?
                      </>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Almost Done!
                  </h1>
                  <p className="text-gray-400">
                    Welcome, {userName}! Just one more step to complete your profile.
                  </p>
                </>
              )}
            </div>

            {/* Progress Indicator (hosts only) */}
            {roleHint === 'host' && (
              <div className="flex items-center justify-center mb-8">
                {/* Step 1 Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <span className="text-xs text-gray-400 mt-2">Phone</span>
                </div>

                {/* Connector */}
                <div className={`w-16 h-1 mx-2 transition-all ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'
                }`}></div>

                {/* Step 2 Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="text-xs text-gray-400 mt-2">Vehicle</span>
                </div>
              </div>
            )}

            {/* User Info Preview */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                {userImage ? (
                  <img
                    src={userImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <IoPersonOutline className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{userName}</p>
                  <p className="text-gray-400 text-sm">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Step 1: Phone Form */}
            {currentStep === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IoPhonePortraitOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {isLoginModeNoAccount
                    ? roleHint === 'host'
                      ? 'Enter your phone number to become a host'
                      : 'Enter your phone number to create your account'
                    : "We'll use this for booking confirmations and important updates"
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !phone}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLoginModeNoAccount
                      ? roleHint === 'host'
                        ? 'Creating Host Account...'
                        : 'Creating Account...'
                      : 'Saving...'}
                  </span>
                ) : (
                  roleHint === 'host' && currentStep === 1
                    ? 'Continue to Vehicle Info'
                    : isLoginModeNoAccount
                      ? roleHint === 'host'
                        ? 'Become a Host'
                        : 'Create Account'
                      : 'Complete Profile'
                )}
              </button>
            </form>
            )}

            {/* Step 2: Car Information (hosts only) */}
            {currentStep === 2 && roleHint === 'host' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Vehicle Information</h2>
                  <p className="text-gray-400 text-sm">Add your first vehicle to start earning on ItWhip</p>
                </div>

                <CarInformationForm
                  carData={carData}
                  onCarDataChange={(data) => setCarData({ ...carData, ...data })}
                  onValidationChange={setIsCarValid}
                  showLocationFields={true}
                  className="mb-6"
                />

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    <IoArrowBackOutline className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !isCarValid}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Host Account...
                      </span>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Back to Login Link (only for login mode with no account) */}
            {isLoginModeNoAccount && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push(roleHint === 'host' ? '/host/login' : '/auth/login')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Your phone number is kept private and only used for booking-related communications.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  )
}
