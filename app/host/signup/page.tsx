// app/host/signup/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import PhoneLoginButton from '@/app/components/auth/PhoneLoginButton'
import OAuthButtonsMinimal from '@/app/components/auth/OAuthButtonsMinimal'
import CarInformationForm, { type CarData } from '@/app/components/host/CarInformationForm'
import {
  IoPersonOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLockClosedOutline,
  IoCheckmarkCircle,
  IoCarSportOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoWarningOutline,
  IoCarOutline,
  IoPeopleOutline,
  IoLayersOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoTrashOutline
} from 'react-icons/io5'
import Image from 'next/image'

// Format phone number as (###) ###-####
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')

  // Apply formatting based on length
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function HostSignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const isOAuthUser = searchParams.get('oauth') === 'true' && session?.user

  // Start at step 2 if OAuth user (they already have account, just need vehicle info)
  const [currentStep, setCurrentStep] = useState(isOAuthUser ? 2 : 1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // Personal info - pre-fill from OAuth session if available
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    // Host role selection
    hostRole: '' as 'own' | 'manage' | 'both' | ''
  })

  // Track if we've already initialized OAuth user (to prevent resetting step on session changes)
  const [oauthInitialized, setOauthInitialized] = useState(false)

  // Pre-fill form data from OAuth session (only once)
  useEffect(() => {
    if (isOAuthUser && session?.user && !oauthInitialized) {
      const nameParts = (session.user.name || '').split(' ')
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user?.email || ''
      }))
      // OAuth users start at step 2 (only set once, don't reset if already advanced to step 3)
      setCurrentStep(2)
      setOauthInitialized(true)
    }
  }, [isOAuthUser, session, oauthInitialized])

  // UNIFIED FLOW: Pre-fill hostRole from query param (from /get-started/business)
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam) {
      let role: 'own' | 'manage' | 'both' | '' = ''
      switch (typeParam) {
        case 'own_cars':
          role = 'own'
          break
        case 'manage_others':
          role = 'manage'
          break
        case 'both':
          role = 'both'
          break
      }
      if (role) {
        setFormData(prev => ({ ...prev, hostRole: role }))
      }
    }
  }, [searchParams])

  // Vehicle + Location info
  const [vehicleData, setVehicleData] = useState<CarData>({
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
  const [isVehicleValid, setIsVehicleValid] = useState(false)

  // Photo upload state
  const [vehiclePhotos, setVehiclePhotos] = useState<{ url: string; file?: File }[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const MIN_PHOTOS_REQUIRED = 4

  const isStep1Valid = () => {
    // OAuth users skip password requirements
    if (isOAuthUser) {
      return (
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.email.trim() !== ''
      )
    }

    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword
    )
  }

  const isStep2Valid = () => {
    // Fleet managers (manage-only) don't need vehicle info - they just need to select their role
    if (formData.hostRole === 'manage') {
      return true
    }
    // For 'own' or 'both', they need valid car info AND role selected
    return isVehicleValid && formData.hostRole !== ''
  }

  const isStep3Valid = () => {
    return vehiclePhotos.length >= MIN_PHOTOS_REQUIRED && formData.agreeToTerms
  }

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2)
      setError('')
    } else if (currentStep === 2 && isStep2Valid()) {
      // Fleet managers (manage-only) skip photos step - handled separately via submit
      if (formData.hostRole !== 'manage') {
        setCurrentStep(3)
        setError('')
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      setError('')
    } else if (currentStep === 3) {
      setCurrentStep(2)
      setError('')
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const isManageOnly = formData.hostRole === 'manage'

    // For manage-only, skip step 3 validation (no photos required)
    if (!isManageOnly && !isStep3Valid()) {
      setError('Please complete all required fields and upload at least 4 photos')
      return
    }

    // For manage-only, just need to agree to terms
    if (isManageOnly && !formData.agreeToTerms) {
      setError('Please agree to the Terms of Service')
      return
    }

    setIsLoading(true)

    try {
      // Determine host role flags
      const managesOwnCars = formData.hostRole === 'own' || formData.hostRole === 'both'
      const isHostManager = formData.hostRole === 'manage' || formData.hostRole === 'both'
      const managesOthersCars = formData.hostRole === 'manage' || formData.hostRole === 'both'

      // Build request body - OAuth users don't need password
      const requestBody: any = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        agreeToTerms: formData.agreeToTerms,
        // Host role flags
        managesOwnCars,
        isHostManager,
        managesOthersCars,
        // Is manage-only fleet manager
        isManageOnly
      }

      // Only include vehicle data for hosts who own cars
      if (!isManageOnly) {
        // Location info
        requestBody.address = vehicleData.address || null
        requestBody.city = vehicleData.city
        requestBody.state = vehicleData.state
        requestBody.zipCode = vehicleData.zipCode
        // Vehicle info
        requestBody.hasVehicle = true
        requestBody.vehicleVin = vehicleData.vin || null
        requestBody.vehicleMake = vehicleData.make
        requestBody.vehicleModel = vehicleData.model
        requestBody.vehicleYear = vehicleData.year
        requestBody.vehicleColor = vehicleData.color
        requestBody.vehicleTrim = vehicleData.trim || null
        // VIN-decoded specs
        requestBody.vehicleFuelType = vehicleData.fuelType || null
        requestBody.vehicleDoors = vehicleData.doors || null
        requestBody.vehicleBodyClass = vehicleData.bodyClass || null
        requestBody.vehicleTransmission = vehicleData.transmission || null
        requestBody.vehicleDriveType = vehicleData.driveType || null
        // Vehicle photos
        requestBody.vehiclePhotoUrls = vehiclePhotos.map(p => p.url)
      } else {
        requestBody.hasVehicle = false
      }

      // Only include password for non-OAuth users
      if (!isOAuthUser && formData.password) {
        requestBody.password = formData.password
      }

      // Mark as OAuth user if applicable
      if (isOAuthUser) {
        requestBody.isOAuthUser = true
        requestBody.oauthUserId = (session?.user as any)?.id
      }

      const response = await fetch('/api/host/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Store hostId for verification page (use localStorage for persistence)
      if (data.data?.hostId) {
        localStorage.setItem('pendingHostId', data.data.hostId)
        localStorage.setItem('pendingHostEmail', formData.email)
      }

      // Store carId if created
      if (data.data?.carId) {
        localStorage.setItem('pendingCarId', data.data.carId)
      }

      // For OAuth users, email is already verified and they're already authenticated
      // All hosts go to /host/dashboard first for approval
      if (isOAuthUser) {
        router.push('/host/dashboard?welcome=true')
        return
      }

      // Trigger verification email for non-OAuth users
      await fetch('/api/host/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: data.data.hostId,
          verificationType: 'email'
        })
      })

      // Redirect to verification page
      router.push('/verify?message=check-email')

    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Back Button */}
      <div className="pt-20 px-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back</span>
        </a>
      </div>
      <div className="pb-12">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoCarSportOutline className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Become a Host
            </h1>
            <p className="text-gray-400 mt-2">
              Start earning by sharing your vehicle
            </p>
          </div>

          {/* Progress Steps - 2 or 3 Steps depending on hostRole */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              {/* Step 1 Circle */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span className="text-xs text-gray-400 mt-2">Info</span>
              </div>

              {/* Connector 1-2 */}
              <div className={`w-12 h-1 mx-2 transition-all ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'
              }`}></div>

              {/* Step 2 Circle */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {(formData.hostRole === 'manage' && currentStep === 2) ? '✓' : (currentStep > 2 ? '✓' : '2')}
                </div>
                <span className="text-xs text-gray-400 mt-2">{formData.hostRole === 'manage' ? 'Role' : 'Vehicle'}</span>
              </div>

              {/* Connector 2-3 and Step 3 - only show if not manage-only */}
              {formData.hostRole !== 'manage' && (
                <>
                  <div className={`w-12 h-1 mx-2 transition-all ${
                    currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-700'
                  }`}></div>

                  {/* Step 3 Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                      3
                    </div>
                    <span className="text-xs text-gray-400 mt-2">Photos</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Signup Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 lg:p-8 border border-gray-700">
            <form onSubmit={handleSubmit}>

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white mb-1 text-center">
                    Personal Information
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 text-center">Create your host account</p>

                  {/* Phone-first + OAuth Buttons */}
                  <PhoneLoginButton hostMode />
                  <OAuthButtonsMinimal roleHint="host" mode="signup" />

                  {/* Continue with Email - Expandable */}
                  {!showEmailForm ? (
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-500 transition-all"
                    >
                      <IoMailOutline className="w-5 h-5" />
                      <span className="font-medium">Continue with Email</span>
                    </button>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-gray-700 mt-4">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                              placeholder="John"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <IoPhonePortraitOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                            placeholder="(555) 123-4567"
                            maxLength={14}
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-10 pr-12 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                            placeholder="Min. 8 characters"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                            placeholder="Confirm your password"
                            required
                          />
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={!isStep1Valid()}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        Continue to Vehicle Info
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Vehicle + Location Info */}
              {currentStep === 2 && (
                <div className="space-y-4 lg:space-y-6">
                  {/* OAuth User Welcome Message */}
                  {isOAuthUser && (
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <IoCheckmarkCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-100">
                            Welcome, {session?.user?.name || 'Host'}!
                          </p>
                          <p className="text-sm text-green-300">
                            Complete your host profile by selecting your role.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desktop: Two-column layout for role selection and vehicle info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Host Role Selection */}
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1 text-center">What will you be doing on ItWhip?</h2>
                      <p className="text-gray-400 text-sm mb-4 text-center">Choose how you plan to use the platform</p>

                      <div className="space-y-3">
                        {/* Option: Rent out my own cars */}
                        <label
                          className={`flex items-start gap-3 p-3 lg:p-4 rounded-lg cursor-pointer transition border-2 ${
                            formData.hostRole === 'own'
                              ? 'bg-green-900/30 border-green-500'
                              : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="hostRole"
                            value="own"
                            checked={formData.hostRole === 'own'}
                            onChange={() => setFormData({...formData, hostRole: 'own'})}
                            className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <IoCarOutline className="w-5 h-5 text-green-500" />
                              <span className="font-medium text-white text-sm lg:text-base">Rent out my own car(s)</span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-400 mt-1">
                              I&apos;ll manage my vehicles and handle bookings myself
                            </p>
                          </div>
                        </label>

                        {/* Option: Manage other people's cars */}
                        <label
                          className={`flex items-start gap-3 p-3 lg:p-4 rounded-lg cursor-pointer transition border-2 ${
                            formData.hostRole === 'manage'
                              ? 'bg-purple-900/30 border-purple-500'
                              : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="hostRole"
                            value="manage"
                            checked={formData.hostRole === 'manage'}
                            onChange={() => setFormData({...formData, hostRole: 'manage'})}
                            className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <IoPeopleOutline className="w-5 h-5 text-purple-500" />
                              <span className="font-medium text-white text-sm lg:text-base">Manage other people&apos;s cars</span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-400 mt-1">
                              I&apos;m a fleet manager - I&apos;ll manage vehicles for other owners
                            </p>
                          </div>
                        </label>

                        {/* Option: Both */}
                        <label
                          className={`flex items-start gap-3 p-3 lg:p-4 rounded-lg cursor-pointer transition border-2 ${
                            formData.hostRole === 'both'
                              ? 'bg-indigo-900/30 border-indigo-500'
                              : 'bg-gray-700/50 border-transparent hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="hostRole"
                            value="both"
                            checked={formData.hostRole === 'both'}
                            onChange={() => setFormData({...formData, hostRole: 'both'})}
                            className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <IoLayersOutline className="w-5 h-5 text-indigo-500" />
                              <span className="font-medium text-white text-sm lg:text-base">Both - I want to do it all</span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-400 mt-1">
                              I&apos;ll rent my own vehicles AND manage for other owners
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Right Column: Vehicle Details OR Fleet Manager Info */}
                    <div>
                      {/* Vehicle Details - only shown for hosts who own cars */}
                      {formData.hostRole !== 'manage' && formData.hostRole !== '' && (
                        <>
                          <h2 className="text-lg font-bold text-white mb-1 text-center">Vehicle Details</h2>
                          <p className="text-gray-400 text-sm mb-4 text-center">Add your first vehicle to start earning</p>

                          <CarInformationForm
                            carData={vehicleData}
                            onCarDataChange={(data) => setVehicleData(prev => ({ ...prev, ...data }))}
                            onValidationChange={setIsVehicleValid}
                            showLocationFields={true}
                            className=""
                          />
                        </>
                      )}

                      {/* Placeholder when no role selected */}
                      {formData.hostRole === '' && (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-8">
                          <p className="text-gray-500 text-center">
                            Select how you plan to use ItWhip to continue
                          </p>
                        </div>
                      )}

                      {/* Fleet Manager Info - shown in right column when manage is selected */}
                      {formData.hostRole === 'manage' && (
                        <div className="flex flex-col">
                          {/* Header spacing to align with left column */}
                          <h2 className="text-xl font-bold text-white mb-1 text-center">Fleet Manager</h2>
                          <p className="text-gray-400 text-sm mb-3 text-center">Your fleet management profile</p>

                          <div className="p-4 lg:p-5 bg-purple-900/30 border border-purple-700 rounded-lg">
                            <div className="flex items-start gap-3">
                              <IoPeopleOutline className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <h3 className="font-medium text-white mb-1 text-center text-sm">Fleet Manager Account</h3>
                                <p className="text-xs text-gray-400">
                                  After approval, you&apos;ll get your own profile page to showcase your fleet management services.
                                  You can invite car owners to have you manage their vehicles, or they can invite you to manage their listings.{' '}
                                  <Link href="/how-it-works" className="text-purple-400 hover:text-purple-300">
                                    Learn more →
                                  </Link>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Terms Agreement for manage-only */}
                          <div className="flex items-start gap-3 mt-6 p-4 bg-gray-700/50 rounded-lg">
                            <input
                              type="checkbox"
                              id="termsManage"
                              checked={formData.agreeToTerms}
                              onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                              className="mt-0.5 h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-500 rounded cursor-pointer bg-gray-800 flex-shrink-0"
                            />
                            <label htmlFor="termsManage" className="text-xs lg:text-sm text-gray-400 cursor-pointer select-none">
                              I agree to the{' '}
                              <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline font-medium">
                                Terms and Conditions
                              </Link>{' '}
                              and{' '}
                              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline font-medium">
                                Privacy Policy
                              </Link>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {!isOAuthUser && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type={formData.hostRole === 'manage' ? 'submit' : 'button'}
                      onClick={formData.hostRole === 'manage' ? undefined : handleNextStep}
                      disabled={!isStep2Valid() || (formData.hostRole === 'manage' && isLoading)}
                      className={`${isOAuthUser && formData.hostRole !== 'manage' ? 'w-full' : 'flex-1'} py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {formData.hostRole === 'manage' ? (
                        isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Fleet Manager Account...
                          </span>
                        ) : 'Complete Signup'
                      ) : 'Continue to Photos'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Vehicle Photos */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-1 text-center">
                    Vehicle Photos
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 text-center">
                    Upload at least {MIN_PHOTOS_REQUIRED} photos of your vehicle to help renters see what they&apos;re booking.
                  </p>

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
                        <p className="text-sm font-medium text-gray-300">
                          Click to upload photos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG up to 10MB each
                        </p>
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
                      <p className="text-xs text-gray-500 mt-1">
                        Add photos of exterior, interior, and key features
                      </p>
                    </div>
                  )}

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3 mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                      className="mt-0.5 h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-500 rounded cursor-pointer bg-gray-800 flex-shrink-0"
                      required
                    />
                    <label htmlFor="terms" className="text-xs lg:text-sm text-gray-400 cursor-pointer select-none">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline font-medium">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !isStep3Valid()}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating Host Profile...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/host/login" className="text-green-400 hover:text-green-300 font-medium">
                  Sign In
                </Link>
              </p>
            </div>

            {/* Renter Signup Link */}
            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
              <p className="text-sm text-gray-500 mb-1">
                Looking to rent a car instead?
              </p>
              <Link href="/auth/signup" className="text-green-400 hover:text-green-300 font-medium text-sm">
                Create Renter Account
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-white mb-4 text-center">
              Why host with ItWhip?
            </h3>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Earn up to 90% of each rental</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>$1M liability insurance included</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>24/7 roadside assistance</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>You control pricing &amp; availability</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HostSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <HostSignupContent />
    </Suspense>
  )
}
