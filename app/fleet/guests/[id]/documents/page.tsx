// app/fleet/guests/[id]/documents/page.tsx
// ✅ FIXED: Added missing <a> tags, improved type safety, better null handling

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoEyeOutline,
  IoDownloadOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoImageOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoConstructOutline,
  IoFingerPrintOutline
} from 'react-icons/io5'

interface Document {
  type: 'driversLicense' | 'selfie'
  label: string
  url: string | null
  verified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  required: boolean
  icon: any
  description: string
}

interface Insurance {
  provider: string | null
  policyNumber: string | null
  expiryDate: string | null
  hasRideshare: boolean
  coverageType: string | null
  customCoverage: string | null
  cardFrontUrl: string | null
  cardBackUrl: string | null
  notes: string | null
  verified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  status: string
  daysUntilExpiry: number | null
}

interface Guest {
  id: string
  name: string
  email: string
  driversLicenseUrl: string | null
  selfieUrl: string | null
  documentsVerified: boolean
  documentVerifiedAt: string | null
  documentVerifiedBy: string | null
  // Stripe Identity verification
  stripeIdentityStatus: string | null
  stripeIdentitySessionId: string | null
  stripeIdentityVerifiedAt: string | null
  stripeVerifiedFirstName: string | null
  stripeVerifiedLastName: string | null
  stripeVerifiedDob: string | null
  stripeVerifiedIdNumber: string | null
  stripeVerifiedIdExpiry: string | null
  stripeVerifiedAddress: string | null
  stripeDocFrontFileId: string | null
  stripeDocBackFileId: string | null
  stripeSelfieFileId: string | null
  // Profile fallbacks
  dateOfBirth: string | null
  driverLicenseNumber: string | null
  driverLicenseExpiry: string | null
}

const FLEET_KEY = 'phoenix-fleet-2847'
const stripeFileUrl = (fileId: string) => `/fleet/api/stripe-file?key=${FLEET_KEY}&id=${fileId}`

