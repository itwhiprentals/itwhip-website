// app/partners/apply/start/page.tsx
// Multi-step Partner Application Form

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoBusinessOutline,
  IoPersonOutline,
  IoCarSportOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCheckmarkCircle,
  IoArrowBack,
  IoArrowForward,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoAlertCircle,
  IoCheckmark
} from 'react-icons/io5'
import { validatePartnerSlug, generateSlugFromName } from '@/app/lib/validation/reserved-slugs'

// Step configuration
const steps = [
  { id: 1, title: 'Company Info', icon: IoBusinessOutline },
  { id: 2, title: 'Contact', icon: IoPersonOutline },
  { id: 3, title: 'Fleet Details', icon: IoCarSportOutline },
  { id: 4, title: 'Documents', icon: IoDocumentTextOutline },
  { id: 5, title: 'Insurance', icon: IoShieldCheckmarkOutline },
  { id: 6, title: 'Review', icon: IoCheckmarkCircle }
]

// Form data types
interface FormData {
  // Step 1: Company Info
  companyName: string
  businessType: string
  yearsInBusiness: string
  ein: string
  partnerSlug: string
  website: string

  // Step 2: Contact
  contactName: string
  contactEmail: string
  contactPhone: string
  contactTitle: string

  // Step 3: Fleet Details
  fleetSize: string
  vehicleTypes: string[]
  operatingCities: string[]
  operatingStates: string[]

  // Step 4: Documents
  businessLicenseUrl: string
  articlesOfIncorporationUrl: string
  w9Url: string

  // Step 5: Insurance
  insuranceProvider: string
  policyNumber: string
  coverageAmount: string
  policyExpiresAt: string
  insuranceCertificateUrl: string

  // Terms
  agreeToTerms: boolean
  agreeToBackgroundCheck: boolean
}

const initialFormData: FormData = {
  companyName: '',
  businessType: '',
  yearsInBusiness: '',
  ein: '',
  partnerSlug: '',
  website: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactTitle: '',
  fleetSize: '',
  vehicleTypes: [],
  operatingCities: [],
  operatingStates: [],
  businessLicenseUrl: '',
  articlesOfIncorporationUrl: '',
  w9Url: '',
  insuranceProvider: '',
  policyNumber: '',
  coverageAmount: '',
  policyExpiresAt: '',
  insuranceCertificateUrl: '',
  agreeToTerms: false,
  agreeToBackgroundCheck: false
}

const businessTypes = [
  'LLC',
  'Corporation (C-Corp)',
  'Corporation (S-Corp)',
  'Sole Proprietorship',
  'Partnership',
  'Other'
]

const vehicleTypeOptions = [
  'Economy (Corolla, Civic, etc.)',
  'Standard (Camry, Accord, etc.)',
  'SUV (RAV4, CR-V, etc.)',
  'Premium (BMW, Mercedes, etc.)',
  'Luxury (Tesla, Lexus, etc.)',
  'Minivan (Sienna, Odyssey, etc.)',
  'Electric (Tesla, Polestar, etc.)'
]

const usStates = [
  'Arizona', 'California', 'Colorado', 'Florida', 'Georgia',
  'Illinois', 'Nevada', 'New York', 'Texas', 'Washington'
]

