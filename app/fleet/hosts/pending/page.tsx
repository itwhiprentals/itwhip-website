// app/fleet/hosts/pending/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoPersonOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoEyeOutline,
  IoCarOutline,
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkDoneOutline
} from 'react-icons/io5'
import StatusBadge from '@/app/components/StatusBadge'
import DocumentRequestModal from '@/app/fleet/components/DocumentRequestModal'

interface PendingHost {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  zipCode: string
  bio?: string
  profilePhoto?: string
  
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
  backgroundCheckStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  
  // Timestamps
  createdAt: string
  joinedAt: string
  
  // Stats
  totalTrips: number
  rating: number
  
  // Metadata
  hasVehicles?: boolean
  vehicleCount?: number
}

type HostStage = 'new' | 'awaiting_docs' | 'background_check' | 'ready'

export default function PendingHostsPage() {
  const router = useRouter()
  const [hosts, setHosts] = useState<PendingHost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<'all' | HostStage>('all')
  const [selectedHosts, setSelectedHosts] = useState<string[]>([])
  const [showDocRequestModal, setShowDocRequestModal] = useState(false)
  const [selectedHostForDocs, setSelectedHostForDocs] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    fetchPendingHosts()
  }, [])

  const fetchPendingHosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('key', 'phoenix-fleet-2847')
      
      const response = await fetch(`/fleet/api/hosts/pending?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setHosts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending hosts:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorizeHost = (host: PendingHost): HostStage => {
    // Check if documents are missing or rejected
    const hasRejectedDocs = [
      host.governmentIdStatus,
      host.driversLicenseStatus,
      host.insuranceDocStatus,
      host.bankAccountStatus
    ].includes('REJECTED')
    
    const missingRequiredDocs = !host.governmentIdUrl || !host.driversLicenseUrl
    
    if (hasRejectedDocs || missingRequiredDocs) {
      return 'awaiting_docs'
    }
    
    // Check if background check is in progress
    if (host.backgroundCheckStatus === 'IN_PROGRESS') {
      return 'background_check'
    }
    
    // Check if ready for approval (all docs approved, background check done)
    const allDocsApproved = host.governmentIdStatus === 'APPROVED' && 
                           host.driversLicenseStatus === 'APPROVED'
    
    if (allDocsApproved && host.backgroundCheckStatus === 'COMPLETED') {
      return 'ready'
    }
    
    // New application
    return 'new'
  }

  const getStageHosts = (stage: HostStage) => {
    return hosts.filter(host => categorizeHost(host) === stage)
  }

  const filteredHosts = activeStage === 'all' ? hosts : getStageHosts(activeStage)

  const stageCounts = {
    new: getStageHosts('new').length,
    awaiting_docs: getStageHosts('awaiting_docs').length,
    background_check: getStageHosts('background_check').length,
    ready: getStageHosts('ready').length
  }

  const handleQuickAction = async (hostId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this host?`)) return

    try {
      const response = await fetch(`/fleet/api/hosts/${hostId}/${action}?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: action === 'reject' ? 'Quick rejection - documents incomplete' : undefined
        })
      })

      if (response.ok) {
        setHosts(hosts.filter(h => h.id !== hostId))
      }
    } catch (error) {
      console.error(`Failed to ${action} host:`, error)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedHosts.length === 0) return
    if (!confirm(`Approve ${selectedHosts.length} host(s)?`)) return

    for (const hostId of selectedHosts) {
      await handleQuickAction(hostId, 'approve')
    }
    setSelectedHosts([])
  }

  const handleBulkReject = async () => {
    if (selectedHosts.length === 0) return
    const reason = prompt('Provide rejection reason:')
    if (!reason) return

    for (const hostId of selectedHosts) {
      await handleQuickAction(hostId, 'reject')
    }
    setSelectedHosts([])
  }

  const handleDocumentRequest = async (hostId: string, documents: string[], message: string) => {
    try {
      const response = await fetch(`/fleet/api/hosts/${hostId}/request-info?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents, message })
      })

      if (response.ok) {
        alert('Document request sent successfully')
        fetchPendingHosts()
      }
    } catch (error) {
      console.error('Failed to send document request:', error)
      throw error
    }
  }

  const getTimeSince = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getDocumentProgress = (host: PendingHost) => {
    let approved = 0
    let total = 0
    
    if (host.governmentIdUrl) {
      total++
      if (host.governmentIdStatus === 'APPROVED') approved++
    }
    if (host.driversLicenseUrl) {
      total++
      if (host.driversLicenseStatus === 'APPROVED') approved++
    }
    if (host.insuranceDocUrl) {
      total++
      if (host.insuranceDocStatus === 'APPROVED') approved++
    }
    if (host.bankAccountInfo) {
      total++
      if (host.bankAccountStatus === 'APPROVED') approved++
    }
    
    return total > 0 ? Math.round((approved / total) * 100) : 0
  }

  const toggleHostSelection = (hostId: string) => {
    setSelectedHosts(prev =>
      prev.includes(hostId) ? prev.filter(id => id !== hostId) : [...prev, hostId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedHosts.length === filteredHosts.length) {
      setSelectedHosts([])
    } else {
      setSelectedHosts(filteredHosts.map(h => h.id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading pending hosts...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/fleet/hosts?key=phoenix-fleet-2847"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pending Host Applications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and approve new host applications
              </p>
            </div>
          </div>
        </div>

        {/* Stage Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => setActiveStage('new')}>
            <div className="flex items-center justify-between mb-2">
              <IoDocumentTextOutline className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{stageCounts.new}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">New Applications</h3>
            <p className="text-xs text-gray-500 mt-1">Initial review needed</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => setActiveStage('awaiting_docs')}>
            <div className="flex items-center justify-between mb-2">
              <IoAlertCircleOutline className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{stageCounts.awaiting_docs}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Awaiting Documents</h3>
            <p className="text-xs text-gray-500 mt-1">Missing or rejected docs</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => setActiveStage('background_check')}>
            <div className="flex items-center justify-between mb-2">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-500" />
              <span className="text-2xl font-bold text-purple-600">{stageCounts.background_check}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Check</h3>
            <p className="text-xs text-gray-500 mt-1">Verification in progress</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => setActiveStage('ready')}>
            <div className="flex items-center justify-between mb-2">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{stageCounts.ready}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ready for Approval</h3>
            <p className="text-xs text-gray-500 mt-1">All checks passed</p>
          </div>
        </div>

        {/* Filters & Bulk Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveStage('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeStage === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              All ({hosts.length})
            </button>
            <button
              onClick={() => setActiveStage('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeStage === 'new' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              New ({stageCounts.new})
            </button>
            <button
              onClick={() => setActiveStage('awaiting_docs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeStage === 'awaiting_docs' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Awaiting Docs ({stageCounts.awaiting_docs})
            </button>
            <button
              onClick={() => setActiveStage('background_check')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeStage === 'background_check' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Background Check ({stageCounts.background_check})
            </button>
            <button
              onClick={() => setActiveStage('ready')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeStage === 'ready' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Ready ({stageCounts.ready})
            </button>
          </div>

          {selectedHosts.length > 0 && (
            <div className="flex gap-2">
              <span className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                {selectedHosts.length} selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                <IoCheckmarkDoneOutline className="inline w-4 h-4 mr-1" />
                Bulk Approve
              </button>
              <button
                onClick={handleBulkReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Bulk Reject
              </button>
            </div>
          )}
        </div>

        {/* Bulk Select All */}
        {filteredHosts.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={selectedHosts.length === filteredHosts.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded"
              />
              Select All
            </label>
          </div>
        )}

        {/* Host Cards */}
        {filteredHosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <IoCheckmarkCircleOutline className="mx-auto text-6xl text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {activeStage === 'all' ? 'All Caught Up!' : `No hosts in "${activeStage}" stage`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeStage === 'all' 
                ? 'No pending host applications at the moment' 
                : 'Try selecting a different stage'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredHosts.map((host) => {
              const stage = categorizeHost(host)
              const progress = getDocumentProgress(host)
              
              return (
                <div 
                  key={host.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedHosts.includes(host.id)}
                      onChange={() => toggleHostSelection(host.id)}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />

                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full flex-shrink-0 relative">
                      {/* Placeholder always visible as base layer */}
                      <div className="w-full h-full bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <IoPersonOutline className="text-2xl text-purple-600 dark:text-purple-400" />
                      </div>
                      {/* Image overlays placeholder when it loads successfully */}
                      {host.profilePhoto && (
                        <img
                          src={host.profilePhoto}
                          alt={host.name}
                          className="absolute inset-0 w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {host.name}
                        </h3>
                        <StatusBadge status={stage.toUpperCase().replace('_', ' ')} size="sm" />
                        {host.backgroundCheckStatus && (
                          <StatusBadge status={host.backgroundCheckStatus} size="sm" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <IoMailOutline />
                          {host.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <IoPhonePortraitOutline />
                          {host.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <IoLocationOutline />
                          {host.city}, {host.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <IoTimeOutline />
                          Applied {getTimeSince(host.createdAt)}
                        </div>
                      </div>
                      
                      {/* Document Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Document Progress</span>
                          <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              progress === 100 ? 'bg-green-600' : 
                              progress > 50 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Document Status */}
                      <div className="flex gap-3 mb-3">
                        <div className={`flex items-center gap-1 text-sm
                          ${host.governmentIdStatus === 'APPROVED' ? 'text-green-600 dark:text-green-400' : 
                            host.governmentIdStatus === 'REJECTED' ? 'text-red-600 dark:text-red-400' : 
                            'text-gray-400'}`}>
                          {host.governmentIdStatus === 'APPROVED' ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
                          Gov ID
                        </div>
                        <div className={`flex items-center gap-1 text-sm
                          ${host.driversLicenseStatus === 'APPROVED' ? 'text-green-600 dark:text-green-400' : 
                            host.driversLicenseStatus === 'REJECTED' ? 'text-red-600 dark:text-red-400' : 
                            'text-gray-400'}`}>
                          {host.driversLicenseStatus === 'APPROVED' ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
                          License
                        </div>
                        <div className={`flex items-center gap-1 text-sm
                          ${host.insuranceDocStatus === 'APPROVED' ? 'text-green-600 dark:text-green-400' : 
                            host.insuranceDocStatus === 'REJECTED' ? 'text-red-600 dark:text-red-400' : 
                            'text-gray-400'}`}>
                          {host.insuranceDocStatus === 'APPROVED' ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
                          Insurance
                        </div>
                        <div className={`flex items-center gap-1 text-sm
                          ${host.bankAccountStatus === 'APPROVED' ? 'text-green-600 dark:text-green-400' : 
                            host.bankAccountStatus === 'REJECTED' ? 'text-red-600 dark:text-red-400' : 
                            'text-gray-400'}`}>
                          {host.bankAccountStatus === 'APPROVED' ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
                          Bank
                        </div>
                      </div>
                      
                      {/* Bio */}
                      {host.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {host.bio}
                        </p>
                      )}
                      
                      {/* Additional Info */}
                      {host.hasVehicles && (
                        <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                          <IoCarOutline />
                          {host.vehicleCount || 0} vehicle{host.vehicleCount !== 1 ? 's' : ''} ready to list
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => router.push(`/fleet/hosts/${host.id}/review?key=phoenix-fleet-2847`)}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <IoEyeOutline />
                        Review
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedHostForDocs({ id: host.id, name: host.name })
                          setShowDocRequestModal(true)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <IoDocumentTextOutline />
                        Request Docs
                      </button>
                      
                      {stage === 'ready' && (
                        <button
                          onClick={() => handleQuickAction(host.id, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <IoCheckmarkCircleOutline />
                          Quick Approve
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleQuickAction(host.id, 'reject')}
                        className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <IoCloseCircleOutline />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Document Request Modal */}
      {showDocRequestModal && selectedHostForDocs && (
        <DocumentRequestModal
          isOpen={showDocRequestModal}
          onClose={() => {
            setShowDocRequestModal(false)
            setSelectedHostForDocs(null)
          }}
          hostId={selectedHostForDocs.id}
          hostName={selectedHostForDocs.name}
          onSubmit={(docs, msg) => handleDocumentRequest(selectedHostForDocs.id, docs, msg)}
        />
      )}
    </div>
  )
}