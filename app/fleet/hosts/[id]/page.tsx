// app/fleet/hosts/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ViewPolicyModal from '@/app/fleet/components/ViewPolicyModal'
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoStarOutline,
  IoCashOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoCardOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoIdCardOutline,
  IoImageOutline,
  IoEyeOutline,
  IoDownloadOutline,
  IoClose
} from 'react-icons/io5'

export default function HostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [host, setHost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [claims, setClaims] = useState<any[]>([])
  const [loadingClaims, setLoadingClaims] = useState(false)
  
  // Insurance modal states
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  // Document viewer state
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{
    type: string
    label: string
    urls: string[]
    pages: string[]
  } | null>(null)
  const [verifyingDocuments, setVerifyingDocuments] = useState(false)

  useEffect(() => {
    const loadHost = async () => {
      const { id } = await params
      const response = await fetch(`/fleet/api/hosts/${id}?key=phoenix-fleet-2847`)
      if (response.ok) {
        const data = await response.json()
        setHost(data.data)
      }
      setLoading(false)
    }
    loadHost()
  }, [params])

  useEffect(() => {
    if (activeTab === 'claims' && host?.id) {
      loadClaims()
    }
  }, [activeTab, host?.id])

  const loadClaims = async () => {
    if (!host?.id) return
    setLoadingClaims(true)
    try {
      const response = await fetch(`/api/fleet/claims?hostId=${host.id}`)
      if (response.ok) {
        const data = await response.json()
        setClaims(data.claims || [])
      }
    } catch (error) {
      console.error('Failed to load claims:', error)
    } finally {
      setLoadingClaims(false)
    }
  }

  const refreshHostData = async () => {
    if (!host?.id) return
    const response = await fetch(`/fleet/api/hosts/${host.id}?key=phoenix-fleet-2847`)
    if (response.ok) {
      const data = await response.json()
      setHost(data.data)
    }
  }

  const handleApproveInsurance = async () => {
    if (!confirm(`Approve P2P insurance for ${host.name}? This will set them to STANDARD tier (75% earnings).`)) {
      return
    }

    setProcessingAction(true)
    try {
      const response = await fetch(`/api/fleet/hosts/${host.id}/insurance/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          action: 'approve',
          reviewedBy: 'admin@itwhip.com',
          insuranceType: 'P2P'
        })
      })

      if (response.ok) {
        alert('P2P insurance approved successfully')
        await refreshHostData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve insurance')
      }
    } catch (error) {
      console.error('Failed to approve insurance:', error)
      alert('Failed to approve insurance')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRejectInsurance = async () => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    setProcessingAction(true)
    try {
      const response = await fetch(`/api/fleet/hosts/${host.id}/insurance/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          action: 'reject',
          reviewedBy: 'admin@itwhip.com',
          rejectionReason: reason,
          insuranceType: 'P2P'
        })
      })

      if (response.ok) {
        alert('Insurance rejected')
        await refreshHostData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reject insurance')
      }
    } catch (error) {
      console.error('Failed to reject insurance:', error)
      alert('Failed to reject insurance')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDeleteInsurance = async () => {
    if (!confirm(`Delete ${host.name}'s P2P insurance details? Their tier will be recalculated.`)) {
      return
    }

    setProcessingAction(true)
    try {
      const response = await fetch(`/api/fleet/hosts/${host.id}/insurance/approve`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          insuranceType: 'P2P'
        })
      })

      if (response.ok) {
        alert('Insurance deleted successfully')
        await refreshHostData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete insurance')
      }
    } catch (error) {
      console.error('Failed to delete insurance:', error)
      alert('Failed to delete insurance')
    } finally {
      setProcessingAction(false)
    }
  }

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'DENIED': return 'bg-red-100 text-red-800'
      case 'PAID': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInsuranceStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'DEACTIVATED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
      case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )
  
  if (!host) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Host not found</p>
          <Link 
            href="/fleet/hosts?key=phoenix-fleet-2847"
            className="mt-4 inline-block text-purple-600 hover:text-purple-700"
          >
            Back to Hosts
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Link
            href="/fleet/hosts?key=phoenix-fleet-2847"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBackOutline className="text-xl" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {host.name}
              </h1>
              {host.documentsVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 rounded-full">
                  <IoShieldCheckmarkOutline className="text-sm" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">
              {host.email} • {host.phone}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap ${
              host.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
              host.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {host.approvalStatus}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap ${
              host.hostType === 'PLATFORM' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {host.hostType === 'PLATFORM' ? 'Platform Fleet' : 'Partner Host'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold">{host.cars?.length || 0}</div>
            <div className="text-xs md:text-sm text-gray-600">Total Cars</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold">{host.totalTrips || 0}</div>
            <div className="text-xs md:text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4">
            {host.rating && host.rating > 0 ? (
              <div className="text-xl md:text-2xl font-bold">{host.rating.toFixed(1)}</div>
            ) : (
              <div className="text-xl md:text-2xl font-bold">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full font-medium">
                  New
                </span>
              </div>
            )}
            <div className="text-xs md:text-sm text-gray-600">Rating</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold">{(host.commissionRate * 100).toFixed(0)}%</div>
            <div className="text-xs md:text-sm text-gray-600">Commission</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold">{host.dashboardAccess ? 'Yes' : 'No'}</div>
            <div className="text-xs md:text-sm text-gray-600">Dashboard Access</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-px scrollbar-hide">
            {['overview', 'permissions', 'cars', 'documents', 'insurance', 'claims', 'banking'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize whitespace-nowrap text-sm md:text-base ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2 items-center">
                    <IoMailOutline className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{host.email}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <IoPhonePortraitOutline className="text-gray-400 flex-shrink-0" />
                    <span>{host.phone}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <IoLocationOutline className="text-gray-400 flex-shrink-0" />
                    <span>{host.city}, {host.state} {host.zipCode}</span>
                  </div>
                </div>
              </div>
              {host.bio && (
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{host.bio}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div>Joined: {new Date(host.joinedAt).toLocaleDateString()}</div>
                  {host.approvedAt && <div>Approved: {new Date(host.approvedAt).toLocaleDateString()}</div>}
                  {host.approvedBy && <div>Approved By: {host.approvedBy}</div>}
                  <div>Active: {host.active ? 'Yes' : 'No'}</div>
                  <div>Verified: {host.isVerified ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Dashboard Permissions</h3>
              {[
                { key: 'dashboardAccess', label: 'Dashboard Access' },
                { key: 'canViewBookings', label: 'View Bookings' },
                { key: 'canEditCalendar', label: 'Edit Calendar' },
                { key: 'canSetPricing', label: 'Set Pricing' },
                { key: 'canMessageGuests', label: 'Message Guests' },
                { key: 'canWithdrawFunds', label: 'Withdraw Funds' },
              ].map((perm) => (
                <div key={perm.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm md:text-base">{perm.label}</span>
                  <span className="flex items-center gap-2">
                    {host[perm.key] ? (
                      <>
                        <IoLockOpenOutline className="text-green-600" />
                        <span className="text-green-600 text-sm">Enabled</span>
                      </>
                    ) : (
                      <>
                        <IoLockClosedOutline className="text-red-600" />
                        <span className="text-red-600 text-sm">Disabled</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
              
              {(host.minDailyRate || host.maxDailyRate) && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <h4 className="font-semibold mb-2">Pricing Boundaries</h4>
                  <div className="text-sm space-y-1">
                    {host.minDailyRate && <div>Min Daily Rate: ${host.minDailyRate}</div>}
                    {host.maxDailyRate && <div>Max Daily Rate: ${host.maxDailyRate}</div>}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <h4 className="font-semibold mb-2">Commission & Banking</h4>
                <div className="text-sm space-y-1">
                  <div>Commission Rate: {(host.commissionRate * 100).toFixed(0)}%</div>
                  <div>Bank Verified: {host.bankVerified ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cars' && (
            <div>
              <h3 className="font-semibold mb-4">Vehicles ({host.cars?.length || 0})</h3>
              {host.cars?.length > 0 ? (
                <div className="space-y-2">
                  {host.cars.map((car: any) => (
                    <div key={car.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-16 h-12 rounded flex-shrink-0 relative">
                          {/* Placeholder always visible as base layer */}
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <IoCarOutline className="text-gray-400" />
                          </div>
                          {/* Image overlays placeholder when it loads successfully */}
                          {car.heroPhoto && (
                            <img
                              src={car.heroPhoto}
                              alt={car.model}
                              className="absolute inset-0 w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{car.year} {car.make} {car.model}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ${car.dailyRate}/day • {car.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/fleet/edit/${car.id}?key=phoenix-fleet-2847`}
                        className="text-purple-600 hover:text-purple-700 text-sm whitespace-nowrap ml-2"
                      >
                        Edit →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No vehicles assigned</p>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Document Verification Status */}
              <div className={`p-4 rounded-lg border ${
                host.documentsVerified
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {host.documentsVerified ? (
                      <IoShieldCheckmarkOutline className="text-xl text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <IoTimeOutline className="text-xl text-yellow-600 dark:text-yellow-400" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {host.documentsVerified ? 'Documents Verified' : 'Documents Pending Review'}
                    </span>
                  </div>
                  {!host.documentsVerified && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Verify all documents for ${host.name}? This will mark the host as document-verified.`)) return
                        setVerifyingDocuments(true)
                        try {
                          const response = await fetch(`/fleet/api/hosts/${host.id}?key=phoenix-fleet-2847`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ documentsVerified: true })
                          })
                          if (response.ok) {
                            await refreshHostData()
                            alert('Documents verified successfully')
                          }
                        } catch (error) {
                          console.error('Failed to verify documents:', error)
                          alert('Failed to verify documents')
                        } finally {
                          setVerifyingDocuments(false)
                        }
                      }}
                      disabled={verifyingDocuments}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {verifyingDocuments ? 'Verifying...' : 'Verify All'}
                    </button>
                  )}
                </div>
              </div>

              {/* Photo ID Section */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <IoIdCardOutline className="text-purple-600" />
                  Photo ID
                </h3>

                {host.photoIdType ? (
                  <div className="space-y-4">
                    {/* ID Type Label */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full font-medium">
                        {host.photoIdType === 'GOVERNMENT_ID' ? 'Government ID' :
                         host.photoIdType === 'DRIVERS_LICENSE' ? "Driver's License" :
                         host.photoIdType === 'PASSPORT' ? 'Passport' : host.photoIdType}
                      </span>
                      {host.photoIdVerified ? (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                          Pending Review
                        </span>
                      )}
                    </div>

                    {/* Photo ID Pages Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(() => {
                        const photoIdUrls = host.photoIdUrls || {}
                        const pages = host.photoIdType === 'PASSPORT'
                          ? [{ key: 'photo', label: 'Photo Page' }, { key: 'info', label: 'Info Page' }, { key: 'lastPage', label: 'Last Page' }]
                          : [{ key: 'front', label: 'Front' }, { key: 'back', label: 'Back' }]

                        return pages.map(({ key, label }) => (
                          <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            {photoIdUrls[key] ? (
                              <div className="relative group">
                                <img
                                  src={photoIdUrls[key]}
                                  alt={label}
                                  className="w-full h-32 object-cover bg-gray-100 dark:bg-gray-800"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedDocument({
                                        type: 'photoId',
                                        label: `${host.photoIdType === 'GOVERNMENT_ID' ? 'Government ID' : host.photoIdType === 'DRIVERS_LICENSE' ? "Driver's License" : 'Passport'} - ${label}`,
                                        urls: [photoIdUrls[key]],
                                        pages: [label]
                                      })
                                      setShowDocumentViewer(true)
                                    }}
                                    className="p-2 bg-white/90 rounded-full hover:bg-white"
                                  >
                                    <IoEyeOutline className="text-gray-900" />
                                  </button>
                                  <a
                                    href={photoIdUrls[key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white/90 rounded-full hover:bg-white"
                                  >
                                    <IoDownloadOutline className="text-gray-900" />
                                  </a>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 text-center">
                                  {label}
                                </div>
                              </div>
                            ) : (
                              <div className="h-32 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400">
                                <IoImageOutline className="text-2xl mb-1" />
                                <span className="text-xs">{label} - Not uploaded</span>
                              </div>
                            )}
                          </div>
                        ))
                      })()}
                    </div>

                    {/* View All Button */}
                    {host.photoIdUrls && Object.values(host.photoIdUrls).some(url => url) && (
                      <button
                        onClick={() => {
                          const photoIdUrls = host.photoIdUrls || {}
                          const pages = host.photoIdType === 'PASSPORT'
                            ? ['photo', 'info', 'lastPage']
                            : ['front', 'back']
                          const pageLabels = host.photoIdType === 'PASSPORT'
                            ? ['Photo Page', 'Info Page', 'Last Page']
                            : ['Front', 'Back']
                          setSelectedDocument({
                            type: 'photoId',
                            label: host.photoIdType === 'GOVERNMENT_ID' ? 'Government ID' : host.photoIdType === 'DRIVERS_LICENSE' ? "Driver's License" : 'Passport',
                            urls: pages.map(p => photoIdUrls[p]).filter(Boolean),
                            pages: pageLabels.filter((_, i) => photoIdUrls[pages[i]])
                          })
                          setShowDocumentViewer(true)
                        }}
                        className="w-full py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm font-medium"
                      >
                        View All Pages
                      </button>
                    )}

                    {/* Photo ID Verify Button */}
                    {!host.photoIdVerified && host.photoIdUrls && Object.keys(host.photoIdUrls).length > 0 && (
                      <button
                        onClick={async () => {
                          if (!confirm(`Verify Photo ID for ${host.name}?`)) return
                          setVerifyingDocuments(true)
                          try {
                            const response = await fetch(`/fleet/api/hosts/${host.id}?key=phoenix-fleet-2847`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ photoIdVerified: true })
                            })
                            if (response.ok) {
                              await refreshHostData()
                              alert('Photo ID verified')
                            }
                          } catch (error) {
                            console.error('Failed to verify:', error)
                          } finally {
                            setVerifyingDocuments(false)
                          }
                        }}
                        disabled={verifyingDocuments}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {verifyingDocuments ? 'Verifying...' : 'Verify Photo ID'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <IoIdCardOutline className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No Photo ID uploaded</p>
                  </div>
                )}
              </div>

              {/* Legacy Documents Section */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <IoDocumentTextOutline className="text-purple-600" />
                  Other Documents
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'insuranceDocUrl', label: 'Insurance Document', icon: IoShieldCheckmarkOutline },
                    { key: 'governmentIdUrl', label: 'Government ID (Legacy)', icon: IoIdCardOutline },
                    { key: 'driversLicenseUrl', label: "Driver's License (Legacy)", icon: IoCarOutline },
                  ].map((doc) => (
                    <div key={doc.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <doc.icon className="text-xl text-gray-500" />
                        <span className="text-sm md:text-base text-gray-900 dark:text-white">{doc.label}</span>
                      </div>
                      {host[doc.key] ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDocument({
                                type: doc.key,
                                label: doc.label,
                                urls: [host[doc.key]],
                                pages: ['Document']
                              })
                              setShowDocumentViewer(true)
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                          >
                            <IoEyeOutline className="text-lg" />
                          </button>
                          <a
                            href={host[doc.key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          >
                            <IoDownloadOutline className="text-lg" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Insurance Coverage</h3>
                <button
                  onClick={async () => {
                    const response = await fetch(`/api/fleet/hosts/${host.id}/insurance`, {
                      headers: {
                        'x-fleet-key': 'phoenix-fleet-2847'
                      }
                    })
                    if (response.ok) {
                      await refreshHostData()
                    }
                  }}
                  className="px-3 py-1.5 text-xs md:text-sm text-purple-600 hover:text-purple-700 border border-purple-600 rounded-lg hover:bg-purple-50"
                >
                  Refresh
                </button>
              </div>

              {/* Platform Insurance Section */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="text-purple-600" />
                  Platform Trip Insurance
                </h4>
                
                {host.insuranceProviderId ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
                            Insurance Assigned
                          </p>
                          <p className="text-xs text-green-800 dark:text-green-300 mb-2">
                            This host has been assigned an insurance provider. All their vehicles are automatically covered.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-green-700 dark:text-green-400">
                            <span className="truncate">Provider: <strong>{host.insuranceProvider?.name || 'Unknown'}</strong></span>
                            {host.insurancePolicyNumber && (
                              <span className="truncate">Policy: <strong>{host.insurancePolicyNumber}</strong></span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPolicyModal(true)}
                          className="ml-2 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
                        >
                          View Policy
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Provider Name</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {host.insuranceProvider.name}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {host.insuranceProvider.type}
                        </span>
                      </div>

                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Policy Number</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono break-all">
                          {host.insurancePolicyNumber || 'Not Set'}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                          host.insuranceActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {host.insuranceActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <IoWarningOutline className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                          No Insurance Assigned
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 mb-3">
                          This host does not have an insurance provider assigned. Their vehicles may not have coverage.
                        </p>
                        <button
                          onClick={() => router.push(`/fleet/hosts/${host.id}/insurance/assign?key=phoenix-fleet-2847`)}
                          className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          Assign Insurance Provider
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Host's Personal P2P Insurance Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <IoDocumentTextOutline className="text-blue-600" />
                  Host's Personal P2P Insurance
                </h4>

                {host.hostInsuranceProvider ? (
                  <div className="space-y-4">
                    <div className={`border rounded-lg p-4 ${
                      host.hostInsuranceStatus === 'ACTIVE'
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : host.hostInsuranceStatus === 'PENDING'
                        ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {host.hostInsuranceProvider}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getInsuranceStatusColor(host.hostInsuranceStatus)}`}>
                              {host.hostInsuranceStatus}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <IoDocumentTextOutline className="w-3 h-3" />
                              <span>Policy: {host.hostPolicyNumber}</span>
                            </div>
                            {host.hostInsuranceExpires && (
                              <div className="flex items-center gap-2">
                                <IoCalendarOutline className="w-3 h-3" />
                                <span>Expires: {new Date(host.hostInsuranceExpires).toLocaleDateString()}</span>
                              </div>
                            )}
                            {host.hostInsuranceDeactivatedAt && host.hostInsuranceStatus === 'DEACTIVATED' && (
                              <div className="flex items-center gap-2">
                                <IoTimeOutline className="w-3 h-3" />
                                <span>Deactivated: {new Date(host.hostInsuranceDeactivatedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Earnings Tier:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              host.hostInsuranceStatus === 'ACTIVE' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {host.hostInsuranceStatus === 'ACTIVE' ? 'STANDARD (75%)' : 'Current Tier'}
                            </span>
                          </div>
                        </div>
                        {host.hostInsuranceStatus !== 'ACTIVE' && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {host.hostInsuranceStatus === 'PENDING' 
                              ? 'Approve to upgrade to STANDARD tier (75% earnings)'
                              : 'Host not at STANDARD tier'
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        {host.hostInsuranceStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={handleApproveInsurance}
                              disabled={processingAction}
                              className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <IoCheckmarkCircleOutline className="w-4 h-4" />
                              Approve P2P
                            </button>
                            <button
                              onClick={handleRejectInsurance}
                              disabled={processingAction}
                              className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <IoCloseCircleOutline className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {(host.hostInsuranceStatus === 'ACTIVE' || host.hostInsuranceStatus === 'DEACTIVATED') && (
                          <button
                            onClick={handleDeleteInsurance}
                            disabled={processingAction}
                            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete Insurance
                          </button>
                        )}
                      </div>
                    </div>

                    {host.hostInsuranceStatus === 'PENDING' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          <strong>Pending Review:</strong> Host submitted P2P insurance. Approve to upgrade to STANDARD tier (75% earnings).
                        </p>
                      </div>
                    )}

                    {host.hostInsuranceStatus === 'ACTIVE' && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-xs text-green-800 dark:text-green-300">
                          <strong>Active:</strong> Host is at STANDARD tier earning 75% per booking.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <IoWarningOutline className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          No Personal P2P Insurance Submitted
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Host has not submitted P2P insurance details. They can add it to reach STANDARD tier (75% earnings).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Commercial Insurance Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="text-purple-600" />
                  Host's Commercial Insurance
                </h4>

                {host.commercialInsuranceProvider ? (
                  <div className="space-y-4">
                    <div className={`border rounded-lg p-4 ${
                      host.commercialInsuranceStatus === 'ACTIVE'
                        ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20'
                        : host.commercialInsuranceStatus === 'PENDING'
                        ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {host.commercialInsuranceProvider}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getInsuranceStatusColor(host.commercialInsuranceStatus)}`}>
                              {host.commercialInsuranceStatus}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <IoDocumentTextOutline className="w-3 h-3" />
                              <span>Policy: {host.commercialPolicyNumber}</span>
                            </div>
                            {host.commercialInsuranceExpires && (
                              <div className="flex items-center gap-2">
                                <IoCalendarOutline className="w-3 h-3" />
                                <span>Expires: {new Date(host.commercialInsuranceExpires).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Earnings Tier:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              host.commercialInsuranceStatus === 'ACTIVE' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {host.commercialInsuranceStatus === 'ACTIVE' ? 'PREMIUM (90%)' : 'Current Tier'}
                            </span>
                            {host.commercialInsuranceStatus === 'ACTIVE' && (
                              <span className="text-xs text-purple-600">(Maximum)</span>
                            )}
                          </div>
                        </div>
                        {host.commercialInsuranceStatus !== 'ACTIVE' && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {host.commercialInsuranceStatus === 'PENDING' 
                              ? 'Approve to upgrade host to PREMIUM tier (90% earnings)'
                              : 'Host not at PREMIUM tier'
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        {host.commercialInsuranceStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={async () => {
                                if (!confirm(`Approve commercial insurance for ${host.name}? This will upgrade them to PREMIUM tier (90% earnings).`)) {
                                  return
                                }
                                
                                setProcessingAction(true)
                                try {
                                  const response = await fetch(`/api/fleet/hosts/${host.id}/insurance/approve`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'x-fleet-key': 'phoenix-fleet-2847'
                                    },
                                    body: JSON.stringify({
                                      action: 'approve',
                                      reviewedBy: 'admin@itwhip.com',
                                      insuranceType: 'COMMERCIAL'
                                    })
                                  })
                                  
                                  if (response.ok) {
                                    alert('Commercial insurance approved successfully')
                                    await refreshHostData()
                                  } else {
                                    const data = await response.json()
                                    alert(data.error || 'Failed to approve insurance')
                                  }
                                } catch (error) {
                                  console.error('Failed to approve insurance:', error)
                                  alert('Failed to approve insurance')
                                } finally {
                                  setProcessingAction(false)
                                }
                              }}
                              disabled={processingAction}
                              className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <IoCheckmarkCircleOutline className="w-4 h-4" />
                              Approve Commercial
                            </button>
                            <button
                              onClick={async () => {
                                const reason = prompt('Enter rejection reason:')
                                if (!reason) return
                                
                                setProcessingAction(true)
                                try {
                                  const response = await fetch(`/api/fleet/hosts/${host.id}/insurance/approve`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'x-fleet-key': 'phoenix-fleet-2847'
                                    },
                                    body: JSON.stringify({
                                      action: 'reject',
                                      reviewedBy: 'admin@itwhip.com',
                                      rejectionReason: reason,
                                      insuranceType: 'COMMERCIAL'
                                    })
                                  })
                                  
                                  if (response.ok) {
                                    alert('Commercial insurance rejected')
                                    await refreshHostData()
                                  } else {
                                    const data = await response.json()
                                    alert(data.error || 'Failed to reject insurance')
                                  }
                                } catch (error) {
                                  console.error('Failed to reject insurance:', error)
                                  alert('Failed to reject insurance')
                                } finally {
                                  setProcessingAction(false)
                                }
                              }}
                              disabled={processingAction}
                              className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <IoCloseCircleOutline className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {host.commercialInsuranceStatus === 'ACTIVE' && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete commercial insurance for ${host.name}? They will drop to lower tier.`)) return
                              
                              setProcessingAction(true)
                              try {
                                const response = await fetch(`/api/fleet/hosts/${host.id}/insurance/approve`, {
                                  method: 'DELETE',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'x-fleet-key': 'phoenix-fleet-2847'
                                  },
                                  body: JSON.stringify({
                                    insuranceType: 'COMMERCIAL'
                                  })
                                })
                                
                                if (response.ok) {
                                  alert('Commercial insurance deleted')
                                  await refreshHostData()
                                }
                              } catch (error) {
                                console.error('Failed to delete:', error)
                              } finally {
                                setProcessingAction(false)
                              }
                            }}
                            disabled={processingAction}
                            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete Insurance
                          </button>
                        )}
                      </div>
                    </div>

                    {host.commercialInsuranceStatus === 'PENDING' && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                        <p className="text-xs text-purple-800 dark:text-purple-300">
                          <strong>Pending Review:</strong> Host submitted commercial insurance. Approve to upgrade to PREMIUM tier (90% earnings).
                        </p>
                      </div>
                    )}

                    {host.commercialInsuranceStatus === 'ACTIVE' && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                        <p className="text-xs text-purple-800 dark:text-purple-300">
                          <strong>Active:</strong> Host is at PREMIUM tier earning 90% per booking.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <IoWarningOutline className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          No Commercial Insurance Submitted
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Host has not submitted commercial insurance. They can add it to reach PREMIUM tier (90% earnings).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Coverage Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-3">Vehicle Coverage Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {host.cars?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Vehicles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {host.insuranceProviderId ? host.cars?.length || 0 : 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Covered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {host.insuranceProviderId ? 0 : host.cars?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Gaps</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {host.insuranceProviderId ? (
                  <>
                    <button
                      onClick={async () => {
                        if (confirm(`Remove insurance assignment from ${host.name}? Their vehicles will lose coverage.`)) {
                          const response = await fetch(
                            `/api/fleet/hosts/${host.id}/insurance?removedBy=admin@itwhip.com`,
                            { 
                              method: 'DELETE',
                              headers: {
                                'x-fleet-key': 'phoenix-fleet-2847'
                              }
                            }
                          )
                          if (response.ok) {
                            alert('Insurance removed successfully')
                            await refreshHostData()
                          } else {
                            const error = await response.json()
                            alert(`Failed to remove insurance: ${error.error}`)
                          }
                        }
                      }}
                      className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      Remove Platform Insurance
                    </button>
                    <button
                      onClick={async () => {
                        const newPolicyNumber = prompt('Enter new policy number:', host.insurancePolicyNumber || '')
                        if (newPolicyNumber !== null) {
                          const response = await fetch(`/api/fleet/hosts/${host.id}/insurance`, {
                            method: 'PATCH',
                            headers: { 
                              'Content-Type': 'application/json',
                              'x-fleet-key': 'phoenix-fleet-2847'
                            },
                            body: JSON.stringify({
                              policyNumber: newPolicyNumber,
                              updatedBy: 'admin@itwhip.com'
                            })
                          })
                          if (response.ok) {
                            alert('Policy number updated')
                            await refreshHostData()
                          }
                        }
                      }}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Update Policy Number
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push(`/fleet/hosts/${host.id}/insurance/assign?key=phoenix-fleet-2847`)}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Assign Platform Insurance
                  </button>
                )}
                <Link
                  href={`/fleet/insurance/coverage/gaps?key=phoenix-fleet-2847`}
                  className="px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
                >
                  View Coverage Gaps
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Insurance Claims</h3>
                <button
                  onClick={loadClaims}
                  className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  Refresh
                </button>
              </div>

              {loadingClaims ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading claims...</p>
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <IoDocumentTextOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No claims filed by this host</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getClaimStatusColor(claim.status)}`}>
                              {claim.status}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              {claim.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Booking: {claim.booking?.bookingCode || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {claim.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${claim.approvedAmount || claim.estimatedCost}
                          </p>
                          <p className="text-xs text-gray-500">
                            {claim.approvedAmount ? 'Approved' : 'Estimated'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500">Incident Date</p>
                          <p className="text-sm font-medium">
                            {new Date(claim.incidentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Filed</p>
                          <p className="text-sm font-medium">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Insurance Tier</p>
                          <p className="text-sm font-medium">
                            {claim.policy?.tier || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'banking' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <h3 className="font-semibold">Banking & Payments</h3>
                <Link
                  href={`/fleet/hosts/${host.id}/banking?key=phoenix-fleet-2847`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap"
                >
                  View Full Banking
                </Link>
              </div>

              {/* Quick Banking Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Balance</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    ${host.currentBalance?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    ${host.pendingBalance?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">On Hold</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    ${host.holdBalance?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Payouts</div>
                  <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    ${host.totalPayoutsAmount?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* Stripe Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <IoCardOutline className="text-purple-600" />
                    Stripe Connect
                  </h4>
                  {host.stripeConnectAccountId ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className={host.stripePayoutsEnabled ? 'text-green-600' : 'text-yellow-600'}>
                          {host.stripeAccountStatus || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payouts</span>
                        <span className={host.stripePayoutsEnabled ? 'text-green-600' : 'text-red-600'}>
                          {host.stripePayoutsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <IoBusinessOutline className="text-purple-600" />
                    Subscription
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tier</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        host.subscriptionTier === 'FLEET_MANAGER' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {host.subscriptionTier || 'FREE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <span className={host.subscriptionStatus === 'ACTIVE' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}>
                        {host.subscriptionStatus || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Fee</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${host.monthlySubscriptionFee?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Access the full banking dashboard to charge host, hold funds, manage payouts, and view complete transaction history.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 flex-wrap">
          {host.approvalStatus === 'PENDING' && (
            <Link
              href={`/fleet/hosts/${host.id}/review?key=phoenix-fleet-2847`}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
            >
              Review Application
            </Link>
          )}
          <Link
            href={`/fleet/hosts/${host.id}/edit?key=phoenix-fleet-2847`}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Edit Host
          </Link>
          <Link
            href={`/fleet/hosts/${host.id}/permissions?key=phoenix-fleet-2847`}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Manage Permissions
          </Link>
          <Link
            href={`/fleet/hosts/${host.id}/banking?key=phoenix-fleet-2847`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Banking Dashboard
          </Link>
          {host.dashboardAccess && (
            <button
              onClick={() => {
                alert('Login as host feature to be implemented')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Login as Host
            </button>
          )}
        </div>
      </div>

      {/* Policy View Modal */}
      {showPolicyModal && host.insuranceProvider && (
        <ViewPolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
          provider={host.insuranceProvider}
        />
      )}

      {/* Document Viewer Bottom Sheet */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowDocumentViewer(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-t-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedDocument.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDocument.pages.length} page{selectedDocument.pages.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedDocument.urls.length === 1 ? (
                // Single image view
                <div className="flex justify-center">
                  <img
                    src={selectedDocument.urls[0]}
                    alt={selectedDocument.label}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                // Multiple images grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDocument.urls.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedDocument.pages[index]}
                      </div>
                      <img
                        src={url}
                        alt={selectedDocument.pages[index]}
                        className="w-full max-h-[40vh] object-contain bg-gray-100 dark:bg-gray-900 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href={selectedDocument.urls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-center text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm font-medium"
              >
                Open in New Tab
              </a>
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="flex-1 py-2 text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}