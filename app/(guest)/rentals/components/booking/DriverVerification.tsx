// app/(guest)/rentals/components/booking/DriverVerification.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { 
  IoCardOutline,
  IoCameraOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoCloudUploadOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

interface VerificationData {
  licenseNumber: string
  licenseState: string
  licenseExpiry: string
  licensePhotoUrl: string
  selfiePhotoUrl: string
  age: string
  agreedToTerms: boolean
}

interface DriverVerificationProps {
  onComplete: (data: VerificationData) => void
  onBack: () => void
  initialData?: VerificationData
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
]

export default function DriverVerification({ 
  onComplete, 
  onBack, 
  initialData 
}: DriverVerificationProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const licenseInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)
  
  const [data, setData] = useState<VerificationData>(initialData || {
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    licensePhotoUrl: '',
    selfiePhotoUrl: '',
    age: '',
    agreedToTerms: false
  })

  const [uploadProgress, setUploadProgress] = useState({
    license: 0,
    selfie: 0
  })

  const handleFileUpload = async (file: File, type: 'license' | 'selfie') => {
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, [type]: 'File size must be less than 5MB' })
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, [type]: 'Please upload an image file' })
      return
    }

    setIsUploading(true)
    setUploadProgress({ ...uploadProgress, [type]: 0 })

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [type]: Math.min(prev[type] + 10, 90)
        }))
      }, 100)

      // Upload to server
      const response = await fetch('/api/rentals/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress({ ...uploadProgress, [type]: 100 })

      if (!response.ok) throw new Error('Upload failed')

      const { url } = await response.json()
      
      // Update data
      setData({
        ...data,
        [type === 'license' ? 'licensePhotoUrl' : 'selfiePhotoUrl']: url
      })

      // Clear errors
      const newErrors = { ...errors }
      delete newErrors[type]
      setErrors(newErrors)

    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ ...errors, [type]: 'Upload failed. Please try again.' })
    } finally {
      setIsUploading(false)
      setUploadProgress({ ...uploadProgress, [type]: 0 })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.licenseNumber) {
      newErrors.licenseNumber = 'License number is required'
    }

    if (!data.licenseState) {
      newErrors.licenseState = 'License state is required'
    }

    if (!data.licenseExpiry) {
      newErrors.licenseExpiry = 'License expiry date is required'
    } else {
      const expiryDate = new Date(data.licenseExpiry)
      if (expiryDate < new Date()) {
        newErrors.licenseExpiry = 'License has expired'
      }
    }

    if (!data.licensePhotoUrl) {
      newErrors.license = 'Please upload your driver\'s license'
    }

    if (!data.selfiePhotoUrl) {
      newErrors.selfie = 'Please upload a selfie for verification'
    }

    if (!data.age) {
      newErrors.age = 'Please select your age range'
    }

    if (!data.agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(data)
    }
  }

  const removePhoto = (type: 'license' | 'selfie') => {
    setData({
      ...data,
      [type === 'license' ? 'licensePhotoUrl' : 'selfiePhotoUrl']: ''
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <IoShieldCheckmarkOutline className="w-8 h-8 text-amber-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold">Driver Verification</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We need to verify your identity to ensure safety for all users
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <div className="font-medium mb-1">Your information is secure</div>
            <div className="text-blue-700 dark:text-blue-400">
              All documents are encrypted and stored securely. We use this information solely for 
              verification purposes and comply with all privacy regulations.
            </div>
          </div>
        </div>
      </div>

      {/* License Information */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Driver's License Number
          </label>
          <input
            type="text"
            value={data.licenseNumber}
            onChange={(e) => setData({ ...data, licenseNumber: e.target.value.toUpperCase() })}
            className={`
              w-full px-4 py-2 border rounded-lg dark:bg-gray-700
              ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
            placeholder="Enter license number"
          />
          {errors.licenseNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issuing State
            </label>
            <select
              value={data.licenseState}
              onChange={(e) => setData({ ...data, licenseState: e.target.value })}
              className={`
                w-full px-4 py-2 border rounded-lg dark:bg-gray-700
                ${errors.licenseState ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              `}
            >
              <option value="">Select state</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.licenseState && (
              <p className="mt-1 text-sm text-red-600">{errors.licenseState}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={data.licenseExpiry}
              onChange={(e) => setData({ ...data, licenseExpiry: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`
                w-full px-4 py-2 border rounded-lg dark:bg-gray-700
                ${errors.licenseExpiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
            {errors.licenseExpiry && (
              <p className="mt-1 text-sm text-red-600">{errors.licenseExpiry}</p>
            )}
          </div>
        </div>
      </div>

      {/* Photo Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* License Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Driver's License Photo
          </label>
          <div
            onClick={() => !data.licensePhotoUrl && licenseInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              hover:border-amber-400 transition-colors
              ${errors.license ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${data.licensePhotoUrl ? 'border-solid' : ''}
            `}
          >
            <input
              ref={licenseInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'license')}
              className="hidden"
            />

            {data.licensePhotoUrl ? (
              <div className="relative">
                <Image
                  src={data.licensePhotoUrl}
                  alt="License"
                  width={200}
                  height={120}
                  className="mx-auto rounded"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePhoto('license')
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <IoCloseCircleOutline className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <IoCardOutline className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click to upload front of license
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  JPG, PNG up to 5MB
                </p>
              </>
            )}

            {uploadProgress.license > 0 && uploadProgress.license < 100 && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 rounded-b-lg">
                <div
                  className="h-full bg-amber-600 rounded-b-lg transition-all"
                  style={{ width: `${uploadProgress.license}%` }}
                />
              </div>
            )}
          </div>
          {errors.license && (
            <p className="mt-1 text-sm text-red-600">{errors.license}</p>
          )}
        </div>

        {/* Selfie Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selfie for Verification
          </label>
          <div
            onClick={() => !data.selfiePhotoUrl && selfieInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              hover:border-amber-400 transition-colors
              ${errors.selfie ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${data.selfiePhotoUrl ? 'border-solid' : ''}
            `}
          >
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
              className="hidden"
            />

            {data.selfiePhotoUrl ? (
              <div className="relative">
                <Image
                  src={data.selfiePhotoUrl}
                  alt="Selfie"
                  width={200}
                  height={120}
                  className="mx-auto rounded"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePhoto('selfie')
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <IoCloseCircleOutline className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <IoPersonOutline className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click to take or upload selfie
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Clear photo of your face
                </p>
              </>
            )}

            {uploadProgress.selfie > 0 && uploadProgress.selfie < 100 && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 rounded-b-lg">
                <div
                  className="h-full bg-amber-600 rounded-b-lg transition-all"
                  style={{ width: `${uploadProgress.selfie}%` }}
                />
              </div>
            )}
          </div>
          {errors.selfie && (
            <p className="mt-1 text-sm text-red-600">{errors.selfie}</p>
          )}
        </div>
      </div>

      {/* Age Verification */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Age Range
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['18-20', '21-24', '25-29', '30+'].map((range) => (
            <button
              key={range}
              onClick={() => setData({ ...data, age: range })}
              className={`
                p-3 rounded-lg border text-center
                ${
                  data.age === range
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }
              `}
            >
              <div className="font-medium">{range}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {range === '18-20' && '+$25/day fee'}
                {range === '21-24' && '+$15/day fee'}
                {range === '25-29' && 'Standard rate'}
                {range === '30+' && 'Standard rate'}
              </div>
            </button>
          ))}
        </div>
        {errors.age && (
          <p className="mt-1 text-sm text-red-600">{errors.age}</p>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="mb-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={data.agreedToTerms}
            onChange={(e) => setData({ ...data, agreedToTerms: e.target.checked })}
            className="mt-1 mr-3"
          />
          <div className="text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-amber-600 hover:underline">
                Terms and Conditions
              </a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="text-amber-600 hover:underline">
                Privacy Policy
              </a>
              . I confirm that I have a valid driver's license and am legally allowed to drive.
            </span>
          </div>
        </label>
        {errors.terms && (
          <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
        )}
      </div>

      {/* Verification Status */}
      {data.licensePhotoUrl && data.selfiePhotoUrl && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm text-green-800 dark:text-green-300 font-medium">
              Documents uploaded successfully. Ready for verification.
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <IoArrowBackOutline className="w-5 h-5 mr-2" />
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className={`
            flex items-center px-6 py-3 rounded-lg font-medium
            ${
              isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }
          `}
        >
          Continue to Payment
          <IoArrowForwardOutline className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  )
}