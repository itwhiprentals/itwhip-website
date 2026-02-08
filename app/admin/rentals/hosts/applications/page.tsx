// app/admin/rentals/hosts/applications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/app/components/StatusBadge'
import DocumentRequestModal from '@/app/admin/components/DocumentRequestModal'
import BackgroundCheckViewer from '@/app/admin/components/BackgroundCheckViewer'
import {
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoRefreshOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoTimeOutline,
  IoWarningOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoDownloadOutline,
  IoFilterOutline,
  IoSearchOutline
} from 'react-icons/io5'

type ApprovalStatus = 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'

interface HostApplication {
  id: string
  name: string
  email: string
  phone?: string
  profilePhoto?: string
  city: string
  state: string
  zipCode?: string
  approvalStatus: ApprovalStatus
  createdAt: string
  submittedAt?: string
  
  // Documents
  documentStatuses?: {
    governmentId?: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
    driversLicense?: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
    insurance?: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
    bankAccount?: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  }
  
  // Background Check
  backgroundCheckStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  backgroundCheckResults?: {
    identity?: string
    dmv?: string
    criminal?: string
    insurance?: string
    credit?: string
  }
  
  // Actions
  pendingActions?: string[]
  restrictionReasons?: string[]
  
  // Metadata
  lastContactedAt?: string
  documentsRequestedAt?: string
  documentsResubmittedAt?: string
  
  // Proposed cars
  proposedCars?: number
}

interface ApplicationStats {
  total: number
  new: number
  awaitingDocs: number
  backgroundCheck: number
  readyForApproval: number
  needsAttention: number
}

