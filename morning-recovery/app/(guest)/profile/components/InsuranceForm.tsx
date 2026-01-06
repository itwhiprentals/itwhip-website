// app/(guest)/profile/components/InsuranceForm.tsx
// ✅ INSURANCE FORM - Your original compact design with new insurance system
// Modal (Desktop) / Bottom Sheet (Mobile - 70% height)

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  IoCloseOutline,
  IoCloudUploadOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface InsuranceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mode: 'add' | 'update'
  existingInsurance?: {
    provider: string
    policyNumber: string
    expiryDate: string
    hasRideshare: boolean
    coverageType: string
    customCoverage?: string | null
    notes?: string | null
    cardFrontUrl?: string | null
    cardBackUrl?: string | null
  } | null
}

const COVERAGE_OPTIONS = [
  { value: 'state_minimum', label: 'State Minimum (25/50/25)' },
  { value: 'basic', label: 'Basic (50/100/50)' },
  { value: 'standard', label: 'Standard (100/300/100)' },
  { value: 'premium', label: 'Premium (250/500/100)' },
  { value: 'custom', label: 'Custom/Other' }
]

export default function InsuranceForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  mode,
  existingInsurance 
}: InsuranceFormProps) {
  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    expiryDate: '',
    hasRideshare: false,
    coverageType: '',
    customCoverage: '',
    notes: ''
  })

  const [cardFront, setCardFront] = useState<File | null>(null)
  const [cardBack, setCardBack] = useState<File | null>(null)
  const [cardFrontPreview, setCardFrontPreview] = useState<string | null>(null)
  const [cardBackPreview, setCardBackPreview] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const cardFrontInputRef = useRef<HTMLInputElement>(null)
  const cardBackInputRef = useRef<HTMLInputElement>(null)

  // Populate form with existing data in update mode
  useEffect(() => {
    if (mode === 'update' && existingInsurance) {
      setFormData({
        provider: existingInsurance.provider || '',
        policyNumber: existingInsurance.policyNumber || '',
        expiryDate: existingInsurance.expiryDate ? new Date(existingInsurance.expiryDate).toISOString().split('T')[0] : '',
        hasRideshare: existingInsurance.hasRideshare || false,
        coverageType: existingInsurance.coverageType || '',
        customCoverage: existingInsurance.customCoverage || '',
        notes: existingInsurance.notes || ''
      })

      if (existingInsurance.cardFrontUrl) {
        setCardFrontPreview(existingInsurance.cardFrontUrl)
      }
      if (existingInsurance.cardBackUrl) {
        setCardBackPreview(existingInsurance.cardBackUrl)
      }
    }
  }, [mode, existingInsurance])

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ 
        ...prev, 
        [side === 'front' ? 'cardFront' : 'cardBack']: 'Please upload an image file' 
      }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        [side === 'front' ? 'cardFront' : 'cardBack']: 'File must be less than 10MB' 
      }))
      return
    }

    if (side === 'front') {
      setCardFront(file)
      setCardFrontPreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, cardFront: '' }))
    } else {
      setCardBack(file)
      setCardBackPreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, cardBack: '' }))
    }
  }

  const removeFile = (side: 'front' | 'back') => {
    if (side === 'front') {
      setCardFront(null)
      setCardFrontPreview(null)
      if (cardFrontInputRef.current) cardFrontInputRef.current.value = ''
    } else {
      setCardBack(null)
      setCardBackPreview(null)
      if (cardBackInputRef.current) cardBackInputRef.current.value = ''
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.provider.trim()) {
      newErrors.provider = 'Insurance provider is required'
    }

    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Policy number is required'
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    } else {
      const expDate = new Date(formData.expiryDate)
      if (expDate < new Date()) {
        newErrors.expiryDate = 'Insurance cannot be expired'
      }
    }

    if (!formData.coverageType) {
      newErrors.coverageType = 'Coverage type is required'
    }

    if (formData.coverageType === 'custom' && !formData.customCoverage.trim()) {
      newErrors.customCoverage = 'Please specify custom coverage'
    }

    if (mode === 'add') {
      if (!cardFront && !cardFrontPreview) {
        newErrors.cardFront = 'Front of insurance card is required'
      }
      if (!cardBack && !cardBackPreview) {
        newErrors.cardBack = 'Back of insurance card is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const submitData = new FormData()
      submitData.append('provider', formData.provider)
      submitData.append('policyNumber', formData.policyNumber)
      submitData.append('expiryDate', formData.expiryDate)
      submitData.append('hasRideshare', formData.hasRideshare.toString())
      submitData.append('coverageType', formData.coverageType)
      
      if (formData.coverageType === 'custom' && formData.customCoverage) {
        submitData.append('customCoverage', formData.customCoverage)
      }
      
      if (formData.notes) {
        submitData.append('notes', formData.notes)
      }

      if (cardFront) {
        submitData.append('cardFront', cardFront)
      }
      if (cardBack) {
        submitData.append('cardBack', cardBack)
      }

      setUploadProgress(30)

      const endpoint = '/api/guest/profile/insurance'
      const method = mode === 'add' ? 'POST' : 'PATCH'

      const response = await fetch(endpoint, {
        method,
        body: submitData
      })

      setUploadProgress(80)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit insurance')
      }

      setUploadProgress(100)

      setTimeout(() => {
        onSuccess()
        onClose()
        
        setFormData({
          provider: '',
          policyNumber: '',
          expiryDate: '',
          hasRideshare: false,
          coverageType: '',
          customCoverage: '',
          notes: ''
        })
        setCardFront(null)
        setCardBack(null)
        setCardFrontPreview(null)
        setCardBackPreview(null)
        setErrors({})
        setUploadProgress(0)
      }, 500)

    } catch (error) {
      console.error('Error submitting insurance:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit insurance' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal/Bottom Sheet */}
      <div className={`
        fixed z-50 bg-white dark:bg-gray-800 
        bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl
        md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
        md:bottom-auto md:rounded-2xl md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh]
        overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300
      `}>
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {mode === 'add' ? 'Add Insurance' : 'Update Insurance'}
              </h2>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                {mode === 'add' ? 'Get up to 50% deposit reduction' : 'Update your insurance information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto h-[calc(70vh-64px)] md:h-auto md:max-h-[calc(90vh-128px)] px-4 py-3">
          
          {/* Info Banner */}
          <div className="mb-3 p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-[10px] text-green-800 dark:text-green-200">
              <strong>Why add insurance?</strong> Verified insurance reduces your deposit by 0-50% on eligible bookings.
            </p>
          </div>

          <div className="space-y-3">
            
            {/* Insurance Provider */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Insurance Provider *
              </label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleInputChange}
                placeholder="e.g., State Farm, Geico, Allstate"
                disabled={loading}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 ${
                  errors.provider ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.provider && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{errors.provider}</p>
              )}
            </div>

            {/* Policy Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Policy Number *
              </label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleInputChange}
                placeholder="Enter policy number"
                disabled={loading}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 ${
                  errors.policyNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.policyNumber && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{errors.policyNumber}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.expiryDate && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{errors.expiryDate}</p>
              )}
            </div>

            {/* Rideshare Coverage */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasRideshare"
                  checked={formData.hasRideshare}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5 disabled:opacity-50"
                />
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Rideshare Coverage
                  </span>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                    Does your policy cover peer-to-peer car sharing?
                  </p>
                </div>
              </label>
            </div>

            {/* Coverage Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coverage Type *
              </label>
              <select
                name="coverageType"
                value={formData.coverageType}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 ${
                  errors.coverageType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select coverage type</option>
                {COVERAGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.coverageType && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{errors.coverageType}</p>
              )}
            </div>

            {/* Custom Coverage */}
            {formData.coverageType === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Coverage Details *
                </label>
                <input
                  type="text"
                  name="customCoverage"
                  value={formData.customCoverage}
                  onChange={handleInputChange}
                  placeholder="e.g., 300/500/200"
                  disabled={loading}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 ${
                    errors.customCoverage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.customCoverage && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{errors.customCoverage}</p>
                )}
              </div>
            )}

            {/* Card Front */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Insurance Card - Front * {mode === 'update' && <span className="text-[10px] text-gray-500">(Optional)</span>}
              </label>
              
              {!cardFrontPreview ? (
                <div
                  onClick={() => cardFrontInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 ${
                    errors.cardFront ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Click to upload front
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                  <img
                    src={cardFrontPreview}
                    alt="Card front"
                    className="w-full h-32 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('front')}
                    disabled={loading}
                    className="absolute top-3 right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <input
                ref={cardFrontInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'front')}
                disabled={loading}
                className="hidden"
              />
              
              {errors.cardFront && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{errors.cardFront}</p>
              )}
            </div>

            {/* Card Back */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Insurance Card - Back * {mode === 'update' && <span className="text-[10px] text-gray-500">(Optional)</span>}
              </label>
              
              {!cardBackPreview ? (
                <div
                  onClick={() => cardBackInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 ${
                    errors.cardBack ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Click to upload back
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                  <img
                    src={cardBackPreview}
                    alt="Card back"
                    className="w-full h-32 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('back')}
                    disabled={loading}
                    className="absolute top-3 right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <input
                ref={cardBackInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'back')}
                disabled={loading}
                className="hidden"
              />
              
              {errors.cardBack && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">{errors.cardBack}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes <span className="text-[10px] text-gray-500">(Optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information..."
                rows={2}
                disabled={loading}
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 resize-none"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <IoWarningOutline className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 dark:text-red-200">{errors.submit}</p>
              </div>
            )}

            {/* Progress */}
            {loading && uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-3 py-2 min-h-[36px] text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-3 py-2 min-h-[36px] text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <IoCheckmarkCircle className="w-3.5 h-3.5" />
                <span>{mode === 'add' ? 'Add Insurance' : 'Update'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </>
  )
}