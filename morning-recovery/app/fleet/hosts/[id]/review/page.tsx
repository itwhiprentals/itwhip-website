// app/fleet/hosts/[id]/review/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoPersonOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoExpandOutline,
  IoCardOutline,
  IoCarOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'
import DocumentViewer from '@/app/components/DocumentViewer'
import StatusBadge from '@/app/components/StatusBadge'
import DocumentRequestModal from '@/app/fleet/components/DocumentRequestModal'
import BackgroundCheckStatus from '@/app/fleet/components/BackgroundCheckStatus'

interface HostDetails {
  id: string
  name: string
  email: string
  phone: string
  bio?: string
  profilePhoto?: string
  
  // Location
  city: string
  state: string
  zipCode?: string
  
  // Documents with statuses
  governmentIdUrl?: string
  governmentIdStatus?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  driversLicenseUrl?: string
  driversLicenseStatus?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  insuranceDocUrl?: string
  insuranceDocStatus?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  bankAccountInfo?: string
  bankAccountStatus?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  documentsVerified: boolean
  
  // Status
  hostType: string
  approvalStatus: string
  
  // Background Check
  backgroundCheck?: {
    id: string
    hostId: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
    identityCheck?: 'PASS' | 'FAIL' | 'PENDING'
    dmvCheck?: 'PASS' | 'FAIL' | 'PENDING'
    criminalCheck?: 'PASS' | 'FAIL' | 'PENDING'
    creditCheck?: 'PASS' | 'FAIL' | 'PENDING'
    insuranceCheck?: 'PASS' | 'FAIL' | 'PENDING'
    startedAt?: string
    completedAt?: string
    estimatedCompletion?: string
    notes?: string
  }
  
  // Stats
  totalTrips: number
  rating: number
  
  // Dates
  createdAt: string
  joinedAt: string
  
  // Vehicles
  cars: any[]
}

interface PermissionSettings {
  canViewBookings: boolean
  canEditCalendar: boolean
  canSetPricing: boolean
  canMessageGuests: boolean
  canWithdrawFunds: boolean
}