export default function HostApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<HostApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<'all' | 'new' | 'awaiting_docs' | 'background_check' | 'ready'>('all')
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())
  
  // Modals
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showBackgroundCheckModal, setShowBackgroundCheckModal] = useState(false)
  const [selectedHostForModal, setSelectedHostForModal] = useState<string | null>(null)
  const [selectedHostNameForModal, setSelectedHostNameForModal] = useState<string>('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/hosts/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.data?.hosts || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApprove = async (hostId: string) => {
    if (!confirm('Approve this host application?')) return
    
    try {
      const response = await fetch(`/api/admin/hosts/${hostId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commission: 20,
          permissions: {
            dashboardAccess: true,
            canViewBookings: true,
            canEditCalendar: true,
            canSetPricing: true,
            canWithdrawFunds: false
          }
        })
      })
      
      if (response.ok) {
        alert('Host approved successfully')
        fetchApplications()
      } else {
        alert('Failed to approve host')
      }
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Failed to approve host')
    }
  }

  const handleReject = async (hostId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    
    try {
      const response = await fetch(`/api/admin/hosts/${hostId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        alert('Host rejected')
        fetchApplications()
      } else {
        alert('Failed to reject host')
      }
    } catch (error) {
      console.error('Rejection failed:', error)
      alert('Failed to reject host')
    }
  }

  const handleRequestDocuments = (hostId: string, hostName: string) => {
    setSelectedHostForModal(hostId)
    setSelectedHostNameForModal(hostName)
    setShowDocumentModal(true)
  }

  const handleViewBackgroundCheck = (hostId: string) => {
    setSelectedHostForModal(hostId)
    setShowBackgroundCheckModal(true)
  }

  const handleInitiateBackgroundCheck = async (hostId: string) => {
    if (!confirm('Initiate background check for this host?')) return
    
    try {
      const response = await fetch(`/api/admin/hosts/${hostId}/background-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        alert('Background check initiated')
        fetchApplications()
      } else {
        alert('Failed to initiate background check')
      }
    } catch (error) {
      console.error('Background check initiation failed:', error)
      alert('Failed to initiate background check')
    }
  }

  const toggleSelection = (hostId: string) => {
    const newSelected = new Set(selectedApplications)
    if (newSelected.has(hostId)) {
      newSelected.delete(hostId)
    } else {
      newSelected.add(hostId)
    }
    setSelectedApplications(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set())
    } else {
      setSelectedApplications(new Set(filteredApplications.map(a => a.id)))
    }
  }

  const handleBulkApprove = async () => {
    if (!confirm(`Approve ${selectedApplications.size} selected applications?`)) return
    
    try {
      const response = await fetch('/api/admin/hosts/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          hostIds: Array.from(selectedApplications)
        })
      })
      
      if (response.ok) {
        alert('Applications approved successfully')
        setSelectedApplications(new Set())
        fetchApplications()
      }
    } catch (error) {
      console.error('Bulk approve failed:', error)
      alert('Failed to approve applications')
    }
  }

  const handleBulkReject = async () => {
    const reason = prompt('Enter rejection reason for all selected:')
    if (!reason) return
    
    try {
      const response = await fetch('/api/admin/hosts/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          hostIds: Array.from(selectedApplications),
          reason
        })
      })
      
      if (response.ok) {
        alert('Applications rejected')
        setSelectedApplications(new Set())
        fetchApplications()
      }
    } catch (error) {
      console.error('Bulk reject failed:', error)
      alert('Failed to reject applications')
    }
  }

  // Categorize applications by stage
  const categorizeApplication = (app: HostApplication): string => {
    // Ready for approval - all checks pass
    if (
      app.documentStatuses?.governmentId === 'APPROVED' &&
      app.documentStatuses?.driversLicense === 'APPROVED' &&
      app.documentStatuses?.insurance === 'APPROVED' &&
      app.backgroundCheckStatus === 'COMPLETED'
    ) {
      return 'ready'
    }
    
    // Background check stage
    if (
      app.documentStatuses?.governmentId === 'APPROVED' &&
      app.documentStatuses?.driversLicense === 'APPROVED' &&
      app.documentStatuses?.insurance === 'APPROVED' &&
      (app.backgroundCheckStatus === 'IN_PROGRESS' || app.backgroundCheckStatus === 'NOT_STARTED')
    ) {
      return 'background_check'
    }
    
    // Awaiting documents
    if (
      app.documentStatuses &&
      (app.documentStatuses.governmentId === 'REJECTED' ||
       app.documentStatuses.driversLicense === 'REJECTED' ||
       app.documentStatuses.insurance === 'REJECTED' ||
       app.documentsRequestedAt)
    ) {
      return 'awaiting_docs'
    }
    
    // New application
    return 'new'
  }

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' ||
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const stage = categorizeApplication(app)
    const matchesStage = filterStage === 'all' || stage === filterStage
    
    return matchesSearch && matchesStage
  })

  // Calculate stats
  const stats: ApplicationStats = {
    total: applications.length,
    new: applications.filter(a => categorizeApplication(a) === 'new').length,
    awaitingDocs: applications.filter(a => categorizeApplication(a) === 'awaiting_docs').length,
    backgroundCheck: applications.filter(a => categorizeApplication(a) === 'background_check').length,
    readyForApproval: applications.filter(a => categorizeApplication(a) === 'ready').length,
    needsAttention: applications.filter(a => a.approvalStatus === 'NEEDS_ATTENTION').length
  }

  const getDocumentStatusIcon = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <IoCloseOutline className="w-4 h-4 text-red-500" />
      case 'SUBMITTED':
        return <IoTimeOutline className="w-4 h-4 text-blue-500" />
      case 'NOT_SUBMITTED':
        return <IoWarningOutline className="w-4 h-4 text-gray-400" />
      default:
        return <IoAlertCircleOutline className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTimeSince = (date?: string) => {
    if (!date) return 'Unknown'
    const now = new Date()
    const then = new Date(date)
    const hours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/rentals/hosts"
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <IoArrowBackOutline className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back to Hosts</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />
              <div className="flex items-center space-x-2">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Host Applications
                </h1>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm rounded">
                  {stats.total} Total
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchApplications}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh"
              >
                <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert for needs attention */}
        {stats.needsAttention > 0 && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
            <div className="flex items-center">
              <IoWarningOutline className="w-5 h-5 text-orange-400 mr-3" />
              <p className="text-sm text-orange-800">
                <span className="font-semibold">{stats.needsAttention} application{stats.needsAttention !== 1 ? 's' : ''}</span> need immediate attention
              </p>
            </div>
          </div>
        )}

        {/* Stage Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setFilterStage('all')}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-left transition-all ${
              filterStage === 'all' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">All stages</p>
          </button>

          <button
            onClick={() => setFilterStage('new')}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-left transition-all ${
              filterStage === 'new' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">New</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-xs text-gray-500 mt-1">Need review</p>
          </button>

          <button
            onClick={() => setFilterStage('awaiting_docs')}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-left transition-all ${
              filterStage === 'awaiting_docs' ? 'ring-2 ring-orange-500' : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">Awaiting Docs</p>
            <p className="text-2xl font-bold text-orange-600">{stats.awaitingDocs}</p>
            <p className="text-xs text-gray-500 mt-1">Requested</p>
          </button>

          <button
            onClick={() => setFilterStage('background_check')}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-left transition-all ${
              filterStage === 'background_check' ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">Background Check</p>
            <p className="text-2xl font-bold text-purple-600">{stats.backgroundCheck}</p>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </button>

          <button
            onClick={() => setFilterStage('ready')}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-left transition-all ${
              filterStage === 'ready' ? 'ring-2 ring-green-500' : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">Ready</p>
            <p className="text-2xl font-bold text-green-600">{stats.readyForApproval}</p>
            <p className="text-xs text-gray-500 mt-1">Can approve</p>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedApplications.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {selectedApplications.size} application{selectedApplications.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedApplications(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-1"
                >
                  <IoCheckmarkOutline className="w-4 h-4" />
                  <span>Approve All</span>
                </button>
                <button
                  onClick={handleBulkReject}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center space-x-1"
                >
                  <IoCloseOutline className="w-4 h-4" />
                  <span>Reject All</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <IoShieldCheckmarkOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Applications Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filterStage !== 'all' 
                  ? `No applications in the ${filterStage.replace('_', ' ')} stage`
                  : 'No host applications to review'}
              </p>
            </div>
          ) : (
            filteredApplications.map(application => {
              const stage = categorizeApplication(application)
              const isReady = stage === 'ready'
              
              return (
                <div
                  key={application.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(application.id)}
                        onChange={() => toggleSelection(application.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      
                      {/* Profile Photo */}
                      {application.profilePhoto ? (
                        <img
                          src={application.profilePhoto}
                          alt={application.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <IoPersonOutline className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Host Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {application.name}
                          </h3>
                          <StatusBadge status={application.approvalStatus} size="sm" />
                          {isReady && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              Ready to Approve
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <IoMailOutline className="w-4 h-4 mr-2" />
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="flex items-center">
                              <IoCallOutline className="w-4 h-4 mr-2" />
                              {application.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <IoLocationOutline className="w-4 h-4 mr-2" />
                            {application.city}, {application.state}
                          </div>
                          <div className="flex items-center">
                            <IoCalendarOutline className="w-4 h-4 mr-2" />
                            Applied {formatTimeSince(application.submittedAt || application.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Documents Status */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Documents Status
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center space-x-2">
                        {getDocumentStatusIcon(application.documentStatuses?.governmentId)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gov ID</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getDocumentStatusIcon(application.documentStatuses?.driversLicense)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">License</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getDocumentStatusIcon(application.documentStatuses?.insurance)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">Insurance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getDocumentStatusIcon(application.documentStatuses?.bankAccount)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">Bank</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Background Check Status */}
                  {application.backgroundCheckStatus && application.backgroundCheckStatus !== 'NOT_STARTED' && (
                    <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Background Check
                          </span>
                        </div>
                        <StatusBadge 
                          status={application.backgroundCheckStatus} 
                          size="sm" 
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Pending Actions */}
                  {application.pendingActions && application.pendingActions.length > 0 && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                        Pending Actions:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {application.pendingActions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/rentals/hosts/${application.id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <IoEyeOutline className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                    
                    {isReady && (
                      <button
                        onClick={() => handleApprove(application.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <IoCheckmarkOutline className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRequestDocuments(application.id, application.name)}
                      className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                    >
                      <IoDocumentTextOutline className="w-4 h-4" />
                      <span>Request Docs</span>
                    </button>
                    
                    {application.backgroundCheckStatus === 'NOT_STARTED' ? (
                      <button
                        onClick={() => handleInitiateBackgroundCheck(application.id)}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                      >
                        <IoShieldCheckmarkOutline className="w-4 h-4" />
                        <span>Start Check</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewBackgroundCheck(application.id)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 flex items-center space-x-2"
                      >
                        <IoShieldCheckmarkOutline className="w-4 h-4" />
                        <span>View Check</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleReject(application.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center space-x-2"
                    >
                      <IoCloseOutline className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {showDocumentModal && selectedHostForModal && (
        <DocumentRequestModal
          isOpen={showDocumentModal}
          onClose={() => {
            setShowDocumentModal(false)
            setSelectedHostForModal(null)
            setSelectedHostNameForModal('')
          }}
          hostId={selectedHostForModal}
          hostName={selectedHostNameForModal}
          hostEmail=""
          onSubmit={async () => {
            fetchApplications()
            setShowDocumentModal(false)
            setSelectedHostForModal(null)
            setSelectedHostNameForModal('')
          }}
        />
      )}

      {showBackgroundCheckModal && selectedHostForModal && (
        <BackgroundCheckViewer
          backgroundCheck={null}
          hostId={selectedHostForModal}
          onRefresh={() => {
            setShowBackgroundCheckModal(false)
            setSelectedHostForModal(null)
          }}
        />
      )}
    </div>
  )
}