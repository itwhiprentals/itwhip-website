// app/partner/fleet/add/page.tsx
// Partner Fleet - Add Vehicle with VIN-first 5-step wizard
'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import {
  IoCarOutline,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoChevronForwardOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoImageOutline,
  IoAddOutline,
  IoTrashOutline,
  IoStar,
  IoStarOutline,
  IoCloseCircle,
  IoShieldCheckmark,
  IoShieldOutline,
  IoSparkles,
  IoLocationOutline,
  IoRocketOutline,
  IoCameraOutline
} from 'react-icons/io5'
import VinScanner from '@/app/components/VinScanner'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import { mapBodyClassToCarType } from '@/app/lib/data/vehicle-features'
import { AddressAutocomplete, AddressResult } from '@/app/components/shared/AddressAutocomplete'
import { CAR_COLORS, CAR_TYPES } from '@/app/host/cars/[id]/edit/types'

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

  // Insurance
  hasOwnInsurance: boolean
  insuranceProvider: string
  insurancePolicyNumber: string
  insuranceExpiryDate: string
  useForRentals: boolean
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
  confirmNoRecalls: false,
  hasOwnInsurance: false,
  insuranceProvider: '',
  insurancePolicyNumber: '',
  insuranceExpiryDate: '',
  useForRentals: false
}