export default function GuestDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [guestId, setGuestId] = useState<string>('')
  const [guest, setGuest] = useState<Guest | null>(null)
  const [insurance, setInsurance] = useState<Insurance | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setGuestId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (guestId) {
      loadGuest()
      loadInsurance()
    }
  }, [guestId])

  const loadGuest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/guests/${guestId}?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        setGuest(data.guest)
      }
    } catch (error) {
      console.error('Failed to load guest:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInsurance = async () => {
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/insurance?key=phoenix-fleet-2847`)
      if (response.ok) {
        const data = await response.json()
        setInsurance(data.current)
      }
    } catch (error) {
      console.error('Failed to load insurance:', error)
    }
  }

  const handleVerifyDocument = async (documentType: string) => {
    if (documentType !== 'all' && !confirm(`Mark ${documentType} as verified?`)) {
      return
    }

    setActionLoading(documentType)
    try {
      if (documentType === 'all') {
        const verifyResponse = await fetch(`/api/fleet/guests/${guestId}/verify-documents?key=phoenix-fleet-2847`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-fleet-key': 'phoenix-fleet-2847'
          },
          body: JSON.stringify({
            adminName: 'Fleet Admin'
          })
        })

        if (verifyResponse.ok) {
          const result = await verifyResponse.json()
          if (result.alreadyVerified) {
            alert('Documents are already verified')
          } else {
            alert(`Successfully verified all documents for ${guest?.name}`)
          }
          await loadGuest()
        } else {
          const errorData = await verifyResponse.json()
          alert(errorData.error || 'Failed to verify all documents')
        }
        setActionLoading(null)
        return
      }

      const updateData: any = {}
      
      switch (documentType) {
        case 'driversLicense':
          updateData.driversLicenseVerified = true
          break
        case 'selfie':
          updateData.selfieVerified = true
          break
      }

      const response = await fetch(`/api/fleet/guests/${guestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        alert('Document verified successfully')
        await loadGuest()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to verify document')
      }
    } catch (error) {
      console.error('Failed to verify document:', error)
      alert('Failed to verify document')
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifyInsurance = async () => {
    if (!confirm('Verify this insurance?')) return

    setActionLoading('insurance')
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/verify-insurance?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          verified: true,
          adminName: 'Fleet Admin'
        })
      })

      if (response.ok) {
        alert('Insurance verified successfully')
        await loadInsurance()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to verify insurance')
      }
    } catch (error) {
      console.error('Failed to verify insurance:', error)
      alert('Failed to verify insurance')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectDocument = async (documentType: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    setActionLoading(documentType)
    try {
      const updateData: any = { rejectionReason: reason }

      switch (documentType) {
        case 'driversLicense':
          updateData.driversLicenseVerified = false
          break
        case 'selfie':
          updateData.selfieVerified = false
          break
      }

      const response = await fetch(`/api/fleet/guests/${guestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        alert('Document rejected')
        await loadGuest()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reject document')
      }
    } catch (error) {
      console.error('Failed to reject document:', error)
      alert('Failed to reject document')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAdminOverride = async (enable: boolean) => {
    const confirmMessage = enable
      ? 'This will mark the guest as fully verified, bypassing Stripe Identity and document requirements. Only use this if you have manually verified their identity through other means (in-person, phone call, etc.). Continue?'
      : 'This will remove the admin override and reset all verification status. The guest will need to complete verification again. Continue?'

    if (!confirm(confirmMessage)) return

    setActionLoading('adminOverride')
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          isVerified: enable,
          fullyVerified: enable,
          documentsVerified: enable,
          adminOverride: enable,
          adminOverrideBy: enable ? 'Fleet Admin' : null,
          adminOverrideAt: enable ? new Date().toISOString() : null,
          reason: enable ? 'Admin override - manual identity verification' : 'Admin override removed'
        })
      })

      if (response.ok) {
        alert(enable ? 'Admin override applied - guest is now verified' : 'Admin override removed')
        await loadGuest()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to apply admin override')
      }
    } catch (error) {
      console.error('Failed to apply admin override:', error)
      alert('Failed to apply admin override')
    } finally {
      setActionLoading(null)
    }
  }

  const getCoverageLabel = (coverageType: string | null, customCoverage: string | null) => {
    if (!coverageType) return 'N/A'
    
    const labels: Record<string, string> = {
      'state_minimum': 'State Minimum (25/50/25)',
      'basic': 'Basic (50/100/50)',
      'standard': 'Standard (100/300/100)',
      'premium': 'Premium (250/500/100)',
      'custom': customCoverage || 'Custom'
    }
    
    return labels[coverageType] || coverageType
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Guest not found</p>
          <Link href="/fleet/guests?key=phoenix-fleet-2847" className="text-purple-600 hover:text-purple-700">
            Back to Guests
          </Link>
        </div>
      </div>
    )
  }

  const documents: Document[] = [
    {
      type: 'driversLicense',
      label: "Driver's License",
      url: guest.driversLicenseUrl || (guest.stripeDocFrontFileId ? stripeFileUrl(guest.stripeDocFrontFileId) : null),
      verified: guest.documentsVerified || false,
      verifiedAt: guest.documentVerifiedAt || null,
      verifiedBy: guest.documentVerifiedBy || null,
      required: true,
      icon: IoCarOutline,
      description: 'Valid driver\'s license (serves as government-issued ID)'
    },
    {
      type: 'selfie',
      label: 'Verification Selfie',
      url: guest.selfieUrl || (guest.stripeSelfieFileId ? stripeFileUrl(guest.stripeSelfieFileId) : null),
      verified: guest.documentsVerified || false,
      verifiedAt: guest.documentVerifiedAt || null,
      verifiedBy: guest.documentVerifiedBy || null,
      required: true,
      icon: IoPersonOutline,
      description: 'Selfie holding driver\'s license for identity verification'
    }
  ]

  const uploadedCount = documents.filter(d => d.url).length + (insurance?.provider ? 1 : 0)
  const requiredCount = documents.filter(d => d.required).length
  const requiredUploaded = documents.filter(d => d.required && d.url).length
  const hasInsurance = insurance?.provider && insurance?.policyNumber
  const totalDocs = documents.length + 1 // 2 required + 1 optional insurance
  const completionPercentage = Math.round((uploadedCount / totalDocs) * 100)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push(`/fleet/guests/${guestId}?key=phoenix-fleet-2847`)}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-3 sm:mb-4"
          >
            <IoArrowBackOutline className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Guest Details
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Document Verification
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Review and verify {guest.name}'s identity documents (2 required + insurance optional)
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Uploaded</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {uploadedCount}/{totalDocs}
                </p>
              </div>
              <IoDocumentTextOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Verified</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {guest.documentsVerified ? 'Yes' : 'No'}
                </p>
              </div>
              <IoCheckmarkCircleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Insurance</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {hasInsurance ? 'Added' : 'None'}
                </p>
              </div>
              <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completion</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {completionPercentage}%
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
                <svg className="transform -rotate-90 w-10 h-10 sm:w-12 sm:h-12">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - completionPercentage / 100)}`}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Identity Status Section */}
        {guest.stripeIdentityStatus && (
          <div className={`mb-6 rounded-lg p-4 border-2 ${
            guest.stripeIdentityStatus === 'verified'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
              : guest.stripeIdentityStatus === 'pending' || guest.stripeIdentityStatus === 'processing'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              : guest.stripeIdentityStatus === 'requires_input'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
              : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
          }`}>
            <div className="flex items-start gap-3">
              <IoFingerPrintOutline className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                guest.stripeIdentityStatus === 'verified'
                  ? 'text-green-600 dark:text-green-400'
                  : guest.stripeIdentityStatus === 'pending' || guest.stripeIdentityStatus === 'processing'
                  ? 'text-blue-600 dark:text-blue-400'
                  : guest.stripeIdentityStatus === 'requires_input'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
              <div className="flex-1">
                <h3 className={`font-semibold text-sm sm:text-base ${
                  guest.stripeIdentityStatus === 'verified'
                    ? 'text-green-900 dark:text-green-100'
                    : guest.stripeIdentityStatus === 'pending' || guest.stripeIdentityStatus === 'processing'
                    ? 'text-blue-900 dark:text-blue-100'
                    : guest.stripeIdentityStatus === 'requires_input'
                    ? 'text-red-900 dark:text-red-100'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Stripe Identity: {guest.stripeIdentityStatus === 'verified' ? 'Verified ✓' :
                    guest.stripeIdentityStatus === 'pending' ? 'Pending' :
                    guest.stripeIdentityStatus === 'processing' ? 'Processing...' :
                    guest.stripeIdentityStatus === 'requires_input' ? 'Failed / Needs Retry' :
                    guest.stripeIdentityStatus}
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${
                  guest.stripeIdentityStatus === 'verified'
                    ? 'text-green-800 dark:text-green-300'
                    : guest.stripeIdentityStatus === 'pending' || guest.stripeIdentityStatus === 'processing'
                    ? 'text-blue-800 dark:text-blue-300'
                    : guest.stripeIdentityStatus === 'requires_input'
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-gray-800 dark:text-gray-300'
                }`}>
                  {guest.stripeIdentityStatus === 'verified'
                    ? `Identity verified via Stripe${guest.stripeIdentityVerifiedAt ? ` on ${formatDate(guest.stripeIdentityVerifiedAt)}` : ''}`
                    : guest.stripeIdentityStatus === 'pending'
                    ? 'Guest has started verification but not completed it yet'
                    : guest.stripeIdentityStatus === 'processing'
                    ? 'Stripe is reviewing the submitted documents'
                    : guest.stripeIdentityStatus === 'requires_input'
                    ? 'Verification failed - guest needs to try again with valid documents'
                    : 'Unknown status'}
                </p>
                {guest.stripeIdentitySessionId && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    Session: {guest.stripeIdentitySessionId.slice(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stripe Identity Verified Data — Photos + DL Info */}
        {guest.stripeIdentityStatus === 'verified' && (
          <StripeIdentityData guest={guest} onViewPhoto={setSelectedDocument} />
        )}

        {/* Show when NO Stripe Identity session exists */}
        {!guest.stripeIdentityStatus && !guest.documentsVerified && (
          <div className="mb-6 bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoFingerPrintOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  Stripe Identity: Not Started
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Guest has not started Stripe Identity verification. Use Admin Override below if manual verification is needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Override Section */}
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <IoConstructOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base">
                  Admin Override - Identity Verification
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-1">
                  Bypass Stripe Identity when service is unavailable or you've verified the guest manually.
                </p>
                <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 mt-2">
                  <strong>Use when:</strong> Stripe outage, in-person verification, corporate accounts, or special circumstances.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAdminOverride(!guest.documentsVerified)}
              disabled={actionLoading === 'adminOverride'}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0 ${
                guest.documentsVerified
                  ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <IoFingerPrintOutline className="w-4 h-4" />
              {actionLoading === 'adminOverride'
                ? 'Processing...'
                : guest.documentsVerified
                ? 'Remove Override'
                : 'Verify Manually'}
            </button>
          </div>
        </div>

        {/* Overall Status */}
        {guest.documentsVerified ? (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  {guest.stripeIdentityStatus === 'verified' ? 'Identity Verified via Stripe' :
                   guest.documentVerifiedBy === 'fleet-admin' ? 'Verified via Admin Override' :
                   'Documents Verified'}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {guest.stripeIdentityStatus === 'verified' ? (
                    <>Driver's license and selfie verified via Stripe Identity{guest.stripeIdentityVerifiedAt && <> on {formatDate(guest.stripeIdentityVerifiedAt)}</>}</>
                  ) : (
                    <>
                      All required documents verified
                      {guest.documentVerifiedAt && (
                        <> on {formatDate(guest.documentVerifiedAt)}</>
                      )}
                      {guest.documentVerifiedBy && (
                        <> by {guest.documentVerifiedBy}</>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : requiredUploaded === requiredCount ? (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Ready for Verification</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  All 2 required documents uploaded. Click "Verify All Documents" to approve.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Verification Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Waiting for {requiredCount - requiredUploaded} required document{requiredCount - requiredUploaded !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.type}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <doc.icon className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {doc.label}
                          <span className="ml-2 text-xs text-red-600 dark:text-red-400">Required</span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                    {doc.verified ? (
                      <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <IoCloseCircleOutline className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {doc.url ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative group">
                        <img
                          src={doc.url}
                          alt={doc.label}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <button
                            onClick={() => setSelectedDocument(doc.url)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-gray-900 rounded-lg font-medium flex items-center"
                          >
                            <IoEyeOutline className="w-4 h-4 mr-2" />
                            View Full Size
                          </button>
                        </div>
                      </div>

                      {doc.verified && doc.verifiedAt && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <IoCalendarOutline className="w-4 h-4 mr-2" />
                          Verified on {formatDate(doc.verifiedAt)}
                          {doc.verifiedBy && ` by ${doc.verifiedBy}`}
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        {!doc.verified && (
                          <button
                            onClick={() => handleVerifyDocument(doc.type)}
                            disabled={actionLoading === doc.type}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                          >
                            <IoCheckmarkCircleOutline className="w-4 h-4 mr-2" />
                            {actionLoading === doc.type ? 'Processing...' : 'Verify'}
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectDocument(doc.type)}
                          disabled={actionLoading === doc.type}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          <IoCloseCircleOutline className="w-4 h-4 mr-2" />
                          {actionLoading === doc.type ? 'Processing...' : 'Reject'}
                        </button>
                        <a
                          href={doc.url}
                          download
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center"
                        >
                          <IoDownloadOutline className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <IoImageOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Document not uploaded yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Insurance Card - Full Width */}
          {hasInsurance && insurance && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                insurance.verified && insurance.status === 'ACTIVE'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : insurance.status === 'EXPIRED'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-yellow-50 dark:bg-yellow-900/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insurance.verified && insurance.status === 'ACTIVE'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : insurance.status === 'EXPIRED'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      <IoShieldCheckmarkOutline className={`w-5 h-5 ${
                        insurance.verified && insurance.status === 'ACTIVE'
                          ? 'text-green-600 dark:text-green-400'
                          : insurance.status === 'EXPIRED'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Personal Insurance Card
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Optional</span>
                      </h3>
                      {insurance.verified && insurance.status === 'ACTIVE' ? (
                        <p className="text-xs text-green-800 dark:text-green-300 mt-0.5">
                          Verified - Guest saves up to 50% on deposits
                        </p>
                      ) : insurance.status === 'EXPIRED' ? (
                        <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                          Expired - Needs to update insurance
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-0.5">
                          Pending Verification
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {insurance.status === 'ACTIVE' && insurance.daysUntilExpiry !== null && insurance.daysUntilExpiry <= 30 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                        <IoAlertCircleOutline className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-[10px] font-medium text-yellow-800 dark:text-yellow-300">
                          {insurance.daysUntilExpiry}d left
                        </span>
                      </div>
                    )}
                    {insurance.verified ? (
                      <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : insurance.status === 'EXPIRED' ? (
                      <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Insurance Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Provider</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {insurance.provider}
                    </p>
                  </div>
                  {insurance.policyNumber && (
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Policy Number</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white font-mono">
                        {insurance.policyNumber}
                      </p>
                    </div>
                  )}
                  {insurance.coverageType && (
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Coverage Type</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {getCoverageLabel(insurance.coverageType, insurance.customCoverage)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Rideshare Coverage</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {insurance.hasRideshare ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Expiration Date</p>
                    <p className={`text-xs font-medium ${
                      insurance.status === 'EXPIRED' 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {formatDate(insurance.expiryDate)}
                    </p>
                  </div>
                  {insurance.verifiedAt && (
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Verified On</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {formatDate(insurance.verifiedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Insurance Card Images */}
                {(insurance.cardFrontUrl || insurance.cardBackUrl) && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Insurance Card Images
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {insurance.cardFrontUrl && (
                        <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group">
                          <img
                            src={insurance.cardFrontUrl}
                            alt="Insurance Card Front"
                            className="w-full h-32 object-contain"
                          />
                          <p className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-gray-600 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/90 py-1">
                            Front
                          </p>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <button
                              onClick={() => setSelectedDocument(insurance.cardFrontUrl)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                              <IoEyeOutline className="w-3.5 h-3.5" />
                              View
                            </button>
                          </div>
                        </div>
                      )}
                      {insurance.cardBackUrl && (
                        <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group">
                          <img
                            src={insurance.cardBackUrl}
                            alt="Insurance Card Back"
                            className="w-full h-32 object-contain"
                          />
                          <p className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-gray-600 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/90 py-1">
                            Back
                          </p>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <button
                              onClick={() => setSelectedDocument(insurance.cardBackUrl)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                              <IoEyeOutline className="w-3.5 h-3.5" />
                              View
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {insurance.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Notes
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2.5 rounded-lg">
                      {insurance.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!insurance.verified && insurance.status !== 'EXPIRED' && (
                    <button
                      onClick={handleVerifyInsurance}
                      disabled={actionLoading === 'insurance'}
                      className="flex-1 px-3 py-2 min-h-[36px] text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
                      {actionLoading === 'insurance' ? 'Verifying...' : 'Verify Insurance'}
                    </button>
                  )}
                  {insurance.cardFrontUrl && (
                    <a
                      href={insurance.cardFrontUrl}
                      download
                      className="px-3 py-2 min-h-[36px] text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
                    >
                      <IoDownloadOutline className="w-3.5 h-3.5" />
                      Front
                    </a>
                  )}
                  {insurance.cardBackUrl && (
                    <a
                      href={insurance.cardBackUrl}
                      download
                      className="px-3 py-2 min-h-[36px] text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
                    >
                      <IoDownloadOutline className="w-3.5 h-3.5" />
                      Back
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {!hasInsurance && (
            <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <IoShieldCheckmarkOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                No Insurance Added
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Guest has not added personal insurance (optional)
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href={`/fleet/guests/${guestId}/permissions?key=phoenix-fleet-2847`}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm text-center transition-colors"
          >
            Manage Permissions
          </Link>

          {requiredUploaded === requiredCount && !guest.documentsVerified && (
            <button
              onClick={() => {
                if (confirm('Mark all required documents as verified?')) {
                  handleVerifyDocument('all')
                }
              }}
              disabled={actionLoading === 'all'}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <IoCheckmarkCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {actionLoading === 'all' ? 'Processing...' : 'Verify All Documents'}
            </button>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div className="max-w-5xl w-full max-h-full overflow-auto">
            <img
              src={selectedDocument}
              alt="Document"
              className="w-full h-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stripe Identity Verified Data Section ──────────────────────────────
function StripeIdentityData({ guest, onViewPhoto }: { guest: Guest; onViewPhoto: (url: string) => void }) {
  const [photoErrors, setPhotoErrors] = useState<Record<string, boolean>>({})

  const verifiedName = [guest.stripeVerifiedFirstName, guest.stripeVerifiedLastName].filter(Boolean).join(' ')
  const dob = guest.stripeVerifiedDob || guest.dateOfBirth
  const dlNumber = guest.stripeVerifiedIdNumber || guest.driverLicenseNumber
  const dlExpiry = guest.stripeVerifiedIdExpiry || guest.driverLicenseExpiry
  const isExpired = dlExpiry ? new Date(dlExpiry) < new Date() : false

  const hasPhotos = guest.stripeDocFrontFileId || guest.stripeDocBackFileId || guest.stripeSelfieFileId

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return null }
  }

  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base flex items-center gap-2 mb-3">
        <IoFingerPrintOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Stripe Identity — Verified Data
      </h3>

      {/* ID Photos — only render photos that actually exist */}
      {hasPhotos && (
        <div className={`grid gap-3 mb-4 ${
          [guest.stripeDocFrontFileId, guest.stripeDocBackFileId, guest.stripeSelfieFileId].filter(Boolean).length === 1
            ? 'grid-cols-1 max-w-xs'
            : [guest.stripeDocFrontFileId, guest.stripeDocBackFileId, guest.stripeSelfieFileId].filter(Boolean).length === 2
            ? 'grid-cols-2'
            : 'grid-cols-3'
        }`}>
          {[
            { label: 'ID Front', fileId: guest.stripeDocFrontFileId },
            { label: 'ID Back', fileId: guest.stripeDocBackFileId },
            { label: 'Selfie', fileId: guest.stripeSelfieFileId },
          ].filter(({ fileId }) => fileId && !photoErrors[fileId!]).map(({ label, fileId }) => {
            const url = stripeFileUrl(fileId!)
            return (
              <div
                key={label}
                className="relative group bg-blue-100/50 dark:bg-blue-900/30 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => onViewPhoto(url)}
              >
                <img
                  src={url}
                  alt={label}
                  className="w-full h-28 object-cover"
                  onError={() => setPhotoErrors(prev => ({ ...prev, [fileId!]: true }))}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <IoEyeOutline className="text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity" />
                </div>
                <p className="text-xs text-center py-1 text-blue-600 dark:text-blue-400">{label}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Verified Data Grid — only show fields that have values */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {verifiedName && (
          <div>
            <p className="text-blue-600/70 dark:text-blue-400/70">Verified Name</p>
            <p className="font-medium text-blue-900 dark:text-blue-100">{verifiedName}</p>
          </div>
        )}
        {dob && (
          <div>
            <p className="text-blue-600/70 dark:text-blue-400/70">Date of Birth</p>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {formatDate(dob)}
              {!guest.stripeVerifiedDob && guest.dateOfBirth && (
                <span className="ml-1 px-1 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Profile</span>
              )}
            </p>
          </div>
        )}
        {dlNumber && (
          <div>
            <p className="text-blue-600/70 dark:text-blue-400/70">DL Number</p>
            <p className="font-medium text-blue-900 dark:text-blue-100 font-mono">
              {dlNumber}
              {!guest.stripeVerifiedIdNumber && guest.driverLicenseNumber && (
                <span className="ml-1 px-1 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-sans">Profile</span>
              )}
            </p>
          </div>
        )}
        {dlExpiry && (
          <div>
            <p className="text-blue-600/70 dark:text-blue-400/70">DL Expiry</p>
            <p className={`font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-blue-900 dark:text-blue-100'}`}>
              {formatDate(dlExpiry)}
              {isExpired && ' (Expired)'}
              {!guest.stripeVerifiedIdExpiry && guest.driverLicenseExpiry && (
                <span className="ml-1 px-1 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Profile</span>
              )}
            </p>
          </div>
        )}
        {guest.stripeVerifiedAddress && (
          <div className="col-span-2">
            <p className="text-blue-600/70 dark:text-blue-400/70">Verified Address</p>
            <p className="font-medium text-blue-900 dark:text-blue-100">{guest.stripeVerifiedAddress}</p>
          </div>
        )}
      </div>
    </div>
  )
}