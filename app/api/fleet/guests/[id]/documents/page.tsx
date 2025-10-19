// app/fleet/guests/[id]/documents/page.tsx
// ✅ UPDATED: Added "Verify All Documents" button functionality

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface GuestDocuments {
  id: string
  name: string
  email: string | null
  profilePhotoUrl: string | null
  
  // Documents
  governmentIdUrl: string | null
  governmentIdType: string | null
  driversLicenseUrl: string | null
  selfieUrl: string | null
  
  // Verification
  documentsVerified: boolean
  documentVerifiedAt: string | null
  documentVerifiedBy: string | null
  
  // Insurance (optional)
  insuranceCardUrl: string | null
  insuranceVerified: boolean
  insuranceVerifiedAt: string | null
}

export default function FleetGuestDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [guestId, setGuestId] = useState<string>('')
  const [guest, setGuest] = useState<GuestDocuments | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifyingDocs, setVerifyingDocs] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setGuestId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (guestId) {
      fetchGuestDocuments()
    }
  }, [guestId])

  const fetchGuestDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/guests/${guestId}?key=phoenix-fleet-2847`)

      if (response.ok) {
        const data = await response.json()
        setGuest(data.guest)
      } else {
        console.error('Failed to fetch guest documents')
      }
    } catch (error) {
      console.error('Error fetching guest documents:', error)
    } finally {
      setLoading(false)
    }
  }

  // ========== ✅ NEW FUNCTION: Verify All Documents ==========
  const handleVerifyAllDocuments = async () => {
    if (!guest) return

    // Check if all documents are uploaded
    if (!guest.governmentIdUrl || !guest.driversLicenseUrl || !guest.selfieUrl) {
      alert('Cannot verify - not all documents have been uploaded yet.')
      return
    }

    // Check if already verified
    if (guest.documentsVerified) {
      alert('Documents are already verified.')
      return
    }

    // Confirm action
    if (!confirm(`Verify all documents for ${guest.name}?\n\nThis will mark their profile as verified and allow them to book vehicles.`)) {
      return
    }

    setVerifyingDocs(true)
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/verify-documents?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminName: 'Fleet Admin' // You can customize this based on logged-in admin
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(`✅ Success!\n\nDocuments verified for ${guest.name}.\nThey can now book vehicles.`)
        
        // Refresh guest data
        await fetchGuestDocuments()
      } else {
        alert(`❌ Error\n\n${data.error || 'Failed to verify documents'}`)
      }
    } catch (error) {
      console.error('Error verifying documents:', error)
      alert('❌ Failed to verify documents. Please try again.')
    } finally {
      setVerifyingDocs(false)
    }
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const getDocumentStatus = (url: string | null, verified: boolean) => {
    if (verified && url) {
      return {
        text: 'Verified',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        icon: IoCheckmarkCircleOutline
      }
    } else if (url) {
      return {
        text: 'Uploaded',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        icon: IoDocumentTextOutline
      }
    } else {
      return {
        text: 'Missing',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        icon: IoCloseCircleOutline
      }
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
          <IoDocumentTextOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Guest not found</h3>
          <Link href="/fleet/guests?key=phoenix-fleet-2847" className="text-purple-600 hover:text-purple-700">
            Back to Guests
          </Link>
        </div>
      </div>
    )
  }

  // ========== ✅ NEW: Calculate verification status ==========
  const allDocsUploaded = !!(guest.governmentIdUrl && guest.driversLicenseUrl && guest.selfieUrl)
  const canVerify = allDocsUploaded && !guest.documentsVerified

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/fleet/guests/${guestId}?key=phoenix-fleet-2847`)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to Guest Profile
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {guest.profilePhotoUrl ? (
                <img
                  src={guest.profilePhotoUrl}
                  alt={guest.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {guest.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {guest.name}'s Documents
                </h1>
                {guest.email && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{guest.email}</p>
                )}
              </div>
            </div>

            {/* ========== ✅ NEW: Verification Status Badge ========== */}
            {guest.documentsVerified ? (
              <div className="flex flex-col items-end">
                <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
                  Documents Verified
                </span>
                {guest.documentVerifiedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Verified {new Date(guest.documentVerifiedAt).toLocaleDateString()} by {guest.documentVerifiedBy}
                  </p>
                )}
              </div>
            ) : allDocsUploaded ? (
              <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <IoAlertCircleOutline className="w-5 h-5 mr-2" />
                Pending Review
              </span>
            ) : (
              <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <IoAlertCircleOutline className="w-5 h-5 mr-2" />
                Incomplete
              </span>
            )}
          </div>
        </div>

        {/* ========== ✅ NEW: Verify All Documents Button ========== */}
        {canVerify && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Ready for Verification
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    All required documents have been uploaded. Review them below and click "Verify All Documents" to approve.
                  </p>
                </div>
              </div>
              <button
                onClick={handleVerifyAllDocuments}
                disabled={verifyingDocs}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap ml-4"
              >
                {verifyingDocs ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline className="w-5 h-5" />
                    <span>Verify All Documents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Government ID */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Government ID
              </h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                getDocumentStatus(guest.governmentIdUrl, guest.documentsVerified).bgColor
              } ${getDocumentStatus(guest.governmentIdUrl, guest.documentsVerified).color}`}>
                {getDocumentStatus(guest.governmentIdUrl, guest.documentsVerified).text}
              </span>
            </div>

            {guest.governmentIdUrl ? (
              <div>
                {guest.governmentIdType && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Type: {guest.governmentIdType}
                  </p>
                )}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={guest.governmentIdUrl}
                    alt="Government ID"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openImageModal(guest.governmentIdUrl!)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <IoEyeOutline className="w-4 h-4 mr-2" />
                    View Full Size
                  </button>
                  <Link
                    href={guest.governmentIdUrl}
                    download
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <IoDownloadOutline className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No document uploaded</p>
              </div>
            )}
          </div>

          {/* Driver's License */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Driver's License
              </h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                getDocumentStatus(guest.driversLicenseUrl, guest.documentsVerified).bgColor
              } ${getDocumentStatus(guest.driversLicenseUrl, guest.documentsVerified).color}`}>
                {getDocumentStatus(guest.driversLicenseUrl, guest.documentsVerified).text}
              </span>
            </div>

            {guest.driversLicenseUrl ? (
              <div>
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={guest.driversLicenseUrl}
                    alt="Driver's License"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openImageModal(guest.driversLicenseUrl!)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <IoEyeOutline className="w-4 h-4 mr-2" />
                    View Full Size
                  </button>
                  <Link
                    href={guest.driversLicenseUrl}
                    download
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <IoDownloadOutline className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No document uploaded</p>
              </div>
            )}
          </div>

          {/* Selfie Photo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selfie Photo
              </h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                getDocumentStatus(guest.selfieUrl, guest.documentsVerified).bgColor
              } ${getDocumentStatus(guest.selfieUrl, guest.documentsVerified).color}`}>
                {getDocumentStatus(guest.selfieUrl, guest.documentsVerified).text}
              </span>
            </div>

            {guest.selfieUrl ? (
              <div>
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={guest.selfieUrl}
                    alt="Selfie"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openImageModal(guest.selfieUrl!)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <IoEyeOutline className="w-4 h-4 mr-2" />
                    View Full Size
                  </button>
                  <Link
                    href={guest.selfieUrl}
                    download
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <IoDownloadOutline className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No photo uploaded</p>
              </div>
            )}
          </div>

          {/* Insurance Card (Optional) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insurance Card <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                getDocumentStatus(guest.insuranceCardUrl, guest.insuranceVerified).bgColor
              } ${getDocumentStatus(guest.insuranceCardUrl, guest.insuranceVerified).color}`}>
                {getDocumentStatus(guest.insuranceCardUrl, guest.insuranceVerified).text}
              </span>
            </div>

            {guest.insuranceCardUrl ? (
              <div>
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={guest.insuranceCardUrl}
                    alt="Insurance Card"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openImageModal(guest.insuranceCardUrl!)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <IoEyeOutline className="w-4 h-4 mr-2" />
                    View Full Size
                  </button>
                  <Link
                    href={guest.insuranceCardUrl}
                    download
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <IoDownloadOutline className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No insurance card uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Document Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}