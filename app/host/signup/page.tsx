// app/host/signup/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import OAuthButtons from '@/app/components/auth/OAuthButtons'
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

  // Pre-fill form data from OAuth session
  useEffect(() => {
    if (isOAuthUser && session?.user) {
      const nameParts = (session.user.name || '').split(' ')
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user?.email || ''
      }))
      // OAuth users start at step 2
      setCurrentStep(2)
    }
  }, [isOAuthUser, session])

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
      setCurrentStep(3)
      setError('')
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

    if (!isStep3Valid()) {
      setError('Please complete all required fields and upload at least 4 photos')
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
        // Location info
        address: vehicleData.address || null,
        city: vehicleData.city,
        state: vehicleData.state,
        zipCode: vehicleData.zipCode,
        // Vehicle info
        hasVehicle: true,
        vehicleVin: vehicleData.vin || null,
        vehicleMake: vehicleData.make,
        vehicleModel: vehicleData.model,
        vehicleYear: vehicleData.year,
        vehicleColor: vehicleData.color,
        vehicleTrim: vehicleData.trim || null,
        // VIN-decoded specs
        vehicleFuelType: vehicleData.fuelType || null,
        vehicleDoors: vehicleData.doors || null,
        vehicleBodyClass: vehicleData.bodyClass || null,
        vehicleTransmission: vehicleData.transmission || null,
        vehicleDriveType: vehicleData.driveType || null,
        agreeToTerms: formData.agreeToTerms,
        // Host role flags
        managesOwnCars,
        isHostManager,
        managesOthersCars,
        // Vehicle photos
        vehiclePhotoUrls: vehiclePhotos.map(p => p.url)
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
      // Redirect to dashboard with welcome message (dashboard shows pending status banner)
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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoCarSportOutline className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Become a Host
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Start earning by sharing your vehicle
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 1 ? <IoCheckmarkCircle className="w-6 h-6" /> : '1'}
              </div>
              <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 2 ? <IoCheckmarkCircle className="w-6 h-6" /> : '2'}
              </div>
              <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit}>

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h2>

                  {/* OAuth Buttons */}
                  <OAuthButtons
                    theme="host"
                    roleHint="host"
                    callbackUrl="/host/dashboard"
                    showDivider={true}
                    mode="signup"
                  />

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoPhonePortraitOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStep1Valid()}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium mt-6"
                  >
                    Continue to Vehicle Info
                  </button>
                </div>
              )}

              {/* Step 2: Vehicle + Location Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* OAuth User Welcome Message */}
                  {isOAuthUser && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            Welcome, {session?.user?.name || 'Host'}!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Complete your host profile by adding your vehicle details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Host Role Selection */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      What will you be doing on ITWhip?
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Choose how you plan to use the platform
                    </p>

                    <div className="space-y-3">
                      {/* Option: Rent out my own cars */}
                      <label
                        className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                          formData.hostRole === 'own'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hostRole"
                          value="own"
                          checked={formData.hostRole === 'own'}
                          onChange={(e) => setFormData({...formData, hostRole: 'own'})}
                          className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IoCarOutline className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Rent out my own car(s)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            I'll manage my vehicles and handle bookings myself
                          </p>
                        </div>
                      </label>

                      {/* Option: Manage other people's cars */}
                      <label
                        className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                          formData.hostRole === 'manage'
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hostRole"
                          value="manage"
                          checked={formData.hostRole === 'manage'}
                          onChange={(e) => setFormData({...formData, hostRole: 'manage'})}
                          className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IoPeopleOutline className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Manage other people's cars
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            I'm a fleet manager - I'll manage vehicles for other owners and earn commission
                          </p>
                        </div>
                      </label>

                      {/* Option: Both */}
                      <label
                        className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition border-2 ${
                          formData.hostRole === 'both'
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hostRole"
                          value="both"
                          checked={formData.hostRole === 'both'}
                          onChange={(e) => setFormData({...formData, hostRole: 'both'})}
                          className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IoLayersOutline className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Both - I want to do it all
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            I'll rent my own vehicles AND manage vehicles for other owners
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Vehicle & Location
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Tell us about your vehicle and where it's located.
                  </p>

                  {/* Vehicle Information Form Component */}
                  <CarInformationForm
                    carData={vehicleData}
                    onCarDataChange={(data) => setVehicleData(prev => ({ ...prev, ...data }))}
                    onValidationChange={setIsVehicleValid}
                    showLocationFields={true}
                  />

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">
                    {/* Only show back button for non-OAuth users */}
                    {!isOAuthUser && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!isStep2Valid()}
                      className={`${isOAuthUser ? 'w-full' : 'flex-1'} bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium`}
                    >
                      Continue to Photos
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Vehicle Photos */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Vehicle Photos
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload at least {MIN_PHOTOS_REQUIRED} photos of your vehicle to help renters see what they're booking.
                  </p>

                  {/* Photo Count Indicator */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    vehiclePhotos.length >= MIN_PHOTOS_REQUIRED
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {vehiclePhotos.length >= MIN_PHOTOS_REQUIRED ? (
                        <IoCheckmarkCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        vehiclePhotos.length >= MIN_PHOTOS_REQUIRED
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-amber-800 dark:text-amber-300'
                      }`}>
                        {vehiclePhotos.length} of {MIN_PHOTOS_REQUIRED} minimum photos uploaded
                      </span>
                    </div>
                    {vehiclePhotos.length < MIN_PHOTOS_REQUIRED && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {MIN_PHOTOS_REQUIRED - vehiclePhotos.length} more required
                      </span>
                    )}
                  </div>

                  {/* Upload Area */}
                  <label className={`block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    uploadingPhotos
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                      : 'border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Uploading photos...</span>
                      </div>
                    ) : (
                      <>
                        <IoCloudUploadOutline className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload photos
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          JPG, PNG up to 10MB each
                        </p>
                      </>
                    )}
                  </label>

                  {/* Photo Grid */}
                  {vehiclePhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {vehiclePhotos.map((photo, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
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
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                              Main Photo
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {vehiclePhotos.length === 0 && (
                    <div className="text-center py-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <IoImageOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No photos uploaded yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Add photos of exterior, interior, and key features
                      </p>
                    </div>
                  )}

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3 mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                      className="mt-0.5 h-5 w-5 text-green-600 focus:ring-green-500 border-2 border-gray-300 dark:border-gray-500 rounded cursor-pointer bg-white dark:bg-gray-800"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                      I agree to the{' '}
                      <Link href="/terms" className="text-green-600 hover:text-green-700 underline font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-green-600 hover:text-green-700 underline font-medium">
                        Privacy Policy
                      </Link>
                      {' '}<span className="text-red-500">*</span>
                    </label>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !isStep3Valid()}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isLoading ? 'Creating Host Profile...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/host/login" className="text-green-600 hover:text-green-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>

            {/* Renter Signup Link */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Looking to rent a car instead?
              </p>
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Create Renter Account
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Why host with ItWhip?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Earn up to 90% of each rental</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>$1M liability insurance included</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>24/7 roadside assistance</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>You control pricing & availability</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function HostSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    }>
      <HostSignupContent />
    </Suspense>
  )
}
