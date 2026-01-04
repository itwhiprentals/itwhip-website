// app/(guest)/claims/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// Icons
const ArrowLeft = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Camera = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Upload = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

interface ClaimDetails {
  id: string
  type: string
  status: string
  description: string
  estimatedCost: number | null
  approvedAmount: number | null
  deductible: number | null
  incidentDate: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  reviewNotes: string | null
  isFiledByGuest: boolean
  filedByRole: string
  hasResponded: boolean
  guestResponseText: string | null
  guestResponseDate: string | null
  guestResponsePhotos: string[]
  responseDeadline: string | null
  hoursRemaining: number | null
  minutesRemaining: number | null
  deadlineExpired: boolean
  needsResponse: boolean
  isUrgent: boolean
  accountHoldApplied: boolean
  guestAtFault: boolean | null
  faultPercentage: number | null
  incidentAddress: string | null
  incidentCity: string | null
  incidentState: string | null
  incidentDescription: string | null
  weatherConditions: string | null
  roadConditions: string | null
  wasPoliceContacted: boolean | null
  policeReportNumber: string | null
  booking: {
    id: string
    bookingCode: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    totalAmount: number
    status: string
    car: {
      id: string
      displayName: string
      fullDisplayName: string
      color: string
      licensePlate: string
      heroPhoto: string | null
    } | null
  }
  host: {
    id: string
    name: string
    profilePhoto: string | null
    rating: number | null
    phone: string | null
  }
  policy: {
    tier: string
    deductible: number
    liabilityCoverage: number
    collisionCoverage: number
  } | null
  hostDamagePhotos: Array<{
    id: string
    url: string
    caption: string | null
  }>
  guestDamagePhotos: Array<{
    id: string
    url: string
    caption: string | null
  }>
  tripPhotos: {
    preTrip: string[]
    postTrip: string[]
  }
  messages: Array<{
    id: string
    message: string
    senderType: string
    senderName: string | null
    createdAt: string
    attachments: string | null
  }>
  timeline: Array<{
    type: string
    title: string
    description: string
    date: string
    by?: string
  }>
}

