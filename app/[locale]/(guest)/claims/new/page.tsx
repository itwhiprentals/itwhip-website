// app/(guest)/claims/new/page.tsx
'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'

// Icons
const ArrowLeft = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

const AlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const Upload = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

interface TripIssue {
  id: string
  status: string
  issueType: string
  severity: string
  hostReported: boolean
  guestAcknowledged: boolean
  needsAcknowledgment: boolean
  hoursUntilEscalation: number | null
}

interface Booking {
  id: string
  bookingCode: string
  startDate: string
  endDate: string
  status: string
  car: {
    displayName: string
    heroPhoto: string | null
  }
  host: {
    name: string
  }
  // Claim eligibility
  canFileClaim: boolean
  blockReason: string | null
  existingClaims: {
    againstGuest: number
    filedByGuest: number
    pendingResponse: boolean
  }
  // TripIssue info
  tripIssue: TripIssue | null
}

interface CurrentClaim {
  id: string
  type: string
  status: string
  isFiledByGuest: boolean
  needsResponse: boolean
  bookingCode: string
  carDetails: string | null
  createdAt: string
}

const CLAIM_TYPE_KEYS = [
  'VEHICLE_DAMAGE', 'ACCIDENT', 'THEFT', 'MECHANICAL_ISSUE',
  'CLEANLINESS', 'SERVICE_ISSUE', 'BILLING_DISPUTE', 'OTHER'
] as const

function NewClaimPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('NewClaim')
  const preselectedBookingId = searchParams.get('bookingId')

  // Form state
  const [step, setStep] = useState(1)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentClaims, setCurrentClaims] = useState<CurrentClaim[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState<string>(preselectedBookingId || '')
  const [claimType, setClaimType] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [damagePhotos, setDamagePhotos] = useState<string[]>([])

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdClaimId, setCreatedClaimId] = useState<string | null>(null)

  // TripIssue action state
  const [tripIssueActionLoading, setTripIssueActionLoading] = useState<string | null>(null)
  const [tripIssueNotes, setTripIssueNotes] = useState('')
  const [showTripIssueModal, setShowTripIssueModal] = useState<string | null>(null)

  // Fetch eligible bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true)
        const response = await fetch('/api/guest/claims?getEligibleBookings=true', {
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login?from=/claims/new')
            return
          }
          throw new Error('Failed to fetch bookings')
        }

        const data = await response.json()
        setBookings(data.eligibleBookings || [])
        setCurrentClaims(data.currentClaims || [])
      } catch (err) {
        console.error('Error fetching bookings:', err)
      } finally {
        setLoadingBookings(false)
      }
    }

    fetchBookings()
  }, [router])

  const selectedBooking = bookings.find(b => b.id === selectedBookingId)

  // Find bookings that have TripIssues needing acknowledgment
  const bookingsNeedingTripIssueAction = bookings.filter(
    b => b.tripIssue?.needsAcknowledgment
  )

  // Handle TripIssue acknowledge/dispute
  const handleTripIssueAction = async (bookingId: string, action: 'acknowledge' | 'dispute') => {
    setTripIssueActionLoading(bookingId)
    setError(null)

    try {
      const response = await fetch(`/api/trip-issues/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          notes: tripIssueNotes || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${action} trip issue`)
      }

      // Refresh bookings to get updated state
      const refreshResponse = await fetch('/api/guest/claims?getEligibleBookings=true', {
        credentials: 'include'
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setBookings(data.eligibleBookings || [])
        setCurrentClaims(data.currentClaims || [])
      }

      setShowTripIssueModal(null)
      setTripIssueNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} trip issue`)
    } finally {
      setTripIssueActionLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBookingId || !claimType || description.length < 50) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/guest/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: selectedBookingId,
          type: claimType,
          description,
          incidentDate: incidentDate || null,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
          damagePhotos
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit claim')
      }

      const data = await response.json()
      setSuccess(true)
      setCreatedClaimId(data.claim?.id || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceedToStep2 = selectedBookingId !== '' && selectedBooking?.canFileClaim === true
  const canProceedToStep3 = claimType !== ''
  const canSubmit = description.length >= 50

  // Success state
  if (success && createdClaimId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('claimSubmittedSuccessfully')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('claimSubmittedDescription')}
          </p>
          <div className="space-y-4">
            <Link
              href={`/claims/${createdClaimId}`}
              className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('viewClaimDetails')}
            </Link>
            <Link
              href="/claims"
              className="block w-full py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('viewAllClaims')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/claims"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToClaims')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('fileNewClaim')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('reportIssueSubtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-start">
            {[
              { num: 1, label: t('stepSelectBooking') },
              { num: 2, label: t('stepClaimType') },
              { num: 3, label: t('stepDetails') }
            ].map((s, idx) => (
              <div key={s.num} className="flex-1 flex flex-col items-center relative">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 ${
                    step >= s.num
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                {/* Label */}
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                  {s.label}
                </span>
                {/* Connecting line */}
                {idx < 2 && (
                  <div
                    className={`absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 ${
                      step > s.num ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TripIssue Action Required Banner */}
        {bookingsNeedingTripIssueAction.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  {t('tripIssueAttention')}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {t('tripIssueDescription')}
                </p>
                <div className="space-y-3">
                  {bookingsNeedingTripIssueAction.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={booking.car?.heroPhoto || '/car-placeholder.svg'}
                            alt={booking.car?.displayName || 'Vehicle'}
                            className="w-12 h-8 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/car-placeholder.svg'
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {booking.car?.displayName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {booking.bookingCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            booking.tripIssue?.severity === 'MAJOR'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              : booking.tripIssue?.severity === 'MODERATE'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                          }`}>
                            {booking.tripIssue?.severity} {booking.tripIssue?.issueType}
                          </span>
                          {booking.tripIssue?.hoursUntilEscalation !== null && (
                            <span className="text-xs text-gray-500">
                              {t('hoursLeft', { hours: booking.tripIssue?.hoursUntilEscalation ?? 0 })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowTripIssueModal(booking.id)}
                          disabled={tripIssueActionLoading === booking.id}
                          className="flex-1 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {tripIssueActionLoading === booking.id ? t('processing') : t('acknowledgeIssue')}
                        </button>
                        <button
                          onClick={() => handleTripIssueAction(booking.id, 'dispute')}
                          disabled={tripIssueActionLoading === booking.id}
                          className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          {t('dispute')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acknowledge TripIssue Modal */}
        {showTripIssueModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('acknowledgeTripIssue')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('acknowledgeConfirmation')}
              </p>
              <textarea
                value={tripIssueNotes}
                onChange={(e) => setTripIssueNotes(e.target.value)}
                placeholder={t('optionalNotesPlaceholder')}
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTripIssueModal(null)
                    setTripIssueNotes('')
                  }}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => handleTripIssueAction(showTripIssueModal, 'acknowledge')}
                  disabled={tripIssueActionLoading === showTripIssueModal}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {tripIssueActionLoading === showTripIssueModal ? t('processing') : t('confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Claims Banner */}
        {currentClaims.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  {t('activeClaimsCount', { count: currentClaims.length })}
                </h3>
                <div className="space-y-2">
                  {currentClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {claim.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          • {claim.bookingCode}
                        </span>
                        {claim.needsResponse && !claim.isFiledByGuest && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs rounded-full">
                            {t('responseRequired')}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/claims/${claim.id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        {claim.needsResponse && !claim.isFiledByGuest ? t('respond') : t('view')}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Select Booking */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('selectBooking')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('selectBookingDescription')}
            </p>

            {loadingBookings ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">{t('loadingBookings')}</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t('noEligibleBookings')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('noEligibleBookingsDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const isBlocked = !booking.canFileClaim
                  const isSelected = selectedBookingId === booking.id

                  return (
                    <div
                      key={booking.id}
                      className={`block p-4 rounded-lg border-2 transition-all ${
                        isBlocked
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75'
                          : isSelected
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-pointer'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                      }`}
                      onClick={() => !isBlocked && setSelectedBookingId(booking.id)}
                    >
                      <div className="flex items-start">
                        {!isBlocked && (
                          <input
                            type="radio"
                            name="booking"
                            value={booking.id}
                            checked={isSelected}
                            onChange={(e) => setSelectedBookingId(e.target.value)}
                            className="mt-1 mr-4 h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                        )}
                        {isBlocked && (
                          <div className="mt-1 mr-4">
                            <XCircle className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 flex-1">
                          <img
                            src={booking.car?.heroPhoto || '/car-placeholder.svg'}
                            alt={booking.car?.displayName || 'Vehicle'}
                            className={`w-20 h-14 object-cover rounded-lg ${isBlocked ? 'grayscale' : ''}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/car-placeholder.svg'
                            }}
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${isBlocked ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {booking.car?.displayName || 'Vehicle'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.bookingCode} • {booking.host?.name || 'Host'}
                            </p>
                            {/* Show TripIssue badge */}
                            {booking.tripIssue && (
                              <div className="flex gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  booking.tripIssue.needsAcknowledgment
                                    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 animate-pulse'
                                    : booking.tripIssue.status === 'RESOLVED'
                                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                      : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                }`}>
                                  {booking.tripIssue.needsAcknowledgment
                                    ? t('actionRequired', { type: booking.tripIssue.issueType })
                                    : booking.tripIssue.status === 'RESOLVED'
                                      ? t('issueResolved')
                                      : t('issueStatus', { status: booking.tripIssue.status })
                                  }
                                </span>
                              </div>
                            )}
                            {/* Show existing claim info */}
                            {(booking.existingClaims?.againstGuest > 0 || booking.existingClaims?.filedByGuest > 0) && (
                              <div className="flex gap-2 mt-1">
                                {booking.existingClaims.againstGuest > 0 && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    booking.existingClaims.pendingResponse
                                      ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                      : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                  }`}>
                                    {booking.existingClaims.pendingResponse ? t('responseNeeded') : t('claimAgainstYou', { count: booking.existingClaims.againstGuest })}
                                  </span>
                                )}
                                {booking.existingClaims.filedByGuest > 0 && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                                    {t('claimFiled', { count: booking.existingClaims.filedByGuest })}
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Block reason */}
                            {isBlocked && booking.blockReason && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                {booking.blockReason}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(booking.startDate).toLocaleDateString()} -{' '}
                              {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {t('continue')}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Claim Type */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('whatTypeOfIssue')}
            </h2>

            {selectedBooking && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                <img
                  src={selectedBooking.car?.heroPhoto || '/car-placeholder.svg'}
                  alt={selectedBooking.car?.displayName || 'Vehicle'}
                  className="w-16 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedBooking.car?.displayName || 'Vehicle'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBooking.bookingCode}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CLAIM_TYPE_KEYS.map((typeKey) => (
                <label
                  key={typeKey}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    claimType === typeKey
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="claimType"
                      value={typeKey}
                      checked={claimType === typeKey}
                      onChange={(e) => setClaimType(e.target.value)}
                      className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t(`claimType_${typeKey}`)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {t(`claimTypeDesc_${typeKey}`)}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('back')}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {t('continue')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('claimDetails')}
            </h2>

            {selectedBooking && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                <img
                  src={selectedBooking.car?.heroPhoto || '/car-placeholder.svg'}
                  alt={selectedBooking.car?.displayName || 'Vehicle'}
                  className="w-16 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedBooking.car?.displayName || 'Vehicle'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {claimType ? t(`claimType_${claimType}`) : ''}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('descriptionLabel')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  minLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('charMinimum', { count: description.length })}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('incidentDateOptional')}
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('estimatedCostOptional')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('photosOptional')}
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('uploadPhotos')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('photoUploadComingSoon')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('back')}
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {submitting ? t('submitting') : t('submitClaim')}
              </button>
            </div>
          </form>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            {t('whatHappensNext')}
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• {t('nextStep1')}</li>
            <li>• {t('nextStep2')}</li>
            <li>• {t('nextStep3')}</li>
            <li>• {t('nextStep4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function NewClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    }>
      <NewClaimPageInner />
    </Suspense>
  )
}
