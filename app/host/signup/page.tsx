// app/host/signup/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import OAuthButtons from '@/app/components/auth/OAuthButtons'
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
  IoChevronDownOutline,
  IoLocationOutline,
  IoColorPaletteOutline
} from 'react-icons/io5'
import { getAllMakes, getModelsByMake, getYears, getPopularMakes } from '@/app/lib/data/vehicles'

// US States - Arizona first, then alphabetical
const US_STATES = [
  { value: 'AZ', label: 'Arizona' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' }
]

// Standard car colors
const CAR_COLORS = [
  { value: 'Black', label: 'Black' },
  { value: 'White', label: 'White' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Gray', label: 'Gray' },
  { value: 'Red', label: 'Red' },
  { value: 'Blue', label: 'Blue' },
  { value: 'Navy', label: 'Navy Blue' },
  { value: 'Brown', label: 'Brown' },
  { value: 'Beige', label: 'Beige' },
  { value: 'Green', label: 'Green' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Orange', label: 'Orange' },
  { value: 'Yellow', label: 'Yellow' },
  { value: 'Purple', label: 'Purple' },
  { value: 'Burgundy', label: 'Burgundy' },
  { value: 'Champagne', label: 'Champagne' },
  { value: 'Pearl White', label: 'Pearl White' },
  { value: 'Midnight Blue', label: 'Midnight Blue' },
  { value: 'Other', label: 'Other' }
]

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
    agreeToTerms: false
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
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    trim: '',
    city: '',
    state: '',
    zipCode: ''
  })

  // Available options
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const allMakes = getAllMakes()
  const popularMakes = getPopularMakes()
  const years = getYears()

  // Update available models when make changes
  useEffect(() => {
    if (vehicleData.make) {
      const models = getModelsByMake(vehicleData.make)
      setAvailableModels(models)
      // Reset model if current model not in new make's models
      if (!models.includes(vehicleData.model)) {
        setVehicleData(prev => ({ ...prev, model: '' }))
      }
    } else {
      setAvailableModels([])
    }
  }, [vehicleData.make])

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
    return (
      vehicleData.make !== '' &&
      vehicleData.model !== '' &&
      vehicleData.year !== '' &&
      vehicleData.color !== '' &&
      vehicleData.city.trim() !== '' &&
      vehicleData.state !== '' &&
      vehicleData.zipCode.trim() !== '' &&
      vehicleData.zipCode.length >= 5 &&
      formData.agreeToTerms
    )
  }

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2)
      setError('')
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isStep2Valid()) {
      setError('Please complete all required fields')
      return
    }

    setIsLoading(true)

    try {
      // Build request body - OAuth users don't need password
      const requestBody: any = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        // Location info
        city: vehicleData.city,
        state: vehicleData.state,
        zipCode: vehicleData.zipCode,
        // Vehicle info
        hasVehicle: true,
        vehicleMake: vehicleData.make,
        vehicleModel: vehicleData.model,
        vehicleYear: vehicleData.year,
        vehicleColor: vehicleData.color,
        vehicleTrim: vehicleData.trim || null,
        agreeToTerms: formData.agreeToTerms
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

      // For OAuth users, email is already verified - go straight to pending review
      if (isOAuthUser) {
        router.push('/host/login?status=pending')
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
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
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

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Vehicle & Location
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Tell us about your vehicle and where it's located.
                  </p>

                  {/* Vehicle Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <IoCarSportOutline className="w-4 h-4" />
                      Vehicle Details
                    </h3>

                    {/* Year and Make - Side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Year */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Year <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicleData.year}
                            onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Make */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Make <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicleData.make}
                            onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Make</option>
                            <optgroup label="Popular Brands">
                              {popularMakes.map(make => (
                                <option key={make} value={make}>{make}</option>
                              ))}
                            </optgroup>
                            <optgroup label="All Brands">
                              {allMakes.filter(make => !popularMakes.includes(make)).map(make => (
                                <option key={make} value={make}>{make}</option>
                              ))}
                            </optgroup>
                          </select>
                          <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Model and Color - Side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Model <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicleData.model}
                            onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                            required
                            disabled={!vehicleData.make}
                          >
                            <option value="">{vehicleData.make ? 'Model' : 'Select Make First'}</option>
                            {availableModels.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                          <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Color <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicleData.color}
                            onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Color</option>
                            {CAR_COLORS.map(color => (
                              <option key={color.value} value={color.value}>{color.label}</option>
                            ))}
                          </select>
                          <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Trim (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Trim <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={vehicleData.trim}
                        onChange={(e) => setVehicleData({...vehicleData, trim: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., SE, XLE, Sport, Limited"
                      />
                    </div>
                  </div>

                  {/* Vehicle Preview */}
                  {vehicleData.make && vehicleData.model && vehicleData.year && vehicleData.color && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center">
                          <IoCarSportOutline className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {vehicleData.year} {vehicleData.make} {vehicleData.model}
                            {vehicleData.trim && ` ${vehicleData.trim}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <IoColorPaletteOutline className="w-4 h-4" />
                            {vehicleData.color} • Ready to list on ItWhip
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

                  {/* Location Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <IoLocationOutline className="w-4 h-4" />
                      Vehicle Location
                    </h3>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IoLocationOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={vehicleData.city}
                          onChange={(e) => setVehicleData({...vehicleData, city: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Phoenix"
                          required
                        />
                      </div>
                    </div>

                    {/* State and Zip */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={vehicleData.state}
                            onChange={(e) => setVehicleData({...vehicleData, state: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select State</option>
                            {US_STATES.map(state => (
                              <option key={state.value} value={state.value}>{state.label}</option>
                            ))}
                          </select>
                          <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Zip Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vehicleData.zipCode}
                          onChange={(e) => setVehicleData({...vehicleData, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="85001"
                          required
                          maxLength={5}
                          pattern="[0-9]{5}"
                        />
                      </div>
                    </div>
                  </div>

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

                  {/* Validation hint */}
                  {!formData.agreeToTerms && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      Please check the box above to continue
                    </p>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <IoWarningOutline className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

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
                      type="submit"
                      disabled={isLoading || !isStep2Valid()}
                      className={`${isOAuthUser ? 'w-full' : 'flex-1'} bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium`}
                    >
                      {isLoading ? 'Creating Host Profile...' : isOAuthUser ? 'Complete Host Registration' : 'Create Account'}
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