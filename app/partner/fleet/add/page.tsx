// app/partner/fleet/add/page.tsx
// Partner Fleet - Add Vehicle with VIN-first 5-step wizard
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  IoCarOutline,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoImageOutline,
  IoAddOutline,
  IoTrashOutline,
  IoStar,
  IoStarOutline,
  IoCloseCircle,
  IoShieldCheckmark,
  IoSparkles,
  IoLocationOutline,
  IoRocketOutline
} from 'react-icons/io5'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import { mapBodyClassToCarType } from '@/app/lib/data/vehicle-features'
import { AddressAutocomplete, AddressResult } from '@/app/components/shared/AddressAutocomplete'
import { CAR_COLORS, CAR_TYPES } from '@/app/host/cars/[id]/edit/types'

// Wizard steps
const STEPS = [
  { id: 1, title: 'VIN & Vehicle', description: 'Enter VIN to auto-populate' },
  { id: 2, title: 'Details', description: 'Color, mileage & location' },
  { id: 3, title: 'Photos', description: 'Minimum 3 photos required' },
  { id: 4, title: 'Pricing', description: 'Set your rates' },
  { id: 5, title: 'Review', description: 'Confirm & submit' }
]

interface PhotoItem {
  id: string
  url: string
  file?: File
  isHero: boolean
  isUploading?: boolean
}

interface VehicleData {
  // VIN-decoded fields (locked after decode)
  vin: string
  make: string
  model: string
  year: number
  trim: string
  doors: number
  transmission: string
  fuelType: string
  driveType: string
  carType: string

  // Vehicle designation (RENTAL or RIDESHARE)
  vehicleType: 'RENTAL' | 'RIDESHARE'

  // Manual fields
  color: string
  licensePlate: string
  currentMileage: number

  // Location
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number

  // Pricing
  dailyRate: number
  weeklyRate: number
  monthlyRate: number

  // Delivery options
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  deliveryFee: number

  // Title & eligibility confirmations
  titleStatus: 'Clean' | 'Salvage' | 'Rebuilt'
  confirmCleanTitle: boolean
  confirmUnder130kMiles: boolean
  confirmNoRecalls: boolean
}

const INITIAL_VEHICLE_DATA: VehicleData = {
  vin: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  trim: '',
  doors: 4,
  transmission: 'automatic',
  fuelType: 'gas',
  driveType: '',
  carType: 'midsize',
  vehicleType: 'RENTAL',
  color: '',
  licensePlate: '',
  currentMileage: 0,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  latitude: 0,
  longitude: 0,
  dailyRate: 0,
  weeklyRate: 0,
  monthlyRate: 0,
  airportPickup: false,
  hotelDelivery: true,
  homeDelivery: false,
  deliveryFee: 35,
  titleStatus: 'Clean',
  confirmCleanTitle: false,
  confirmUnder130kMiles: false,
  confirmNoRecalls: false
}

