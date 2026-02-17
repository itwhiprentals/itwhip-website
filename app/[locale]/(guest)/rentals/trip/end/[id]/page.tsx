// app/(guest)/rentals/trip/end/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { PhotoCapture } from '../../start/[id]/components/PhotoCapture'
import { OdometerInput } from '../../start/[id]/components/OdometerInput'
import { FuelSelector } from '../../start/[id]/components/FuelSelector'
import { ChargeCalculator } from './components/ChargeCalculator'
import { DisputeSelector } from './components/DisputeSelector'
import { PaymentConfirm } from './components/PaymentConfirm'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import { validateOdometer, validateFuelLevel, validateInspectionPhotos } from '@/app/lib/trip/validation'
import { calculateTripCharges } from '@/app/lib/trip/calculations'
import TripStepProgress from '@/app/components/TripStepProgress'
import { IoWarningOutline, IoTimeOutline } from 'react-icons/io5'

interface TripEndData {
  photos: Record<string, string>
  odometer: number
  fuelLevel: string
  damageReported: boolean
  damageDescription: string
  damagePhotos: string[]
  disputes: string[]
  notes: string
  acceptedTerms?: boolean
  processingMethod?: 'immediate' | 'hold'
}

export default function TripEndPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('TripEnd')
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [charges, setCharges] = useState<any>(null)

  const [tripData, setTripData] = useState<TripEndData>({
    photos: {},
    odometer: 0,
    fuelLevel: '',
    damageReported: false,
    damageDescription: '',
    damagePhotos: [],
    disputes: [],
    notes: '',
    acceptedTerms: false,
    processingMethod: 'hold'
  })

  const steps = [
    { title: 'Photos', component: PhotoCapture },
    { title: 'Mileage', component: OdometerInput },
    { title: 'Fuel', component: FuelSelector },
    { title: 'Charges', component: ChargeCalculator },
    { title: 'Disputes', component: DisputeSelector },
    { title: 'Complete', component: PaymentConfirm }
  ]

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const loadBooking = async () => {
    try {
      const response = await fetch(`/api/rentals/user-bookings?bookingId=${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.bookings && data.bookings.length > 0) {
          const booking = data.bookings[0]
          
          // Verify trip is active
          if (!booking.tripStartedAt) {
            setError('Trip has not been started yet. Please start your trip first.')
            return
          }
          if (booking.tripEndedAt) {
            setError('This trip has already been completed.')
            router.push(`/rentals/dashboard/bookings/${bookingId}`)
            return
          }
          
          setBooking(booking)
        } else {
          setError('Booking not found')
        }
      } else {
        setError('Failed to load booking information')
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoCapture = (photoId: string, url: string) => {
    setTripData(prev => ({
      ...prev,
      photos: { ...prev.photos, [photoId]: url }
    }))
  }

  const handleOdometerChange = (value: number) => {
    setTripData(prev => ({ ...prev, odometer: value }))
    
    // Calculate charges when odometer is updated
    if (booking && value > booking.startMileage) {
      const calculatedCharges = calculateTripCharges(
        booking.startMileage,
        value,
        booking.fuelLevelStart,
        tripData.fuelLevel || booking.fuelLevelStart,
        new Date(booking.startDate),
        new Date(booking.endDate),
        new Date(),
        booking.numberOfDays,
        tripData.damagePhotos as any || []
      )
      setCharges(calculatedCharges)
    }
  }

  const handleFuelChange = (level: string) => {
    setTripData(prev => ({ ...prev, fuelLevel: level }))
    
    // Recalculate charges when fuel level changes
    if (booking && tripData.odometer) {
      const calculatedCharges = calculateTripCharges(
        booking.startMileage,
        tripData.odometer,
        booking.fuelLevelStart,
        level,
        new Date(booking.startDate),
        new Date(booking.endDate),
        new Date(),
        booking.numberOfDays,
        tripData.damagePhotos as any || []
      )
      setCharges(calculatedCharges)
    }
  }

  const handleDamageReport = (damage: { reported: boolean; description: string; photos: string[] }) => {
    setTripData(prev => ({
      ...prev,
      damageReported: damage.reported,
      damageDescription: damage.description,
      damagePhotos: damage.photos
    }))
  }

  const handleDisputeSelect = (disputes: string[]) => {
    setTripData(prev => ({ ...prev, disputes }))
  }

  const handleTermsAcceptance = (accepted: boolean) => {
    setTripData(prev => ({ ...prev, acceptedTerms: accepted }))
  }

  const handleProcessingMethodChange = (method: 'immediate' | 'hold') => {
    setTripData(prev => ({ ...prev, processingMethod: method }))
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Photos
        const photoValidation = validateInspectionPhotos(tripData.photos, 'end')
        if (!photoValidation.valid) {
          setError(photoValidation.error || 'Please capture all required photos')
          return false
        }
        break
        
      case 1: // Odometer
        const odometerValidation = validateOdometer(tripData.odometer, booking?.startMileage)
        if (!odometerValidation.valid) {
          setError(odometerValidation.error || 'Invalid odometer reading')
          return false
        }
        break
        
      case 2: // Fuel
        const fuelValidation = validateFuelLevel(tripData.fuelLevel)
        if (!fuelValidation.valid) {
          setError(fuelValidation.error || 'Please select fuel level')
          return false
        }
        break
        
      case 3: // Charges - validate damage photos if damage reported
        if (tripData.damageReported && tripData.damagePhotos.length < 2) {
          setError('Please capture at least 2 photos of any damage')
          return false
        }
        break
        
      case 4: // Disputes - no validation needed
        break
        
      case 5: // Payment confirmation - validate terms accepted
        if (!tripData.acceptedTerms) {
          setError('Please accept the terms to complete your trip')
          return false
        }
        break
    }
    
    setError(null)
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    // Only called from PaymentConfirm component now
    if (!tripData.acceptedTerms) {
      setError('Please accept the terms to complete your trip')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/rentals/bookings/${bookingId}/trip/end`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endMileage: tripData.odometer,
          fuelLevelEnd: tripData.fuelLevel,
          inspectionPhotos: tripData.photos,
          damageReported: tripData.damageReported,
          damageDescription: tripData.damageDescription,
          damagePhotos: tripData.damagePhotos,
          notes: tripData.notes,
          disputes: tripData.disputes,
          processingMethod: tripData.processingMethod,
          // Add statutory compliance data
          statutoryNotice: {
            statutes: ['A.R.S. §33-1321', 'A.R.S. §28-9601'],
            itemizationRequired: true,
            releaseTimeline: '7-14 business days',
            disputeWindow: '48 hours',
            depositAmount: booking.depositAmount || 500
          }
        })
      })

      if (response.ok) {
        // Show success and redirect
        router.push(`/rentals/dashboard/bookings/${bookingId}?tripEnded=true&showReview=true`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to complete trip. Please try again.')
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate trip duration
  const getTripDuration = () => {
    if (!booking?.tripStartedAt) return null
    const start = new Date(booking.tripStartedAt)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loadingTripDetails')}</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || t('bookingNotFound')}</p>
          <button
            onClick={() => router.push('/rentals/dashboard')}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = steps[currentStep].component
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('completeYourTrip')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {booking.car.year} {booking.car.make} {booking.car.model}
          </p>
          {getTripDuration() && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <IoTimeOutline className="w-4 h-4 mr-1" />
              <span>{t('tripDuration')}: {getTripDuration()}</span>
            </div>
          )}
        </div>

        {/* Progress Bar — matching trip start layout */}
        <TripStepProgress
          steps={steps.map(s => ({ name: s.title }))}
          currentStep={currentStep}
          className="mb-8"
        />

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <IoWarningOutline className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Current Step Component */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <CurrentStepComponent
            booking={booking}
            data={tripData}
            charges={charges}
            depositAmount={booking.depositAmount || 500}
            onPhotoCapture={handlePhotoCapture}
            onOdometerChange={handleOdometerChange}
            onFuelChange={handleFuelChange}
            onDamageReport={handleDamageReport}
            onDisputeSelect={handleDisputeSelect}
            onTermsAcceptance={handleTermsAcceptance}
            {...{ onProcessingMethodChange: handleProcessingMethodChange } as any}
            onSubmit={isLastStep ? handleSubmit : undefined}
            submitting={submitting}
          />
        </div>

        {/* Navigation Buttons - Hide on last step since PaymentConfirm has its own button */}
        {!isLastStep && (
          <div className="flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            {currentStep === 0 && <div />}

            <button
              onClick={handleNext}
              disabled={submitting}
              className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Next'}
            </button>
          </div>
        )}

        {/* Legal Notice */}
        {!isLastStep && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              By proceeding, you agree to the charges calculated based on your trip details.
              An itemized statement will be provided per Arizona Revised Statutes §33-1321.
              You have 48 hours to dispute any charges.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}