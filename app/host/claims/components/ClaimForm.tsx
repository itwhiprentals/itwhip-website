// app/host/claims/components/ClaimForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  IoCarOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoLocationOutline,
} from 'react-icons/io5'

// Import FNOL Components
import VehicleConditionSection from './fnol/VehicleConditionSection'
import IncidentConditionsSection from './fnol/IncidentConditionsSection'
import PoliceReportSection from './fnol/PoliceReportSection'
import WitnessSection from './fnol/WitnessSection'
import OtherPartySection from './fnol/OtherPartySection'
import InjurySection from './fnol/InjurySection'
import type { Witness, Injury } from './fnol/types'
import { US_STATES } from './fnol/types'

interface Booking {
  id: string
  bookingCode: string
  startDate: string
  endDate: string
  car: {
    id: string
    make: string
    model: string
    year: number
    photos?: Array<{ url: string }>
  }
  renter?: {
    name: string
    email: string
  }
  guestName?: string
  guestEmail?: string
  insurancePolicy?: {
    tier: string
    deductible: number
  }
}

interface InsuranceDetails {
  insuranceHierarchy: {
    primary: {
      type: string
      provider: string
      policyNumber?: string | null
      status: string
    }
    secondary: {
      provider: string
      tier: string
      coverage: {
        liability: number
        collision: number
        deductible: number
      }
      premium: number
    }
    tertiary?: {
      provider: string
      verified: boolean
      depositReduction: string
    } | null
  }
  deductibleDetails: {
    primaryDeductible: number
    depositHeld: number
    guestResponsibility: number
    coveredByDeposit: number
  }
  hostEarnings: {
    tier: string
    percentage: number
    insuranceRole: string
  }
}

interface ClaimFormProps {
  hostId: string
  onSuccess?: (claimId: string) => void
  onCancel?: () => void
}

