// app/host/claims/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ClaimStatusBadge from '../components/ClaimStatusBadge'
import TripDocumentation from '@/app/components/claims/TripDocumentation'
import PhotoComparison from '@/app/components/claims/PhotoComparison'
import LossWageEligibility from '@/app/components/claims/LossWageEligibility'
import EditDescriptionModal from '@/app/components/claims/EditDescriptionModal'
import EditLocationModal from '@/app/components/claims/EditLocationModal'
import EditIncidentDetailsModal from '@/app/components/claims/EditIncidentDetailsModal'
import ServiceMetricsSummary from '@/app/components/host/ServiceMetricsSummary'
import ClaimESGSummary from '@/app/components/claims/ClaimESGSummary'
import {
  IoArrowBackOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoImageOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoLockClosedOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoBusinessOutline,
  IoPencilOutline,
  IoLocationOutline,
  IoHomeOutline,
  IoShieldOutline,
  IoSpeedometerOutline,
  IoCloudOutline,
  IoCallOutline,
  IoPeopleOutline,
  IoMedicalOutline,
} from 'react-icons/io5'

interface Witness {
  name: string
  phone: string
  email: string | null
  statement: string | null
}

interface OtherParty {
  driver: {
    name: string
    phone: string
    license: string | null
    licenseState: string | null
  }
  vehicle: {
    year: number | null
    make: string | null
    model: string | null
    plate: string | null
    vin: string | null
  }
  insurance: {
    carrier: string | null
    policy: string | null
  }
}

interface Injury {
  person: string
  description: string
  severity: string
  medicalAttention: boolean
  hospital: string | null
}

interface ClaimDamagePhoto {
  id: string
  url: string
  caption: string | null
  order: number
  uploadedBy: string
  uploadedAt: string
}

interface ClaimDetail {
  id: string
  type: string
  status: string
  description: string
  estimatedCost: number
  approvedAmount: number | null
  deductible: number
  incidentDate: string
  createdAt: string
  updatedAt: string
  reviewNotes: string | null
  reportedBy: string
  reviewedBy: string | null
  reviewedAt: string | null
  paidToHost: string | null
  paidAmount: number | null
  guestAtFault: boolean
  
  incidentAddress: string | null
  incidentCity: string | null
  incidentState: string | null
  incidentZip: string | null
  incidentDescription: string | null
  
  odometerAtIncident: number | null
  vehicleDrivable: boolean | null
  vehicleLocation: string | null
  weatherConditions: string | null
  weatherDescription: string | null
  roadConditions: string | null
  roadDescription: string | null
  estimatedSpeed: number | null
  trafficConditions: string | null
  wasPoliceContacted: boolean | null
  policeDepartment: string | null
  officerName: string | null
  officerBadge: string | null
  policeReportNumber: string | null
  policeReportFiled: boolean | null
  policeReportDate: string | null
  witnesses: Witness[]
  otherPartyInvolved: boolean | null
  otherParty: OtherParty | null
  wereInjuries: boolean | null
  injuries: Injury[]
  
  hostDamagePhotos: ClaimDamagePhoto[]
  guestDamagePhotos: ClaimDamagePhoto[]
  
