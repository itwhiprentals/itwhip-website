// app/fleet/claims/[id]/page.tsx
'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
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
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoBusinessOutline,
  IoDownloadOutline,
  IoSendOutline,
  IoEyeOutline,
  IoCloudUploadOutline,
} from 'react-icons/io5'

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface ClaimErrorBoundaryProps {
  children: React.ReactNode
}

interface ClaimErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ClaimErrorBoundary extends React.Component<
  ClaimErrorBoundaryProps,
  ClaimErrorBoundaryState
> {
  constructor(props: ClaimErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Claim page error:', error, errorInfo)
    toast.error('Something went wrong loading the claim details')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <IoAlertCircleOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unable to Load Claim
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
            <Link
              href="/fleet/claims"
              className="block mt-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Claims
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


// ============================================================================
// HELPER FUNCTION: Optimize Cloudinary Images
// ============================================================================
const optimizeImageUrl = (url: string, width: number = 400, quality: number = 80): string => {
  if (!url) return url
  
  // If it's a Cloudinary URL, add transformations
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`
    }
  }
  
  return url
}

// ============================================================================
// MAIN COMPONENT INTERFACES
// ============================================================================
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
  damagePhotos: any
  reportedBy: string
  reviewedBy: string | null
  reviewedAt: string | null
  paidToHost: string | null
  paidAmount: number | null
  guestAtFault: boolean
  
  // New insurance routing fields
  primaryParty: string | null
  severity: string | null
  guestRespondedAt: string | null
  lockedCarState: string | null
  submittedToInsurerAt: string | null
  insurerClaimId: string | null
  insurerStatus: string | null
  insurerPaidAt: string | null
  insurerPaidAmount: number | null
  insurerDenialReason: string | null
  
  // Guest response fields
  guestResponseText: string | null
  guestResponseDate: string | null
  guestResponseDeadline: string | null
  guestResponsePhotos: any
  accountHoldApplied: boolean
  
  // Vehicle deactivation
  vehicleDeactivated: boolean
  vehicleReactivatedAt: string | null
  vehicleReactivatedBy: string | null
  
  // Activity tracking
  activityLog: any
  statusHistory: any
  
  booking: {
    id: string
    bookingCode: string
    startDate: string
    endDate: string
    guestName: string | null
    guestEmail: string | null
    depositHeld: number
    insuranceSelection: string | null
    insuranceProvider: string | null
    policySnapshot: any
  }
  
  policy: {
    id: string
    tier: string
    deductible: number
    liabilityCoverage: number
    collisionCoverage: number
    policyNumber: string | null
    policySource: string | null
    boundViaApi: boolean
    externalPolicyId: string | null
    primaryParty: string | null
    hostTier: string | null
    provider: {
      id: string
      name: string
      type: string
      contactEmail?: string | null
      contactPhone?: string | null
    }
  }
  
  host: {
    id: string
    name: string
    email: string
    phone: string
    earningsTier: string
    p2pInsuranceActive: boolean
    commercialInsuranceActive: boolean
  }
  
  insuranceHierarchy: Array<{
    level: string
    type: string
    provider: string
    policyNumber?: string
    deductible: number
    coverage: string
  }>
  
  financialBreakdown: {
    estimatedCost: number
    approvedAmount: number
    deductible: number
    depositHeld: number
    hostEarningsPercent: number
    hostPayout: number
    platformFee: number
    guestResponsibility: number
  }
  
  vehicleInfo: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
    photo: string | null
    hasActiveClaim: boolean
    claimLockUntil: string | null
    safetyHold: boolean
  }
  
  guestInfo: {
    id?: string
    name: string
    email: string
    location?: string
    accountOnHold: boolean
    hasInsurance: boolean
    insuranceProvider: string | null
    insuranceVerified: boolean
  }
  
  messages: Array<{
    id: string
    senderId: string
    senderType: string
    senderName: string | null
    message: string
    createdAt: string
  }>
}

function FleetClaimDetailPageContent() {
  const router = useRouter()
  const params = useParams()
  const claimId = params.id as string

  const [claim, setClaim] = useState<ClaimDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Approve/Deny modal states
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showDenyModal, setShowDenyModal] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [denialReason, setDenialReason] = useState('')
  const [processing, setProcessing] = useState(false)
  
  // Photo viewer
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  
  // FNOL submission
  const [submittingToInsurer, setSubmittingToInsurer] = useState(false)

  useEffect(() => {
    fetchClaimDetails()
  }, [claimId])

  const fetchClaimDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/fleet/claims/${claimId}?key=phoenix-fleet-2847`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch claim: ${response.statusText}`)
      }
      
      const data = await response.json()
      setClaim(data)
      setApprovedAmount(data.estimatedCost.toString())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load claim details'
      console.error('Error fetching claim:', err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approvedAmount || parseFloat(approvedAmount) <= 0) {
      toast.error('Please enter a valid approved amount')
      return
    }

    const toastId = toast.loading('Approving claim...')

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/claims/${claimId}/approve?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedAmount: parseFloat(approvedAmount),
          reviewNotes,
          reviewedBy: 'fleet-admin@itwhip.com', // TODO: Get from auth
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve claim')
      }

      toast.success('Claim approved successfully! Guest account placed on hold.', { id: toastId })
      setShowApproveModal(false)
      setReviewNotes('')
      await fetchClaimDetails()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve claim'
      console.error('Error approving claim:', err)
      toast.error(errorMessage, { id: toastId })
    } finally {
      setProcessing(false)
    }
  }

  const handleDeny = async () => {
    if (!denialReason.trim()) {
      toast.error('Please provide a denial reason')
      return
    }

    const toastId = toast.loading('Denying claim...')

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/claims/${claimId}/deny?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewNotes,
          denialReason,
          reviewedBy: 'fleet-admin@itwhip.com', // TODO: Get from auth
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deny claim')
      }

      toast.success('Claim denied successfully. Vehicle reactivated.', { id: toastId })
      setShowDenyModal(false)
      setDenialReason('')
      setReviewNotes('')
      await fetchClaimDetails()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deny claim'
      console.error('Error denying claim:', err)
      toast.error(errorMessage, { id: toastId })
    } finally {
      setProcessing(false)
    }
  }

  const handleExportPDF = async () => {
    const toastId = toast.loading('Generating PDF...')
  
    try {
      const response = await fetch(`/api/fleet/claims/${claimId}/export?key=phoenix-fleet-2847`)
  
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
  
      // Get the PDF blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `claim-${claimId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
  
      toast.success('PDF downloaded successfully!', { id: toastId })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF'
      console.error('Error exporting PDF:', err)
      toast.error(errorMessage, { id: toastId })
    }
  }

  const handleSubmitToInsurer = async () => {
    if (!claim?.policy?.provider) {
      toast.error('No insurance provider found for this claim')
      return
    }

    const providerName = claim.policy.provider.name
    
    if (!confirm(`Submit this claim to ${providerName}? This will initiate the FNOL (First Notice of Loss) process.`)) {
      return
    }

    const toastId = toast.loading(`Submitting to ${providerName}...`)

    try {
      setSubmittingToInsurer(true)
      
      const response = await fetch(`/api/fleet/claims/${claimId}/submit-fnol?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedBy: 'fleet-admin@itwhip.com' // TODO: Get from auth
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit claim to insurer')
      }

      toast.success(
        `Claim successfully submitted to ${providerName}! Insurer Claim ID: ${data.details.insurerClaimId}`,
        { id: toastId, duration: 6000 }
      )
      
      // Refresh claim data
      await fetchClaimDetails()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit claim to insurer'
      console.error('Error submitting to insurer:', err)
      toast.error(errorMessage, { id: toastId })
    } finally {
      setSubmittingToInsurer(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading claim details...</p>
        </div>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoAlertCircleOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Claim
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchClaimDetails()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3"
          >
            Try Again
          </button>
          <Link
            href="/fleet/claims"
            className="block text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Claims
          </Link>
        </div>
      </div>
    )
  }

  const damagePhotosArray = claim.damagePhotos 
    ? (Array.isArray(claim.damagePhotos) ? claim.damagePhotos : [claim.damagePhotos])
    : []

  const daysOpen = Math.floor(
    (new Date().getTime() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  const hoursUntilGuestDeadline = claim.guestResponseDeadline
    ? Math.floor(
        (new Date(claim.guestResponseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60)
      )
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/fleet/claims"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Back to claims list"
              >
                <IoArrowBackOutline className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Claim #{claim.id.slice(0, 8)}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Booking: {claim.booking.bookingCode}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                aria-label="Export claim as PDF"
              >
                <IoDownloadOutline className="w-5 h-5" aria-hidden="true" />
                <span>Export PDF</span>
              </button>
              
              {/* Submit to Insurer Button */}
              {claim.status === 'APPROVED' && claim.policy?.provider && (
                <>
                  {!claim.submittedToInsurerAt ? (
                    <button
                      onClick={handleSubmitToInsurer}
                      disabled={submittingToInsurer}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      aria-label={`Submit claim to ${claim.policy.provider.name}`}
                    >
                      {submittingToInsurer ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <IoSendOutline className="w-5 h-5" aria-hidden="true" />
                          <span>Submit to {claim.policy.provider.name}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg flex items-center space-x-2">
                      <IoCheckmarkCircleOutline className="w-5 h-5" />
                      <span>Submitted to {claim.policy.provider.name}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Claim Overview */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" aria-labelledby="claim-overview-heading">
              <div className="flex items-center justify-between mb-6">
                <h2 id="claim-overview-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Claim Overview
                </h2>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    claim.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    claim.status === 'DENIED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                  role="status"
                  aria-label={`Claim status: ${claim.status}`}
                >
                  {claim.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {claim.type.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Severity</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {claim.severity || 'Not Set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Incident Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    <time dateTime={claim.incidentDate}>
                      {new Date(claim.incidentDate).toLocaleDateString()}
                    </time>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Filed Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    <time dateTime={claim.createdAt}>
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </time>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reported By</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {claim.reportedBy}
                  </p>
                </div>
                {claim.reviewedBy && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed By</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {claim.reviewedBy}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                <p className="text-gray-900 dark:text-white">{claim.description}</p>
              </div>

              {claim.reviewNotes && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Review Notes</p>
                  <p className="text-gray-900 dark:text-white">{claim.reviewNotes}</p>
                </div>
              )}
            </section>

            {/* Vehicle Information */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" aria-labelledby="vehicle-info-heading">
              <h2 id="vehicle-info-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <IoCarOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                Vehicle Information
              </h2>

              <div className="flex items-start space-x-4">
                {claim.vehicleInfo.photo && (
                  <div className="flex-shrink-0">
                    <Image
                      src={optimizeImageUrl(claim.vehicleInfo.photo, 120)}
                      alt={`${claim.vehicleInfo.year} ${claim.vehicleInfo.make} ${claim.vehicleInfo.model}`}
                      width={120}
                      height={80}
                      className="rounded-lg object-cover"
                      loading="lazy"
                      quality={80}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {claim.vehicleInfo.year} {claim.vehicleInfo.make} {claim.vehicleInfo.model}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    License Plate: {claim.vehicleInfo.licensePlate}
                  </p>
                  
                  <div className="mt-3 flex items-center space-x-3">
                    {claim.vehicleInfo.hasActiveClaim && (
                      <span 
                        className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium flex items-center"
                        role="status"
                        aria-label="Vehicle is locked due to active claim"
                      >
                        <IoLockClosedOutline className="w-3 h-3 mr-1" aria-hidden="true" />
                        Claim Locked
                      </span>
                    )}
                    {claim.vehicleInfo.safetyHold && (
                      <span 
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs font-medium flex items-center"
                        role="status"
                        aria-label="Vehicle is under safety hold"
                      >
                        <IoWarningOutline className="w-3 h-3 mr-1" aria-hidden="true" />
                        Safety Hold
                      </span>
                    )}
                  </div>

                  {claim.vehicleInfo.claimLockUntil && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Locked until: <time dateTime={claim.vehicleInfo.claimLockUntil}>
                        {new Date(claim.vehicleInfo.claimLockUntil).toLocaleDateString()}
                      </time>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Insurance Hierarchy */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" aria-labelledby="insurance-hierarchy-heading">
              <h2 id="insurance-hierarchy-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <IoShieldCheckmarkOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                Insurance Coverage Hierarchy
              </h2>

              <div className="space-y-4" role="list">
                {claim.insuranceHierarchy.map((insurance, index) => (
                  <div
                    key={index}
                    className={`border-l-4 pl-4 py-3 ${
                      insurance.level === 'PRIMARY' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      insurance.level === 'SECONDARY' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                      'border-gray-400 bg-gray-50 dark:bg-gray-700/20'
                    }`}
                    role="listitem"
                    aria-label={`${insurance.level} insurance: ${insurance.provider}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {insurance.level}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {insurance.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {insurance.provider}
                    </p>
                    {insurance.policyNumber && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Policy: {insurance.policyNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Deductible: ${insurance.deductible.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {insurance.coverage}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Insurance Provider Information */}
            {claim.policy?.provider && (
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" aria-labelledby="provider-info-heading">
                <h2 id="provider-info-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <IoBusinessOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                  Insurance Provider
                </h2>

                <div className="space-y-4">
                  {/* Provider Name & Status */}
                  <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {claim.policy.provider.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          claim.policy.provider.type === 'EMBEDDED'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                        }`}>
                          {claim.policy.provider.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Primary insurer for this claim
                      </p>
                    </div>
                    <Link
                      href={`/fleet/insurance/providers/${claim.policy.provider.id}?key=phoenix-fleet-2847`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <IoBusinessOutline className="w-4 h-4" />
                      <span>View Provider</span>
                    </Link>
                  </div>

                  {/* FNOL Submission Status */}
                  {claim.submittedToInsurerAt && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                            FNOL Submitted Successfully
                          </h4>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <dt className="text-blue-700 dark:text-blue-300 mb-1">Submitted At</dt>
                              <dd className="font-medium text-blue-900 dark:text-blue-100">
                                {new Date(claim.submittedToInsurerAt).toLocaleString()}
                              </dd>
                            </div>
                            {claim.insurerClaimId && (
                              <div>
                                <dt className="text-blue-700 dark:text-blue-300 mb-1">Insurer Claim ID</dt>
                                <dd className="font-medium text-blue-900 dark:text-blue-100 font-mono text-xs">
                                  {claim.insurerClaimId}
                                </dd>
                              </div>
                            )}
                            {claim.insurerStatus && (
                              <div>
                                <dt className="text-blue-700 dark:text-blue-300 mb-1">Insurer Status</dt>
                                <dd className="font-medium text-blue-900 dark:text-blue-100">
                                  {claim.insurerStatus}
                                </dd>
                              </div>
                            )}
                            {claim.insurerPaidAt && (
                              <div>
                                <dt className="text-blue-700 dark:text-blue-300 mb-1">Insurer Payment</dt>
                                <dd className="font-medium text-blue-900 dark:text-blue-100">
                                  ${claim.insurerPaidAmount?.toLocaleString()} on{' '}
                                  {new Date(claim.insurerPaidAt).toLocaleDateString()}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Submission Required */}
                  {claim.status === 'APPROVED' && !claim.submittedToInsurerAt && claim.insurerStatus === 'MANUAL_SUBMISSION_REQUIRED' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                            Manual Submission Required
                          </h4>
                          <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                            {claim.policy.provider.name} does not have API integration configured. 
                            Please submit this claim manually to the provider.
                          </p>
                          <div className="flex items-center space-x-3">
                            {claim.policy.provider.contactEmail && (
                              <a
                                href={`mailto:${claim.policy.provider.contactEmail}`}
                                className="text-sm text-yellow-900 dark:text-yellow-200 underline hover:no-underline"
                              >
                                {claim.policy.provider.contactEmail}
                              </a>
                            )}
                            {claim.policy.provider.contactPhone && (
                              <a
                                href={`tel:${claim.policy.provider.contactPhone}`}
                                className="text-sm text-yellow-900 dark:text-yellow-200 underline hover:no-underline"
                              >
                                {claim.policy.provider.contactPhone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/fleet/insurance/providers/${claim.policy.provider.id}?key=phoenix-fleet-2847#claims`}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center space-x-2"
                      >
                        <IoDocumentTextOutline className="w-4 h-4" />
                        <span>View All Claims</span>
                      </Link>
                      <Link
                        href={`/fleet/insurance/providers/${claim.policy.provider.id}?key=phoenix-fleet-2847#fnol`}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center space-x-2"
                      >
                        <IoShieldCheckmarkOutline className="w-4 h-4" />
                        <span>View FNOL Activity</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Financial Breakdown */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" aria-labelledby="financial-breakdown-heading">
              <h2 id="financial-breakdown-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <IoCashOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                Financial Breakdown
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" role="list">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" role="listitem">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Cost</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${claim.financialBreakdown.estimatedCost.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg" role="listitem">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Approved Amount</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${claim.financialBreakdown.approvedAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg" role="listitem">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Host Payout</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ${claim.financialBreakdown.hostPayout.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    ({claim.financialBreakdown.hostEarningsPercent}%)
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg" role="listitem">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Platform Fee</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    ${claim.financialBreakdown.platformFee.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Deductible</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${claim.financialBreakdown.deductible.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Deposit Held</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${claim.financialBreakdown.depositHeld.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Guest Responsibility</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      ${claim.financialBreakdown.guestResponsibility.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Policy/FNOL Metadata */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" aria-labelledby="policy-metadata-heading">
              <h2 id="policy-metadata-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <IoDocumentTextOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                Policy & FNOL Metadata
              </h2>

              <dl className="grid grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Policy Reference ID</dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                    {claim.policy.id.slice(0, 12)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">External Policy ID</dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                    {claim.policy.externalPolicyId || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">FNOL Submission ID</dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                    {claim.insurerClaimId || 'Not Submitted'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Submission Channel</dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                    {claim.policy.boundViaApi ? 'API' : 'Manual'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Carrier Acknowledgment</dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                    {claim.submittedToInsurerAt 
                      ? <time dateTime={claim.submittedToInsurerAt}>
                          {new Date(claim.submittedToInsurerAt).toLocaleDateString()}
                        </time>
                      : 'Pending'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Insurer Status</dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                    {claim.insurerStatus || 'Not Submitted'}
                  </dd>
                </div>
              </dl>

              {claim.policy.policySource && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg" role="note">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Policy Source:</strong> {claim.policy.policySource}
                  </p>
                </div>
              )}
            </section>

            {/* Evidence Gallery */}
            {damagePhotosArray.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" aria-labelledby="evidence-gallery-heading">
                <h2 id="evidence-gallery-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <IoImageOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                  Evidence Gallery ({damagePhotosArray.length} photos)
                </h2>

                <div className="grid grid-cols-3 gap-4" role="list">
                  {damagePhotosArray.map((photo: string, index: number) => (
                    <button
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => setSelectedPhoto(photo)}
                      aria-label={`View damage evidence photo ${index + 1} of ${damagePhotosArray.length}`}
                      role="listitem"
                    >
                      <Image
                        src={optimizeImageUrl(photo, 300)}
                        alt={`Damage evidence ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                        loading="lazy"
                        quality={80}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                        <IoEyeOutline className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Guest Response Section */}
            {claim.guestResponseDeadline && (
              <section 
                className={`rounded-lg shadow-sm p-6 ${
                  claim.guestResponseText 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                }`}
                aria-labelledby="guest-response-heading"
                role="region"
              >
                <h2 id="guest-response-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IoPersonOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                  Guest Response
                </h2>

                {claim.guestResponseText ? (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Responded on <time dateTime={claim.guestResponseDate!}>
                        {new Date(claim.guestResponseDate!).toLocaleDateString()}
                      </time>
                    </p>
                    <p className="text-gray-900 dark:text-white">{claim.guestResponseText}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium mb-2">
                      Awaiting Guest Response
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deadline: <time dateTime={claim.guestResponseDeadline}>
                        {new Date(claim.guestResponseDeadline).toLocaleString()}
                      </time>
                    </p>
                    {hoursUntilGuestDeadline !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" role="status">
                        {hoursUntilGuestDeadline > 0 
                          ? `${hoursUntilGuestDeadline} hours remaining`
                          : 'Deadline passed'
                        }
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

          </div>

          {/* Sidebar - Right Side */}
          <aside className="space-y-6">
            
            {/* Quick Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Quick Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Days Open</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{daysOpen}</p>
                </div>
                {claim.reviewedAt && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.floor(
                        (new Date(claim.reviewedAt).getTime() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60)
                      )}h
                    </p>
                  </div>
                )}
                {claim.accountHoldApplied && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-red-600 dark:text-red-400" role="status">
                      <IoWarningOutline className="w-5 h-5 mr-2" aria-hidden="true" />
                      <span className="text-sm font-medium">Account on Hold</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoPersonOutline className="w-4 h-4 mr-2" aria-hidden="true" />
                Guest Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Name</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {claim.guestInfo.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Email</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {claim.guestInfo.email}
                  </dd>
                </div>
                {claim.guestInfo.location && (
                  <div>
                    <dt className="text-xs text-gray-600 dark:text-gray-400">Location</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {claim.guestInfo.location}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Insurance</dt>
                  <dd className="flex items-center space-x-2 mt-1">
                    {claim.guestInfo.hasInsurance ? (
                      <>
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600" aria-label="Has insurance" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {claim.guestInfo.insuranceProvider}
                        </span>
                      </>
                    ) : (
                      <>
                        <IoCloseCircleOutline className="w-4 h-4 text-gray-400" aria-label="No insurance" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          No Insurance
                        </span>
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Host Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <IoBusinessOutline className="w-4 h-4 mr-2" aria-hidden="true" />
                Host Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Name</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {claim.host.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Email</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {claim.host.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Phone</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {claim.host.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Earnings Tier</dt>
                  <dd>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                      claim.host.earningsTier === 'PREMIUM' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      claim.host.earningsTier === 'STANDARD' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {claim.host.earningsTier}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-600 dark:text-gray-400">Insurance Type</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {claim.host.commercialInsuranceActive ? 'Commercial (90%)' :
                     claim.host.p2pInsuranceActive ? 'P2P (75%)' :
                     'Platform (40%)'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Action Buttons */}
            {claim.status === 'PENDING' && (
              <div className="space-y-3" role="group" aria-label="Claim actions">
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2 font-medium"
                  aria-label="Approve this claim"
                >
                  <IoCheckmarkCircleOutline className="w-5 h-5" aria-hidden="true" />
                  <span>Approve Claim</span>
                </button>
                <button
                  onClick={() => setShowDenyModal(true)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center space-x-2 font-medium"
                  aria-label="Deny this claim"
                >
                  <IoCloseCircleOutline className="w-5 h-5" aria-hidden="true" />
                  <span>Deny Claim</span>
                </button>
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
          onClick={() => setShowApproveModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="approve-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Approve Claim
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="approved-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approved Amount ($)
                </label>
                <input
                  id="approved-amount"
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter approved amount"
                  aria-required="true"
                />
              </div>
              
              <div>
                <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any notes about this approval..."
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3" role="alert">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Approving this claim will:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 ml-4 list-disc">
                  <li>Place the guest's account on hold</li>
                  <li>Set a 48-hour response deadline for the guest</li>
                  <li>Notify all parties via email</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setReviewNotes('')
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancel approval"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Confirm claim approval"
              >
                {processing ? 'Processing...' : 'Approve Claim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deny-modal-title"
          onClick={() => setShowDenyModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="deny-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Deny Claim
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="denial-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Denial Reason *
                </label>
                <textarea
                  id="denial-reason"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Provide reason for denial..."
                  required
                  aria-required="true"
                />
              </div>
              
              <div>
                <label htmlFor="deny-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="deny-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3" role="alert">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Note:</strong> Denying this claim will reactivate the vehicle if it was locked.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDenyModal(false)
                  setDenialReason('')
                  setReviewNotes('')
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancel denial"
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Confirm claim denial"
              >
                {processing ? 'Processing...' : 'Deny Claim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Damage evidence photo viewer"
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedPhoto}
              alt="Damage evidence full size"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
              quality={90}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2 transition-colors"
              aria-label="Close photo viewer"
            >
              <IoCloseCircleOutline className="w-8 h-8" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap with Error Boundary
export default function FleetClaimDetailPage() {
  return (
    <ClaimErrorBoundary>
      <FleetClaimDetailPageContent />
    </ClaimErrorBoundary>
  )
}