export default function ClaimForm({ hostId, onSuccess, onCancel }: ClaimFormProps) {
  const router = useRouter()

  // Form state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [claimType, setClaimType] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [damagePhotos, setDamagePhotos] = useState<string[]>([])
  const [photoPreview, setPhotoPreview] = useState<string>('')
  
  // Incident Location State
  const [incidentAddress, setIncidentAddress] = useState('')
  const [incidentCity, setIncidentCity] = useState('')
  const [incidentState, setIncidentState] = useState('AZ')
  const [incidentZip, setIncidentZip] = useState('')
  const [incidentDescription, setIncidentDescription] = useState('')
  
  // FNOL State - Vehicle Condition
  const [odometerAtIncident, setOdometerAtIncident] = useState('')
  const [vehicleDrivable, setVehicleDrivable] = useState(true)
  const [vehicleLocation, setVehicleLocation] = useState('')
  
  // FNOL State - Incident Conditions
  const [weatherConditions, setWeatherConditions] = useState('')
  const [weatherDescription, setWeatherDescription] = useState('')
  const [roadConditions, setRoadConditions] = useState('')
  const [roadDescription, setRoadDescription] = useState('')
  const [estimatedSpeed, setEstimatedSpeed] = useState('')
  const [trafficConditions, setTrafficConditions] = useState('')
  
  // FNOL State - Police Report
  const [wasPoliceContacted, setWasPoliceContacted] = useState(false)
  const [policeDepartment, setPoliceDepartment] = useState('')
  const [officerName, setOfficerName] = useState('')
  const [officerBadge, setOfficerBadge] = useState('')
  const [policeReportNumber, setPoliceReportNumber] = useState('')
  const [policeReportFiled, setPoliceReportFiled] = useState(false)
  const [policeReportDate, setPoliceReportDate] = useState('')
  
  // FNOL State - Witnesses
  const [witnesses, setWitnesses] = useState<Witness[]>([])
  
  // FNOL State - Other Party
  const [otherPartyInvolved, setOtherPartyInvolved] = useState(false)
  const [otherPartyDriverName, setOtherPartyDriverName] = useState('')
  const [otherPartyDriverPhone, setOtherPartyDriverPhone] = useState('')
  const [otherPartyDriverLicense, setOtherPartyDriverLicense] = useState('')
  const [otherPartyDriverLicenseState, setOtherPartyDriverLicenseState] = useState('')
  const [otherPartyVehicleYear, setOtherPartyVehicleYear] = useState('')
  const [otherPartyVehicleMake, setOtherPartyVehicleMake] = useState('')
  const [otherPartyVehicleModel, setOtherPartyVehicleModel] = useState('')
  const [otherPartyVehiclePlate, setOtherPartyVehiclePlate] = useState('')
  const [otherPartyVehicleVin, setOtherPartyVehicleVin] = useState('')
  const [otherPartyInsuranceCarrier, setOtherPartyInsuranceCarrier] = useState('')
  const [otherPartyInsurancePolicy, setOtherPartyInsurancePolicy] = useState('')
  
  // FNOL State - Injuries
  const [wereInjuries, setWereInjuries] = useState(false)
  const [injuries, setInjuries] = useState<Injury[]>([])

  // Insurance state
  const [insuranceDetails, setInsuranceDetails] = useState<InsuranceDetails | null>(null)
  const [loadingInsurance, setLoadingInsurance] = useState(false)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Claim types
  const claimTypes = [
    { value: 'ACCIDENT', label: 'Accident', description: 'Vehicle collision or crash' },
    { value: 'THEFT', label: 'Theft', description: 'Vehicle or items stolen' },
    { value: 'VANDALISM', label: 'Vandalism', description: 'Intentional damage to vehicle' },
    { value: 'CLEANING', label: 'Cleaning', description: 'Excessive cleaning required' },
    { value: 'MECHANICAL', label: 'Mechanical', description: 'Mechanical damage or failure' },
    { value: 'WEATHER', label: 'Weather Damage', description: 'Damage from weather events' },
    { value: 'OTHER', label: 'Other', description: 'Other types of damage' }
  ]

  // US States for dropdown (use imported constant)
  const usStates = US_STATES

  // Warn user if navigating away during submission
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting && !submitSuccess) {
        e.preventDefault()
        e.returnValue = 'Claim submission in progress. Are you sure you want to leave?'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isSubmitting, submitSuccess])

  // Fetch eligible bookings on mount
  useEffect(() => {
    fetchEligibleBookings()
  }, [])

  // Fetch insurance details when booking selected
  useEffect(() => {
    if (selectedBookingId) {
      fetchInsuranceDetails(selectedBookingId)
    } else {
      setInsuranceDetails(null)
    }
  }, [selectedBookingId])

  const fetchEligibleBookings = async () => {
    try {
      setLoadingBookings(true)
      const response = await fetch(`/api/host/bookings?status=COMPLETED,ACTIVE&hasInsurance=true`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load eligible bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  const fetchInsuranceDetails = async (bookingId: string) => {
    try {
      setLoadingInsurance(true)
      const response = await fetch(`/api/host/bookings/${bookingId}/insurance`)
      if (response.ok) {
        const data = await response.json()
        setInsuranceDetails(data)
      }
    } catch (error) {
      console.error('Error fetching insurance details:', error)
    } finally {
      setLoadingInsurance(false)
    }
  }

  // Get selected booking details
  const selectedBooking = bookings.find(b => b.id === selectedBookingId)

  // Helper to get guest name
  const getGuestName = (booking: Booking) => {
    return booking.renter?.name || booking.guestName || 'Guest'
  }

  // Helper to get car photo
  const getCarPhoto = (booking: Booking) => {
    return booking.car.photos?.[0]?.url || null
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!selectedBookingId) {
      errors.booking = 'Please select a booking'
    }

    if (!claimType) {
      errors.type = 'Please select a claim type'
    }

    if (!description.trim()) {
      errors.description = 'Please provide a description'
    } else if (description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters'
    }

    if (!incidentDate) {
      errors.incidentDate = 'Please select an incident date'
    } else if (selectedBooking) {
      const incident = new Date(incidentDate)
      const start = new Date(selectedBooking.startDate)
      const end = new Date(selectedBooking.endDate)
      const maxDate = new Date(end)
      maxDate.setDate(maxDate.getDate() + 30)

      const isDevelopment = process.env.NODE_ENV === 'development'
      const skipDateValidation = isDevelopment
      
      if (!skipDateValidation && (incident < start || incident > maxDate)) {
        errors.incidentDate = 'Incident date must be within trip dates or up to 30 days after'
      }
      
      if (skipDateValidation && (incident < start || incident > maxDate)) {
        console.warn('⚠️ DEV MODE: Bypassing 30-day claim restriction for testing')
      }
    }

    if (estimatedCost) {
      const cost = parseFloat(estimatedCost)
      if (isNaN(cost) || cost < 0) {
        errors.estimatedCost = 'Please enter a valid amount'
      } else if (cost > 100000) {
        errors.estimatedCost = 'Amount cannot exceed $100,000'
      }
    }

    // Incident Location Validation
    if (!incidentAddress.trim()) {
      errors.incidentAddress = 'Incident address is required'
    }

    if (!incidentCity.trim()) {
      errors.incidentCity = 'City is required'
    }

    if (!incidentState) {
      errors.incidentState = 'State is required'
    }

    if (!incidentZip.trim()) {
      errors.incidentZip = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(incidentZip)) {
      errors.incidentZip = 'Invalid ZIP code format'
    }

    // FNOL Validations
    if (!odometerAtIncident.trim()) {
      errors.odometerAtIncident = 'Odometer reading is required'
    } else if (parseInt(odometerAtIncident) < 0) {
      errors.odometerAtIncident = 'Invalid odometer reading'
    }

    if (!vehicleDrivable && !vehicleLocation.trim()) {
      errors.vehicleLocation = 'Current vehicle location is required if not drivable'
    }

    if (!weatherConditions) {
      errors.weatherConditions = 'Weather conditions are required'
    }

    if (!roadConditions) {
      errors.roadConditions = 'Road conditions are required'
    }

    if (wasPoliceContacted) {
      if (!policeDepartment.trim()) {
        errors.policeDepartment = 'Police department is required if police contacted'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle photo URL input
  const handleAddPhoto = () => {
    if (photoPreview.trim()) {
      setDamagePhotos([...damagePhotos, photoPreview.trim()])
      setPhotoPreview('')
    }
  }

  const handleRemovePhoto = (index: number) => {
    setDamagePhotos(damagePhotos.filter((_, i) => i !== index))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Guard clause to prevent double submission
    if (isSubmitting || submitSuccess) {
      console.warn('⚠️ Claim submission already in progress or completed')
      return
    }

    setError('')
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/host/claims/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          type: claimType,
          description: description.trim(),
          incidentDate,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
          damagePhotos: damagePhotos.filter(url => url.trim()),
          // Note: We're NOT sending deactivateVehicle anymore - it's automatic
          carId: selectedBooking?.car.id,
          // Incident Location Data
          incidentLocation: {
            address: incidentAddress.trim(),
            city: incidentCity.trim(),
            state: incidentState,
            zipCode: incidentZip.trim(),
            description: incidentDescription.trim() || null
          },
          // FNOL Data
          fnolData: {
            // Vehicle Condition
            odometerAtIncident: parseInt(odometerAtIncident),
            vehicleDrivable,
            vehicleLocation: vehicleDrivable ? null : vehicleLocation.trim(),
            
            // Incident Conditions
            weatherConditions,
            weatherDescription: weatherDescription.trim() || null,
            roadConditions,
            roadDescription: roadDescription.trim() || null,
            estimatedSpeed: estimatedSpeed ? parseInt(estimatedSpeed) : null,
            trafficConditions: trafficConditions || null,
            
            // Police Report
            wasPoliceContacted,
            policeDepartment: wasPoliceContacted ? policeDepartment.trim() : null,
            officerName: wasPoliceContacted ? officerName.trim() || null : null,
            officerBadge: wasPoliceContacted ? officerBadge.trim() || null : null,
            policeReportNumber: wasPoliceContacted ? policeReportNumber.trim() || null : null,
            policeReportFiled: wasPoliceContacted ? policeReportFiled : false,
            policeReportDate: wasPoliceContacted && policeReportDate ? policeReportDate : null,
            
            // Witnesses
            witnesses: witnesses.filter(w => w.name.trim()).map(w => ({
              name: w.name.trim(),
              phone: w.phone.trim(),
              email: w.email.trim() || null,
              statement: w.statement.trim() || null
            })),
            
            // Other Party
            otherPartyInvolved,
            otherParty: otherPartyInvolved ? {
              driver: {
                name: otherPartyDriverName.trim(),
                phone: otherPartyDriverPhone.trim(),
                license: otherPartyDriverLicense.trim() || null,
                licenseState: otherPartyDriverLicenseState || null
              },
              vehicle: {
                year: otherPartyVehicleYear ? parseInt(otherPartyVehicleYear) : null,
                make: otherPartyVehicleMake.trim() || null,
                model: otherPartyVehicleModel.trim() || null,
                plate: otherPartyVehiclePlate.trim() || null,
                vin: otherPartyVehicleVin.trim() || null
              },
              insurance: {
                carrier: otherPartyInsuranceCarrier.trim() || null,
                policy: otherPartyInsurancePolicy.trim() || null
              }
            } : null,
            
            // Injuries
            wereInjuries,
            injuries: wereInjuries ? injuries.filter(i => i.person.trim()).map(i => ({
              person: i.person.trim(),
              description: i.description.trim(),
              severity: i.severity,
              medicalAttention: i.medicalAttention,
              hospital: i.medicalAttention ? i.hospital.trim() || null : null
            })) : []
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim')
      }

      // Mark as successfully submitted BEFORE redirect
      setSubmitSuccess(true)

      // Success! Redirect immediately
      if (onSuccess) {
        onSuccess(data.claim.id)
      } else {
        router.push(`/host/claims/${data.claim.id}`)
      }
    } catch (err: any) {
      console.error('Error submitting claim:', err)
      setError(err.message || 'Failed to submit claim. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Override FNOL component styling - Force professional gray borders */}
      <style jsx global>{`
        /* ===== REMOVE ALL GRADIENTS (except blue info box) ===== */
        form [class*="bg-gradient-to-br"]:not(.bg-blue-50),
        form [class*="bg-gradient-to-r"]:not(.bg-blue-50),
        form [class*="bg-gradient-to-l"]:not(.bg-blue-50),
        form [class*="bg-gradient-to-t"]:not(.bg-blue-50),
        form [class*="bg-gradient-to-b"]:not(.bg-blue-50) {
          background: white !important;
          background-image: none !important;
        }
        
        .dark form [class*="bg-gradient-to-br"]:not(.bg-blue-50),
        .dark form [class*="bg-gradient-to-r"]:not(.bg-blue-50),
        .dark form [class*="bg-gradient-to-l"]:not(.bg-blue-50),
        .dark form [class*="bg-gradient-to-t"]:not(.bg-blue-50),
        .dark form [class*="bg-gradient-to-b"]:not(.bg-blue-50) {
          background: rgb(31 41 55) !important;
          background-image: none !important;
        }
        
        /* ===== FORCE ALL COLORED BORDERS TO GRAY ===== */
        /* Target all possible colored border classes from FNOL components */
        form div[class*="border-blue"]:not(.border-blue-200),
        form div[class*="border-green"],
        form div[class*="border-red"],
        form div[class*="border-indigo"],
        form div[class*="border-yellow"],
        form div[class*="border-pink"],
        form div[class*="border-purple"],
        form div[class*="border-teal"],
        form div[class*="border-cyan"],
        form div[class*="border-orange"],
        form section[class*="border-blue"]:not(.border-blue-200),
        form section[class*="border-green"],
        form section[class*="border-red"],
        form section[class*="border-indigo"],
        form section[class*="border-yellow"],
        form section[class*="border-pink"],
        form section[class*="border-purple"],
        form section[class*="border-teal"],
        form section[class*="border-cyan"],
        form section[class*="border-orange"] {
          border-color: rgb(229 231 235) !important; /* border-gray-200 */
        }
        
        .dark form div[class*="border-blue"]:not(.dark\:border-blue-800),
        .dark form div[class*="border-green"],
        .dark form div[class*="border-red"],
        .dark form div[class*="border-indigo"],
        .dark form div[class*="border-yellow"],
        .dark form div[class*="border-pink"],
        .dark form div[class*="border-purple"],
        .dark form div[class*="border-teal"],
        .dark form div[class*="border-cyan"],
        .dark form div[class*="border-orange"],
        .dark form section[class*="border-blue"]:not(.dark\:border-blue-800),
        .dark form section[class*="border-green"],
        .dark form section[class*="border-red"],
        .dark form section[class*="border-indigo"],
        .dark form section[class*="border-yellow"],
        .dark form section[class*="border-pink"],
        .dark form section[class*="border-purple"],
        .dark form section[class*="border-teal"],
        .dark form section[class*="border-cyan"],
        .dark form section[class*="border-orange"] {
          border-color: rgb(55 65 81) !important; /* border-gray-700 */
        }
        
        /* ===== OVERRIDE SPECIFIC FNOL COMPONENT BORDERS ===== */
        /* Vehicle Condition Section */
        form div[class*="VehicleCondition"] > div:first-child,
        form div:has(> div > span:contains("Vehicle Condition")) {
          border-color: rgb(229 231 235) !important;
        }
        
        .dark form div[class*="VehicleCondition"] > div:first-child,
        .dark form div:has(> div > span:contains("Vehicle Condition")) {
          border-color: rgb(55 65 81) !important;
        }
        
        /* Incident Conditions Section */
        form div[class*="IncidentConditions"] > div:first-child {
          border-color: rgb(229 231 235) !important;
        }
        
        .dark form div[class*="IncidentConditions"] > div:first-child {
          border-color: rgb(55 65 81) !important;
        }
        
        /* Witness Section */
        form div[class*="Witness"] > div:first-child {
          border-color: rgb(229 231 235) !important;
        }
        
        .dark form div[class*="Witness"] > div:first-child {
          border-color: rgb(55 65 81) !important;
        }
        
        /* Other Party Section */
        form div[class*="OtherParty"] > div:first-child {
          border-color: rgb(229 231 235) !important;
        }
        
        .dark form div[class*="OtherParty"] > div:first-child {
          border-color: rgb(55 65 81) !important;
        }
        
        /* ===== KEEP ONLY BLUE STYLING FOR INFO BOX ===== */
        form .bg-blue-50 {
          background: rgb(239 246 255) !important;
          background-image: none !important;
        }
        
        .dark form .bg-blue-50 {
          background: rgba(59, 130, 246, 0.1) !important;
          background-image: none !important;
        }
        
        /* ===== ENSURE CLEAN WHITE/GRAY BACKGROUNDS ===== */
        form div[class*="bg-green"],
        form div[class*="bg-indigo"],
        form div[class*="bg-purple"],
        form div[class*="bg-teal"],
        form div[class*="bg-orange"] {
          background: white !important;
        }
        
        .dark form div[class*="bg-green"],
        .dark form div[class*="bg-indigo"],
        .dark form div[class*="bg-purple"],
        .dark form div[class*="bg-teal"],
        .dark form div[class*="bg-orange"] {
          background: rgb(31 41 55) !important;
        }
      `}</style>

      <fieldset disabled={isSubmitting || submitSuccess}>
        {/* Success alert */}
        {submitSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-start gap-3">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
                  Claim Submitted Successfully!
                </h4>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Your vehicle has been automatically deactivated for safety. Redirecting to claim details...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-start gap-3">
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                  Submission Error
                </h4>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== PHASE 1: 5 BASIC SECTIONS (NO CONTAINER) ===== */}
        {/* Select Booking */}
        <div className="space-y-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <IoCarOutline className="w-4 h-4" />
              Select Booking
            </label>
            
            {loadingBookings ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  No eligible bookings found. Claims can only be filed for completed or active trips with insurance coverage.
                </p>
              </div>
            ) : (
              <>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                    text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${fieldErrors.booking ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                >
                  <option value="">Select a booking...</option>
                  {bookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.bookingCode} - {booking.car.year} {booking.car.make} {booking.car.model} (Guest: {getGuestName(booking)})
                    </option>
                  ))}
                </select>
                {fieldErrors.booking && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.booking}</p>
                )}
              </>
            )}

            {/* Selected booking details with insurance summary */}
            {selectedBooking && (
              <div className="space-y-4 mt-4">
                {/* Basic booking info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    {getCarPhoto(selectedBooking) && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <Image
                          src={getCarPhoto(selectedBooking)!}
                          alt="Car"
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        {selectedBooking.car.year} {selectedBooking.car.make} {selectedBooking.car.model}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Guest: {getGuestName(selectedBooking)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insurance Summary */}
                {loadingInsurance ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ) : insuranceDetails && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      Insurance Coverage Summary
                    </h4>

                    {/* Coverage Hierarchy */}
                    <div className="space-y-2 mb-3">
                      {/* Primary Layer */}
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 text-xs">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            PRIMARY: {insuranceDetails.insuranceHierarchy.primary.type === 'HOST_COMMERCIAL' ? 'Your Commercial Insurance' :
                                     insuranceDetails.insuranceHierarchy.primary.type === 'HOST_P2P' ? 'Your P2P Insurance' : 
                                     'Platform Insurance'}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {insuranceDetails.insuranceHierarchy.primary.provider}
                            {insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' && 
                              ' - Handles claim first'}
                          </div>
                        </div>
                      </div>

                      {/* Secondary Layer */}
                      {insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' && (
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 text-xs">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              BACKUP: Platform Insurance ({insuranceDetails.insuranceHierarchy.secondary.tier})
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              ${insuranceDetails.insuranceHierarchy.secondary.coverage.deductible} deductible - Only if your insurance denies
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Guest Insurance if present */}
                      {insuranceDetails.insuranceHierarchy.tertiary && (
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 text-xs">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              GUEST: Personal Insurance {insuranceDetails.insuranceHierarchy.tertiary.verified && '✓'}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {insuranceDetails.insuranceHierarchy.tertiary.depositReduction} deposit reduction applied
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deductible Info */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <div className="text-xs">
                        <div className="text-gray-500 dark:text-gray-400">Deposit Held</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${insuranceDetails.deductibleDetails.depositHeld}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500 dark:text-gray-400">Guest Owes</div>
                        <div className="font-semibold text-red-600 dark:text-red-400">
                          ${insuranceDetails.deductibleDetails.guestResponsibility}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500 dark:text-gray-400">Deductible</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${insuranceDetails.deductibleDetails.primaryDeductible}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500 dark:text-gray-400">Your Tier</div>
                        <div className="font-semibold text-purple-600 dark:text-purple-400">
                          {insuranceDetails.hostEarnings.tier} ({insuranceDetails.hostEarnings.percentage}%)
                        </div>
                      </div>
                    </div>

                    {/* Important note for hosts */}
                    {insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg shadow-sm text-xs border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-1.5">
                          <IoInformationCircleOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          <div className="text-gray-700 dark:text-gray-300">
                            As a {insuranceDetails.hostEarnings.tier} tier host, your insurance handles claims first. 
                            The guest's deposit of ${insuranceDetails.deductibleDetails.depositHeld} will cover part of your deductible.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Claim Type */}
          <div className="pt-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <IoAlertCircleOutline className="w-4 h-4" />
              Claim Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {claimTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setClaimType(type.value)}
                  disabled={isSubmitting || submitSuccess}
                  className={`
                    p-4 rounded-lg shadow-sm border-2 text-left transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${claimType === type.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
            {fieldErrors.type && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.type}</p>
            )}
          </div>

          {/* Description */}
          <div className="pt-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <IoDocumentTextOutline className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe what happened, when it occurred, and the extent of the damage..."
              className={`
                w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${fieldErrors.description ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
            <div className="flex justify-between mt-2">
              <div>
                {fieldErrors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.description}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description.length} characters (min 20)
              </p>
            </div>
          </div>

          {/* Incident Date */}
          <div className="pt-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <IoCalendarOutline className="w-4 h-4" />
              Incident Date
            </label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`
                w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${fieldErrors.incidentDate ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
            {fieldErrors.incidentDate && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.incidentDate}</p>
            )}
          </div>

          {/* Incident Location Section (NO GRADIENT - CLEAN) */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <IoLocationOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Incident Location
              </h3>
              <span className="ml-auto text-xs text-purple-600 dark:text-purple-400 font-medium">
                Required for Insurance
              </span>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={incidentAddress}
                onChange={(e) => setIncidentAddress(e.target.value)}
                placeholder="e.g., 1234 E Main St"
                className={`
                  w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${fieldErrors.incidentAddress ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                `}
              />
              {fieldErrors.incidentAddress && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.incidentAddress}</p>
              )}
            </div>

            {/* City, State, ZIP Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={incidentCity}
                  onChange={(e) => setIncidentCity(e.target.value)}
                  placeholder="Phoenix"
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${fieldErrors.incidentCity ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                />
                {fieldErrors.incidentCity && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.incidentCity}</p>
                )}
              </div>

              {/* State */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <select
                  value={incidentState}
                  onChange={(e) => setIncidentState(e.target.value)}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                    text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${fieldErrors.incidentState ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                >
                  {usStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {fieldErrors.incidentState && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.incidentState}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={incidentZip}
                  onChange={(e) => setIncidentZip(e.target.value)}
                  placeholder="85001"
                  maxLength={10}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${fieldErrors.incidentZip ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                />
                {fieldErrors.incidentZip && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.incidentZip}</p>
                )}
              </div>
            </div>

            {/* Location Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Location Details <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                rows={2}
                placeholder="e.g., Intersection of Main St and 1st Ave, parking lot near entrance, highway mile marker 47..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Provide landmarks, intersections, or other details that help pinpoint the exact location
              </p>
            </div>
          </div>

        {/* ===== FNOL SECTIONS (INDEPENDENT WITH OWN GRADIENTS) ===== */}
        <div className="pt-2">
          <VehicleConditionSection
            odometerAtIncident={odometerAtIncident}
            setOdometerAtIncident={setOdometerAtIncident}
            vehicleDrivable={vehicleDrivable}
            setVehicleDrivable={setVehicleDrivable}
            vehicleLocation={vehicleLocation}
            setVehicleLocation={setVehicleLocation}
            errors={fieldErrors}
            disabled={isSubmitting || submitSuccess}
          />
        </div>

        <div className="pt-2">
          <IncidentConditionsSection
            weatherConditions={weatherConditions}
            setWeatherConditions={setWeatherConditions}
            weatherDescription={weatherDescription}
            setWeatherDescription={setWeatherDescription}
            roadConditions={roadConditions}
            setRoadConditions={setRoadConditions}
            roadDescription={roadDescription}
            setRoadDescription={setRoadDescription}
            estimatedSpeed={estimatedSpeed}
            setEstimatedSpeed={setEstimatedSpeed}
            trafficConditions={trafficConditions}
            setTrafficConditions={setTrafficConditions}
            errors={fieldErrors}
            disabled={isSubmitting || submitSuccess}
          />
        </div>

        <div className="pt-2">
          <PoliceReportSection
            wasPoliceContacted={wasPoliceContacted}
            setWasPoliceContacted={setWasPoliceContacted}
            policeDepartment={policeDepartment}
            setPoliceDepartment={setPoliceDepartment}
            officerName={officerName}
            setOfficerName={setOfficerName}
            officerBadge={officerBadge}
            setOfficerBadge={setOfficerBadge}
            policeReportNumber={policeReportNumber}
            setPoliceReportNumber={setPoliceReportNumber}
            policeReportFiled={policeReportFiled}
            setPoliceReportFiled={setPoliceReportFiled}
            policeReportDate={policeReportDate}
            setPoliceReportDate={setPoliceReportDate}
            errors={fieldErrors}
            disabled={isSubmitting || submitSuccess}
          />
        </div>

        <div className="pt-2">
          <WitnessSection
            witnesses={witnesses}
            setWitnesses={setWitnesses}
            disabled={isSubmitting || submitSuccess}
          />
        </div>

        <div className="pt-2">
          <OtherPartySection
            otherPartyInvolved={otherPartyInvolved}
            setOtherPartyInvolved={setOtherPartyInvolved}
            otherPartyDriverName={otherPartyDriverName}
            setOtherPartyDriverName={setOtherPartyDriverName}
            otherPartyDriverPhone={otherPartyDriverPhone}
            setOtherPartyDriverPhone={setOtherPartyDriverPhone}
            otherPartyDriverLicense={otherPartyDriverLicense}
            setOtherPartyDriverLicense={setOtherPartyDriverLicense}
            otherPartyDriverLicenseState={otherPartyDriverLicenseState}
            setOtherPartyDriverLicenseState={setOtherPartyDriverLicenseState}
            otherPartyVehicleYear={otherPartyVehicleYear}
            setOtherPartyVehicleYear={setOtherPartyVehicleYear}
            otherPartyVehicleMake={otherPartyVehicleMake}
            setOtherPartyVehicleMake={setOtherPartyVehicleMake}
            otherPartyVehicleModel={otherPartyVehicleModel}
            setOtherPartyVehicleModel={setOtherPartyVehicleModel}
            otherPartyVehiclePlate={otherPartyVehiclePlate}
            setOtherPartyVehiclePlate={setOtherPartyVehiclePlate}
            otherPartyVehicleVin={otherPartyVehicleVin}
            setOtherPartyVehicleVin={setOtherPartyVehicleVin}
            otherPartyInsuranceCarrier={otherPartyInsuranceCarrier}
            setOtherPartyInsuranceCarrier={setOtherPartyInsuranceCarrier}
            otherPartyInsurancePolicy={otherPartyInsurancePolicy}
            setOtherPartyInsurancePolicy={setOtherPartyInsurancePolicy}
            usStates={usStates as any}
            disabled={isSubmitting || submitSuccess}
          />
        </div>

        <div className="pt-2">
          <InjurySection
            wereInjuries={wereInjuries}
            setWereInjuries={setWereInjuries}
            injuries={injuries}
            setInjuries={setInjuries}
            disabled={isSubmitting || submitSuccess}
          />
        </div>

        {/* Estimated Cost (Standalone) */}
        <div className="pt-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <IoCashOutline className="w-4 h-4" />
            Estimated Repair Cost (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
              min="0"
              max="100000"
              step="0.01"
              className={`
                w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${fieldErrors.estimatedCost ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
          </div>
          {fieldErrors.estimatedCost && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.estimatedCost}</p>
          )}
        </div>

        {/* Damage Photos (Standalone) */}
        <div className="pt-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <IoCloudUploadOutline className="w-4 h-4" />
            Damage Photos (Optional)
          </label>
          
          {/* Add photo URL */}
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={photoPreview}
              onChange={(e) => setPhotoPreview(e.target.value)}
              placeholder="Paste image URL (e.g., from Cloudinary)"
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={!photoPreview.trim() || isSubmitting || submitSuccess}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add
            </button>
          </div>

          {/* Photo list */}
          {damagePhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {damagePhotos.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg shadow-sm overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={url}
                      alt={`Damage ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    disabled={isSubmitting || submitSuccess}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Deactivation Notice (Information only - no checkbox) */}
        <div className="pt-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Vehicle Will Be Temporarily Deactivated
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  For safety and insurance compliance, your vehicle will be automatically taken offline when this claim is submitted. 
                  It will not accept new bookings until the claim is resolved and the vehicle is verified as safe to rent.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  <strong>Note:</strong> You can request reactivation through Fleet Admin once repairs are complete, or cancel the claim if filed in error.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || submitSuccess}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess || bookings.length === 0}
            className="flex-1 sm:flex-none px-6 py-3 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Claim...</span>
              </>
            ) : submitSuccess ? (
              <>
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                <span>Submitted!</span>
              </>
            ) : (
              <>
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                <span>Submit Claim</span>
              </>
            )}
          </button>
        </div>
      </fieldset>
    </form>
  )
}