export default function PartnerFleetAddPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [vehicleData, setVehicleData] = useState<VehicleData>(INITIAL_VEHICLE_DATA)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // VIN decode state
  const [vinDecoding, setVinDecoding] = useState(false)
  const [vinError, setVinError] = useState('')
  const [vinDecoded, setVinDecoded] = useState(false)
  const [vinDecodedFields, setVinDecodedFields] = useState<string[]>([])

  // Eligibility state
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean
    warnings: string[]
    blockers: string[]
  } | null>(null)

  // Step validation
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({})

  // Check eligibility based on year
  const checkEligibility = useCallback((vehicleYear: number) => {
    const currentYear = new Date().getFullYear()
    const vehicleAge = currentYear - vehicleYear

    const blockers: string[] = []
    const warnings: string[] = []

    // Turo-style: 12 year max
    if (vehicleAge > 12) {
      blockers.push(`Vehicle is ${vehicleAge} years old (max 12 years allowed)`)
    }

    // Warning for older vehicles
    if (vehicleAge > 8 && vehicleAge <= 12) {
      warnings.push('Older vehicles typically see lower booking demand')
    }

    setEligibilityResult({
      eligible: blockers.length === 0,
      warnings,
      blockers
    })

    return blockers.length === 0
  }, [])

  // Handle VIN decode
  const handleVinDecode = useCallback(async () => {
    const vin = vehicleData.vin.trim().toUpperCase()

    if (!vin || vin.length !== 17) {
      setVinError('VIN must be exactly 17 characters')
      return
    }

    if (!isValidVIN(vin)) {
      setVinError('Invalid VIN format - cannot contain I, O, or Q')
      return
    }

    setVinDecoding(true)
    setVinError('')
    setVinDecoded(false)
    setVinDecodedFields([])
    setEligibilityResult(null)

    try {
      const result = await decodeVIN(vin)

      if (result && result.make) {
        const decodedFields: string[] = ['make', 'model', 'year']

        // Build update object
        const updates: Partial<VehicleData> = {
          vin: vin,
          make: result.make,
          model: result.model || '',
          year: parseInt(result.year) || vehicleData.year
        }

        // Add trim if available
        if (result.trim) {
          updates.trim = result.trim
          decodedFields.push('trim')
        }

        // Add doors if available
        if (result.doors) {
          updates.doors = parseInt(result.doors) || 4
          decodedFields.push('doors')
        }

        // Add transmission if available
        if (result.transmission) {
          updates.transmission = result.transmission.toLowerCase().includes('automatic') ? 'automatic' : 'manual'
          decodedFields.push('transmission')
        }

        // Add fuel type if available
        if (result.fuelType) {
          const fuelLower = result.fuelType.toLowerCase()
          if (fuelLower.includes('electric')) updates.fuelType = 'electric'
          else if (fuelLower.includes('hybrid')) updates.fuelType = 'hybrid'
          else if (fuelLower.includes('diesel')) updates.fuelType = 'diesel'
          else updates.fuelType = 'gas'
          decodedFields.push('fuelType')
        }

        // Map body class to car type
        if (result.bodyClass) {
          const mappedType = mapBodyClassToCarType(result.bodyClass, result.make, result.model)
          if (mappedType) {
            updates.carType = mappedType.toLowerCase()
            decodedFields.push('carType')
          }
        }

        // Add drive type if available
        if (result.driveType) {
          const driveLower = result.driveType.toLowerCase()
          if (driveLower.includes('all') || driveLower.includes('awd')) updates.driveType = 'AWD'
          else if (driveLower.includes('front') || driveLower.includes('fwd')) updates.driveType = 'FWD'
          else if (driveLower.includes('rear') || driveLower.includes('rwd')) updates.driveType = 'RWD'
          else if (driveLower.includes('4x4') || driveLower.includes('4wd')) updates.driveType = '4WD'
          else updates.driveType = result.driveType.toUpperCase()
          decodedFields.push('driveType')
        }

        // Update vehicle data
        setVehicleData(prev => ({ ...prev, ...updates }))
        setVinDecodedFields(decodedFields)
        setVinDecoded(true)

        // Check eligibility
        const year = parseInt(result.year) || vehicleData.year
        checkEligibility(year)
      } else {
        setVinError('Could not decode VIN - please verify and try again')
      }
    } catch (error) {
      console.error('VIN decode error:', error)
      setVinError('Failed to decode VIN - please try again')
    } finally {
      setVinDecoding(false)
    }
  }, [vehicleData.vin, vehicleData.year, checkEligibility])

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const errors: string[] = []

    switch (step) {
      case 1:
        if (!vinDecoded) {
          errors.push('Please decode your VIN first')
        }
        if (!eligibilityResult?.eligible) {
          errors.push('Vehicle does not meet eligibility requirements')
        }
        if (!vehicleData.confirmCleanTitle || !vehicleData.confirmUnder130kMiles || !vehicleData.confirmNoRecalls) {
          errors.push('Please confirm all eligibility requirements')
        }
        break

      case 2:
        if (!vehicleData.color) errors.push('Please select a color')
        if (!vehicleData.address || !vehicleData.city || !vehicleData.state) {
          errors.push('Please enter the vehicle location')
        }
        break

      case 3:
        if (photos.length < 3) {
          errors.push(`Please upload at least 3 photos (${photos.length} uploaded)`)
        }
        break

      case 4:
        if (!vehicleData.dailyRate || vehicleData.dailyRate < 25) {
          errors.push('Daily rate must be at least $25')
        }
        break
    }

    setStepErrors(prev => ({ ...prev, [step]: errors }))
    return errors.length === 0
  }, [vinDecoded, eligibilityResult, vehicleData, photos])

  // Navigate to next step
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  // Navigate to previous step
  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Handle address selection
  const handleAddressSelect = (address: AddressResult) => {
    setVehicleData(prev => ({
      ...prev,
      address: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      latitude: address.latitude,
      longitude: address.longitude
    }))
  }

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPhotos: PhotoItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const id = `temp-${Date.now()}-${i}`
      const url = URL.createObjectURL(file)

      newPhotos.push({
        id,
        url,
        file,
        isHero: photos.length === 0 && i === 0
      })
    }

    setPhotos(prev => [...prev, ...newPhotos])
    e.target.value = '' // Reset input
  }

  // Set hero photo
  const setHeroPhoto = (photoId: string) => {
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      isHero: photo.id === photoId
    })))
  }

  // Delete photo
  const deletePhoto = (photoId: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId)
      // If we deleted the hero photo, make the first one hero
      if (filtered.length > 0 && !filtered.some(p => p.isHero)) {
        filtered[0].isHero = true
      }
      return filtered
    })
  }

  // Submit vehicle
  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // First, upload photos
      const uploadedPhotoUrls: { url: string; isHero: boolean }[] = []

      for (const photo of photos) {
        if (photo.file) {
          // Upload to server
          const formData = new FormData()
          formData.append('file', photo.file)
          formData.append('type', 'vehicle-photo')

          const uploadRes = await fetch('/api/partner/upload', {
            method: 'POST',
            body: formData
          })

          if (uploadRes.ok) {
            const data = await uploadRes.json()
            uploadedPhotoUrls.push({
              url: data.url,
              isHero: photo.isHero
            })
          }
        } else {
          uploadedPhotoUrls.push({
            url: photo.url,
            isHero: photo.isHero
          })
        }
      }

      // Submit vehicle data
      const response = await fetch('/api/partner/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: vehicleData.vin,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          trim: vehicleData.trim,
          color: vehicleData.color,
          licensePlate: vehicleData.licensePlate || null,
          doors: vehicleData.doors,
          transmission: vehicleData.transmission,
          fuelType: vehicleData.fuelType,
          driveType: vehicleData.driveType,
          carType: vehicleData.carType,
          vehicleType: vehicleData.vehicleType,
          currentMileage: vehicleData.currentMileage,
          address: vehicleData.address,
          city: vehicleData.city,
          state: vehicleData.state,
          zipCode: vehicleData.zipCode,
          latitude: vehicleData.latitude,
          longitude: vehicleData.longitude,
          dailyRate: vehicleData.dailyRate,
          weeklyRate: vehicleData.weeklyRate || vehicleData.dailyRate * 6.5,
          monthlyRate: vehicleData.monthlyRate || vehicleData.dailyRate * 25,
          airportPickup: vehicleData.airportPickup,
          hotelDelivery: vehicleData.hotelDelivery,
          homeDelivery: vehicleData.homeDelivery,
          deliveryFee: vehicleData.deliveryFee,
          titleStatus: vehicleData.titleStatus,
          photos: uploadedPhotoUrls,
          vinVerificationMethod: 'API'
        })
      })

      const result = await response.json()

      if (result.success) {
        router.push('/partner/fleet?added=true')
      } else {
        setSubmitError(result.error || 'Failed to add vehicle')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError('Failed to add vehicle. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-calculate weekly/monthly rates when daily rate changes
  useEffect(() => {
    if (vehicleData.dailyRate > 0) {
      const suggestedWeekly = Math.round(vehicleData.dailyRate * 6.5)
      const suggestedMonthly = Math.round(vehicleData.dailyRate * 25)

      if (!vehicleData.weeklyRate) {
        setVehicleData(prev => ({ ...prev, weeklyRate: suggestedWeekly }))
      }
      if (!vehicleData.monthlyRate) {
        setVehicleData(prev => ({ ...prev, monthlyRate: suggestedMonthly }))
      }
    }
  }, [vehicleData.dailyRate])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/partner/fleet" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <IoChevronBack className="w-5 h-5" />
              <span>Back to Fleet</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Add Vehicle</h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-1 text-center hidden sm:block">
                    <p className={`text-xs font-medium ${
                      currentStep >= step.id
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded ${
                    currentStep > step.id
                      ? 'bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Step Errors */}
        {stepErrors[currentStep]?.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                {stepErrors[currentStep].map((error, i) => (
                  <p key={i} className="text-sm text-red-700 dark:text-red-300">{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: VIN & Vehicle */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <IoShieldCheckmark className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Enter Your VIN</h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your 17-character Vehicle Identification Number will auto-populate vehicle details.
              </p>

              {/* VIN Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={vehicleData.vin}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17)
                      setVehicleData(prev => ({ ...prev, vin: value }))
                      setVinError('')
                      if (vinDecoded) {
                        setVinDecoded(false)
                        setVinDecodedFields([])
                        setEligibilityResult(null)
                      }
                    }}
                    placeholder="Enter 17-character VIN"
                    maxLength={17}
                    className={`w-full px-4 py-3 text-lg font-mono uppercase border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      vinError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{vehicleData.vin.length}/17 characters</span>
                    {vinError && <span className="text-xs text-red-500">{vinError}</span>}
                  </div>
                </div>
                <button
                  onClick={handleVinDecode}
                  disabled={vehicleData.vin.length !== 17 || vinDecoding}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {vinDecoding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Decoding...
                    </>
                  ) : (
                    <>
                      <IoSparkles className="w-5 h-5" />
                      Decode VIN
                    </>
                  )}
                </button>
              </div>

              {/* Where to find VIN */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <IoInformationCircleOutline className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Where to find your VIN:</p>
                    <ul className="list-disc ml-4 mt-1 text-blue-600 dark:text-blue-400">
                      <li>Driver's side dashboard (visible through windshield)</li>
                      <li>Driver's door jamb sticker</li>
                      <li>Vehicle registration or title document</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Decoded Vehicle Info */}
            {vinDecoded && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Detected</h2>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {vehicleData.year} {vehicleData.make} {vehicleData.model}
                  </h3>
                  {vehicleData.trim && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">{vehicleData.trim}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vinDecodedFields.includes('transmission') && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Transmission</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{vehicleData.transmission}</p>
                    </div>
                  )}
                  {vinDecodedFields.includes('fuelType') && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fuel Type</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{vehicleData.fuelType}</p>
                    </div>
                  )}
                  {vinDecodedFields.includes('driveType') && vehicleData.driveType && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Drive Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{vehicleData.driveType}</p>
                    </div>
                  )}
                  {vinDecodedFields.includes('doors') && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Doors</p>
                      <p className="font-medium text-gray-900 dark:text-white">{vehicleData.doors}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Designation - Rental vs Rideshare */}
            {vinDecoded && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <IoCarOutline className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Designation</h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  How will this vehicle be used?
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Rental Option */}
                  <label
                    className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      vehicleData.vehicleType === 'RENTAL'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value="RENTAL"
                      checked={vehicleData.vehicleType === 'RENTAL'}
                      onChange={() => setVehicleData(prev => ({ ...prev, vehicleType: 'RENTAL' }))}
                      className="absolute opacity-0"
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        vehicleData.vehicleType === 'RENTAL'
                          ? 'border-purple-600'
                          : 'border-gray-400'
                      }`}>
                        {vehicleData.vehicleType === 'RENTAL' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Rental</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      Standard car rental for travelers and locals
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 ml-8 mt-1">
                      Minimum 1 day booking
                    </p>
                  </label>

                  {/* Rideshare Option */}
                  <label
                    className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      vehicleData.vehicleType === 'RIDESHARE'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value="RIDESHARE"
                      checked={vehicleData.vehicleType === 'RIDESHARE'}
                      onChange={() => setVehicleData(prev => ({ ...prev, vehicleType: 'RIDESHARE' }))}
                      className="absolute opacity-0"
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        vehicleData.vehicleType === 'RIDESHARE'
                          ? 'border-orange-500'
                          : 'border-gray-400'
                      }`}>
                        {vehicleData.vehicleType === 'RIDESHARE' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Rideshare</span>
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                        UBER / LYFT
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      For gig economy drivers (Uber, Lyft, DoorDash)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 ml-8 mt-1">
                      Minimum 3 day booking required
                    </p>
                  </label>
                </div>

                {vehicleData.vehicleType === 'RIDESHARE' && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <IoInformationCircleOutline className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        <p className="font-medium">Rideshare vehicles:</p>
                        <ul className="list-disc ml-4 mt-1 text-orange-600 dark:text-orange-400">
                          <li>Require 3+ day minimum bookings</li>
                          <li>Optimized for weekly/monthly drivers</li>
                          <li>Show "Rideshare" badge on listing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Eligibility Checks */}
            {eligibilityResult && (
              <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${
                eligibilityResult.eligible
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-red-200 dark:border-red-800'
              }`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
                  eligibilityResult.eligible
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {eligibilityResult.eligible ? (
                    <>
                      <IoCheckmarkCircle className="w-5 h-5" />
                      Vehicle Eligible
                    </>
                  ) : (
                    <>
                      <IoCloseCircle className="w-5 h-5" />
                      Vehicle Not Eligible
                    </>
                  )}
                </h3>

                {/* Blockers */}
                {eligibilityResult.blockers.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {eligibilityResult.blockers.map((blocker, i) => (
                      <p key={i} className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                        <IoCloseCircle className="w-4 h-4" />
                        {blocker}
                      </p>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {eligibilityResult.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    {eligibilityResult.warnings.map((warning, i) => (
                      <p key={i} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                        <IoWarningOutline className="w-4 h-4" />
                        {warning}
                      </p>
                    ))}
                  </div>
                )}

                {/* Confirmations */}
                {eligibilityResult.eligible && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Please confirm the following requirements:
                    </p>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vehicleData.confirmCleanTitle}
                        onChange={(e) => setVehicleData(prev => ({ ...prev, confirmCleanTitle: e.target.checked }))}
                        className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        This vehicle has a <strong>clean title</strong> (not salvage, rebuilt, or flood damaged)
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vehicleData.confirmUnder130kMiles}
                        onChange={(e) => setVehicleData(prev => ({ ...prev, confirmUnder130kMiles: e.target.checked }))}
                        className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        This vehicle has <strong>under 130,000 miles</strong>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vehicleData.confirmNoRecalls}
                        onChange={(e) => setVehicleData(prev => ({ ...prev, confirmNoRecalls: e.target.checked }))}
                        className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        This vehicle has <strong>no open safety recalls</strong>
                        <a
                          href={`https://www.nhtsa.gov/recalls?vin=${vehicleData.vin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-purple-600 hover:text-purple-700 underline"
                        >
                          (Check recalls)
                        </a>
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Additional Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color *
                  </label>
                  <select
                    value={vehicleData.color}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select color</option>
                    {CAR_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {/* License Plate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={vehicleData.licensePlate}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                    placeholder="ABC-1234"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Current Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Mileage
                  </label>
                  <input
                    type="number"
                    value={vehicleData.currentMileage || ''}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, currentMileage: parseInt(e.target.value) || 0 }))}
                    placeholder="50000"
                    min="0"
                    max="130000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <IoLocationOutline className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Location</h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Where is this vehicle primarily located for pickup?
              </p>

              <AddressAutocomplete
                value={vehicleData.address}
                city={vehicleData.city}
                state={vehicleData.state}
                zipCode={vehicleData.zipCode}
                onAddressSelect={handleAddressSelect}
                placeholder="Start typing the vehicle address..."
              />

              {vehicleData.city && vehicleData.state && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <IoCheckmarkCircle className="w-4 h-4" />
                    {vehicleData.address}, {vehicleData.city}, {vehicleData.state} {vehicleData.zipCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IoImageOutline className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Photos</h2>
                </div>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer flex items-center gap-2">
                  <IoAddOutline className="w-5 h-5" />
                  Add Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo count indicator */}
              <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${
                photos.length >= 3
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-center gap-2">
                  {photos.length >= 3 ? (
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    photos.length >= 3
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {photos.length} of 3 minimum photos uploaded
                  </span>
                </div>
                {photos.length < 3 && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    {3 - photos.length} more required
                  </span>
                )}
              </div>

              {/* Photo tips */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Photo tips:</strong> Include exterior (front, side, rear), interior, and dashboard shots. High-quality photos increase bookings.
                </p>
              </div>

              {/* Photos Grid */}
              {photos.length === 0 ? (
                <label className="block text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <IoImageOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">Click or drag photos here</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-[4/3]">
                      <Image
                        src={photo.url}
                        alt="Vehicle photo"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setHeroPhoto(photo.id)}
                          className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                          title="Set as main photo"
                        >
                          {photo.isHero ? (
                            <IoStar className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <IoStarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          )}
                        </button>
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                          title="Delete photo"
                        >
                          <IoTrashOutline className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                      {photo.isHero && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                          Main Photo
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add more photos button */}
                  <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                    <IoAddOutline className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Add more</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pricing</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Rate *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={vehicleData.dailyRate || ''}
                      onChange={(e) => setVehicleData(prev => ({
                        ...prev,
                        dailyRate: parseFloat(e.target.value) || 0,
                        weeklyRate: 0,
                        monthlyRate: 0
                      }))}
                      min="25"
                      step="5"
                      placeholder="75"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum $25/day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weekly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={vehicleData.weeklyRate || ''}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, weeklyRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="10"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Suggested: ${Math.round(vehicleData.dailyRate * 6.5) || 0}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={vehicleData.monthlyRate || ''}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, monthlyRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="50"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Suggested: ${Math.round(vehicleData.dailyRate * 25) || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Options</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleData.airportPickup}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, airportPickup: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Airport Pickup Available</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleData.hotelDelivery}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, hotelDelivery: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Hotel Delivery Available</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleData.homeDelivery}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, homeDelivery: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Home Delivery Available</span>
                </label>
              </div>

              {(vehicleData.airportPickup || vehicleData.hotelDelivery || vehicleData.homeDelivery) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Fee
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={vehicleData.deliveryFee}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="5"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Hero Image */}
              {photos.find(p => p.isHero) && (
                <div className="relative h-64">
                  <Image
                    src={photos.find(p => p.isHero)!.url}
                    alt="Vehicle"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {vehicleData.year} {vehicleData.make} {vehicleData.model}
                </h2>
                {vehicleData.trim && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">{vehicleData.trim}</p>
                )}

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* Vehicle Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Vehicle Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">VIN</dt>
                        <dd className="font-mono text-gray-900 dark:text-white">{vehicleData.vin}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Color</dt>
                        <dd className="text-gray-900 dark:text-white">{vehicleData.color}</dd>
                      </div>
                      {vehicleData.licensePlate && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">License Plate</dt>
                          <dd className="text-gray-900 dark:text-white">{vehicleData.licensePlate}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Transmission</dt>
                        <dd className="text-gray-900 dark:text-white capitalize">{vehicleData.transmission}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Fuel Type</dt>
                        <dd className="text-gray-900 dark:text-white capitalize">{vehicleData.fuelType}</dd>
                      </div>
                      {vehicleData.driveType && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Drive Type</dt>
                          <dd className="text-gray-900 dark:text-white">{vehicleData.driveType}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Pricing & Location */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pricing & Location</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Daily Rate</dt>
                        <dd className="text-gray-900 dark:text-white font-semibold">${vehicleData.dailyRate}/day</dd>
                      </div>
                      {vehicleData.weeklyRate > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Weekly Rate</dt>
                          <dd className="text-gray-900 dark:text-white">${vehicleData.weeklyRate}/week</dd>
                        </div>
                      )}
                      {vehicleData.monthlyRate > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Monthly Rate</dt>
                          <dd className="text-gray-900 dark:text-white">${vehicleData.monthlyRate}/month</dd>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <dt className="text-gray-500">Location</dt>
                        <dd className="text-gray-900 dark:text-white mt-1">
                          {vehicleData.address}<br />
                          {vehicleData.city}, {vehicleData.state} {vehicleData.zipCode}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Photos Preview */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Photos ({photos.length})</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative flex-shrink-0 w-20 h-16">
                        <Image
                          src={photo.url}
                          alt="Vehicle"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Benefits */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <IoRocketOutline className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-300">Partner Benefits</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="w-4 h-4" />
                  <span><strong>Auto-Approved:</strong> No waiting for manual review</span>
                </li>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="w-4 h-4" />
                  <span><strong>Instant Book:</strong> Guests can book immediately</span>
                </li>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="w-4 h-4" />
                  <span><strong>Fleet Pricing:</strong> Lower commission rates for partners</span>
                </li>
              </ul>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <IoWarningOutline className="w-4 h-4" />
                  {submitError}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={goToPrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoChevronBack className="w-5 h-5" />
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              Continue
              <IoChevronForward className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-5 h-5" />
                  Add Vehicle to Fleet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
