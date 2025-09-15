// app/(guest)/rentals/trip/end/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PhotoCapture } from '../../start/[id]/components/PhotoCapture'
import { OdometerInput } from '../../start/[id]/components/OdometerInput'
import { FuelSelector } from '../../start/[id]/components/FuelSelector'
import { ChargeCalculator } from './components/ChargeCalculator'
import { DisputeSelector } from './components/DisputeSelector'
import { PaymentConfirm } from './components/PaymentConfirm'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import { validateOdometer, validateFuelLevel, validateInspectionPhotos } from '@/app/lib/trip/validation'
import { calculateTripCharges } from '@/app/lib/trip/calculations'
import { 
  IoArrowBackOutline,
  IoCarSportOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoTimeOutline
} from 'react-icons/io5'

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

  // Define steps with icons
  const steps = [
    { 
      title: 'Final Inspection', 
      component: PhotoCapture,
      description: 'Document vehicle condition',
      icon: '📸'
    },
    { 
      title: 'Mileage', 
      component: OdometerInput,
      description: 'Record final odometer',
      icon: '🚗'
    },
    { 
      title: 'Fuel Level', 
      component: FuelSelector,
      description: 'Check fuel gauge',
      icon: '⛽'
    },
    { 
      title: 'Charges', 
      component: ChargeCalculator,
      description: 'Review any fees',
      icon: '💵'
    },
    { 
      title: 'Disputes', 
      component: DisputeSelector,
      description: 'Report any issues',
      icon: '⚠️'
    },
    { 
      title: 'Complete', 
      component: PaymentConfirm,
      description: 'Finalize & settle deposit',
      icon: '✅'
    }
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
        tripData.damagePhotos || []
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
        tripData.damagePhotos || []
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
        headers: {
          'Content-Type': 'application/json',
          'x-guest-email': booking.guestEmail || ''
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <IoWarningOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Trip</h2>
          <p className="text-gray-600 mb-6">{error || 'Booking information not found'}</p>
          <button
            onClick={() => router.push('/rentals/dashboard')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = steps[currentStep].component
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/rentals/dashboard/bookings/${bookingId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back to Booking</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            {getTripDuration() && (
              <div className="flex items-center text-sm text-gray-600">
                <IoTimeOutline className="w-4 h-4 mr-1" />
                <span>Trip Duration: {getTripDuration()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Trip Info Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Trip</h1>
              <div className="mt-2 space-y-1">
                <p className="text-gray-700 font-medium">
                  {booking.car.year} {booking.car.make} {booking.car.model}
                </p>
                <p className="text-sm text-gray-600">
                  Booking Code: {booking.bookingCode}
                </p>
                <p className="text-sm text-gray-600">
                  Security Deposit: ${booking.depositAmount || 500}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <IoCarSportOutline className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                      index < currentStep
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <IoCheckmarkCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-xs">{step.icon}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      index === currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Counter */}
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <IoWarningOutline className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Current Step Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
            onProcessingMethodChange={handleProcessingMethodChange}
            onSubmit={isLastStep ? handleSubmit : undefined}
            submitting={submitting}
          />
        </div>

        {/* Navigation Buttons - Hide on last step since PaymentConfirm has its own button */}
        {!isLastStep && (
          <div className="flex justify-between">
            <button
              onClick={currentStep === 0 ? () => router.push(`/rentals/dashboard/bookings/${bookingId}`) : handleBack}
              disabled={submitting}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Continue
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Legal Notice - Also hide on last step as PaymentConfirm has its own */}
        {!isLastStep && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
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