export default function PartnerApplicationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [slugValidation, setSlugValidation] = useState<{ valid: boolean; error?: string }>({ valid: true })

  // Update form data
  const updateField = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [])

  // Auto-generate slug from company name
  const handleCompanyNameChange = (name: string) => {
    updateField('companyName', name)
    if (name && !formData.partnerSlug) {
      const slug = generateSlugFromName(name)
      updateField('partnerSlug', slug)
      validateSlug(slug)
    }
  }

  // Validate slug
  const validateSlug = (slug: string) => {
    const result = validatePartnerSlug(slug)
    setSlugValidation(result)
    return result.valid
  }

  // Toggle array field
  const toggleArrayField = (field: 'vehicleTypes' | 'operatingCities' | 'operatingStates', value: string) => {
    const current = formData[field] as string[]
    if (current.includes(value)) {
      updateField(field, current.filter(v => v !== value))
    } else {
      updateField(field, [...current, value])
    }
  }

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    switch (currentStep) {
      case 1:
        if (!formData.companyName) newErrors.companyName = 'Company name is required'
        if (!formData.businessType) newErrors.businessType = 'Business type is required'
        if (!formData.yearsInBusiness) newErrors.yearsInBusiness = 'Years in business is required'
        if (!formData.partnerSlug) {
          newErrors.partnerSlug = 'Partner URL is required'
        } else if (!slugValidation.valid) {
          newErrors.partnerSlug = slugValidation.error || 'Invalid URL'
        }
        break

      case 2:
        if (!formData.contactName) newErrors.contactName = 'Contact name is required'
        if (!formData.contactEmail) newErrors.contactEmail = 'Email is required'
        if (!formData.contactPhone) newErrors.contactPhone = 'Phone is required'
        break

      case 3:
        if (!formData.fleetSize) newErrors.fleetSize = 'Fleet size is required'
        if (formData.vehicleTypes.length === 0) newErrors.vehicleTypes = 'Select at least one vehicle type'
        if (formData.operatingStates.length === 0) newErrors.operatingStates = 'Select at least one state'
        break

      case 4:
        if (!formData.businessLicenseUrl) newErrors.businessLicenseUrl = 'Business license is required'
        if (!formData.w9Url) newErrors.w9Url = 'W-9 form is required'
        break

      case 5:
        if (!formData.insuranceProvider) newErrors.insuranceProvider = 'Insurance provider is required'
        if (!formData.policyNumber) newErrors.policyNumber = 'Policy number is required'
        if (!formData.policyExpiresAt) newErrors.policyExpiresAt = 'Expiration date is required'
        if (!formData.insuranceCertificateUrl) newErrors.insuranceCertificateUrl = 'Insurance certificate is required'
        break

      case 6:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'
        if (!formData.agreeToBackgroundCheck) newErrors.agreeToBackgroundCheck = 'Background check consent is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigate steps
  const nextStep = () => {
    if (validateStep() && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  // Submit application
  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Redirect to success page or login
      router.push('/partners/apply/success')
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // File upload handler (placeholder - integrate with Cloudinary)
  const handleFileUpload = async (field: keyof FormData, file: File) => {
    // TODO: Integrate with Cloudinary upload
    // For now, just show a placeholder URL
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('upload_preset', 'unsigned')

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: 'POST', body: formDataUpload }
      )
      const data = await response.json()
      if (data.secure_url) {
        updateField(field, data.secure_url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Partner Application</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Complete the form below to become an ItWhip Fleet Partner</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="relative flex items-center justify-between">
            {/* Progress Line Background */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 hidden sm:block" style={{ left: '8%', right: '8%' }} />
            {/* Progress Line Filled */}
            <div
              className="absolute top-5 h-0.5 bg-green-500 hidden sm:block transition-all duration-300"
              style={{
                left: '8%',
                width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 84)}%`
              }}
            />

            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center relative z-10" style={{ width: `${100 / steps.length}%` }}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white shadow-md'
                      : currentStep === step.id
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg ring-4 ring-orange-100 dark:ring-orange-900/30'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <IoCheckmark className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium mt-3 text-center transition-colors ${
                    currentStep > step.id
                      ? 'text-green-600 dark:text-green-400'
                      : currentStep === step.id
                      ? 'text-orange-600 dark:text-orange-400 font-semibold'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.id}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Drive It Pro LLC"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Partner URL *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400 mr-2">itwhip.com/rideshare/</span>
                  <input
                    type="text"
                    value={formData.partnerSlug}
                    onChange={(e) => {
                      updateField('partnerSlug', e.target.value.toLowerCase())
                      validateSlug(e.target.value.toLowerCase())
                    }}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.partnerSlug || !slugValidation.valid ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="drive-it-pro"
                  />
                </div>
                {(errors.partnerSlug || !slugValidation.valid) && (
                  <p className="mt-1 text-sm text-red-500">{errors.partnerSlug || slugValidation.error}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => updateField('businessType', e.target.value)}
                    className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.businessType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="mt-1 text-sm text-red-500">{errors.businessType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Years in Business *
                  </label>
                  <select
                    value={formData.yearsInBusiness}
                    onChange={(e) => updateField('yearsInBusiness', e.target.value)}
                    className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.yearsInBusiness ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="0">Less than 1 year</option>
                    <option value="1">1-2 years</option>
                    <option value="3">3-5 years</option>
                    <option value="5">5-10 years</option>
                    <option value="10">10+ years</option>
                  </select>
                  {errors.yearsInBusiness && (
                    <p className="mt-1 text-sm text-red-500">{errors.yearsInBusiness}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    EIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ein}
                    onChange={(e) => updateField('ein', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="XX-XXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.contactName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Smith"
                />
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.contactTitle}
                  onChange={(e) => updateField('contactTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Fleet Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@driveItPro.com"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Fleet Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fleet Size *
                </label>
                <select
                  value={formData.fleetSize}
                  onChange={(e) => updateField('fleetSize', e.target.value)}
                  className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.fleetSize ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select fleet size</option>
                  <option value="5-9">5-9 vehicles</option>
                  <option value="10-24">10-24 vehicles</option>
                  <option value="25-49">25-49 vehicles</option>
                  <option value="50-99">50-99 vehicles</option>
                  <option value="100+">100+ vehicles</option>
                </select>
                {errors.fleetSize && (
                  <p className="mt-1 text-sm text-red-500">{errors.fleetSize}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Types * <span className="text-gray-400 font-normal">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {vehicleTypeOptions.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.vehicleTypes.includes(type)
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.vehicleTypes.includes(type)}
                        onChange={() => toggleArrayField('vehicleTypes', type)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.vehicleTypes.includes(type)
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {formData.vehicleTypes.includes(type) && (
                          <IoCheckmark className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
                {errors.vehicleTypes && (
                  <p className="mt-1 text-sm text-red-500">{errors.vehicleTypes}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operating States * <span className="text-gray-400 font-normal">(Select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {usStates.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => toggleArrayField('operatingStates', state)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.operatingStates.includes(state)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
                {errors.operatingStates && (
                  <p className="mt-1 text-sm text-red-500">{errors.operatingStates}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <IoAlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Upload clear, legible copies of the following documents. Accepted formats: PDF, JPG, PNG.
                  </p>
                </div>
              </div>

              <FileUploadField
                label="Business License *"
                value={formData.businessLicenseUrl}
                onChange={(url) => updateField('businessLicenseUrl', url)}
                onUpload={(file) => handleFileUpload('businessLicenseUrl', file)}
                error={errors.businessLicenseUrl}
              />

              <FileUploadField
                label="Articles of Incorporation (Optional)"
                value={formData.articlesOfIncorporationUrl}
                onChange={(url) => updateField('articlesOfIncorporationUrl', url)}
                onUpload={(file) => handleFileUpload('articlesOfIncorporationUrl', file)}
              />

              <FileUploadField
                label="W-9 Form *"
                value={formData.w9Url}
                onChange={(url) => updateField('w9Url', url)}
                onUpload={(file) => handleFileUpload('w9Url', file)}
                error={errors.w9Url}
              />
            </div>
          )}

          {/* Step 5: Insurance */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Insurance Provider *
                </label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => updateField('insuranceProvider', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.insuranceProvider ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="State Farm, Progressive, etc."
                />
                {errors.insuranceProvider && (
                  <p className="mt-1 text-sm text-red-500">{errors.insuranceProvider}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    value={formData.policyNumber}
                    onChange={(e) => updateField('policyNumber', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.policyNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="POL-123456"
                  />
                  {errors.policyNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.policyNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coverage Amount (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.coverageAmount}
                    onChange={(e) => updateField('coverageAmount', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="$1,000,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Policy Expiration Date *
                </label>
                <input
                  type="date"
                  value={formData.policyExpiresAt}
                  onChange={(e) => updateField('policyExpiresAt', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.policyExpiresAt ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.policyExpiresAt && (
                  <p className="mt-1 text-sm text-red-500">{errors.policyExpiresAt}</p>
                )}
              </div>

              <FileUploadField
                label="Insurance Certificate *"
                value={formData.insuranceCertificateUrl}
                onChange={(url) => updateField('insuranceCertificateUrl', url)}
                onUpload={(file) => handleFileUpload('insuranceCertificateUrl', file)}
                error={errors.insuranceCertificateUrl}
              />
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Application Summary</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Company:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.companyName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Business Type:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.businessType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.contactName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.contactEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Fleet Size:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.fleetSize} vehicles</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Operating In:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.operatingStates.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/platform-agreement" className="text-orange-600 hover:underline">Platform Agreement</Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToBackgroundCheck}
                    onChange={(e) => updateField('agreeToBackgroundCheck', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I consent to a background check for authorized representatives
                  </span>
                </label>
                {errors.agreeToBackgroundCheck && (
                  <p className="text-sm text-red-500">{errors.agreeToBackgroundCheck}</p>
                )}
              </div>

              {submitError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IoAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IoArrowBack className="w-5 h-5" />
                Back
              </button>
            ) : (
              <Link
                href="/partners/apply"
                className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IoArrowBack className="w-5 h-5" />
                Cancel
              </Link>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Continue
                <IoArrowForward className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                {!isSubmitting && <IoCheckmarkCircle className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// File Upload Component
function FileUploadField({
  label,
  value,
  onChange,
  onUpload,
  error
}: {
  label: string
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => void
  error?: string
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {value ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
          <span className="flex-1 text-sm text-green-700 dark:text-green-300 truncate">
            Document uploaded
          </span>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <IoTrashOutline className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
            error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <IoCloudUploadOutline className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-gray-400 mt-1">
            PDF, JPG, PNG up to 10MB
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