export default function ClaimDetailPage() {
  const router = useRouter()
  const params = useParams()
  const claimId = params.id as string

  const [claim, setClaim] = useState<ClaimDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Response form state
  const [responseText, setResponseText] = useState('')
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fetchClaim = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/guest/claims/${claimId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/auth/login?from=/claims/${claimId}`)
          return
        }
        if (response.status === 404) {
          setError('Claim not found')
          return
        }
        throw new Error('Failed to fetch claim details')
      }

      const data = await response.json()
      setClaim(data.claim)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [claimId, router])

  useEffect(() => {
    if (claimId) {
      fetchClaim()
    }
  }, [claimId, fetchClaim])

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()

    if (responseText.trim().length < 100) {
      setSubmitError('Your response must be at least 100 characters')
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      const response = await fetch(`/api/guest/claims/${claimId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          response: responseText,
          evidencePhotos
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit response')
      }

      setSubmitSuccess(true)
      // Refresh claim data
      await fetchClaim()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    if (!claim) return null

    if (claim.needsResponse && !claim.hasResponded) {
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          claim.isUrgent
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        }`}>
          <Clock className="w-4 h-4 mr-1" />
          Response Required
        </span>
      )
    }

    switch (claim.status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </span>
        )
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Under Review
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        )
      case 'DENIED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-4 h-4 mr-1" />
            Denied
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
            {claim.status}
          </span>
        )
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading claim details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Claim not found'}
          </h2>
          <Link
            href="/claims"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Claims
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/claims"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Claims
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Claim #{claim.id.slice(-8).toUpperCase()}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {claim.isFiledByGuest ? 'Filed by you' : 'Filed by host'} on{' '}
                {new Date(claim.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {claim.estimatedCost && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${claim.estimatedCost.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Urgent Response Banner */}
        {claim.needsResponse && !claim.hasResponded && (
          <div className={`rounded-lg p-4 mb-6 ${
            claim.isUrgent
              ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
              : 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700'
          }`}>
            <div className="flex items-start">
              <AlertTriangle className={`w-6 h-6 flex-shrink-0 mr-3 ${
                claim.isUrgent ? 'text-red-600' : 'text-orange-600'
              }`} />
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  claim.isUrgent ? 'text-red-800 dark:text-red-300' : 'text-orange-800 dark:text-orange-300'
                }`}>
                  {claim.isUrgent ? 'Urgent: Response Required' : 'Response Required'}
                </h3>
                <p className={`text-sm mt-1 ${
                  claim.isUrgent ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'
                }`}>
                  {claim.hoursRemaining !== null && claim.hoursRemaining > 0
                    ? `You have ${claim.hoursRemaining} hours remaining to submit your response.`
                    : 'Please submit your response as soon as possible.'}
                  {claim.accountHoldApplied && ' Your account is currently on hold until you respond.'}
                </p>
              </div>
              <div className={`text-2xl font-bold ${
                claim.isUrgent ? 'text-red-700' : 'text-orange-700'
              }`}>
                {claim.hoursRemaining}h
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {submitSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Response Submitted Successfully
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Your response has been submitted. Our team will review and get back to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Booking Details
              </h2>
              <div className="flex items-start gap-4">
                <img
                  src={claim.booking.car?.heroPhoto || '/car-placeholder.svg'}
                  alt={claim.booking.car?.displayName || 'Vehicle'}
                  className="w-24 h-16 object-cover rounded-lg bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/car-placeholder.svg'
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {claim.booking.car?.fullDisplayName || 'Unknown Vehicle'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Booking #{claim.booking.bookingCode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(claim.booking.startDate).toLocaleDateString()} -{' '}
                    {new Date(claim.booking.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Claim Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Claim Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-gray-900 dark:text-white">
                    {claim.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                {claim.incidentDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Incident Date</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(claim.incidentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {claim.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Host's Evidence */}
            {claim.hostDamagePhotos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Host's Evidence Photos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {claim.hostDamagePhotos.map((photo, index) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Evidence photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Form */}
            {claim.needsResponse && !claim.hasResponded && !claim.deadlineExpired && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Submit Your Response
                </h2>
                <form onSubmit={handleSubmitResponse}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Response *
                      </label>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Please provide your detailed account of the incident. Include any relevant information that may help with the claim review (minimum 100 characters)."
                        className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        minLength={100}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {responseText.length}/100 characters minimum
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Evidence Photos (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Upload photos to support your response
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Photo upload coming soon
                        </p>
                      </div>
                    </div>

                    {submitError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                        <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || responseText.length < 100}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Previous Response */}
            {claim.hasResponded && claim.guestResponseText && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Response
                </h2>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-green-700 dark:text-green-400 mb-2">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Response Submitted</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    Submitted on {claim.guestResponseDate
                      ? new Date(claim.guestResponseDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown date'}
                  </p>
                </div>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {claim.guestResponseText}
                </p>

                {claim.guestDamagePhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Evidence Photos
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {claim.guestDamagePhotos.map((photo, index) => (
                        <img
                          key={photo.id}
                          src={photo.url}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Host
              </h3>
              <div className="flex items-center">
                <img
                  src={claim.host.profilePhoto || '/default-avatar.svg'}
                  alt={claim.host.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.svg'
                  }}
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">{claim.host.name}</p>
                  {claim.host.rating && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {claim.host.rating.toFixed(1)} rating
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance Info */}
            {claim.policy && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Insurance Policy
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tier</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {claim.policy.tier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Deductible</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${claim.policy.deductible.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Liability</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${claim.policy.liabilityCoverage.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {claim.timeline.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Timeline
                </h3>
                <div className="space-y-4">
                  {claim.timeline.map((event, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Our claims team is available to assist you with any questions.
              </p>
              <a
                href="mailto:claims@itwhip.com"
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Contact Claims Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