export default function HostReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [hostId, setHostId] = useState<string>('')
  const [host, setHost] = useState<HostDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<{ url: string; title: string } | null>(null)
  const [showDocRequestModal, setShowDocRequestModal] = useState(false)
  
  // Approval settings
  const [commissionRate, setCommissionRate] = useState(20)
  const [minDailyRate, setMinDailyRate] = useState(50)
  const [maxDailyRate, setMaxDailyRate] = useState(500)
  const [permissions, setPermissions] = useState<PermissionSettings>({
    canViewBookings: true,
    canEditCalendar: true,
    canSetPricing: false,
    canMessageGuests: true,
    canWithdrawFunds: false
  })
  const [notes, setNotes] = useState('')

  useEffect(() => {
    params.then(p => {
      setHostId(p.id)
      fetchHostDetails(p.id)
    })
  }, [params])

  const fetchHostDetails = async (id: string) => {
    try {
      const response = await fetch(`/fleet/api/hosts/${id}?key=phoenix-fleet-2847`)
      const data = await response.json()
      
      if (data.success) {
        setHost(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch host details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this host?')) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/fleet/api/hosts/${hostId}/approve?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate: commissionRate / 100,
          minDailyRate,
          maxDailyRate,
          permissions,
          notes
        })
      })

      if (response.ok) {
        router.push('/fleet/hosts/pending?key=phoenix-fleet-2847')
      }
    } catch (error) {
      console.error('Failed to approve host:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/fleet/api/hosts/${hostId}/approve?key=phoenix-fleet-2847`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        router.push('/fleet/hosts/pending?key=phoenix-fleet-2847')
      }
    } catch (error) {
      console.error('Failed to reject host:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDocumentRequest = async (documents: string[], message: string) => {
    try {
      const response = await fetch(`/fleet/api/hosts/${hostId}/request-info?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents, message })
      })

      if (response.ok) {
        alert('Document request sent successfully')
        fetchHostDetails(hostId) // Refresh data
      }
    } catch (error) {
      console.error('Failed to send document request:', error)
      throw error
    }
  }

  const handleInitiateBackgroundCheck = async () => {
    if (!confirm('Start background check for this host?')) return
    
    try {
      const response = await fetch(`/fleet/api/hosts/${hostId}/background-check?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        fetchHostDetails(hostId) // Refresh to show check status
      }
    } catch (error) {
      console.error('Failed to initiate background check:', error)
    }
  }

  const getDocumentStatusIcon = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return <IoCheckmarkCircleOutline className="text-2xl text-green-500" />
      case 'REJECTED':
        return <IoCloseCircleOutline className="text-2xl text-red-500" />
      case 'SUBMITTED':
        return <IoAlertCircleOutline className="text-2xl text-yellow-500" />
      default:
        return <IoCloseCircleOutline className="text-2xl text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading host details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">Host not found</div>
        </div>
      </div>
    )
  }

  const bankInfo = host.bankAccountInfo ? JSON.parse(host.bankAccountInfo) : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/fleet/hosts/pending?key=phoenix-fleet-2847"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review Host Application
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge status={host.approvalStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Host Info & Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoPersonOutline className="text-xl" />
                Personal Information
              </h2>
              
              <div className="flex items-start gap-4 mb-4">
                {host.profilePhoto ? (
                  <img 
                    src={host.profilePhoto} 
                    alt={host.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <IoPersonOutline className="text-3xl text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {host.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <IoMailOutline />
                      {host.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <IoPhonePortraitOutline />
                      {host.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <IoLocationOutline />
                      {host.city}, {host.state} {host.zipCode}
                    </div>
                  </div>
                </div>
              </div>
              
              {host.bio && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {host.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoDocumentTextOutline className="text-xl" />
                  Verification Documents
                </h2>
                <button
                  onClick={() => setShowDocRequestModal(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Request Documents
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Government ID */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDocumentStatusIcon(host.governmentIdStatus)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Government ID
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {host.governmentIdUrl ? 'Uploaded' : 'Not provided'}
                          </p>
                          {host.governmentIdStatus && (
                            <StatusBadge status={host.governmentIdStatus} size="sm" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {host.governmentIdUrl && (
                        <button
                          onClick={() => setViewingDoc({ url: host.governmentIdUrl!, title: 'Government ID' })}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                        >
                          <IoExpandOutline />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver's License */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDocumentStatusIcon(host.driversLicenseStatus)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Driver's License
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {host.driversLicenseUrl ? 'Uploaded' : 'Not provided'}
                          </p>
                          {host.driversLicenseStatus && (
                            <StatusBadge status={host.driversLicenseStatus} size="sm" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {host.driversLicenseUrl && (
                        <button
                          onClick={() => setViewingDoc({ url: host.driversLicenseUrl!, title: "Driver's License" })}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                        >
                          <IoExpandOutline />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {host.insuranceDocUrl ? (
                        getDocumentStatusIcon(host.insuranceDocStatus)
                      ) : (
                        <IoWarningOutline className="text-2xl text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Insurance Documentation
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {host.insuranceDocUrl ? 'Uploaded' : 'Optional - Not provided'}
                          </p>
                          {host.insuranceDocStatus && (
                            <StatusBadge status={host.insuranceDocStatus} size="sm" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {host.insuranceDocUrl && (
                        <button
                          onClick={() => setViewingDoc({ url: host.insuranceDocUrl!, title: 'Insurance' })}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                        >
                          <IoExpandOutline />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Account */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDocumentStatusIcon(host.bankAccountStatus)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Bank Account Information
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {bankInfo ? 'Provided' : 'Not provided'}
                          </p>
                          {host.bankAccountStatus && (
                            <StatusBadge status={host.bankAccountStatus} size="sm" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Check Status */}
            <BackgroundCheckStatus
              backgroundCheck={host.backgroundCheck || null}
              onInitiateCheck={handleInitiateBackgroundCheck}
            />

            {/* Banking Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoCardOutline className="text-xl" />
                Banking Information
              </h2>
              
              {bankInfo ? (
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bank Name</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {bankInfo.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {bankInfo.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Routing</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {bankInfo.routingNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No banking information provided</p>
              )}
            </div>

            {/* Vehicles */}
            {host.cars.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoCarOutline className="text-xl" />
                  Vehicles ({host.cars.length})
                </h2>
                
                <div className="space-y-3">
                  {host.cars.map((car: any) => (
                    <div key={car.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {car.year} {car.make} {car.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {car.city}, {car.state}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        ${car.dailyRate}/day
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Approval Settings */}
          <div className="space-y-6">
            {/* Approval Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoShieldCheckmarkOutline className="text-xl" />
                Approval Settings
              </h2>
              
              {/* Commission Rate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commission Rate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    min="10"
                    max="30"
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-700 dark:text-gray-300">%</span>
                </div>
              </div>

              {/* Pricing Boundaries */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pricing Boundaries
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Min Daily Rate</label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        value={minDailyRate}
                        onChange={(e) => setMinDailyRate(Number(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max Daily Rate</label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        value={maxDailyRate}
                        onChange={(e) => setMaxDailyRate(Number(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dashboard Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canViewBookings}
                      onChange={(e) => setPermissions({...permissions, canViewBookings: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">View bookings</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canEditCalendar}
                      onChange={(e) => setPermissions({...permissions, canEditCalendar: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Edit calendar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canSetPricing}
                      onChange={(e) => setPermissions({...permissions, canSetPricing: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Set pricing</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canMessageGuests}
                      onChange={(e) => setPermissions({...permissions, canMessageGuests: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Message guests</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.canWithdrawFunds}
                      onChange={(e) => setPermissions({...permissions, canWithdrawFunds: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Withdraw funds</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add any notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Approve Host'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject Application
                </button>
                <Link
                  href="/fleet/hosts/pending?key=phoenix-fleet-2847"
                  className="block w-full px-4 py-2 text-center bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-5xl w-full">
            <DocumentViewer
              documentUrl={viewingDoc.url}
              documentType="image"
              title={viewingDoc.title}
              onClose={() => setViewingDoc(null)}
            />
          </div>
        </div>
      )}

      {/* Document Request Modal */}
      <DocumentRequestModal
        isOpen={showDocRequestModal}
        onClose={() => setShowDocRequestModal(false)}
        hostId={hostId}
        hostName={host.name}
        onSubmit={handleDocumentRequest}
      />
    </div>
  )
}