  booking: {
    id: string
    bookingCode: string
    startDate: string
    endDate: string
    car: {
      id: string
      displayName: string
      fullDisplayName: string
      heroPhoto: string | null
      licensePlate: string
      vin: string | null
      color: string
      year: number
      make: string
      model: string
      isActive: boolean
      fnolDetails?: {
        registration: {
          registeredOwner: string | null
          estimatedValue: number | null
          currentMileage: number | null
          annualMileage: number | null
          primaryUse: string | null
        }
        garage: {
          address: string | null
          city: string | null
          state: string | null
          zipCode: string | null
          fullAddress: string | null
        }
        lien: {
          hasLien: boolean
          lienholderName: string | null
          lienholderAddress: string | null
        }
        safety: {
          hasAlarm: boolean
          hasTracking: boolean
          hasImmobilizer: boolean
        }
        modifications: {
          isModified: boolean
          description: string | null
        }
      }
    } | null
    guest: {
      name: string
      email: string
      phone?: string
    } | null
  }
  policy: {
    tier: string
    deductible: number
  }
  insuranceDetails?: {
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
  tripDocumentation?: {
    completion: {
      completedBy: string | null
      startedAt: string | null
      endedAt: string | null
      duration: string | null
      adminOverride: {
        adminId: string
        notes: string | null
        reason: string
      } | null
    }
    mileage: {
      start: number | null
      end: number | null
      driven: number | null
      allowance: number | null
      withinLimit: boolean | null
    }
    fuel: {
      start: string | null
      end: string | null
      percentUsed: number | null
    }
    location: {
      pickup: {
        lat: number | null
        lng: number | null
        address: string | null
      }
      return: {
        lat: number | null
        lng: number | null
        address: string | null
      }
    }
    photos: {
      preTrip: string[]
      postTrip: string[]
      preTripCount: number
      postTripCount: number
      detailed: Array<{
        id: string
        type: string
        category: string
        url: string
        uploadedAt: string
      }>
    }
    review: {
      id: string
      rating: number
      comment: string
      submittedAt: string
      breakdown: {
        cleanliness: number | null
        accuracy: number | null
        communication: number | null
        convenience: number | null
        value: number | null
      }
    } | null
    damage: {
      reported: boolean
      description: string | null
      photos: string[]
    }
  }
}

export default function ClaimDetailPage() {
  const router = useRouter()
  const params = useParams()
  const claimId = params.id as string

  const [claim, setClaim] = useState<ClaimDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [loadingInsurance, setLoadingInsurance] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditLocationModal, setShowEditLocationModal] = useState(false)
  const [showEditIncidentModal, setShowEditIncidentModal] = useState(false)

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails()
    }
  }, [claimId])

  const fetchClaimDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/claims/${claimId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch claim details')
      }

      const data = await response.json()
      setClaim(data.claim)

      if (data.claim.booking?.id) {
        fetchInsuranceDetails(data.claim.booking.id)
      }
    } catch (err: any) {
      console.error('Error fetching claim:', err)
      setError(err.message || 'Failed to load claim details')
    } finally {
      setLoading(false)
    }
  }

  const fetchInsuranceDetails = async (bookingId: string) => {
    try {
      setLoadingInsurance(true)
      const response = await fetch(`/api/host/bookings/${bookingId}/insurance`)
      if (response.ok) {
        const insuranceData = await response.json()
        setClaim(prev => prev ? { ...prev, insuranceDetails: insuranceData } : null)
      }
    } catch (error) {
      console.error('Error fetching insurance details:', error)
    } finally {
      setLoadingInsurance(false)
    }
  }

  const handleUploadDamagePhotos = async (files: File[]) => {
    setUploadingPhotos(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'ml_default')
        formData.append('folder', 'claim-damage-photos')

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/du1hjyrgm/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error('Failed to upload image to Cloudinary')
        }

        const data = await response.json()
        return data.secure_url
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      const response = await fetch(`/api/host/claims/${claimId}/add-photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: uploadedUrls }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update claim')
      }

      await fetchClaimDetails()
      
      alert(`Successfully uploaded ${uploadedUrls.length} photo(s)!`)
    } catch (error: any) {
      console.error('Upload error:', error)
      throw new Error(error.message || 'Failed to upload photos')
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handleCancelClaim = async () => {
    setCancelling(true)
    try {
      const response = await fetch(`/api/host/claims/${claimId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel claim')
      }

      router.push('/host/claims?cancelled=true')
    } catch (err: any) {
      console.error('Error cancelling claim:', err)
      alert(err.message || 'Failed to cancel claim')
    } finally {
      setCancelling(false)
      setShowCancelConfirm(false)
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A'
    return `$${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    
    return formatDateTime(dateString)
  }

  const getClaimTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ACCIDENT: 'Accident',
      THEFT: 'Theft',
      VANDALISM: 'Vandalism',
      CLEANING: 'Cleaning',
      MECHANICAL: 'Mechanical',
      WEATHER: 'Weather Damage',
      OTHER: 'Other'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm p-6 text-center">
            <IoAlertCircleOutline className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
            <p className="text-red-800 dark:text-red-300 mb-4">{error || 'Claim not found'}</p>
            <Link
              href="/host/claims"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              Back to Claims
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const canCancel = claim.status === 'PENDING'
  const vehicleDeactivated = claim.booking.car && !claim.booking.car.isActive
  const insuranceDetails = claim.insuranceDetails
  const hasIncidentLocation = claim.incidentAddress && claim.incidentCity && claim.incidentState && claim.incidentZip
  const fnolDetails = claim.booking.car?.fnolDetails
  
  const hasFnolData = claim.odometerAtIncident !== null || claim.weatherConditions || claim.wasPoliceContacted !== null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 w-full">
        <Link
          href="/host/claims"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
        >
          <IoArrowBackOutline className="w-4 h-4" />
          Back to Claims
        </Link>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {getClaimTypeLabel(claim.type)} Claim
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filed {formatDate(claim.createdAt)} • Booking {claim.booking.bookingCode}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ClaimStatusBadge status={claim.status as any} />
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <IoTrashOutline className="w-4 h-4" />
                  Cancel Claim
                </button>
              )}
            </div>
          </div>

          {vehicleDeactivated && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg shadow-sm p-4 flex items-start gap-3">
              <IoLockClosedOutline className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                  Vehicle Deactivated
                </h4>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  This vehicle is currently deactivated and not accepting new bookings during the claim review.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5" />
                  Incident Description
                </h3>
                
                {claim.status === 'PENDING' && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <IoPencilOutline className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {claim.description}
              </p>
              
              {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-2">
                  <IoPencilOutline className="w-3 h-3" />
                  Last edited {formatTimeAgo(claim.updatedAt)}
                </p>
              )}
            </div>

            {/* Incident Location */}
            {hasIncidentLocation && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <IoLocationOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Incident Location
                  </h3>
                  
                  {claim.status === 'PENDING' && (
                    <button
                      onClick={() => setShowEditLocationModal(true)}
                      className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <IoPencilOutline className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Street Address
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {claim.incidentAddress}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        City
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {claim.incidentCity}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        State
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {claim.incidentState}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        ZIP Code
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {claim.incidentZip}
                      </div>
                    </div>
                  </div>

                  {claim.incidentDescription && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Additional Location Details
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {claim.incidentDescription}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INCIDENT DETAILS SUMMARY (Host-Friendly) */}
            {hasFnolData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Incident Details
                  </h3>
                  {claim.status === 'PENDING' && (
                    <button
                      onClick={() => setShowEditIncidentModal(true)}
                      className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <IoPencilOutline className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Vehicle Condition */}
                  {(claim.odometerAtIncident !== null || claim.vehicleDrivable !== null) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Vehicle Condition at Time of Incident
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2 text-sm">
                        {claim.odometerAtIncident !== null && claim.odometerAtIncident !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Odometer Reading:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {claim.odometerAtIncident.toLocaleString()} miles
                            </span>
                          </div>
                        )}
                        {claim.vehicleDrivable !== null && claim.vehicleDrivable !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Vehicle Drivable:</span>
                            <span className={`font-medium ${claim.vehicleDrivable ? 'text-green-600' : 'text-red-600'}`}>
                              {claim.vehicleDrivable ? 'Yes' : 'No'}
                            </span>
                          </div>
                        )}
                        {claim.vehicleDrivable === false && claim.vehicleLocation && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Current Location:</span>
                            <p className="mt-1 text-gray-900 dark:text-white">{claim.vehicleLocation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Incident Conditions */}
                  {claim.weatherConditions && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Conditions During Incident
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Weather:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{claim.weatherConditions}</p>
                          </div>
                          {claim.roadConditions && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Road Conditions:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{claim.roadConditions}</p>
                            </div>
                          )}
                          {claim.estimatedSpeed !== null && claim.estimatedSpeed !== undefined && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Estimated Speed:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{claim.estimatedSpeed} mph</p>
                            </div>
                          )}
                          {claim.trafficConditions && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Traffic:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{claim.trafficConditions}</p>
                            </div>
                          )}
                        </div>
                        {(claim.weatherDescription || claim.roadDescription) && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600 space-y-2">
                            {claim.weatherDescription && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Weather Details:</span>
                                <p className="mt-1 text-gray-900 dark:text-white">{claim.weatherDescription}</p>
                              </div>
                            )}
                            {claim.roadDescription && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Road Details:</span>
                                <p className="mt-1 text-gray-900 dark:text-white">{claim.roadDescription}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Police Report */}
                  {claim.wasPoliceContacted !== null && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Police Report
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                        {claim.wasPoliceContacted ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                              <IoCheckmarkCircleOutline className="w-4 h-4" />
                              Police were contacted
                            </div>
                            {claim.policeDepartment && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Department:</span>
                                <span className="text-gray-900 dark:text-white">{claim.policeDepartment}</span>
                              </div>
                            )}
                            {claim.officerName && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Officer:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {claim.officerName}
                                  {claim.officerBadge && ` (Badge #${claim.officerBadge})`}
                                </span>
                              </div>
                            )}
                            {claim.policeReportNumber && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Report Number:</span>
                                <span className="font-mono text-gray-900 dark:text-white">{claim.policeReportNumber}</span>
                              </div>
                            )}
                            {claim.policeReportDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Report Date:</span>
                                <span className="text-gray-900 dark:text-white">{formatDate(claim.policeReportDate)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Report Filed:</span>
                              <span className={`font-medium ${claim.policeReportFiled ? 'text-green-600' : 'text-yellow-600'}`}>
                                {claim.policeReportFiled ? 'Yes' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <IoCloseCircleOutline className="w-4 h-4" />
                            Police were not contacted
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Witnesses */}
                  {claim.witnesses && claim.witnesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Witnesses ({claim.witnesses.length})
                      </h4>
                      <div className="space-y-2">
                        {claim.witnesses.map((witness, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                              {witness.name}
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                <span className="text-gray-900 dark:text-white">{witness.phone}</span>
                              </div>
                              {witness.email && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                  <span className="text-gray-900 dark:text-white">{witness.email}</span>
                                </div>
                              )}
                              {witness.statement && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                  <span className="text-gray-600 dark:text-gray-400">Statement:</span>
                                  <p className="mt-1 text-gray-900 dark:text-white">{witness.statement}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Party */}
                  {claim.otherPartyInvolved && claim.otherParty && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Other Party Information
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-3 text-sm">
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Driver</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Name:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{claim.otherParty.driver.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                              <span className="text-gray-900 dark:text-white">{claim.otherParty.driver.phone}</span>
                            </div>
                            {claim.otherParty.driver.license && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">License:</span>
                                <span className="font-mono text-gray-900 dark:text-white">
                                  {claim.otherParty.driver.license}
                                  {claim.otherParty.driver.licenseState && ` (${claim.otherParty.driver.licenseState})`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {(claim.otherParty.vehicle.make || claim.otherParty.vehicle.plate) && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle</div>
                            <div className="space-y-1">
                              {claim.otherParty.vehicle.year && claim.otherParty.vehicle.make && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
                                  <span className="text-gray-900 dark:text-white">
                                    {claim.otherParty.vehicle.year} {claim.otherParty.vehicle.make} {claim.otherParty.vehicle.model}
                                  </span>
                                </div>
                              )}
                              {claim.otherParty.vehicle.plate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">License Plate:</span>
                                  <span className="font-mono text-gray-900 dark:text-white">{claim.otherParty.vehicle.plate}</span>
                                </div>
                              )}
                              {claim.otherParty.vehicle.vin && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">VIN:</span>
                                  <span className="font-mono text-xs text-gray-900 dark:text-white">{claim.otherParty.vehicle.vin}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {claim.otherParty.insurance.carrier && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Insurance</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Carrier:</span>
                                <span className="text-gray-900 dark:text-white">{claim.otherParty.insurance.carrier}</span>
                              </div>
                              {claim.otherParty.insurance.policy && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Policy Number:</span>
                                  <span className="font-mono text-gray-900 dark:text-white">{claim.otherParty.insurance.policy}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Injuries */}
                  {claim.wereInjuries && claim.injuries && claim.injuries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Injuries Reported ({claim.injuries.length})
                      </h4>
                      <div className="space-y-2">
                        {claim.injuries.map((injury, index) => (
                          <div key={index} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm border border-red-100 dark:border-red-800">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {injury.person}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                injury.severity === 'SEVERE' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                  : injury.severity === 'MODERATE'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                              }`}>
                                {injury.severity}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {injury.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Medical Attention:</span>
                                <span className={`ml-2 font-medium ${injury.medicalAttention ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                  {injury.medicalAttention ? 'Yes' : 'No'}
                                </span>
                              </div>
                              {injury.medicalAttention && injury.hospital && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Hospital:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white">
                                    {injury.hospital}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trip Documentation */}
            {claim.tripDocumentation && (
              <TripDocumentation 
                tripDocumentation={claim.tripDocumentation}
                showAdminControls={false}
              />
            )}
            
            {/* Photo Comparison */}
            {claim.tripDocumentation && (
              <PhotoComparison
                preTripPhotos={claim.tripDocumentation.photos.preTrip}
                postTripPhotos={claim.tripDocumentation.photos.postTrip}
                hostDamagePhotos={claim.hostDamagePhotos}
                guestDamagePhotos={claim.guestDamagePhotos}
                onUploadHostPhotos={handleUploadDamagePhotos}
                isUploading={uploadingPhotos}
              />
            )}

            {/* Review Notes */}
            {claim.reviewNotes && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Review Notes
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">
                  {claim.reviewNotes}
                </p>
                {claim.reviewedAt && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Reviewed {formatDateTime(claim.reviewedAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vehicle Info with FNOL Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoCarOutline className="w-4 h-4" />
                Vehicle Information
              </h3>
              {claim.booking.car && (
                <>
                  {claim.booking.car.heroPhoto && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 relative">
                      <Image
                        src={claim.booking.car.heroPhoto}
                        alt={claim.booking.car.displayName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm mb-3">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {claim.booking.car.fullDisplayName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">License Plate:</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {claim.booking.car.licensePlate}
                      </span>
                    </div>
                    {claim.booking.car.vin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">VIN:</span>
                        <span className="font-mono text-xs text-gray-900 dark:text-white">
                          {claim.booking.car.vin}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* FNOL Vehicle Details */}
                  {fnolDetails && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                          <IoShieldOutline className="w-3 h-3" />
                          Insurance & Registration
                        </h4>
                        <div className="space-y-2 text-xs">
                          {fnolDetails.registration.registeredOwner && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Registered Owner:</span>
                              <span className="text-gray-900 dark:text-white">
                                {fnolDetails.registration.registeredOwner}
                              </span>
                            </div>
                          )}
                          {fnolDetails.registration.estimatedValue && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Est. Value:</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatCurrency(fnolDetails.registration.estimatedValue)}
                              </span>
                            </div>
                          )}
                          {fnolDetails.registration.currentMileage && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Current Mileage:</span>
                              <span className="text-gray-900 dark:text-white">
                                {fnolDetails.registration.currentMileage.toLocaleString()} mi
                              </span>
                            </div>
                          )}
                          {fnolDetails.registration.primaryUse && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Primary Use:</span>
                              <span className="text-gray-900 dark:text-white">
                                {fnolDetails.registration.primaryUse}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {fnolDetails.garage.fullAddress && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                            <IoHomeOutline className="w-3 h-3" />
                            Garage Location
                          </h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {fnolDetails.garage.fullAddress}
                          </p>
                        </div>
                      )}

                      {fnolDetails.lien.hasLien && fnolDetails.lien.lienholderName && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                            Lienholder
                          </h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {fnolDetails.lien.lienholderName}
                          </p>
                          {fnolDetails.lien.lienholderAddress && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {fnolDetails.lien.lienholderAddress}
                            </p>
                          )}
                        </div>
                      )}

                      {(fnolDetails.safety.hasAlarm || fnolDetails.safety.hasTracking || fnolDetails.safety.hasImmobilizer) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                            Safety Features
                          </h4>
                          <div className="space-y-1 text-xs">
                            {fnolDetails.safety.hasAlarm && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <IoCheckmarkCircleOutline className="w-3 h-3" />
                                <span>Car Alarm</span>
                              </div>
                            )}
                            {fnolDetails.safety.hasTracking && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <IoCheckmarkCircleOutline className="w-3 h-3" />
                                <span>GPS Tracking</span>
                              </div>
                            )}
                            {fnolDetails.safety.hasImmobilizer && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <IoCheckmarkCircleOutline className="w-3 h-3" />
                                <span>Engine Immobilizer</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {fnolDetails.modifications.isModified && fnolDetails.modifications.description && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                            Modifications
                          </h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {fnolDetails.modifications.description}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <Link
                    href={`/host/cars/${claim.booking.car.id}/edit`}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline inline-block"
                  >
                    View Vehicle →
                  </Link>
                </>
              )}
            </div>

            {/* SERVICE METRICS SUMMARY */}
            {claim.booking.car && (
              <ServiceMetricsSummary carId={claim.booking.car.id} />
            )}

            {/* ESG SUMMARY */}
            {claim.booking.car && (
              <ClaimESGSummary hostId={claim.reportedBy} />
            )}

            {/* Guest Info */}
            {claim.booking.guest && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoPersonOutline className="w-4 h-4" />
                  Guest
                </h3>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {claim.booking.guest.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {claim.booking.guest.email}
                </p>
                {claim.booking.guest.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {claim.booking.guest.phone}
                  </p>
                )}
              </div>
            )}

            {/* Financial Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoCashOutline className="w-4 h-4" />
                Financial Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(claim.estimatedCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Deductible</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(claim.deductible)}
                  </span>
                </div>
                {claim.approvedAmount !== null && (
                  <>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Approved Amount</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(claim.approvedAmount)}
                      </span>
                    </div>
                  </>
                )}
                {claim.paidAmount !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Paid to Host</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(claim.paidAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Loss Wage Eligibility */}
            <LossWageEligibility claimId={claimId} />

            {/* Insurance Coverage Details - FIXED VERSION */}
            {loadingInsurance ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ) : insuranceDetails && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-sm border-2 border-blue-200 dark:border-blue-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Insurance Coverage Summary
                </h3>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs mb-0.5">
                        PRIMARY: {insuranceDetails.insuranceHierarchy.primary.type === 'HOST_COMMERCIAL' ? 'Host Commercial Insurance' :
                                 insuranceDetails.insuranceHierarchy.primary.type === 'HOST_P2P' ? 'Host P2P Insurance' : 
                                 'Platform Insurance'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs">
                        {insuranceDetails.insuranceHierarchy.primary.provider}
                        {insuranceDetails.insuranceHierarchy.primary.policyNumber && 
                          ` • Policy: ${insuranceDetails.insuranceHierarchy.primary.policyNumber}`}
                      </div>
                      {insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' && (
                        <div className="mt-1 text-xs text-green-700 dark:text-green-400 font-medium">
                          ✓ This insurance handles the claim first
                        </div>
                      )}
                    </div>
                  </div>

                  {insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' && (
                    <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-xs mb-0.5">
                          BACKUP: Platform Insurance ({insuranceDetails.insuranceHierarchy.secondary.tier})
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                          {insuranceDetails.insuranceHierarchy.secondary.provider}
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Liability:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              ${insuranceDetails.insuranceHierarchy.secondary.coverage.liability.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Collision:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              ${insuranceDetails.insuranceHierarchy.secondary.coverage.collision.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Deductible:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              ${insuranceDetails.insuranceHierarchy.secondary.coverage.deductible.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Premium:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              ${insuranceDetails.insuranceHierarchy.secondary.premium.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Only applies if primary insurance denies the claim
                        </div>
                      </div>
                    </div>
                  )}

                  {insuranceDetails.insuranceHierarchy.tertiary && (
                    <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-xs mb-0.5 flex items-center gap-1">
                          GUEST: Personal Insurance
                          {insuranceDetails.insuranceHierarchy.tertiary.verified && (
                            <IoCheckmarkCircleOutline className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs">
                          {insuranceDetails.insuranceHierarchy.tertiary.provider}
                        </div>
                        <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                          {insuranceDetails.insuranceHierarchy.tertiary.depositReduction} deposit reduction applied
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg mb-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Deposit Held</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      ${insuranceDetails.deductibleDetails.depositHeld.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Guest Owes</div>
                    <div className="text-sm font-bold text-red-600 dark:text-red-400">
                      ${insuranceDetails.deductibleDetails.guestResponsibility.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Deductible</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      ${insuranceDetails.deductibleDetails.primaryDeductible.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Your Tier</div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {insuranceDetails.hostEarnings.tier} ({insuranceDetails.hostEarnings.percentage}%)
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {insuranceDetails.insuranceHierarchy.primary.type !== 'PLATFORM' ? (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-1.5">
                        <IoInformationCircleOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                          <span className="font-semibold">Host Insurance Primary:</span> As a {insuranceDetails.hostEarnings.tier} tier host
                          {insuranceDetails.hostEarnings.tier === 'PREMIUM' && ' with commercial insurance'}, 
                          your insurance handles this claim first. 
                          {insuranceDetails.hostEarnings.tier === 'PREMIUM' ? (
                            <> Your commercial insurance deductible applies to this claim.</>
                          ) : insuranceDetails.hostEarnings.tier === 'STANDARD' ? (
                            <> Your P2P insurance deductible applies. The guest's deposit of ${insuranceDetails.deductibleDetails.depositHeld.toLocaleString()} may help cover deductible costs.</>
                          ) : (
                            <> The guest's deposit helps cover deductible costs.</>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-1.5">
                        <IoInformationCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          <span className="font-semibold">Platform Insurance Primary:</span> As a {insuranceDetails.hostEarnings.tier} tier host
                          {insuranceDetails.hostEarnings.tier === 'BASIC' && ' without active personal insurance'}, 
                          platform insurance handles this claim. Deductible is ${insuranceDetails.deductibleDetails.primaryDeductible.toLocaleString()}.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start gap-1.5">
                      <IoBusinessOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Earnings Impact:</span> You earn {insuranceDetails.hostEarnings.percentage}% 
                        of booking revenue as a {insuranceDetails.hostEarnings.tier} tier host. 
                        {insuranceDetails.hostEarnings.tier === 'PREMIUM' && 'Your commercial insurance provides maximum earnings.'}
                        {insuranceDetails.hostEarnings.tier === 'STANDARD' && 'Your P2P insurance provides enhanced earnings.'}
                        {insuranceDetails.hostEarnings.tier === 'BASIC' && 'Platform insurance provides base earnings.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <IoTimeOutline className="w-4 h-4" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Incident Date
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(claim.incidentDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Claim Filed
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDateTime(claim.createdAt)}
                    </p>
                  </div>
                </div>
                {claim.reviewedAt && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Reviewed
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDateTime(claim.reviewedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {claim.paidToHost && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Paid to Host
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDateTime(claim.paidToHost)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Description Modal */}
      <EditDescriptionModal
        claimId={claimId}
        currentDescription={claim.description}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchClaimDetails}
      />

      {/* Edit Location Modal */}
      {hasIncidentLocation && (
        <EditLocationModal
          claimId={claimId}
          currentLocation={{
            address: claim.incidentAddress!,
            city: claim.incidentCity!,
            state: claim.incidentState!,
            zipCode: claim.incidentZip!,
            description: claim.incidentDescription,
          }}
          isOpen={showEditLocationModal}
          onClose={() => setShowEditLocationModal(false)}
          onSuccess={fetchClaimDetails}
        />
      )}

      {/* Edit Incident Details Modal */}
      {hasFnolData && (
        <EditIncidentDetailsModal
          claimId={claimId}
          currentData={{
            odometerAtIncident: claim.odometerAtIncident,
            vehicleDrivable: claim.vehicleDrivable,
            vehicleLocation: claim.vehicleLocation,
            weatherConditions: claim.weatherConditions,
            weatherDescription: claim.weatherDescription,
            roadConditions: claim.roadConditions,
            roadDescription: claim.roadDescription,
            estimatedSpeed: claim.estimatedSpeed,
            trafficConditions: claim.trafficConditions,
            wasPoliceContacted: claim.wasPoliceContacted,
            policeDepartment: claim.policeDepartment,
            officerName: claim.officerName,
            officerBadge: claim.officerBadge,
            policeReportNumber: claim.policeReportNumber,
            policeReportFiled: claim.policeReportFiled,
            policeReportDate: claim.policeReportDate,
            witnesses: claim.witnesses || [],
            otherPartyInvolved: claim.otherPartyInvolved,
            otherParty: claim.otherParty,
            wereInjuries: claim.wereInjuries,
            injuries: claim.injuries || [],
          }}
          isOpen={showEditIncidentModal}
          onClose={() => setShowEditIncidentModal(false)}
          onSuccess={() => {
            setShowEditIncidentModal(false)
            fetchClaimDetails()
          }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <IoWarningOutline className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Cancel Claim?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to cancel this claim? This action cannot be undone.
                  {vehicleDeactivated && ' The vehicle will be reactivated.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
              >
                Keep Claim
              </button>
              <button
                onClick={handleCancelClaim}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <IoTrashOutline className="w-4 h-4" />
                    Yes, Cancel Claim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}