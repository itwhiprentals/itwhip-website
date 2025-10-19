// app/host/claims/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ClaimStatusBadge from '../components/ClaimStatusBadge'
import ClaimTimeline from '../components/ClaimTimeline'
import {
  IoArrowBackOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoImageOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
  IoReceiptOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface Claim {
  id: string
  claimType?: 'insurance' | 'trip_charges' // NEW: Distinguish claim types
  type: string
  status: string
  reportedBy: string
  description: string
  estimatedCost: number
  approvedAmount: number | null
  deductible: number | null
  netPayout: number | null
  incidentDate: string | null
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNotes: string | null
  paidAt: string | null
  guestAtFault: boolean
  faultPercentage: number | null
  damagePhotos: string[]
  booking: {
    id: string
    bookingCode: string
    startDate: string
    endDate: string
    totalAmount: number
    car: {
      displayName: string
      fullDisplayName: string
      heroPhoto: string | null
      licensePlate: string
    } | null
    guest: {
      name: string
      email: string
      phone: string
    } | null
  }
  policy: {
    policyNumber: string
    tier: string
    deductible: number
    coverageAmount: number
  } | null
  timeline: any[]
  // Trip charges specific fields
  chargeBreakdown?: {
    mileageCharge?: number
    fuelCharge?: number
    lateCharge?: number
    damageCharge?: number
    cleaningCharge?: number
    otherCharges?: number
  }
  disputes?: string | null
  holdUntil?: string | null
}

export default function ClaimDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const claimId = params.id as string

  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails()
    }
  }, [claimId])

  const fetchClaimDetails = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/host/claims/${claimId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Claim not found')
        } else if (response.status === 403) {
          throw new Error('You do not have access to this claim')
        }
        throw new Error('Failed to load claim details')
      }

      const data = await response.json()
      setClaim(data.claim)
    } catch (err: any) {
      console.error('Error fetching claim:', err)
      setError(err.message || 'Failed to load claim details')
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A'
    return `$${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // Get claim type label
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading claim details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error || !claim) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center">
            <IoAlertCircleOutline className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Claim Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The claim you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              href="/host/claims"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <IoArrowBackOutline className="w-5 h-5" />
              <span>Back to Claims</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Back button */}
        <Link
          href="/host/claims"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 group"
        >
          <IoArrowBackOutline className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Claims</span>
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Claim #{claim.id.slice(0, 8).toUpperCase()}
                </h1>
                <ClaimStatusBadge status={claim.status as any} size="md" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {getClaimTypeLabel(claim.type)} • Filed {formatDate(claim.createdAt)}
              </p>
            </div>

            {/* Financial summary card */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(claim.estimatedCost)}
              </p>
              {claim.approvedAmount !== null && (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Approved Amount</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {formatCurrency(claim.approvedAmount)}
                  </p>
                </>
              )}
              {claim.netPayout !== null && (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Payout</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(claim.netPayout)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5" />
                Claim Details
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {claim.description}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Incident Date</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(claim.incidentDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reported By</p>
                    <p className="text-gray-900 dark:text-white">{claim.reportedBy}</p>
                  </div>
                </div>

                {claim.reviewNotes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                      Review Notes
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {claim.reviewNotes}
                    </p>
                    {claim.reviewedBy && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        Reviewed by {claim.reviewedBy} on {formatDate(claim.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Damage photos */}
            {claim.damagePhotos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoImageOutline className="w-5 h-5" />
                  Damage Photos ({claim.damagePhotos.length})
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {claim.damagePhotos.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={url}
                        alt={`Damage photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {claim.timeline && claim.timeline.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoCalendarOutline className="w-5 h-5" />
                  Claim Timeline
                </h2>

                <ClaimTimeline timeline={claim.timeline} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoCarOutline className="w-5 h-5" />
                Booking Information
              </h2>

              {claim.booking.car?.heroPhoto && !imageError && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
                  <Image
                    src={claim.booking.car.heroPhoto}
                    alt={claim.booking.car.displayName}
                    width={400}
                    height={225}
                    className="object-cover w-full h-full"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Vehicle</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {claim.booking.car?.fullDisplayName || claim.booking.car?.displayName || 'N/A'}
                  </p>
                  {claim.booking.car?.licensePlate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Plate: {claim.booking.car.licensePlate}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Booking Code</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {claim.booking.bookingCode}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Rental Period</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(claim.booking.startDate).toLocaleDateString()} - {new Date(claim.booking.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Guest info */}
            {claim.booking.guest && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoPersonOutline className="w-5 h-5" />
                  Guest Information
                </h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.booking.guest.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <a 
                      href={`mailto:${claim.booking.guest.email}`}
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {claim.booking.guest.email}
                    </a>
                  </div>

                  {claim.booking.guest.phone && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <a 
                        href={`tel:${claim.booking.guest.phone}`}
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {claim.booking.guest.phone}
                      </a>
                    </div>
                  )}

                  {claim.guestAtFault && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-900 dark:text-yellow-200">
                        Guest At Fault: {claim.faultPercentage}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insurance policy */}
            {claim.policy && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5" />
                  Insurance Policy
                </h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Policy Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.policy.policyNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Coverage Tier</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.policy.tier}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Deductible</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(claim.policy.deductible)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Coverage</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(claim.policy.coverageAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Need Help?
                  </p>
                  <p className="text-blue-800 dark:text-blue-300 text-xs">
                    Contact claims support at{' '}
                    <a href="mailto:claims@itwhip.com" className="underline hover:no-underline">
                      claims@itwhip.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}