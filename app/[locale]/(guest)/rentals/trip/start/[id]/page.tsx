// app/(guest)/rentals/trip/start/[id]/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { PhotoCapture } from './components/PhotoCapture'
import { OdometerInput } from './components/OdometerInput'
import { FuelSelector } from './components/FuelSelector'
import { HandoffVerify } from './components/HandoffVerify'
import { InspectionChecklist } from './components/InspectionChecklist'
import TripStepProgress from '@/app/components/TripStepProgress'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import { validateInspectionPhotos, validateOdometer, validateFuelLevel, canStartTrip } from '@/app/lib/trip/validation'

interface TripStartData {
  photos: Record<string, string>
  odometer: number
  fuelLevel: string
  location: { lat: number; lng: number } | null
  checklist: Record<string, boolean>
  notes: string
}

export default function TripStartPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('TripStart')
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [handoffSkipped, setHandoffSkipped] = useState(false)

  const [tripData, setTripData] = useState<TripStartData>({
    photos: {},
    odometer: 0,
    fuelLevel: '',
    location: null,
    checklist: {
      keysReceived: false,
      exteriorChecked: false,
      interiorChecked: false,
      lightsWork: false,
      tiresGood: false,
      noWarningLights: false
    },
    notes: ''
  })

  // Load booking data
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
          
          // Verify trip can be started
          const validation = canStartTrip(booking)
          if (!validation.valid) {
            setError(validation.error || 'Cannot start trip')
            return
          }
          
          setBooking(booking)

          // If handoff already complete, skip to Photos (step 1)
          if (booking.handoffStatus === 'HANDOFF_COMPLETE' || booking.handoffStatus === 'BYPASSED') {
            setCurrentStep(1)
            setHandoffSkipped(true)
            setTripData(prev => ({ ...prev, location: { lat: 0, lng: 0 } }))
          }

          // Location will be verified by the LocationVerify component via GPS
        } else {
          setError('Booking not found')
        }
      } else {
        setError('Failed to load booking')
      }
    } catch (err) {
      setError('Failed to load booking')
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
  }

  const handleFuelChange = (level: string) => {
    setTripData(prev => ({ ...prev, fuelLevel: level }))
  }

  const handleLocationVerified = (location: { lat: number; lng: number }) => {
    setTripData(prev => ({ ...prev, location }))
  }

  const handleChecklistChange = (item: string, checked: boolean) => {
    setTripData(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [item]: checked }
    }))
  }

  const handleNotesChange = (notes: string) => {
    setTripData(prev => ({ ...prev, notes }))
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Location verification via GPS
        if (!tripData.location) {
          setError('Please verify your location before continuing')
          return false
        }
        return true
        
      case 1: // Photos
        const photoValidation = validateInspectionPhotos(tripData.photos, 'start')
        if (!photoValidation.valid) {
          setError(photoValidation.error || 'Please capture all required photos')
          return false
        }
        break
      case 2: // Odometer
        const odometerValidation = validateOdometer(tripData.odometer)
        if (!odometerValidation.valid) {
          setError(odometerValidation.error || 'Invalid odometer reading')
          return false
        }
        break
      case 3: // Fuel
        const fuelValidation = validateFuelLevel(tripData.fuelLevel)
        if (!fuelValidation.valid) {
          setError(fuelValidation.error || 'Please select fuel level')
          return false
        }
        break
      case 4: // Checklist
        const allChecked = Object.values(tripData.checklist).every(v => v === true)
        if (!allChecked) {
          setError('Please complete all checklist items')
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
    const minStep = handoffSkipped ? 1 : 0
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/rentals/bookings/${bookingId}/trip/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startMileage: tripData.odometer,
          fuelLevelStart: tripData.fuelLevel,
          inspectionPhotos: tripData.photos,
          location: tripData.location,
          checklist: tripData.checklist,
          notes: tripData.notes
        })
      })

      if (response.ok) {
        router.push(`/rentals/dashboard/bookings/${bookingId}?tripStarted=true`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to start trip')
      }
    } catch (err) {
      setError('Failed to start trip. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { title: 'Handoff', component: HandoffVerify },
    { title: 'Photos', component: PhotoCapture },
    { title: 'Odometer', component: OdometerInput },
    { title: 'Fuel', component: FuelSelector },
    { title: 'Checklist', component: InspectionChecklist }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loadingInspection')}</p>
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
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('startTripInspection')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {booking.car.year} {booking.car.make} {booking.car.model}
          </p>
        </div>

        {/* Progress Bar */}
        <TripStepProgress
          steps={steps.map(s => ({ name: s.title }))}
          currentStep={currentStep}
          className="mb-8"
        />

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Current Step Component */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <CurrentStepComponent
            booking={booking}
            data={tripData}
            onPhotoCapture={handlePhotoCapture}
            onOdometerChange={handleOdometerChange}
            onFuelChange={handleFuelChange}
            onLocationVerified={handleLocationVerified}
            onChecklistChange={handleChecklistChange}
            onNotesChange={handleNotesChange}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={currentStep <= (handoffSkipped ? 1 : 0) ? () => router.back() : handleBack}
            disabled={submitting}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <span>Processing...</span>
            ) : currentStep === steps.length - 1 ? (
              'Start Trip'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}