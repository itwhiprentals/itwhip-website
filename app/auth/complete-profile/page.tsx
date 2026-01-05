// app/auth/complete-profile/page.tsx
'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'
import CarInformationForm, { type CarData } from '@/app/components/host/CarInformationForm'
import {
  IoPhonePortraitOutline,
  IoCheckmarkCircle,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoCarOutline,
  IoPeopleOutline,
  IoLayersOutline
} from 'react-icons/io5'
import Image from 'next/image'
import Link from 'next/link'

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
  // Guard param is set by oauth-redirect to indicate cross-role scenarios
  // Use this SYNCHRONOUSLY to prevent race conditions with async state
  const guard = searchParams.get('guard')
  const isGuestToHostUpgrade = guard === 'guest-on-host'
  const isHostToGuestBlocked = guard === 'host-on-guest'

  // Multi-step wizard state (for hosts) - 3 steps: Phone → Vehicle+hostRole → Photos
  const [currentStep, setCurrentStep] = useState(1)
  const [carData, setCarData] = useState<CarData>({
    vin: '',
    make: '',
    model: '',
    year: '',
    color: '',
    trim: '',
    fuelType: '',
    doors: '',
    bodyClass: '',
    transmission: '',
    driveType: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })
  const [isCarValid, setIsCarValid] = useState(false)

  // Host role selection
  const [hostRole, setHostRole] = useState<'own' | 'manage' | 'both' | ''>('')

  // Photo upload state
  const [vehiclePhotos, setVehiclePhotos] = useState<{ url: string; file?: File }[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const MIN_PHOTOS_REQUIRED = 4

  // Step validation functions
  const isStep2Valid = () => {
    return isCarValid && hostRole !== ''
  }

  const isStep3Valid = () => {
    return vehiclePhotos.length >= MIN_PHOTOS_REQUIRED && agreeToTerms
  }

  // Get pending OAuth data from session
  const pendingOAuth = (session?.user as any)?.pendingOAuth
  const isProfileComplete = (session?.user as any)?.isProfileComplete

  // Determine if this is a new user (pending) or existing user
  const isPendingUser = pendingOAuth && !isProfileComplete

  // For login mode with pending user, this means "no account found"
  const isLoginModeNoAccount = mode === 'login' && isPendingUser

  // Track if existing HOST user is trying to access guest without guest profile
  const [isHostWithoutGuestProfile, setIsHostWithoutGuestProfile] = useState(false)
  // Track if existing GUEST user is trying to access host without host profile
  const [isGuestWithoutHostProfile, setIsGuestWithoutHostProfile] = useState(false)
  // Track if user is switching accounts (to prevent redirects during signOut)
  // CRITICAL: Use BOTH useState and useRef - ref is synchronous and prevents race conditions
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false)
  const switchingAccountRef = useRef(false)
  const [checkingProfile, setCheckingProfile] = useState(roleHint === 'guest' || roleHint === 'host')

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
  // OR if existing GUEST user is trying to login as HOST without a host profile
  // These scenarios should be BLOCKED - they must use account linking flow
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

    async function checkHostProfile() {
      try {
        const response = await fetch('/api/host/profile')
        // Handle both 404 (no profile) and 401 (no auth token = no host profile)
        if (response.status === 404 || response.status === 401) {
          // Check if user is a GUEST (has guest profile but not host)
          const guestResponse = await fetch('/api/guest/profile')
          if (guestResponse.ok) {
            // GUEST user trying to become a HOST - show upgrade form
            console.log('[Complete Profile] GUEST user wants to become HOST - showing upgrade form')
            setIsGuestWithoutHostProfile(true)
          }
        }
      } catch (error) {
        console.error('[Complete Profile] Error checking host profile:', error)
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
    } else if (status === 'authenticated' && !isPendingUser && roleHint === 'host') {
      // For EXISTING users trying to access host, check if they have a host profile
      checkHostProfile()
    } else if (status === 'authenticated') {
      // No roleHint, no need to check
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

    // CRITICAL FIX: Check guard params FIRST (synchronous) before async state
    // This prevents the race condition where redirect fires before async checks complete
    if (isGuestToHostUpgrade) {
      console.log('[Complete Profile] Guard=guest-on-host detected - blocking redirect for upgrade flow')
      return
    }
    if (isHostToGuestBlocked) {
      console.log('[Complete Profile] Guard=host-on-guest detected - blocking redirect for guard screen')
      return
    }

    if (status === 'authenticated' && isProfileComplete && !isPendingUser && !checkingProfile) {
      // If HOST user trying to access GUEST without profile, don't redirect - show blocking message
      if (isHostWithoutGuestProfile) {
        console.log('[Complete Profile] Showing blocking message for HOST without GUEST profile')
        return
      }
      // If GUEST user trying to access HOST without profile, don't redirect - show blocking message
      if (isGuestWithoutHostProfile) {
        console.log('[Complete Profile] Showing blocking message for GUEST without HOST profile')
        return
      }
      // User already has complete profile, redirect to dashboard
      router.push(redirectTo)
    }
  }, [status, isProfileComplete, isPendingUser, router, redirectTo, isHostWithoutGuestProfile, isGuestWithoutHostProfile, checkingProfile, isSwitchingAccount, isGuestToHostUpgrade, isHostToGuestBlocked])

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

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhotos(true)
    setError('')

    try {
      const newPhotos: { url: string; file?: File }[] = []

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed')
          continue
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          setError('Each photo must be under 10MB')
          continue
        }

        // Upload to Cloudinary via API
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'hostSignupPhoto')

        const response = await fetch('/api/rentals/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          newPhotos.push({ url: data.url, file })
        } else {
          console.error('Failed to upload photo')
        }
      }

      setVehiclePhotos(prev => [...prev, ...newPhotos])
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload photos. Please try again.')
    } finally {
      setUploadingPhotos(false)
      // Reset input
      e.target.value = ''
    }
  }

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setVehiclePhotos(prev => prev.filter((_, i) => i !== index))
  }

  const validatePhone = () => {
    // Phone is REQUIRED for OAuth users (OAuth only provides email/name)
    if (!phone || phone.trim() === '') {
      setError('Phone number is required')
      return false
    }
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

    // For hosts at step 2, validate and proceed to step 3
    if (roleHint === 'host' && currentStep === 2) {
      if (isStep2Valid()) {
        setCurrentStep(3)
      }
      return
    }

    // For hosts at step 3 or guests at step 1, submit to API
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
            hostRole: hostRole,
            vehiclePhotoUrls: vehiclePhotos.map(p => p.url),
            agreeToTerms: agreeToTerms,
            carData: {
              vin: carData.vin || null,
              make: carData.make,
              model: carData.model,
              year: carData.year,
              color: carData.color,
              trim: carData.trim || null,
              // VIN-decoded specs
              fuelType: carData.fuelType || null,
              doors: carData.doors || null,
              bodyClass: carData.bodyClass || null,
              transmission: carData.transmission || null,
              driveType: carData.driveType || null,
              // Location
              address: carData.address || '',
              city: carData.city,
              state: carData.state,
              zipCode: carData.zipCode
            }
          })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle HOST trying to create GUEST profile - redirect to host dashboard
        if (data.requiresAccountLinking && data.isHost) {
          setError('You already have a Host account. Redirecting to Host Dashboard...')
          setIsLoading(false)
          setTimeout(() => {
            window.location.href = data.hostDashboardUrl || '/host/dashboard'
          }, 2000)
          return
        }
        throw new Error(data.error || 'Failed to save phone number')
      }

      // If this was a new user creation, we got new JWT cookies
      // Force a hard redirect to get fresh session state
      if (data.isNewUser) {
        console.log('[Complete Profile] New user created')

        // Skip phone verification - phone is optional and not part of login flow
        // Redirect directly to dashboard
        setTimeout(() => {
          if (roleHint === 'host') {
            window.location.href = '/host/login?status=pending'
          } else {
            window.location.href = redirectTo
          }
        }, 100)
      } else if (data.isNewHost) {
        // Guest-to-Host upgrade - new JWT cookies were set
        // Force a hard redirect to get fresh session state
        console.log('[Complete Profile] Guest upgraded to Host')
        setTimeout(() => {
          // Redirect to dashboard - it will show pending approval status if needed
          window.location.href = '/host/dashboard'
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

  // Show loading state UNLESS we have a guard param that tells us what to render immediately
  // This prevents the flash of loading spinner when we already know the intent
  if (status === 'loading' || (checkingProfile && !isGuestToHostUpgrade && !isHostToGuestBlocked)) {
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
  // UPGRADE STATE: GUEST user trying to become a HOST
  // Show the host signup form to let them upgrade their account
  // CRITICAL: Check BOTH the synchronous guard param AND the async state
  // The guard param is checked first to prevent race conditions
  // ========================================================================
  if (isGuestToHostUpgrade || isGuestWithoutHostProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="flex items-center justify-center px-4 py-16 pt-24">
          <div className="w-full max-w-md">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
              {/* Upgrade Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <IoCheckmarkCircle className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Upgrade to Host
                </h1>
                <p className="text-gray-400">
                  You have a <span className="text-orange-500 font-semibold">Guest</span> account. Complete the form below to also become a host!
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

              {/* Progress Indicator - 3 Steps */}
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

                {/* Connector 1-2 */}
                <div className={`w-12 h-1 mx-2 transition-all ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'
                }`}></div>

                {/* Step 2 Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                  <span className="text-xs text-gray-400 mt-2">Vehicle</span>
                </div>

                {/* Connector 2-3 */}
                <div className={`w-12 h-1 mx-2 transition-all ${
                  currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-700'
                }`}></div>

                {/* Step 3 Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= 3
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    3
                  </div>
                  <span className="text-xs text-gray-400 mt-2">Photos</span>
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
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Required for booking notifications and account verification
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
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Vehicle Info
                  </button>

                  {/* Cancel Link */}
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel and go to Guest Dashboard
                  </button>
                </form>
              )}

              {/* Step 2: Vehicle + Host Role */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Host Role Selection */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">What will you be doing on ItWhip?</h2>
                    <p className="text-gray-400 text-sm mb-4">Choose how you plan to use the platform</p>

                    <div className="space-y-3">
                      {/* Option: Rent out my own cars */}
                      <label
                        className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                          hostRole === 'own'
                            ? 'bg-green-900/30 border-green-500'
                            : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hostRole"
                          value="own"
                          checked={hostRole === 'own'}
                          onChange={() => setHostRole('own')}
                          className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IoCarOutline className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-white">Rent out my own car(s)</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            I'll manage my vehicles and handle bookings myself
                          </p>
                        </div>
                      </label>

                      {/* Option: Manage other people's cars */}
                      <label
                        className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                          hostRole === 'manage'
                            ? 'bg-purple-900/30 border-purple-500'
                            : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hostRole"
                          value="manage"
                          checked={hostRole === 'manage'}
                          onChange={() => setHostRole('manage')}
                          className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IoPeopleOutline className="w-5 h-5 text-purple-500" />
                            <span className="font-medium text-white">Manage other people's cars</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            I'm a fleet manager - I'll manage vehicles for other owners and earn commission
                          </p>
                        </div>
                      </label>

                      {/* Option: Both */}
                      <label
                        className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                          hostRole === 'both'
                            ? 'bg-indigo-900/30 border-indigo-500'
                            : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hostRole"
                          value="both"
                          checked={hostRole === 'both'}
                          onChange={() => setHostRole('both')}
                          className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IoLayersOutline className="w-5 h-5 text-indigo-500" />
                            <span className="font-medium text-white">Both - I want to do it all</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            I'll rent my own vehicles AND manage vehicles for other owners
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-white mb-2">Vehicle Information</h2>
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
                      onClick={() => setCurrentStep(3)}
                      disabled={!isStep2Valid()}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Photos
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Vehicle Photos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white mb-2">Vehicle Photos</h2>
                    <p className="text-gray-400 text-sm">Upload at least {MIN_PHOTOS_REQUIRED} photos of your vehicle</p>
                  </div>

                  {/* Photo Count Indicator */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    vehiclePhotos.length >= MIN_PHOTOS_REQUIRED
                      ? 'bg-emerald-900/30 border border-emerald-700'
                      : 'bg-amber-900/30 border border-amber-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {vehiclePhotos.length >= MIN_PHOTOS_REQUIRED ? (
                        <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <IoWarningOutline className="w-5 h-5 text-amber-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        vehiclePhotos.length >= MIN_PHOTOS_REQUIRED
                          ? 'text-emerald-300'
                          : 'text-amber-300'
                      }`}>
                        {vehiclePhotos.length} of {MIN_PHOTOS_REQUIRED} minimum photos uploaded
                      </span>
                    </div>
                    {vehiclePhotos.length < MIN_PHOTOS_REQUIRED && (
                      <span className="text-xs text-amber-400">
                        {MIN_PHOTOS_REQUIRED - vehiclePhotos.length} more required
                      </span>
                    )}
                  </div>

                  {/* Upload Area */}
                  <label className={`block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    uploadingPhotos
                      ? 'border-gray-600 bg-gray-700/50'
                      : 'border-blue-600 hover:border-blue-500 hover:bg-blue-900/20'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhotos}
                    />
                    {uploadingPhotos ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-gray-400">Uploading photos...</span>
                      </div>
                    ) : (
                      <>
                        <IoCloudUploadOutline className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-300">Click to upload photos</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB each</p>
                      </>
                    )}
                  </label>

                  {/* Photo Grid */}
                  {vehiclePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {vehiclePhotos.map((photo, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-700">
                          <Image
                            src={photo.url}
                            alt={`Vehicle photo ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <IoTrashOutline className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                              Main Photo
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {vehiclePhotos.length === 0 && (
                    <div className="text-center py-6 border border-gray-700 rounded-lg bg-gray-800/50">
                      <IoImageOutline className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No photos uploaded yet</p>
                      <p className="text-xs text-gray-500 mt-1">Add photos of exterior, interior, and key features</p>
                    </div>
                  )}

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3 mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-0.5 h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-500 rounded cursor-pointer bg-gray-800"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer select-none">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline font-medium">
                        Privacy Policy
                      </Link>
                      {' '}<span className="text-red-500">*</span>
                    </label>
                  </div>

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
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      <IoArrowBackOutline className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || !isStep3Valid()}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Host Profile...
                        </span>
                      ) : (
                        'Complete Signup'
                      )}
                    </button>
                  </div>
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

  // ========================================================================
  // BLOCKING STATE: HOST user trying to access GUEST without profile
  // They must use account linking flow - NO automatic profile creation
  // CRITICAL: Check BOTH the synchronous guard param AND the async state
  // ========================================================================
  if (isHostToGuestBlocked || isHostWithoutGuestProfile) {
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
                  To also use this account as a Guest, please use the <span className="text-white font-medium">Account Linking</span> feature from your Host dashboard.
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

            {/* Progress Indicator (hosts only) - 3 Steps */}
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

                {/* Connector 1-2 */}
                <div className={`w-12 h-1 mx-2 transition-all ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'
                }`}></div>

                {/* Step 2 Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                  <span className="text-xs text-gray-400 mt-2">Vehicle</span>
                </div>

                {/* Connector 2-3 */}
                <div className={`w-12 h-1 mx-2 transition-all ${
                  currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-700'
                }`}></div>

                {/* Step 3 Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= 3
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    3
                  </div>
                  <span className="text-xs text-gray-400 mt-2">Photos</span>
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
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Required for booking notifications and account verification
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
                disabled={isLoading}
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

            {/* Step 2: Vehicle + Host Role (hosts only) */}
            {currentStep === 2 && roleHint === 'host' && (
              <div className="space-y-6">
                {/* Host Role Selection */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">What will you be doing on ItWhip?</h2>
                  <p className="text-gray-400 text-sm mb-4">Choose how you plan to use the platform</p>

                  <div className="space-y-3">
                    {/* Option: Rent out my own cars */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                        hostRole === 'own'
                          ? 'bg-green-900/30 border-green-500'
                          : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hostRole2"
                        value="own"
                        checked={hostRole === 'own'}
                        onChange={() => setHostRole('own')}
                        className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <IoCarOutline className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-white">Rent out my own car(s)</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          I'll manage my vehicles and handle bookings myself
                        </p>
                      </div>
                    </label>

                    {/* Option: Manage other people's cars */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                        hostRole === 'manage'
                          ? 'bg-purple-900/30 border-purple-500'
                          : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hostRole2"
                        value="manage"
                        checked={hostRole === 'manage'}
                        onChange={() => setHostRole('manage')}
                        className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <IoPeopleOutline className="w-5 h-5 text-purple-500" />
                          <span className="font-medium text-white">Manage other people's cars</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          I'm a fleet manager - I'll manage vehicles for other owners and earn commission
                        </p>
                      </div>
                    </label>

                    {/* Option: Both */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                        hostRole === 'both'
                          ? 'bg-indigo-900/30 border-indigo-500'
                          : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hostRole2"
                        value="both"
                        checked={hostRole === 'both'}
                        onChange={() => setHostRole('both')}
                        className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <IoLayersOutline className="w-5 h-5 text-indigo-500" />
                          <span className="font-medium text-white">Both - I want to do it all</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          I'll rent my own vehicles AND manage vehicles for other owners
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-white mb-2">Vehicle Information</h2>
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
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStep2Valid()}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Photos
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle Photos (hosts only) */}
            {currentStep === 3 && roleHint === 'host' && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white mb-2">Vehicle Photos</h2>
                  <p className="text-gray-400 text-sm">Upload at least {MIN_PHOTOS_REQUIRED} photos of your vehicle</p>
                </div>

                {/* Photo Count Indicator */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  vehiclePhotos.length >= MIN_PHOTOS_REQUIRED
                    ? 'bg-emerald-900/30 border border-emerald-700'
                    : 'bg-amber-900/30 border border-amber-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {vehiclePhotos.length >= MIN_PHOTOS_REQUIRED ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <IoWarningOutline className="w-5 h-5 text-amber-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      vehiclePhotos.length >= MIN_PHOTOS_REQUIRED
                        ? 'text-emerald-300'
                        : 'text-amber-300'
                    }`}>
                      {vehiclePhotos.length} of {MIN_PHOTOS_REQUIRED} minimum photos uploaded
                    </span>
                  </div>
                  {vehiclePhotos.length < MIN_PHOTOS_REQUIRED && (
                    <span className="text-xs text-amber-400">
                      {MIN_PHOTOS_REQUIRED - vehiclePhotos.length} more required
                    </span>
                  )}
                </div>

                {/* Upload Area */}
                <label className={`block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploadingPhotos
                    ? 'border-gray-600 bg-gray-700/50'
                    : 'border-blue-600 hover:border-blue-500 hover:bg-blue-900/20'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhotos}
                  />
                  {uploadingPhotos ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-400">Uploading photos...</span>
                    </div>
                  ) : (
                    <>
                      <IoCloudUploadOutline className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-300">Click to upload photos</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB each</p>
                    </>
                  )}
                </label>

                {/* Photo Grid */}
                {vehiclePhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {vehiclePhotos.map((photo, index) => (
                      <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-700">
                        <Image
                          src={photo.url}
                          alt={`Vehicle photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {vehiclePhotos.length === 0 && (
                  <div className="text-center py-6 border border-gray-700 rounded-lg bg-gray-800/50">
                    <IoImageOutline className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No photos uploaded yet</p>
                    <p className="text-xs text-gray-500 mt-1">Add photos of exterior, interior, and key features</p>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="flex items-start gap-3 mt-6 p-4 bg-gray-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="terms2"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-500 rounded cursor-pointer bg-gray-800"
                  />
                  <label htmlFor="terms2" className="text-sm text-gray-400 cursor-pointer select-none">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline font-medium">
                      Privacy Policy
                    </Link>
                    {' '}<span className="text-red-500">*</span>
                  </label>
                </div>

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
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    <IoArrowBackOutline className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !isStep3Valid()}
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