export default function PartnerFleetAddPage() {
  const router = useRouter()
  const t = useTranslations('PartnerFleet')

  const STEPS = useMemo(() => [
    { id: 1, title: t('addStep1Title'), description: t('addStep1Desc') },
    { id: 2, title: t('addStep2Title'), description: t('addStep2Desc') },
    { id: 3, title: t('addStep3Title'), description: t('addStep3Desc') },
    { id: 4, title: t('addStep4Title'), description: t('addStep4Desc') },
    { id: 5, title: t('addStep5Title'), description: t('addStep5Desc') }
  ], [t])

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
  const [showVinScanner, setShowVinScanner] = useState(false)

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
      blockers.push(t('addVehicleAgeTooOld', { age: vehicleAge }))
    }

    // Warning for older vehicles
    if (vehicleAge > 8 && vehicleAge <= 12) {
      warnings.push(t('addOlderVehicleWarning'))
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
      setVinError(t('addVinMust17'))
      return
    }

    if (!isValidVIN(vin)) {
      setVinError(t('addVinInvalidFormat'))
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

        // Add doors if available (normalize: 5→4 since NHTSA counts hatch/tailgate as a door)
        if (result.doors) {
          let parsedDoors = parseInt(result.doors) || 4
          if (parsedDoors === 5) parsedDoors = 4
          if (parsedDoors === 3) parsedDoors = 2
          updates.doors = parsedDoors
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
        setVinError(t('addVinCouldNotDecode'))
      }
    } catch (error) {
      console.error('VIN decode error:', error)
      setVinError(t('addVinFailedDecode'))
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
          errors.push(t('addErrorDecodeVin'))
        }
        if (!eligibilityResult?.eligible) {
          errors.push(t('addErrorNotEligible'))
        }
        if (!vehicleData.confirmCleanTitle || !vehicleData.confirmUnder130kMiles || !vehicleData.confirmNoRecalls) {
          errors.push(t('addErrorConfirmEligibility'))
        }
        break

      case 2:
        if (!vehicleData.color) errors.push(t('addErrorSelectColor'))
        if (!vehicleData.address || !vehicleData.city || !vehicleData.state) {
          errors.push(t('addErrorEnterLocation'))
        }
        break

      case 3:
        if (photos.length < 3) {
          errors.push(t('addErrorMinPhotos', { count: photos.length }))
        }
        break

      case 4:
        if (!vehicleData.dailyRate || vehicleData.dailyRate < 25) {
          errors.push(t('addErrorDailyRate'))
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
          const vName = `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}${vehicleData.trim ? ' ' + vehicleData.trim : ''}`
          formData.append('vehicleName', vName)

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
          vinVerificationMethod: 'API',
          // Insurance fields
          hasOwnInsurance: vehicleData.hasOwnInsurance,
          insuranceProvider: vehicleData.insuranceProvider || null,
          insurancePolicyNumber: vehicleData.insurancePolicyNumber || null,
          insuranceExpiryDate: vehicleData.insuranceExpiryDate || null,
          useForRentals: vehicleData.useForRentals
        })
      })

      const result = await response.json()

      if (result.success) {
        router.push('/partner/fleet?added=true')
      } else {
        setSubmitError(result.error || t('addFailedToAdd'))
      }
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError(t('addFailedToAddRetry'))
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
              <span>{t('addBackToFleet')}</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t('addVehicleTitle')}</h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
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
                  <div className="mt-1 text-center">
                    <p className={`text-[10px] sm:text-xs font-medium ${
                      currentStep >= step.id
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-1 sm:px-2 -mt-5">
                    <IoChevronForwardOutline className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      currentStep > step.id
                        ? 'text-green-600'
                        : 'text-gray-300 dark:text-gray-600'
                    }`} />
                  </div>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <IoShieldCheckmark className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('addEnterYourVin')}</h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('addVinAutoPopulate')}
              </p>

              {/* VIN Input with Decode Button Inside */}
              <div className="flex items-center gap-2 p-2 border rounded-lg focus-within:ring-2 focus-within:ring-purple-600 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
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
                  placeholder={t('addVinPlaceholder')}
                  maxLength={17}
                  className="flex-1 px-2 py-2 text-lg font-mono uppercase bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white"
                />
                {/* Camera + Decode Buttons - Same line as input */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Camera Scan Button */}
                  <button
                    type="button"
                    onClick={() => setShowVinScanner(true)}
                    className="h-10 w-10 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 rounded-md transition-colors flex items-center justify-center"
                    title={t('addScanVinCamera')}
                  >
                    <IoCameraOutline className="w-5 h-5" />
                  </button>
                  {/* Decode VIN Button */}
                  <button
                    onClick={handleVinDecode}
                    disabled={vehicleData.vin.length !== 17 || vinDecoding}
                    className="h-10 px-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                  >
                    {vinDecoding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                        {t('addDecoding')}
                      </>
                    ) : (
                      t('addDecode')
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">{t('addVinCharCount', { count: vehicleData.vin.length })}</span>
                {vinError && <span className="text-xs text-red-500">{vinError}</span>}
              </div>

              {/* VIN Scanner Modal */}
              {showVinScanner && (
                <VinScanner
                  onScan={(scannedVin) => {
                    setVehicleData(prev => ({ ...prev, vin: scannedVin }))
                    setShowVinScanner(false)
                    // Auto-decode after scanning
                    setTimeout(() => {
                      handleVinDecode()
                    }, 100)
                  }}
                  onClose={() => setShowVinScanner(false)}
                />
              )}

              {/* Where to find VIN */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <IoInformationCircleOutline className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">{t('addWhereToFindVin')}</p>
                    <ul className="list-disc ml-4 mt-1 text-blue-600 dark:text-blue-400">
                      <li>{t('addVinLocation1')}</li>
                      <li>{t('addVinLocation2')}</li>
                      <li>{t('addVinLocation3')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Decoded Vehicle Info */}
            {vinDecoded && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('addVehicleDetected')}</h2>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{vehicleData.year} {vehicleData.make}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {vehicleData.model}
                    {vehicleData.trim && (
                      <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">{vehicleData.trim}</span>
                    )}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {vinDecodedFields.includes('transmission') && (
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addTransmission')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicleData.transmission}</p>
                      </div>
                    )}
                    {vinDecodedFields.includes('fuelType') && (
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addFuelType')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicleData.fuelType}</p>
                      </div>
                    )}
                    {vinDecodedFields.includes('driveType') && vehicleData.driveType && (
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addDriveType')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicleData.driveType}</p>
                      </div>
                    )}
                    {vinDecodedFields.includes('doors') && (
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addDoors')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicleData.doors}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Designation - Rental vs Rideshare */}
            {vinDecoded && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <IoCarOutline className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('addVehicleDesignation')}</h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('addHowWillBeUsed')}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Rental Option */}
                  <label
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                      <span className="font-semibold text-gray-900 dark:text-white">{t('addRental')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t('addRentalDesc')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 ml-8 mt-1">
                      {t('addRentalMinBooking')}
                    </p>
                  </label>

                  {/* Rideshare Option */}
                  <label
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                      <span className="font-semibold text-gray-900 dark:text-white">{t('addRideshare')}</span>
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                        UBER / LYFT
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                      {t('addRideshareDesc')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 ml-8 mt-1">
                      {t('addRideshareMinBooking')}
                    </p>
                  </label>
                </div>

                {vehicleData.vehicleType === 'RIDESHARE' && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <IoInformationCircleOutline className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        <p className="font-medium">{t('addRideshareVehicles')}</p>
                        <ul className="list-disc ml-4 mt-1 text-orange-600 dark:text-orange-400">
                          <li>{t('addRideshareReq1')}</li>
                          <li>{t('addRideshareReq2')}</li>
                          <li>{t('addRideshareReq3')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Eligibility Checks */}
            {eligibilityResult && (
              <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border ${
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
                      {t('addVehicleEligible')}
                    </>
                  ) : (
                    <>
                      <IoCloseCircle className="w-5 h-5" />
                      {t('addVehicleNotEligible')}
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
                      {t('addConfirmRequirements')}
                    </p>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vehicleData.confirmCleanTitle}
                        onChange={(e) => setVehicleData(prev => ({ ...prev, confirmCleanTitle: e.target.checked }))}
                        className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t.rich('addConfirmCleanTitle', { bold: (chunks) => <strong>{chunks}</strong> })}
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
                        {t.rich('addConfirmUnder130k', { bold: (chunks) => <strong>{chunks}</strong> })}
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
                        {t.rich('addConfirmNoRecalls', { bold: (chunks) => <strong>{chunks}</strong> })}
                        <a
                          href={`https://www.nhtsa.gov/recalls?vin=${vehicleData.vin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-purple-600 hover:text-purple-700 underline"
                        >
                          {t('addCheckRecalls')}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('addVehicleDetails')}</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addColor')}
                  </label>
                  <select
                    value={vehicleData.color}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('addSelectColor')}</option>
                    {CAR_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {/* License Plate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addLicensePlate')}
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
                    {t('addCurrentMileage')}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <IoLocationOutline className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('addVehicleLocation')}</h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('addLocationDesc')}
              </p>

              <AddressAutocomplete
                value={vehicleData.address}
                city={vehicleData.city}
                state={vehicleData.state}
                zipCode={vehicleData.zipCode}
                onAddressSelect={handleAddressSelect}
                placeholder={t('addLocationPlaceholder')}
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

            {/* Insurance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <IoShieldOutline className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('addVehicleInsurance')}</h2>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{t('addOptional')}</span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('addInsuranceQuestion')}
              </p>

              {/* Has Own Insurance Toggle */}
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('addHasOwnInsurance')}</p>
                  <p className="text-sm text-gray-500">{t('addHasOwnInsuranceDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={vehicleData.hasOwnInsurance}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setVehicleData(prev => ({
                      ...prev,
                      hasOwnInsurance: checked,
                      useForRentals: checked ? prev.useForRentals : false
                    }))
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                />
              </label>

              {/* Insurance Details - Only show if has own insurance */}
              {vehicleData.hasOwnInsurance && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('addInsuranceProvider')}
                      </label>
                      <input
                        type="text"
                        value={vehicleData.insuranceProvider}
                        onChange={(e) => setVehicleData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                        placeholder={t('addInsuranceProviderPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('addPolicyNumber')}
                      </label>
                      <input
                        type="text"
                        value={vehicleData.insurancePolicyNumber}
                        onChange={(e) => setVehicleData(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
                        placeholder={t('addPolicyNumberPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('addPolicyExpiryDate')}
                    </label>
                    <input
                      type="date"
                      value={vehicleData.insuranceExpiryDate}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, insuranceExpiryDate: e.target.value }))}
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Use for Rentals Toggle */}
                  <label className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t('addUseForRentals')}</p>
                      <p className="text-sm text-gray-500">
                        {t('addUseForRentalsDesc')}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={vehicleData.useForRentals}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, useForRentals: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                    />
                  </label>
                </div>
              )}

              {/* Info about insurance */}
              {!vehicleData.hasOwnInsurance && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <IoInformationCircleOutline className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {t('addNoInsuranceInfo')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IoImageOutline className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('addVehiclePhotos')}</h2>
                </div>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer flex items-center gap-2">
                  <IoAddOutline className="w-5 h-5" />
                  {t('addAddPhotos')}
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
                    {t('addPhotoCount', { count: photos.length })}
                  </span>
                </div>
                {photos.length < 3 && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    {t('addMoreRequired', { count: 3 - photos.length })}
                  </span>
                )}
              </div>

              {/* Photo tips */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{t('addPhotoTipsLabel')}</strong> {t('addPhotoTips')}
                </p>
              </div>

              {/* Photos Grid */}
              {photos.length === 0 ? (
                <label className="block text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <IoImageOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('addClickOrDrag')}</p>
                  <p className="text-sm text-gray-500 mt-1">{t('addPhotoFormat')}</p>
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
                          title={t('addSetMainPhoto')}
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
                          title={t('addDeletePhoto')}
                        >
                          <IoTrashOutline className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                      {photo.isHero && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                          {t('addMainPhoto')}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add more photos button */}
                  <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                    <IoAddOutline className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">{t('addAddMore')}</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('addPricing')}</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addDailyRate')}
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
                  <p className="text-xs text-gray-500 mt-1">{t('addMinPerDay')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addWeeklyRate')}
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
                    {t('addSuggested', { amount: Math.round(vehicleData.dailyRate * 6.5) || 0 })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addMonthlyRate')}
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
                    {t('addSuggested', { amount: Math.round(vehicleData.dailyRate * 25) || 0 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('addDeliveryOptions')}</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleData.airportPickup}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, airportPickup: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('addAirportPickup')}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleData.hotelDelivery}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, hotelDelivery: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('addHotelDelivery')}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleData.homeDelivery}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, homeDelivery: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{t('addHomeDelivery')}</span>
                </label>
              </div>

              {(vehicleData.airportPickup || vehicleData.hotelDelivery || vehicleData.homeDelivery) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addDeliveryFee')}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('addVehicleDetailsReview')}</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('addVin')}</dt>
                        <dd className="font-mono text-gray-900 dark:text-white">{vehicleData.vin}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('addColorLabel')}</dt>
                        <dd className="text-gray-900 dark:text-white">{vehicleData.color}</dd>
                      </div>
                      {vehicleData.licensePlate && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">{t('addLicensePlateLabel')}</dt>
                          <dd className="text-gray-900 dark:text-white">{vehicleData.licensePlate}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('addTransmissionLabel')}</dt>
                        <dd className="text-gray-900 dark:text-white capitalize">{vehicleData.transmission}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('addFuelTypeLabel')}</dt>
                        <dd className="text-gray-900 dark:text-white capitalize">{vehicleData.fuelType}</dd>
                      </div>
                      {vehicleData.driveType && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">{t('addDriveTypeLabel')}</dt>
                          <dd className="text-gray-900 dark:text-white">{vehicleData.driveType}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Pricing & Location */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('addPricingLocation')}</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">{t('addDailyRateLabel')}</dt>
                        <dd className="text-gray-900 dark:text-white font-semibold">{t('addDailyRateValue', { rate: vehicleData.dailyRate })}</dd>
                      </div>
                      {vehicleData.weeklyRate > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">{t('addWeeklyRateLabel')}</dt>
                          <dd className="text-gray-900 dark:text-white">{t('addWeeklyRateValue', { rate: vehicleData.weeklyRate })}</dd>
                        </div>
                      )}
                      {vehicleData.monthlyRate > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">{t('addMonthlyRateLabel')}</dt>
                          <dd className="text-gray-900 dark:text-white">{t('addMonthlyRateValue', { rate: vehicleData.monthlyRate })}</dd>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <dt className="text-gray-500">{t('addLocationLabel')}</dt>
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
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('addPhotosCount', { count: photos.length })}</h3>
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

                {/* Insurance Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <IoShieldOutline className="w-5 h-5 text-blue-600" />
                    {t('addInsurance')}
                  </h3>
                  {vehicleData.hasOwnInsurance ? (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>{vehicleData.insuranceProvider || t('addOwnInsurance')}</strong>
                        {vehicleData.insurancePolicyNumber && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            {t('addPolicyLabel', { number: vehicleData.insurancePolicyNumber })}
                          </span>
                        )}
                      </p>
                      {vehicleData.useForRentals && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {t('addWillCoverRentals')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t('addNoInsuranceConfigured')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Partner Benefits */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <IoRocketOutline className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-300">{t('addPartnerBenefits')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="w-4 h-4" />
                  <span><strong>{t('addAutoApproved')}</strong> {t('addAutoApprovedDesc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="w-4 h-4" />
                  <span><strong>{t('addInstantBook')}</strong> {t('addInstantBookDesc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="w-4 h-4" />
                  <span><strong>{t('addFleetPricing')}</strong> {t('addFleetPricingDesc')}</span>
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
            {t('addBack')}
          </button>

          {currentStep < 5 ? (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              {t('addContinue')}
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
                  {t('addSubmitting')}
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-5 h-5" />
                  {t('addAddVehicleToFleet')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
